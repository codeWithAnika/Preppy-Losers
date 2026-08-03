import { getSiteUrl } from "@/lib/env/public";

/**
 * Content Security Policy tuned for PREPPY LOSERS:
 * Supabase Auth, Razorpay checkout, Google OAuth, GA4, Sentry.
 */
export function buildContentSecurityPolicy(): string {
  const siteUrl = getSiteUrl();

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'", "https://checkout.razorpay.com"],
    "frame-ancestors": ["'none'"],
    "object-src": ["'none'"],
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      "https://checkout.razorpay.com",
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
    ],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      "https://*.supabase.co",
      "https://www.google-analytics.com",
      "https://www.googletagmanager.com",
    ],
    "font-src": ["'self'", "data:"],
    "connect-src": [
      "'self'",
      siteUrl,
      "https://*.supabase.co",
      "wss://*.supabase.co",
      "https://api.razorpay.com",
      "https://*.ingest.sentry.io",
      "https://*.ingest.us.sentry.io",
      "https://www.google-analytics.com",
      "https://region1.google-analytics.com",
    ],
    "frame-src": [
      "https://api.razorpay.com",
      "https://checkout.razorpay.com",
      "https://accounts.google.com",
    ],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
    "upgrade-insecure-requests": [],
  };

  return Object.entries(directives)
    .map(([key, values]) =>
      values.length === 0 ? key : `${key} ${values.join(" ")}`
    )
    .join("; ");
}

export function getSecurityHeaders(
  options: { includeHsts?: boolean } = {}
): Record<string, string> {
  const headers: Record<string, string> = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), payment=(self)",
    "Content-Security-Policy": buildContentSecurityPolicy(),
    "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    "Cross-Origin-Resource-Policy": "same-site",
  };

  if (options.includeHsts) {
    headers["Strict-Transport-Security"] =
      "max-age=63072000; includeSubDomains; preload";
  }

  return headers;
}

export function getStaticAssetCacheHeaders(
  kind: "immutable" | "public"
): Record<string, string> {
  if (kind === "immutable") {
    return {
      "Cache-Control": "public, max-age=31536000, immutable",
    };
  }

  return {
    "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
  };
}
