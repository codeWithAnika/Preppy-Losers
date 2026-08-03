const PRODUCTION_DOMAIN = "preppylosers.com";

function getAllowedOrigins(): string[] {
  const fromEnv = Deno.env.get("ALLOWED_ORIGINS");
  if (fromEnv) {
    return fromEnv.split(",").map((o) => o.trim()).filter(Boolean);
  }

  return [
    `https://${PRODUCTION_DOMAIN}`,
    `https://www.${PRODUCTION_DOMAIN}`,
  ];
}

export function getEdgeCorsHeaders(
  requestOrigin: string | null
): Record<string, string> {
  const allowed = getAllowedOrigins();

  if (requestOrigin && allowed.includes(requestOrigin)) {
    return {
      "Access-Control-Allow-Origin": requestOrigin,
      "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      Vary: "Origin",
    };
  }

  if (Deno.env.get("ENVIRONMENT") !== "production") {
    return {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    };
  }

  return {
    "Access-Control-Allow-Origin": "null",
    Vary: "Origin",
  };
}

export function corsHeadersForRequest(req: Request): Record<string, string> {
  return getEdgeCorsHeaders(req.headers.get("Origin"));
}

/** Default headers when request is unavailable (prefer corsHeadersForRequest). */
export const corsHeaders = getEdgeCorsHeaders(null);
