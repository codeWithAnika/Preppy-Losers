import type { ShippingAddress } from "@/lib/cart";

export type CustomerAddressRow = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export type CustomerAddress = ShippingAddress & {
  id: string;
  fullName: string;
  country: string;
  isDefault: boolean;
};

export type CustomerAddressInput = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  isDefault?: boolean;
};

export function mapCustomerAddressRow(row: CustomerAddressRow): CustomerAddress {
  return {
    id: row.id,
    fullName: row.full_name,
    line1: row.address_line_1,
    line2: row.address_line_2 ?? undefined,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    phone: row.phone,
    country: row.country,
    isDefault: row.is_default,
  };
}

export function toAddressInput(address: CustomerAddress): CustomerAddressInput {
  return {
    fullName: address.fullName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    country: address.country,
    isDefault: address.isDefault,
  };
}

export function toShippingSnapshot(address: CustomerAddress): ShippingAddress {
  return {
    fullName: address.fullName,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    phone: address.phone,
    country: address.country,
  };
}

export function formatAddressOneLine(address: CustomerAddress | ShippingAddress): string {
  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.pincode,
  ].filter(Boolean);
  return parts.join(", ");
}
