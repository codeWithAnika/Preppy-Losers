import type { SupabaseClient } from "@supabase/supabase-js";
import type { CartItem } from "@/lib/cart";
import {
  getFunctionErrorMessage,
  type FunctionResponseBody,
} from "@/lib/payment-utils";

export type PromoErrorCode =
  | "INVALID_CODE"
  | "INACTIVE_CODE"
  | "EXPIRED_CODE"
  | "NOT_STARTED"
  | "MINIMUM_NOT_MET"
  | "USAGE_EXCEEDED";

export interface AppliedPromo {
  promoCode: string;
  subtotal: number;
  discount: number;
  finalAmount: number;
}

export interface ValidatePromoResponse extends FunctionResponseBody {
  promoCode?: string;
  subtotal?: number;
  discount?: number;
  finalAmount?: number;
}

const PROMO_USER_MESSAGES: Record<PromoErrorCode, string> = {
  INVALID_CODE: "Invalid promo code.",
  INACTIVE_CODE: "This promo code is inactive.",
  EXPIRED_CODE: "This promo code has expired.",
  NOT_STARTED: "This promo code is not active yet.",
  MINIMUM_NOT_MET: "Minimum order amount not reached for this code.",
  USAGE_EXCEEDED: "This promo code has reached its usage limit.",
};

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

export async function invokeValidatePromo(
  supabase: SupabaseClient,
  code: string,
  items: CartItem[]
): Promise<{ data: ValidatePromoResponse | null; error: unknown }> {
  const { data, error } = await supabase.functions.invoke("validate-promo-code", {
    body: { code, items },
  });

  return {
    data: data as ValidatePromoResponse | null,
    error,
  };
}

export async function getValidatePromoErrorMessage(
  error: unknown,
  data: ValidatePromoResponse | null
): Promise<string> {
  const mapped = mapPromoErrorToUserMessage(data);
  if (mapped !== "Unable to apply promo code.") {
    return mapped;
  }

  return getFunctionErrorMessage(error, data, "Unable to apply promo code.");
}

export function toAppliedPromo(data: ValidatePromoResponse): AppliedPromo | null {
  if (
    !data.success ||
    !data.promoCode ||
    !Number.isFinite(Number(data.subtotal)) ||
    !Number.isFinite(Number(data.discount)) ||
    !Number.isFinite(Number(data.finalAmount))
  ) {
    return null;
  }

  return {
    promoCode: data.promoCode,
    subtotal: Number(data.subtotal),
    discount: Number(data.discount),
    finalAmount: Number(data.finalAmount),
  };
}
