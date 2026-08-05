import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export type PromoErrorCode =
  | "INVALID_CODE"
  | "INACTIVE_CODE"
  | "EXPIRED_CODE"
  | "NOT_STARTED"
  | "MINIMUM_NOT_MET"
  | "USAGE_EXCEEDED";

export interface PromoCodeRow {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minimum_order: number;
  maximum_discount: number | null;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  starts_at: string | null;
  expires_at: string | null;
}

export interface PromoPricing {
  promoCode: string;
  promoId: string;
  subtotalRupee: number;
  discountRupee: number;
  finalRupee: number;
  subtotalPaise: number;
  discountPaise: number;
  finalPaise: number;
}

type PromoFailure = {
  ok: false;
  error: string;
  code: PromoErrorCode;
};

type PromoSuccess = { ok: true; pricing: PromoPricing };

export function normalizePromoCode(code: string): string {
  return code.trim().toUpperCase();
}

function rupeeToPaise(amount: number): number {
  return Math.round(amount * 100);
}

export function calculateDiscountRupee(
  promo: Pick<PromoCodeRow, "type" | "value" | "maximum_discount">,
  subtotalRupee: number
): number {
  if (subtotalRupee <= 0) {
    return 0;
  }

  let discount = 0;

  if (promo.type === "percentage") {
    discount = (subtotalRupee * Number(promo.value)) / 100;
    if (promo.maximum_discount !== null) {
      discount = Math.min(discount, Number(promo.maximum_discount));
    }
  } else {
    discount = Number(promo.value);
  }

  discount = Math.floor(discount);
  return Math.min(Math.max(0, discount), subtotalRupee);
}

export function buildPromoPricing(
  promo: PromoCodeRow,
  subtotalRupee: number
): PromoPricing {
  const discountRupee = calculateDiscountRupee(promo, subtotalRupee);
  const finalRupee = Math.max(0, subtotalRupee - discountRupee);

  return {
    promoCode: normalizePromoCode(promo.code),
    promoId: promo.id,
    subtotalRupee,
    discountRupee,
    finalRupee,
    subtotalPaise: rupeeToPaise(subtotalRupee),
    discountPaise: rupeeToPaise(discountRupee),
    finalPaise: rupeeToPaise(finalRupee),
  };
}

function validatePromoWindow(promo: PromoCodeRow, now = new Date()): PromoFailure | null {
  if (!promo.active) {
    return {
      ok: false,
      error: "This promo code is inactive.",
      code: "INACTIVE_CODE",
    };
  }

  if (promo.starts_at && new Date(promo.starts_at) > now) {
    return {
      ok: false,
      error: "This promo code is not active yet.",
      code: "NOT_STARTED",
    };
  }

  if (promo.expires_at && new Date(promo.expires_at) < now) {
    return {
      ok: false,
      error: "This promo code has expired.",
      code: "EXPIRED_CODE",
    };
  }

  if (promo.max_uses !== null && promo.used_count >= promo.max_uses) {
    return {
      ok: false,
      error: "This promo code has reached its usage limit.",
      code: "USAGE_EXCEEDED",
    };
  }

  return null;
}

export async function validatePromoForSubtotal(
  supabase: SupabaseClient,
  rawCode: string,
  subtotalRupee: number
): Promise<PromoSuccess | PromoFailure> {
  const code = normalizePromoCode(rawCode);

  if (!code) {
    return {
      ok: false,
      error: "Invalid promo code.",
      code: "INVALID_CODE",
    };
  }

  if (!Number.isFinite(subtotalRupee) || subtotalRupee <= 0) {
    return {
      ok: false,
      error: "Invalid promo code.",
      code: "INVALID_CODE",
    };
  }

  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      error: "Unable to validate promo code.",
      code: "INVALID_CODE",
    };
  }

  if (!data) {
    return {
      ok: false,
      error: "Invalid promo code.",
      code: "INVALID_CODE",
    };
  }

  const promo = data as PromoCodeRow;
  const windowError = validatePromoWindow(promo);
  if (windowError) {
    return windowError;
  }

  if (subtotalRupee < Number(promo.minimum_order)) {
    return {
      ok: false,
      error: `Minimum order of ₹${Math.ceil(Number(promo.minimum_order))} required for this code.`,
      code: "MINIMUM_NOT_MET",
    };
  }

  return {
    ok: true,
    pricing: buildPromoPricing(promo, subtotalRupee),
  };
}

export function applyDiscountToLineAmounts(
  lineAmounts: number[],
  discountRupee: number
): number[] {
  if (lineAmounts.length === 0) {
    return [];
  }

  if (discountRupee <= 0) {
    return [...lineAmounts];
  }

  const subtotal = lineAmounts.reduce((sum, amount) => sum + amount, 0);
  if (subtotal <= 0) {
    return lineAmounts.map(() => 0);
  }

  const cappedDiscount = Math.min(discountRupee, subtotal);
  let remainingDiscount = cappedDiscount;
  const adjusted: number[] = [];

  lineAmounts.forEach((lineAmount, index) => {
    if (index === lineAmounts.length - 1) {
      adjusted.push(Math.max(0, lineAmount - remainingDiscount));
      return;
    }

    const share = Math.floor((cappedDiscount * lineAmount) / subtotal);
    remainingDiscount -= share;
    adjusted.push(Math.max(0, lineAmount - share));
  });

  return adjusted;
}
