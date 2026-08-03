import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isEmailConfigured } from "@/lib/email/config";
import {
  sendOrderConfirmationEmail,
  sendWelcomeEmail,
} from "@/lib/email/notifications";

export const dynamic = "force-dynamic";

/**
 * Development-only endpoint to test Resend without completing checkout.
 * POST /api/email/test
 * Body: { "type": "welcome" | "order_confirmation", "to"?: "you@example.com" }
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isEmailConfigured()) {
    return NextResponse.json(
      {
        error: "Email not configured",
        hint: "Set RESEND_API_KEY and RESEND_FROM_EMAIL in .env.local",
      },
      { status: 503 }
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Sign in first, then POST to this endpoint" },
      { status: 401 }
    );
  }

  const body = (await request.json()) as {
    type?: "welcome" | "order_confirmation";
    to?: string;
  };

  const to = body.to ?? user.email;
  if (!to) {
    return NextResponse.json({ error: "No recipient email" }, { status: 400 });
  }

  if (body.type === "welcome") {
    const result = await sendWelcomeEmail({ to, customerName: "Test User" });
    return NextResponse.json({ type: "welcome", to, ...result });
  }

  if (body.type === "order_confirmation") {
    const result = await sendOrderConfirmationEmail({
      customerEmail: to,
      customerName: "Test User",
      orderId: "order_TEST123456",
      paymentId: "pay_TEST123456",
      amountInr: 859,
      items: [
        {
          productName: "HEXED SYSTEM Tee",
          size: "M",
          quantity: 1,
          lineTotalInr: 859,
        },
      ],
      shippingAddress: {
        line1: "123 Test Street",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        phone: "9876543210",
      },
    });
    return NextResponse.json({ type: "order_confirmation", to, ...result });
  }

  return NextResponse.json(
    { error: 'Invalid type. Use "welcome" or "order_confirmation".' },
    { status: 400 }
  );
}
