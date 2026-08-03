import "server-only";

import type { ReactElement } from "react";
import { Resend } from "resend";
import { logger } from "@/lib/logging/logger";
import {
  getFromEmail,
  getResendApiKey,
  isEmailConfigured,
} from "@/lib/email/config";

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

type SendEmailBase = {
  to: string | string[];
  subject: string;
  replyTo?: string;
};

export type SendEmailParams = SendEmailBase &
  (
    | { html: string; react?: never }
    | { react: ReactElement; html?: never }
  );

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
  skipped?: boolean;
}

export async function sendEmail(
  params: SendEmailParams
): Promise<SendEmailResult> {
  if (!isEmailConfigured()) {
    logger.warn("system", "Email skipped — RESEND_API_KEY or RESEND_FROM_EMAIL not set", {
      meta: { subject: params.subject },
    });
    return { success: false, skipped: true, error: "Email not configured" };
  }

  const from = getFromEmail();
  const client = getResendClient();

  if (!from || !client) {
    return { success: false, skipped: true, error: "Email not configured" };
  }

  try {
    const { data, error } = await client.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      replyTo: params.replyTo,
      ...(params.react ? { react: params.react } : { html: params.html }),
    });

    if (error) {
      logger.error("system", "Resend send failed", undefined, {
        meta: { subject: params.subject, error: error.message },
      });
      return { success: false, error: error.message };
    }

    logger.info("system", "Email sent via Resend", {
      meta: { subject: params.subject, id: data?.id },
    });

    return { success: true, id: data?.id };
  } catch (error) {
    logger.error("system", "Resend send exception", error, {
      meta: { subject: params.subject },
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
