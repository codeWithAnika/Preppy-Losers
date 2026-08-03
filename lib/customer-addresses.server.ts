import { createClient } from "@/lib/supabase/server";
import {
  mapCustomerAddressRow,
  type CustomerAddress,
  type CustomerAddressRow,
} from "@/lib/customer-addresses";

export async function getCustomerAddresses(
  userId: string
): Promise<CustomerAddress[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("customer_addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch addresses: ${error.message}`);
  }

  return ((data ?? []) as CustomerAddressRow[]).map(mapCustomerAddressRow);
}

export async function getDefaultCustomerAddress(
  userId: string
): Promise<CustomerAddress | null> {
  const addresses = await getCustomerAddresses(userId);
  return addresses.find((entry) => entry.isDefault) ?? addresses[0] ?? null;
}
