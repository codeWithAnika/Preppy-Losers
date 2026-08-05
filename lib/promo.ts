import type { SupabaseClient } from "@supabase/supabase-js";
import { FunctionsHttpError } from "@supabase/supabase-js";
import type { CartItem } from "@/lib/cart";
import { validatePromoCodeAction } from "@/lib/promo.actions";
import type {
  AppliedPromo,
  PromoCartItemPayload,
  PromoErrorCode,
  ValidatePromoResult,
} from "@/lib/promo.types";
import {
  getFunctionErrorMessage,
  type FunctionResponseBody,
} from "@/lib/payment-utils";

export type {
  AppliedPromo,
  PromoCartItemPayload,
  PromoErrorCode,
  ValidatePromoResult,
} from "@/lib/promo.types";

export type ValidatePromoResponse = FunctionResponseBody &
  Partial<ValidatePromoResult> & {
    promoCode?: string;
    subtotal?: number;
    discount?: number;
    finalAmount?: number;
  };

const PROMO_USER_MESSAGES: Record<PromoErrorCode, string> = {
  INVALID_CODE: "Invalid promo code.",
  INACTIVE_CODE: "This promo code is inactive.",
  EXPIRED_CODE: "This promo code has expired.",
  NOT_STARTED: "This promo code is not active yet.",
  MINIMUM_NOT_MET: "Minimum order amount not reached for this code.",
  USAGE_EXCEEDED: "This promo code has reached its usage limit.",
};

function logPromoDebug(label: string, payload: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "development") {
    console.log(`[promo] ${label}`, payload);
  }
}

export function toPromoCartPayload(items: CartItem[]): PromoCartItemPayload[] {
  return items.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    price: item.price,
    size: item.size,
    quantity: item.quantity,
  }));
}

export function mapPromoErrorToUserMessage(
  data: ValidatePromoResponse | null,
  fallback = "Unable to apply promo code."
): string {
  if (!data) return fallback;

  if (data.error && data.code && data.code in PROMO_USER_MESSAGES) {
    return data.error;
  }

  const code = data.code as PromoErrorCode | undefined;
  if (code && PROMO_USER_MESSAGES[code]) {
    return data.error ?? PROMO_USER_MESSAGES[code];
  }

  if (data.error) {
    return data.error;
  }

  return fallback;
}

async function parseFunctionsHttpError(
  error: FunctionsHttpError
): Promise<ValidatePromoResponse | null> {
  try {
    return (await error.context.json()) as ValidatePromoResponse;
  } catch {
    return null;
  }
}

async function invokeValidatePromoEdge(
  supabase: SupabaseClient,
  code: string,
  items: PromoCartItemPayload[]
): Promise<{ data: ValidatePromoResponse | null; error: unknown }> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {};
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const { data, error } = await supabase.functions.invoke("validate-promo-code", {
    body: { code, items },
    headers,
  });

  if (error instanceof FunctionsHttpError) {
    const body = await parseFunctionsHttpError(error);
    return { data: body ?? (data as ValidatePromoResponse | null), error };
  }

  return {
    data: data as ValidatePromoResponse | null,
    error,
  };
}

export async function invokeValidatePromo(
  supabase: SupabaseClient,
  code: string,
  items: CartItem[]
): Promise<{ data: ValidatePromoResponse | null; error: unknown }> {
  const payload = toPromoCartPayload(items);
  const normalizedCode = code.trim().toUpperCase();

  logPromoDebug("validate request", {
    code: normalizedCode,
    itemCount: payload.length,
    items: payload,
  });

  let data: ValidatePromoResponse | null = null;
  let error: unknown = null;

  try {
    data = await validatePromoCodeAction(normalizedCode, payload);
  } catch (actionError) {
    error = actionError;
    logPromoDebug("server action failed, trying edge function", {
      message: actionError instanceof Error ? actionError.message : String(actionError),
    });

    const edgeResult = await invokeValidatePromoEdge(supabase, normalizedCode, payload);
    data = edgeResult.data;
    error = edgeResult.error;
  }

  logPromoDebug("validate response", {
    success: data?.success,
    code: data?.code,
    error: data?.error,
    promoCode: data?.promoCode,
    subtotal: data?.subtotal,
    discount: data?.discount,
    finalAmount: data?.finalAmount,
    invokeError: error instanceof Error ? error.message : error ? String(error) : null,
  });

  if (!data && error instanceof FunctionsHttpError) {
    const body = await parseFunctionsHttpError(error);
    if (body) {
      return { data: body, error };
    }
  }

  return { data, error: data?.success ? null : error };
}

export async function getValidatePromoErrorMessage(
  error: unknown,
  data: ValidatePromoResponse | null
): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    const body = (await parseFunctionsHttpError(error)) ?? data;
    const mapped = mapPromoErrorToUserMessage(body);
    if (mapped !== "Unable to apply promo code.") {
      return mapped;
    }
  }

  const mapped = mapPromoErrorToUserMessage(data);
  if (mapped !== "Unable to apply promo code.") {
    return mapped;
  }

  return getFunctionErrorMessage(error, data, "Unable to apply promo code.");
}

export function toAppliedPromo(data: ValidatePromoResponse): AppliedPromo | null {
  if (data.success === false) {
    return null;
  }

  const promoCode = data.promoCode?.trim();
  const subtotal = Number(data.subtotal);
  const discount = Number(data.discount);
  const finalAmount = Number(data.finalAmount);

  if (
    !promoCode ||
    !Number.isFinite(subtotal) ||
    !Number.isFinite(discount) ||
    !Number.isFinite(finalAmount) ||
    finalAmount < 0
  ) {
    return null;
  }

  return {
    promoCode,
    subtotal,
    discount,
    finalAmount,
  };
}

export function logAppliedPromo(applied: AppliedPromo): void {
  logPromoDebug("applied promo", {
    promoCode: applied.promoCode,
    subtotal: applied.subtotal,
    discount: applied.discount,
    finalAmount: applied.finalAmount,
  });
}
