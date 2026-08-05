"use server";

import { revalidatePath } from "next/cache";
import { assertAdminAction } from "@/lib/auth/is-admin";
import { normalizePromoCode } from "@/lib/promo-calculations";
import type { PromoCodeFormInput } from "@/lib/admin/types";

function parseOptionalNumber(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (!Number.isFinite(value)) return null;
  return value;
}

function parseOptionalDate(value: string | null | undefined): string | null {
  if (!value || !value.trim()) return null;
  return new Date(value).toISOString();
}

function promoPayload(input: PromoCodeFormInput) {
  const code = normalizePromoCode(input.code);
  if (!code) {
    throw new Error("Promo code is required");
  }

  return {
    code,
    type: input.type,
    value: input.value,
    minimum_order: input.minimumOrder ?? 0,
    maximum_discount: parseOptionalNumber(input.maximumDiscount),
    max_uses: parseOptionalNumber(input.maxUses),
    active: input.active,
    starts_at: parseOptionalDate(input.startsAt),
    expires_at: parseOptionalDate(input.expiresAt),
  };
}

export async function createPromoCodeAction(input: PromoCodeFormInput) {
  const { supabase } = await assertAdminAction();

  try {
    const payload = promoPayload(input);
    const { error } = await supabase.from("promo_codes").insert(payload);
    if (error) return { success: false as const, error: error.message };

    revalidatePath("/admin/promo-codes");
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Invalid promo code input",
    };
  }
}

export async function updatePromoCodeAction(input: PromoCodeFormInput) {
  const { supabase } = await assertAdminAction();
  if (!input.id) return { success: false as const, error: "Missing promo code id" };

  try {
    const payload = promoPayload(input);
    const { error } = await supabase
      .from("promo_codes")
      .update(payload)
      .eq("id", input.id);

    if (error) return { success: false as const, error: error.message };

    revalidatePath("/admin/promo-codes");
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Invalid promo code input",
    };
  }
}

export async function togglePromoCodeActiveAction(id: string, active: boolean) {
  const { supabase } = await assertAdminAction();

  const { error } = await supabase
    .from("promo_codes")
    .update({ active })
    .eq("id", id);

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/admin/promo-codes");
  return { success: true as const };
}

export async function deletePromoCodeAction(id: string) {
  const { supabase } = await assertAdminAction();

  const { error } = await supabase.from("promo_codes").delete().eq("id", id);
  if (error) return { success: false as const, error: error.message };

  revalidatePath("/admin/promo-codes");
  return { success: true as const };
}
