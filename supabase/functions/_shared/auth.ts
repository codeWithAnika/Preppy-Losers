import { createClient, type SupabaseClient, type User } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { jsonResponse } from "./http.ts";
import { logPaymentError } from "./logger.ts";
import { paymentError } from "./payment-errors.ts";

export function getServiceRoleClient(): SupabaseClient | null {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey);
}

export async function getAuthenticatedUser(
  req: Request,
  scope: string
): Promise<{ user: User; supabaseUser: SupabaseClient } | Response> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    logPaymentError(scope, "Missing Authorization header", new Error("no auth"));
    const { body, status } = paymentError("UNAUTHORIZED", 401);
    return jsonResponse(body, status);
  }

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!url || !anonKey) {
    const { body, status } = paymentError("SERVER_ERROR", 500);
    return jsonResponse(body, status);
  }

  const supabaseUser = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error,
  } = await supabaseUser.auth.getUser();

  if (error || !user) {
    logPaymentError(scope, "Auth failed", error ?? new Error("no user"));
    const { body, status } = paymentError("UNAUTHORIZED", 401);
    return jsonResponse(body, status);
  }

  return { user, supabaseUser };
}
