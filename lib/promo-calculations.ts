export type PromoType = "percentage" | "fixed";

export interface PromoCalculationInput {
  type: PromoType;
  value: number;
  maximumDiscount: number | null;
}

export function normalizePromoCode(code: string): string {
  return code.trim().toUpperCase();
}

export function calculateDiscountRupee(
  promo: PromoCalculationInput,
  subtotalRupee: number
): number {
  if (subtotalRupee <= 0) {
    return 0;
  }

  let discount = 0;

  if (promo.type === "percentage") {
    discount = (subtotalRupee * promo.value) / 100;
    if (promo.maximumDiscount !== null) {
      discount = Math.min(discount, promo.maximumDiscount);
    }
  } else {
    discount = promo.value;
  }

  discount = Math.floor(discount);
  return Math.min(Math.max(0, discount), subtotalRupee);
}

export function buildPromoPricing(
  subtotalRupee: number,
  promo: PromoCalculationInput
): {
  subtotalRupee: number;
  discountRupee: number;
  finalRupee: number;
} {
  const discountRupee = calculateDiscountRupee(promo, subtotalRupee);
  const finalRupee = Math.max(0, subtotalRupee - discountRupee);

  return {
    subtotalRupee,
    discountRupee,
    finalRupee,
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

export function isPromoExpired(expiresAt: string | null, now = new Date()): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < now;
}

export function isPromoNotStarted(startsAt: string | null, now = new Date()): boolean {
  if (!startsAt) return false;
  return new Date(startsAt) > now;
}

export function isPromoUsageExceeded(
  usedCount: number,
  maxUses: number | null
): boolean {
  if (maxUses === null) return false;
  return usedCount >= maxUses;
}
