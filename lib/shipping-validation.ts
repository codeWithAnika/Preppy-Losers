/** Shared shipping address validation for checkout (client + server actions). */

export interface ShippingAddressFields {
  fullName?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  country?: string;
}

const MAX_NAME_LENGTH = 120;
const MAX_LINE_LENGTH = 200;
const MAX_CITY_LENGTH = 80;

export function normalizePhoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** Indian mobile: 10 digits starting 6–9, or +91 prefix. */
export function isValidPhone(phone: string): boolean {
  const digits = normalizePhoneDigits(phone);
  if (digits.length === 10) {
    return /^[6-9]\d{9}$/.test(digits);
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return /^91[6-9]\d{9}$/.test(digits);
  }
  return false;
}

export function normalizeShippingAddressInput(
  address: ShippingAddressFields,
  fallbackFullName = ""
): ShippingAddressFields {
  const fullName = (address.fullName?.trim() || fallbackFullName.trim()).slice(
    0,
    MAX_NAME_LENGTH
  );

  return {
    fullName: fullName || undefined,
    line1: address.line1.trim().slice(0, MAX_LINE_LENGTH),
    line2: address.line2?.trim().slice(0, MAX_LINE_LENGTH) || undefined,
    city: address.city.trim().slice(0, MAX_CITY_LENGTH),
    state: address.state.trim().slice(0, MAX_CITY_LENGTH),
    pincode: address.pincode.trim(),
    phone: address.phone.trim(),
    country: address.country?.trim() || "India",
  };
}

export function isValidShippingAddress(
  address: ShippingAddressFields | null | undefined
): boolean {
  if (!address) return false;

  const fullName = address.fullName?.trim() ?? "";

  return (
    fullName.length >= 2 &&
    fullName.length <= MAX_NAME_LENGTH &&
    address.line1.trim().length >= 3 &&
    address.line1.trim().length <= MAX_LINE_LENGTH &&
    address.city.trim().length >= 2 &&
    address.city.trim().length <= MAX_CITY_LENGTH &&
    address.state.trim().length >= 2 &&
    address.state.trim().length <= MAX_CITY_LENGTH &&
    /^\d{6}$/.test(address.pincode.trim()) &&
    isValidPhone(address.phone)
  );
}

export function getShippingAddressError(
  address: ShippingAddressFields,
  fallbackFullName = ""
): string | null {
  const normalized = normalizeShippingAddressInput(address, fallbackFullName);

  if (isValidShippingAddress(normalized)) {
    return null;
  }

  const fullName = normalized.fullName?.trim() ?? "";
  if (fullName.length < 2) {
    return "Please enter your full name.";
  }
  if (normalized.line1.trim().length < 3) {
    return "Please enter a complete street address.";
  }
  if (normalized.city.trim().length < 2 || normalized.state.trim().length < 2) {
    return "Please enter your city and state.";
  }
  if (!/^\d{6}$/.test(normalized.pincode.trim())) {
    return "Enter a valid 6-digit pincode.";
  }
  if (!isValidPhone(normalized.phone)) {
    return "Enter a valid 10-digit Indian mobile number.";
  }

  return "Please enter a complete shipping address.";
}
