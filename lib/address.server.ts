import {
  getDefaultCustomerAddress,
  getCustomerAddresses,
} from "@/lib/customer-addresses.server";
import type { ShippingAddress } from "@/lib/cart";
import { toShippingSnapshot } from "@/lib/customer-addresses";

/** @deprecated Use getDefaultCustomerAddress from customer-addresses.server */
export async function getDefaultAddress(
  userId: string
): Promise<(ShippingAddress & { id: string }) | null> {
  const address = await getDefaultCustomerAddress(userId);
  if (!address) return null;
  return { id: address.id, ...toShippingSnapshot(address) };
}

export { getCustomerAddresses, getDefaultCustomerAddress };
