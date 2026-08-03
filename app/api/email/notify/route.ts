import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logging/logger";
import {
  sendOrderEmails,
  sendWelcomeEmail,
  type OrderEmailPayload,
} from "@/lib/email/notifications";

export const dynamic = "force-dynamic";

type NotifyType = "welcome" | "order_confirmation";

interface WelcomeBody {
  type: "welcome";
  customerName?: string;
}

interface OrderBody {
  type: "order_confirmation";
  orderId: string;
  paymentId?: string;
  amountInr: number;
  items: OrderEmailPayload["items"];
  shippingAddress?: OrderEmailPayload["shippingAddress"];
  customerName?: string;
}

type NotifyBody = WelcomeBody | OrderBody;

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

    if (body.type === "welcome") {
      if (!user.email) {
        return NextResponse.json({
          success: true,
          skipped: true,
          reason: "No email on account",
        });
      }

      const result = await sendWelcomeEmail({
        to: user.email,
        customerName: body.customerName,
      });

      if (!result.success) {
        logger.warn("auth", "Welcome email failed", {
          userId: user.id,
          meta: { error: result.error },
        });
      }

      return NextResponse.json({
        success: true,
        sent: result.success,
        error: result.error,
      });
    }

    if (body.type === "order_confirmation") {
      if (!user.email) {
        return NextResponse.json({
          success: true,
          skipped: true,
          reason: "No email on account",
        });
      }

      if (!body.orderId || body.amountInr === undefined || !body.items?.length) {
        return NextResponse.json(
          { error: "Missing orderId, amountInr, or items" },
          { status: 400 }
        );
      }

      const emailResult = await sendOrderEmails({
        customerEmail: user.email,
        customerName: body.customerName,
        orderId: body.orderId,
        paymentId: body.paymentId,
        amountInr: body.amountInr,
        items: body.items,
        shippingAddress: body.shippingAddress,
      });

      if (emailResult.errors.length > 0) {
        logger.warn("order", "Order email partially failed", {
          userId: user.id,
          meta: {
            orderId: body.orderId,
            errors: emailResult.errors,
            customer: emailResult.customer,
            admin: emailResult.admin,
          },
        });
      }

      return NextResponse.json({
        success: true,
        customer: emailResult.customer,
        admin: emailResult.admin,
        errors: emailResult.errors,
      });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    logger.error("system", "Email notify route failed", error, {
      path: "/api/email/notify",
      method: "POST",
    });

    return NextResponse.json({ success: true, error: "Internal error logged" });
  }
}
