import "server-only";

import type { Json } from "@/lib/database.types";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logging/logger";
import { normalizeWhatsAppPhone } from "@/lib/whatsapp/client";

function toJson(value: unknown): Json | null {
  if (value === undefined || value === null) return null;
  return JSON.parse(JSON.stringify(value)) as Json;
}
export type WhatsAppMessageStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "read"
  | "failed"
  | "received";

async function upsertConversation(params: {
  customerPhone: string;
  customerName?: string | null;
  lastMessage: string;
  lastMessageAt: string;
}): Promise<string | null> {
  const admin = createAdminClient();
  const phone = normalizeWhatsAppPhone(params.customerPhone);

  const { data: existing, error: lookupError } = await admin
    .from("whatsapp_conversations")
    .select("id, customer_name")
    .eq("customer_phone", phone)
    .maybeSingle();

  if (lookupError) {
    logger.error("system", "WhatsApp conversation lookup failed", lookupError, {
      meta: { phone },
    });
    return null;
  }

  if (existing?.id) {
    const { error: updateError } = await admin
      .from("whatsapp_conversations")
      .update({
        customer_name: params.customerName ?? existing.customer_name,
        last_message: params.lastMessage,
        last_message_at: params.lastMessageAt,
        status: "open",
      })
      .eq("id", existing.id);

    if (updateError) {
      logger.error("system", "WhatsApp conversation update failed", updateError, {
        meta: { phone },
      });
      return null;
    }

    return existing.id;
  }

  const { data: inserted, error: insertError } = await admin
    .from("whatsapp_conversations")
    .insert({
      customer_phone: phone,
      customer_name: params.customerName ?? null,
      last_message: params.lastMessage,
      last_message_at: params.lastMessageAt,
      status: "open",
    })
    .select("id")
    .single();

  if (insertError) {
    logger.error("system", "WhatsApp conversation insert failed", insertError, {
      meta: { phone },
    });
    return null;
  }

  return inserted.id;
}

export async function persistOutboundMessage(params: {
  customerPhone: string;
  messageId?: string;
  messageText: string;
  status?: WhatsAppMessageStatus;
  templateName?: string;
  rawPayload?: unknown;
}): Promise<void> {
  const phone = normalizeWhatsAppPhone(params.customerPhone);
  const now = new Date().toISOString();

  const conversationId = await upsertConversation({
    customerPhone: phone,
    lastMessage: params.messageText,
    lastMessageAt: now,
  });

  const admin = createAdminClient();
  const { error } = await admin.from("whatsapp_messages").insert({
    conversation_id: conversationId,
    customer_phone: phone,
    message_id: params.messageId ?? null,
    message_text: params.messageText,
    direction: "outbound",
    status: params.status ?? "sent",
    template_name: params.templateName ?? null,
    raw_payload: toJson(params.rawPayload),
  });

  if (error) {
    logger.error("system", "WhatsApp outbound message persist failed", error, {
      meta: { phone, messageId: params.messageId },
    });
  }
}

export async function recordInboundMessage(params: {
  customerPhone: string;
  messageId: string;
  messageText: string;
  customerName?: string;
  rawPayload?: unknown;
}): Promise<void> {
  const phone = normalizeWhatsAppPhone(params.customerPhone);
  const now = new Date().toISOString();

  const conversationId = await upsertConversation({
    customerPhone: phone,
    customerName: params.customerName,
    lastMessage: params.messageText,
    lastMessageAt: now,
  });

  const admin = createAdminClient();

  const { error } = await admin.from("whatsapp_messages").upsert(
    {
      conversation_id: conversationId,
      customer_phone: phone,
      message_id: params.messageId,
      message_text: params.messageText,
      direction: "inbound",
      status: "received",
      raw_payload: toJson(params.rawPayload),
    },
    { onConflict: "message_id" }
  );

  if (error) {
    logger.error("system", "WhatsApp inbound message persist failed", error, {
      meta: { phone, messageId: params.messageId },
    });
  }
}

export async function updateMessageStatus(params: {
  messageId: string;
  status: WhatsAppMessageStatus;
  rawPayload?: unknown;
}): Promise<void> {
  const admin = createAdminClient();

  const { error } = await admin
    .from("whatsapp_messages")
    .update({
      status: params.status,
      raw_payload: toJson(params.rawPayload),
    })
    .eq("message_id", params.messageId);

  if (error) {
    logger.error("system", "WhatsApp message status update failed", error, {
      meta: { messageId: params.messageId, status: params.status },
    });
  }
}
