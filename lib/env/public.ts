/** Safe to import from client and server. Never put secrets here. */

const PRODUCTION_DOMAIN = "preppylosers.com";
const PRODUCTION_SITE_URL = `https://${PRODUCTION_DOMAIN}`;

function isProductionSiteHostname(hostname: string): boolean {
  return (
    hostname === PRODUCTION_DOMAIN || hostname === `www.${PRODUCTION_DOMAIN}`
  );
}

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    (process.env.NODE_ENV === "production"
      ? PRODUCTION_SITE_URL
      : "http://localhost:3000")
  );
}

/**
 * Canonical site URL for customer-facing transactional emails.
 * Always resolves to production — never localhost, Vercel preview, or deploy URLs.
 */
export function getEmailSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

  if (fromEnv) {
    try {
      const parsed = new URL(
        fromEnv.startsWith("http") ? fromEnv : `https://${fromEnv}`
      );
      if (isProductionSiteHostname(parsed.hostname)) {
        return parsed.origin;
      }
    } catch {
      // Fall through to production default.
    }
  }

  return PRODUCTION_SITE_URL;
}

export function getAllowedOrigins(): string[] {
  const fromEnv = process.env.ALLOWED_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (fromEnv?.length) {
    return fromEnv;
  }

  const siteUrl = getSiteUrl();
  const origins = new Set<string>([siteUrl]);

  if (process.env.NODE_ENV === "production") {
    origins.add(`https://${PRODUCTION_DOMAIN}`);
    origins.add(`https://www.${PRODUCTION_DOMAIN}`);
  }

  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }

  return Array.from(origins);
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
  siteUrl: getSiteUrl(),
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "",
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? "",
  sentryEnabled:
    process.env.NEXT_PUBLIC_SENTRY_DSN !== undefined &&
    process.env.NEXT_PUBLIC_SENTRY_DSN !== "",
} as const;
