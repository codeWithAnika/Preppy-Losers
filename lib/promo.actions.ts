"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validatePromoCheckout } from "@/lib/promo-validation.server";
import type {
  PromoCartItemPayload,
  ValidatePromoResult,
} from "@/lib/promo.types";

export async function validatePromoCodeAction(
  code: string,
  items: PromoCartItemPayload[]
): Promise<ValidatePromoResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Your session expired. Please sign in again.",
      code: "UNAUTHORIZED",
    };
  }

  try {
    const admin = createAdminClient();
    return await validatePromoCheckout(admin, code, items);
  } catch {
    return {
      success: false,
      error: "Unable to validate promo code.",
      code: "SERVER_UNAVAILABLE",
    };
  }
}
