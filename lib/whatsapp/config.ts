import "server-only";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/** Safe read for webhook routes — does not throw when unset. */
export function isWhatsAppWebhookConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_VERIFY_TOKEN);
}

export function getWhatsAppVerifyToken(): string | null {
  return process.env.WHATSAPP_VERIFY_TOKEN ?? null;
}

export function getWhatsAppAppSecret(): string | undefined {
  return process.env.WHATSAPP_APP_SECRET;
}

export function isWhatsAppSendConfigured(): boolean {
  return Boolean(
    process.env.WHATSAPP_PHONE_ID && process.env.WHATSAPP_ACCESS_TOKEN
  );
}

export const whatsappConfig = {
  get phoneId(): string {
    return requireEnv("WHATSAPP_PHONE_ID");
  },

  get businessId(): string {
    return process.env.WHATSAPP_BUSINESS_ID ?? "";
  },

  get accessToken(): string {
    return requireEnv("WHATSAPP_ACCESS_TOKEN");
  },

  get verifyToken(): string {
    return requireEnv("WHATSAPP_VERIFY_TOKEN");
  },

  get appSecret(): string | undefined {
    return process.env.WHATSAPP_APP_SECRET;
  },

  /** Customer-facing number for wa.me links (digits only, e.g. 919876543210). */
  get waMeNumber(): string {
    return process.env.WHATSAPP_WA_ME_NUMBER ?? "";
  },

  get apiVersion(): string {
    return process.env.WHATSAPP_API_VERSION ?? "v21.0";
  },

  get welcomeTemplateName(): string {
    return process.env.WHATSAPP_WELCOME_TEMPLATE ?? "welcome_message";
  },

  get orderTemplateName(): string {
    return process.env.WHATSAPP_ORDER_TEMPLATE ?? "order_confirmation";
  },

  get graphApiBaseUrl(): string {
    return `https://graph.facebook.com/${this.apiVersion}/${this.phoneId}/messages`;
  },
} as const;
