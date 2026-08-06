import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildPromoPricing,
  isPromoExpired,
  isPromoNotStarted,
  isPromoUsageExceeded,
  normalizePromoCode,
  type PromoCalculationInput,
} from "@/lib/promo-calculations";
import { isProductPurchasable } from "@/lib/purchasability";
import { mapDropRow } from "@/lib/drops";
import type { DropRow } from "@/lib/drops";
import type {
  PromoCartItemPayload,
  PromoErrorCode,
  ValidatePromoFailure,
  ValidatePromoResult,
  ValidatePromoSuccess,
} from "@/lib/promo.types";

export type {
  PromoCartItemPayload,
  PromoErrorCode,
  ValidatePromoFailure,
  ValidatePromoResult,
  ValidatePromoSuccess,
} from "@/lib/promo.types";

interface SizeStockEntry {
  size: string;
  stock: number;
}

interface ProductWithDropRow {
  id: string;
  name: string;
  price: number;
  size_stock: SizeStockEntry[] | null;
  status: string;
  drop_id: string | null;
  drops: DropRow | DropRow[] | null;
}

interface PromoCodeRow {
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

type OrderValidationResult =
  | { ok: true; totalRupee: number }
  | { ok: false; error: string; code: ValidatePromoFailure["code"] };

function resolveDropJoin(drops: DropRow | DropRow[] | null) {
  if (!drops) return null;
  const row = Array.isArray(drops) ? drops[0] : drops;
  return row ? mapDropRow(row) : null;
}

async function validateOrderSubtotal(
  supabase: SupabaseClient,
  items: PromoCartItemPayload[]
): Promise<OrderValidationResult> {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Your cart is empty.", code: "INVALID_PAYLOAD" };
  }

  const productIds = Array.from(new Set(items.map((item) => item.productId)));
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price, size_stock, status, drop_id, drops(*)")
    .in("id", productIds);

  if (error) {
    return {
      ok: false,
      error: "Server unavailable. Please try again.",
      code: "SERVER_UNAVAILABLE",
    };
  }

  const productMap = new Map(
    ((products ?? []) as ProductWithDropRow[]).map((product) => [product.id, product])
  );

  let totalRupee = 0;

  for (const item of items) {
    if (!item.productId || !item.size || !Number.isInteger(item.quantity) || item.quantity <= 0) {
      return { ok: false, error: "Invalid cart item.", code: "INVALID_PAYLOAD" };
    }

    const row = productMap.get(item.productId);
    if (!row) {
      return { ok: false, error: "Unknown product in cart.", code: "INVALID_PAYLOAD" };
    }

    const drop = resolveDropJoin(row.drops);
    const product = {
      id: row.id,
      dropId: row.drop_id,
      status: row.status as "draft" | "published" | "archived",
      name: row.name,
      description: "",
      details: null,
      price: row.price,
      images: [],
      sizeStock: [],
      dropDate: "",
    };

    if (!isProductPurchasable(product, drop)) {
      return {
        ok: false,
        error: `Product is not available: ${product.name}`,
        code: "INVALID_PAYLOAD",
      };
    }

    const sizeEntry = (row.size_stock ?? []).find((entry) => entry.size === item.size);
    if (!sizeEntry) {
      return {
        ok: false,
        error: `Invalid size ${item.size} for ${product.name}`,
        code: "INVALID_PAYLOAD",
      };
    }

    if (sizeEntry.stock < item.quantity) {
      return {
        ok: false,
        error: "Out of stock for the selected size.",
        code: "OUT_OF_STOCK",
      };
    }

    if (item.price !== row.price) {
      return {
        ok: false,
        error: "Prices changed. Refresh your cart and try again.",
        code: "PRICE_MISMATCH",
      };
    }

    totalRupee += row.price * item.quantity;
  }

  return { ok: true, totalRupee };
}

async function fetchPromoCode(
  supabase: SupabaseClient,
  code: string
): Promise<PromoCodeRow | null> {
  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .ilike("code", code)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as PromoCodeRow;
}

function validatePromoRecord(
  promo: PromoCodeRow,
  subtotalRupee: number
): ValidatePromoFailure | null {
  if (!promo.active) {
    return {
      success: false,
      error: "This promo code is inactive.",
      code: "INACTIVE_CODE",
    };
  }

  if (isPromoNotStarted(promo.starts_at)) {
    return {
      success: false,
      error: "This promo code is not active yet.",
      code: "NOT_STARTED",
    };
  }

  if (isPromoExpired(promo.expires_at)) {
    return {
      success: false,
      error: "This promo code has expired.",
      code: "EXPIRED_CODE",
    };
  }

  if (isPromoUsageExceeded(promo.used_count, promo.max_uses)) {
    return {
      success: false,
      error: "This promo code has reached its usage limit.",
      code: "USAGE_EXCEEDED",
    };
  }

  if (subtotalRupee < Number(promo.minimum_order)) {
    return {
      success: false,
      error: `Minimum order of ₹${Math.ceil(Number(promo.minimum_order))} required for this code.`,
      code: "MINIMUM_NOT_MET",
    };
  }

  return null;
}

export async function validatePromoCheckout(
  supabase: SupabaseClient,
  rawCode: string,
  items: PromoCartItemPayload[]
): Promise<ValidatePromoSuccess | ValidatePromoFailure> {
  const code = normalizePromoCode(rawCode);

  if (!code) {
    return {
      success: false,
      error: "Invalid promo code.",
      code: "INVALID_CODE",
    };
  }

  const orderValidation = await validateOrderSubtotal(supabase, items);
  if (!orderValidation.ok) {
    return {
      success: false,
      error: orderValidation.error,
      code: orderValidation.code,
    };
  }

  const promo = await fetchPromoCode(supabase, code);
  if (!promo) {
    return {
      success: false,
      error: "Invalid promo code.",
      code: "INVALID_CODE",
    };
  }

  const promoError = validatePromoRecord(promo, orderValidation.totalRupee);
  if (promoError) {
    return promoError;
  }

  const promoInput: PromoCalculationInput = {
    type: promo.type,
    value: Number(promo.value),
    maximumDiscount:
      promo.maximum_discount === null ? null : Number(promo.maximum_discount),
  };

  const pricing = buildPromoPricing(orderValidation.totalRupee, promoInput);

  return {
    success: true,
    promoCode: normalizePromoCode(promo.code),
    subtotal: pricing.subtotalRupee,
    discount: pricing.discountRupee,
    finalAmount: pricing.finalRupee,
  };
}
