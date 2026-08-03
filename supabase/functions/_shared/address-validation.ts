export interface ShippingAddressPayload {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
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
