export type CartItem = {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  size: string;
  quantity: number;
  maxStock: number;
};

export type ShippingAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
};

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getCartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartItemKey(productId: string, size: string): string {
  return `${productId}:${size}`;
}
