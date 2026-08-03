import "server-only";

import { createElement } from "react";
import { SUPPORT_EMAIL } from "@/lib/legal/constants";
import { getAdminEmail } from "@/lib/email/config";
import { sendEmail } from "@/lib/email/resend";
import {
  buildAdminNewOrderEmailHtml,
  buildAdminNewOrderSubject,
} from "@/lib/email/templates/admin-new-order";
import {
  OrderConfirmationEmail,
  buildOrderConfirmationSubject,
} from "@/lib/email/templates/order-confirmation";
import type { OrderEmailItem } from "@/lib/email/types/order-email";
import {
  buildWelcomeEmailHtml,
  buildWelcomeEmailSubject,
} from "@/lib/email/templates/welcome";

export interface OrderEmailPayload {
  customerEmail: string;
  customerName?: string;
  orderId: string;
  paymentId?: string;
  amountInr: number;
  items: OrderEmailItem[];
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    phone?: string;
  };
}

function formatOrderRef(orderId: string): string {
  return orderId.slice(0, 12).toUpperCase();
}

function formatShippingLine(
  address: OrderEmailPayload["shippingAddress"]
): string | undefined {
  if (!address) return undefined;

  const parts = [
    address.line1,
    address.line2,
    `${address.city}, ${address.state} ${address.pincode}`,
    address.phone ? `Phone: ${address.phone}` : null,
  ].filter(Boolean);

  return parts.join("<br />");
}

export type { OrderEmailItem } from "@/lib/email/types/order-email";

export async function sendWelcomeEmail(params: {
  to: string;
  customerName?: string;
}): Promise<{ success: boolean; error?: string }> {
  const result = await sendEmail({
    to: params.to,
    subject: buildWelcomeEmailSubject(),
    html: buildWelcomeEmailHtml(params.customerName ?? ""),
    replyTo: SUPPORT_EMAIL,
  });

  return { success: result.success, error: result.error };
}

export async function sendOrderConfirmationEmail(
  payload: OrderEmailPayload
): Promise<{ success: boolean; error?: string }> {
  const orderRef = formatOrderRef(payload.orderId);
  const templateData = {
    customerName: payload.customerName ?? "Customer",
    orderRef,
    paymentId: payload.paymentId,
    amountInr: payload.amountInr,
    items: payload.items,
    shippingAddress: payload.shippingAddress,
  };

  const result = await sendEmail({
    to: payload.customerEmail,
    subject: buildOrderConfirmationSubject(orderRef),
    react: createElement(OrderConfirmationEmail, templateData),
    replyTo: SUPPORT_EMAIL,
  });

  return { success: result.success, error: result.error };
}

export async function sendAdminNewOrderEmail(
  payload: OrderEmailPayload
): Promise<{ success: boolean; error?: string }> {
  const orderRef = formatOrderRef(payload.orderId);
  const templateData = {
    customerName: payload.customerName ?? "Customer",
    customerEmail: payload.customerEmail,
    orderRef,
    paymentId: payload.paymentId,
    amountInr: payload.amountInr,
    items: payload.items,
    shippingLine: formatShippingLine(payload.shippingAddress),
  };

  const result = await sendEmail({
    to: getAdminEmail(),
    subject: buildAdminNewOrderSubject(orderRef, payload.amountInr),
    html: buildAdminNewOrderEmailHtml(templateData),
    replyTo: payload.customerEmail,
  });

  return { success: result.success, error: result.error };
}

/** Sends customer confirmation + admin alert. Never throws. */
export async function sendOrderEmails(
  payload: OrderEmailPayload
): Promise<{ customer: boolean; admin: boolean; errors: string[] }> {
  const errors: string[] = [];

  const [customerResult, adminResult] = await Promise.all([
    sendOrderConfirmationEmail(payload),
    sendAdminNewOrderEmail(payload),
  ]);

  if (!customerResult.success && customerResult.error) {
    errors.push(`customer: ${customerResult.error}`);
  }
  if (!adminResult.success && adminResult.error) {
    errors.push(`admin: ${adminResult.error}`);
  }

  return {
    customer: customerResult.success,
    admin: adminResult.success,
    errors,
  };
}
