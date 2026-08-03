import { createClient } from "@/lib/supabase/server";
import type { ShippingAddress } from "@/lib/cart";
import { mapAddressRow, type AddressRow } from "@/lib/address";

export async function getDefaultAddress(
  userId: string
): Promise<(ShippingAddress & { id: string }) | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch address: ${error.message}`);
  }

  if (!data) return null;
  return mapAddressRow(data as AddressRow);
}

export async function saveAddress(
  userId: string,
  address: ShippingAddress
): Promise<void> {
  const supabase = createClient();

  const { data: existing } = await supabase
    .from("addresses")
    .select("id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("addresses")
      .update({
        line1: address.line1,
        line2: address.line2 ?? null,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        phone: address.phone,
        is_default: true,
      })
      .eq("id", existing.id);

    if (error) throw new Error(`Failed to update address: ${error.message}`);
    return;
  }

  const { error } = await supabase.from("addresses").insert({
    user_id: userId,
    line1: address.line1,
    line2: address.line2 ?? null,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    phone: address.phone,
    is_default: true,
  });

  if (error) throw new Error(`Failed to save address: ${error.message}`);
}
