import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logging/logger";
import {
  getWhatsAppAppSecret,
  getWhatsAppVerifyToken,
  isWhatsAppWebhookConfigured,
} from "@/lib/whatsapp/config";
import { recordInboundMessage, updateMessageStatus } from "@/lib/whatsapp/db";

export const dynamic = "force-dynamic";

interface WhatsAppWebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body?: string };
}

interface WhatsAppWebhookStatus {
  id: string;
  status: string;
  timestamp: string;
  recipient_id: string;
}

interface WhatsAppWebhookChange {
  value?: {
    messaging_product?: string;
    metadata?: { phone_number_id?: string };
    contacts?: { profile?: { name?: string }; wa_id?: string }[];
    messages?: WhatsAppWebhookMessage[];
    statuses?: WhatsAppWebhookStatus[];
  };
  field?: string;
}

interface WhatsAppWebhookBody {
  object?: string;
  entry?: {
    id?: string;
    changes?: WhatsAppWebhookChange[];
  }[];
}

function mapDeliveryStatus(status: string): "sent" | "delivered" | "read" | "failed" {
  switch (status) {
    case "sent":
      return "sent";
    case "delivered":
      return "delivered";
    case "read":
      return "read";
    case "failed":
      return "failed";
    default:
      return "sent";
  }
}

function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = getWhatsAppAppSecret();

  if (!appSecret) {
    if (process.env.NODE_ENV === "production") {
      logger.error("system", "WHATSAPP_APP_SECRET missing in production", undefined, {
        path: "/api/whatsapp/webhook",
      });
      return false;
    }
    return true;
  }

  if (!signatureHeader?.startsWith("sha256=")) {
    return false;
  }

  const expected = createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const received = signatureHeader.slice("sha256=".length);

  if (expected.length !== received.length) {
    return false;
  }

  try {
    return timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(received, "hex")
    );
  } catch {
    return false;
  }
}

/** Meta webhook verification (GET). */
export async function GET(request: Request) {
  if (!isWhatsAppWebhookConfigured()) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const verifyToken = getWhatsAppVerifyToken();
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === verifyToken && challenge) {
    logger.info("system", "WhatsApp webhook verified", {
      path: "/api/whatsapp/webhook",
      method: "GET",
    });
    return new NextResponse(challenge, { status: 200 });
  }

  logger.warn("system", "WhatsApp webhook verification failed", {
    path: "/api/whatsapp/webhook",
    method: "GET",
  });

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/** Incoming messages + delivery status updates (POST). */
export async function POST(request: Request) {
  if (!isWhatsAppWebhookConfigured()) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!verifySignature(rawBody, signature)) {
    logger.warn("system", "WhatsApp webhook signature invalid", {
      path: "/api/whatsapp/webhook",
      method: "POST",
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: WhatsAppWebhookBody;

  try {
    body = JSON.parse(rawBody) as WhatsAppWebhookBody;
  } catch (error) {
    logger.error("system", "WhatsApp webhook JSON parse failed", error);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.object !== "whatsapp_business_account") {
    return NextResponse.json({ status: "ignored" });
  }

  try {
    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value;
        if (!value) continue;

        const contactName = value.contacts?.[0]?.profile?.name;

        for (const message of value.messages ?? []) {
          const text =
            message.text?.body ??
            (message.type !== "text" ? `[${message.type} message]` : "");

          await recordInboundMessage({
            customerPhone: message.from,
            messageId: message.id,
            messageText: text,
            customerName: contactName,
            rawPayload: message,
          });

          logger.info("system", "WhatsApp inbound message stored", {
            meta: { from: message.from, messageId: message.id },
          });
        }

        for (const statusUpdate of value.statuses ?? []) {
          await updateMessageStatus({
            messageId: statusUpdate.id,
            status: mapDeliveryStatus(statusUpdate.status),
            rawPayload: statusUpdate,
          });

          logger.info("system", "WhatsApp message status updated", {
            meta: {
              messageId: statusUpdate.id,
              status: statusUpdate.status,
            },
          });
        }
      }
    }
  } catch (error) {
    logger.error("system", "WhatsApp webhook processing failed", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ status: "ok" });
}
