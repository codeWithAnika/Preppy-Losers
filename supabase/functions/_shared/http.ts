import { corsHeaders } from "./cors.ts";
import type { PaymentErrorBody } from "./payment-errors.ts";

export function jsonResponse(
  body: Record<string, unknown> | PaymentErrorBody,
  status: number
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function okResponse(body: Record<string, unknown>): Response {
  return jsonResponse(body, 200);
}
