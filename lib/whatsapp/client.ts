import "server-only";

import { logger } from "@/lib/logging/logger";
import { whatsappConfig } from "@/lib/whatsapp/config";

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  raw?: unknown;
}

export interface TemplateVariable {
  type: "text";
  text: string;
}

/** Normalize to WhatsApp API format: digits only, no + prefix. */
export function normalizeWhatsAppPhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    digits = `91${digits}`;
  }

  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  return digits;
}

export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string
): Promise<WhatsAppSendResult> {
  const to = normalizeWhatsAppPhone(phoneNumber);

  try {
    const response = await fetch(whatsappConfig.graphApiBaseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${whatsappConfig.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      }),
    });

    const raw = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error =
        (raw as { error?: { message?: string } })?.error?.message ??
        `WhatsApp API error (${response.status})`;

      logger.error("system", "WhatsApp text message failed", undefined, {
        meta: { to, status: response.status, error },
      });

      return { success: false, error, raw };
    }

    const messageId = (raw as { messages?: { id: string }[] })?.messages?.[0]?.id;

    logger.info("system", "WhatsApp text message sent", {
      meta: { to, messageId },
    });

    return { success: true, messageId, raw };
  } catch (error) {
    logger.error("system", "WhatsApp text message exception", error, {
      meta: { to },
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function sendTemplateMessage(
  phoneNumber: string,
  templateName: string,
  variables: string[] = [],
  languageCode = "en"
): Promise<WhatsAppSendResult> {
  const to = normalizeWhatsAppPhone(phoneNumber);

  const components =
    variables.length > 0
      ? [
          {
            type: "body",
            parameters: variables.map((text): TemplateVariable => ({
              type: "text",
              text,
            })),
          },
        ]
      : undefined;

  try {
    const response = await fetch(whatsappConfig.graphApiBaseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${whatsappConfig.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          ...(components ? { components } : {}),
        },
      }),
    });

    const raw = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error =
        (raw as { error?: { message?: string } })?.error?.message ??
        `WhatsApp template API error (${response.status})`;

      logger.error("system", "WhatsApp template message failed", undefined, {
        meta: { to, templateName, status: response.status, error },
      });

      return { success: false, error, raw };
    }

    const messageId = (raw as { messages?: { id: string }[] })?.messages?.[0]?.id;

    logger.info("system", "WhatsApp template message sent", {
      meta: { to, templateName, messageId },
    });

    return { success: true, messageId, raw };
  } catch (error) {
    logger.error("system", "WhatsApp template message exception", error, {
      meta: { to, templateName },
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
