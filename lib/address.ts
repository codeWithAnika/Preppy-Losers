import type { ShippingAddress } from "@/lib/cart";

export type AddressRow = {
  id: string;
  user_id: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  phone: string | null;
  is_default: boolean;
};

export function mapAddressRow(row: AddressRow): ShippingAddress & { id: string } {
  return {
    id: row.id,
    line1: row.line1,
    line2: row.line2 ?? undefined,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    phone: row.phone ?? "",
  };
}
