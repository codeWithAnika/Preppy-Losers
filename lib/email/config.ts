import "server-only";

import { SUPPORT_EMAIL } from "@/lib/legal/constants";

/**
 * Resend email configuration (server-only).
 *
 * Required env vars:
 * - RESEND_API_KEY — API key from Resend dashboard (never expose to client)
 * - RESEND_FROM_EMAIL — verified sender address, e.g. loserspreppy@gmail.com
 *
 * Optional:
 * - RESEND_ADMIN_EMAIL — inbox for new-order alerts (defaults to SUPPORT_EMAIL)
 */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

export function getResendApiKey(): string | null {
  return process.env.RESEND_API_KEY ?? null;
}

/** All outgoing emails use process.env.RESEND_FROM_EMAIL as the Resend `from` field. */
export function getFromEmail(): string | null {
  return process.env.RESEND_FROM_EMAIL ?? null;
}

/** Admin inbox for new-order alerts. Defaults to support email. */
export function getAdminEmail(): string {
  return process.env.RESEND_ADMIN_EMAIL ?? SUPPORT_EMAIL;
}
