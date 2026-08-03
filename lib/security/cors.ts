import { getAllowedOrigins } from "@/lib/env/public";

export function resolveCorsOrigin(requestOrigin: string | null): string | null {
  const allowed = getAllowedOrigins();

  if (!requestOrigin) {
    return allowed[0] ?? null;
  }

  if (allowed.includes(requestOrigin)) {
    return requestOrigin;
  }

  return null;
}

export function getCorsHeaders(requestOrigin: string | null): HeadersInit {
  const origin = resolveCorsOrigin(requestOrigin);

  if (!origin) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, content-type, x-request-id, x-csrf-token",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

/** Edge Function CORS — restrict to allowed origins in production. */
export function getEdgeCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const origin = resolveCorsOrigin(requestOrigin);

  if (!origin) {
    return {
      "Access-Control-Allow-Origin": "null",
      Vary: "Origin",
    };
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}
