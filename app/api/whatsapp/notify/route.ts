import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logging/logger";
import { normalizeWhatsAppPhone } from "@/lib/whatsapp/client";
import {
  sendOrderConfirmationWhatsApp,
  sendWelcomeWhatsApp,
} from "@/lib/whatsapp/notifications";

export const dynamic = "force-dynamic";

type NotifyType = "welcome" | "order_confirmation";

interface NotifyBody {
  type: NotifyType;
  phone: string;
  customerName?: string;
  orderId?: string;
  amountInr?: number;
  productSummary?: string;
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as NotifyBody;

    if (!body.type || !body.phone) {
      return NextResponse.json(
        { error: "Missing type or phone" },
        { status: 400 }
      );
    }

    const phone = normalizeWhatsAppPhone(body.phone);

    if (body.type === "welcome") {
      const result = await sendWelcomeWhatsApp({
        phone,
        customerName: body.customerName,
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 502 });
      }

      return NextResponse.json({ success: true });
    }

    if (body.type === "order_confirmation") {
      if (!body.orderId || body.amountInr === undefined) {
        return NextResponse.json(
          { error: "Missing orderId or amountInr" },
          { status: 400 }
        );
      }

      const result = await sendOrderConfirmationWhatsApp({
        phone,
        customerName: body.customerName,
        orderId: body.orderId,
        amountInr: body.amountInr,
        productSummary: body.productSummary,
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 502 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    logger.error("system", "WhatsApp notify route failed", error, {
      path: "/api/whatsapp/notify",
      method: "POST",
    });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
