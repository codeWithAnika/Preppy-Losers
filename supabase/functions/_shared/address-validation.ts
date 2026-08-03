export interface ShippingAddressPayload {
  fullName?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  country?: string;
}

/** Normalize client shipping input into a complete order snapshot (stored on orders). */
export function normalizeShippingSnapshot(
  address: ShippingAddressPayload
): ShippingAddressPayload {
  return {
    fullName: address.fullName?.trim() || undefined,
    line1: address.line1.trim(),
    line2: address.line2?.trim() || undefined,
    city: address.city.trim(),
    state: address.state.trim(),
    pincode: address.pincode.trim(),
    phone: address.phone.trim(),
    country: address.country?.trim() || "India",
  };
}

export function isValidShippingAddress(
  address: ShippingAddressPayload | null | undefined
): address is ShippingAddressPayload {
  if (!address) return false;

  return (
    address.line1.trim().length >= 3 &&
    address.city.trim().length >= 2 &&
    address.state.trim().length >= 2 &&
    /^\d{6}$/.test(address.pincode.trim()) &&
    address.phone.replace(/\s+/g, "").length >= 10
  );
}
