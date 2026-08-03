export interface OrderEmailItem {
  productName: string;
  size: string;
  quantity: number;
  lineTotalInr: number;
}

export interface ShippingAddressDisplay {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
}

export interface OrderConfirmationEmailProps {
  customerName: string;
  orderRef: string;
  paymentId?: string;
  amountInr: number;
  items: OrderEmailItem[];
  shippingAddress?: ShippingAddressDisplay;
  /** Optional override for inbox preview text. */
  previewText?: string;
}
