"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CustomerAddressInput } from "@/lib/customer-addresses";

function validateInput(input: CustomerAddressInput): string | null {
  if (!input.fullName.trim()) return "Full name is required.";
  if (!input.line1.trim()) return "Address line 1 is required.";
  if (!input.city.trim()) return "City is required.";
  if (!input.state.trim()) return "State is required.";
  if (!/^\d{6}$/.test(input.pincode.trim())) return "Enter a valid 6-digit pincode.";
  if (input.phone.replace(/\D/g, "").length < 10) return "Enter a valid phone number.";
  return null;
}

function toRowPayload(input: CustomerAddressInput) {
  return {
    full_name: input.fullName.trim(),
    phone: input.phone.trim(),
    address_line_1: input.line1.trim(),
    address_line_2: input.line2?.trim() || null,
    city: input.city.trim(),
    state: input.state.trim(),
    pincode: input.pincode.trim(),
    country: input.country?.trim() || "India",
    is_default: input.isDefault ?? false,
  };
}

export async function createCustomerAddressAction(
  input: CustomerAddressInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const validationError = validateInput(input);
  if (validationError) return { ok: false, error: validationError };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "You must be signed in." };

  const { data, error } = await supabase
    .from("customer_addresses")
    .insert({
      user_id: user.id,
      ...toRowPayload(input),
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath("/account");
  revalidatePath("/checkout");
  return { ok: true, id: data.id };
}

export async function updateCustomerAddressAction(
  id: string,
  input: CustomerAddressInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const validationError = validateInput(input);
  if (validationError) return { ok: false, error: validationError };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "You must be signed in." };

  const { error } = await supabase
    .from("customer_addresses")
    .update(toRowPayload(input))
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/account");
  revalidatePath("/checkout");
  return { ok: true };
}

export async function deleteCustomerAddressAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "You must be signed in." };

  const { error } = await supabase
    .from("customer_addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/account");
  revalidatePath("/checkout");
  return { ok: true };
}

export async function setDefaultCustomerAddressAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "You must be signed in." };

  const { error } = await supabase
    .from("customer_addresses")
    .update({ is_default: true })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/account");
  revalidatePath("/checkout");
  return { ok: true };
}

/** Save address after successful checkout (upsert by matching lines). */
export async function saveCheckoutAddressAction(
  input: CustomerAddressInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const validationError = validateInput(input);
  if (validationError) return { ok: false, error: validationError };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "You must be signed in." };

  const { data: existing } = await supabase
    .from("customer_addresses")
    .select("id")
    .eq("user_id", user.id)
    .eq("address_line_1", input.line1.trim())
    .eq("pincode", input.pincode.trim())
    .maybeSingle();

  if (existing?.id) {
    const result = await updateCustomerAddressAction(existing.id, {
      ...input,
      isDefault: true,
    });
    if (!result.ok) return result;
    return { ok: true, id: existing.id };
  }

  return createCustomerAddressAction({ ...input, isDefault: true });
}
