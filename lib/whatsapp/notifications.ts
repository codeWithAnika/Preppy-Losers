import "server-only";

import { BRAND_NAME } from "@/lib/legal/constants";
import {
  sendTemplateMessage,
  sendWhatsAppMessage,
} from "@/lib/whatsapp/client";
import { whatsappConfig } from "@/lib/whatsapp/config";
import { persistOutboundMessage } from "@/lib/whatsapp/db";

export async function sendWelcomeWhatsApp(params: {
  phone: string;
  customerName?: string;
}): Promise<{ success: boolean; error?: string }> {
  const name = params.customerName?.trim() || "there";

  const templateResult = await sendTemplateMessage(
    params.phone,
    whatsappConfig.welcomeTemplateName,
    [name]
  );

  if (templateResult.success) {
    await persistOutboundMessage({
      customerPhone: params.phone,
      messageId: templateResult.messageId,
      messageText: `Welcome template sent to ${name}`,
      templateName: whatsappConfig.welcomeTemplateName,
      status: "sent",
      rawPayload: templateResult.raw,
    });
    return { success: true };
  }

  const fallbackText = `Welcome to ${BRAND_NAME}, ${name}! You're now part of the underground. We'll notify you about new drops and order updates here.`;

  const textResult = await sendWhatsAppMessage(params.phone, fallbackText);

  if (textResult.success) {
    await persistOutboundMessage({
      customerPhone: params.phone,
      messageId: textResult.messageId,
      messageText: fallbackText,
      status: "sent",
      rawPayload: textResult.raw,
    });
    return { success: true };
  }

  return {
    success: false,
    error: textResult.error ?? templateResult.error ?? "Failed to send welcome message",
  };
}

export async function sendOrderConfirmationWhatsApp(params: {
  phone: string;
  customerName?: string;
  orderId: string;
  amountInr: number;
  productSummary?: string;
}): Promise<{ success: boolean; error?: string }> {
  const name = params.customerName?.trim() || "Customer";
  const amount = String(params.amountInr);
  const orderRef = params.orderId.slice(0, 8).toUpperCase();

  const templateResult = await sendTemplateMessage(
    params.phone,
    whatsappConfig.orderTemplateName,
    [name, orderRef, amount]
  );

  if (templateResult.success) {
    await persistOutboundMessage({
      customerPhone: params.phone,
      messageId: templateResult.messageId,
      messageText: `Order ${orderRef} confirmed — ₹${amount}`,
      templateName: whatsappConfig.orderTemplateName,
      status: "sent",
      rawPayload: templateResult.raw,
    });
    return { success: true };
  }

  const summary = params.productSummary ? `\n${params.productSummary}` : "";
  const fallbackText =
    `Hi ${name}, your ${BRAND_NAME} order ${orderRef} is confirmed.` +
    `\nAmount: ₹${amount}.${summary}` +
    `\nWe'll message you when it ships. Questions? Reply here.`;

  const textResult = await sendWhatsAppMessage(params.phone, fallbackText);

  if (textResult.success) {
    await persistOutboundMessage({
      customerPhone: params.phone,
      messageId: textResult.messageId,
      messageText: fallbackText,
      status: "sent",
      rawPayload: textResult.raw,
    });
    return { success: true };
  }

  return {
    success: false,
    error:
      textResult.error ?? templateResult.error ?? "Failed to send order confirmation",
  };
}
