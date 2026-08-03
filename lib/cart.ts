/** Fallback stock cap when legacy cart items lack maxStock. */
const FALLBACK_MAX_STOCK = 30;

export type CartItem = {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  size: string;
  quantity: number;
  maxStock: number;
};

/** Raw persisted cart entry (legacy field names and loose types). */
type RawCartItem = {
  productId?: unknown;
  id?: unknown;
  productName?: unknown;
  name?: unknown;
  productImage?: unknown;
  image?: unknown;
  price?: unknown;
  size?: unknown;
  quantity?: unknown;
  maxStock?: unknown;
};

export function parsePrice(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return value;
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/[₹,\s]/g, "");
    const parsed = Number(cleaned);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
  }

  return null;
}

function parseQuantity(value: unknown): number | null {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : Number.NaN;

  if (!Number.isFinite(parsed) || parsed < 1) {
    return null;
  }

  return Math.floor(parsed);
}

function parseMaxStock(value: unknown, quantity: number): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : Number.NaN;

  if (Number.isFinite(parsed) && parsed >= quantity) {
    return Math.floor(parsed);
  }

  return Math.max(quantity, FALLBACK_MAX_STOCK);
}

/** Normalize legacy or malformed persisted cart entries. Returns null if unusable. */
export function normalizeCartItem(raw: unknown): CartItem | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const entry = raw as RawCartItem;
  const productId = entry.productId ?? entry.id;
  const productName = entry.productName ?? entry.name;
  const productImage = entry.productImage ?? entry.image;
  const size = entry.size;

  if (typeof productId !== "string" || !productId.trim()) {
    return null;
  }
  if (typeof productName !== "string" || !productName.trim()) {
    return null;
  }
  if (typeof size !== "string" || !size.trim()) {
    return null;
  }

  const price = parsePrice(entry.price);
  const quantity = parseQuantity(entry.quantity);
  if (price === null || quantity === null) {
    return null;
  }

  const image =
    typeof productImage === "string" && productImage.trim()
      ? productImage
      : "/product-placeholder.webp";

  return {
    productId: productId.trim(),
    productName: productName.trim(),
    productImage: image,
    price,
    size: size.trim(),
    quantity,
    maxStock: parseMaxStock(entry.maxStock, quantity),
  };
}

export function normalizeCartItems(items: unknown): CartItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  const normalized: CartItem[] = [];

  for (const item of items) {
    const next = normalizeCartItem(item);
    if (next) {
      normalized.push(next);
    } else if (process.env.NODE_ENV !== "production") {
      console.warn("[cart] Dropping invalid cart item during normalization:", item);
    }
  }

  return normalized;
}

export function isValidCartItem(item: CartItem): boolean {
  return (
    typeof item.productId === "string" &&
    item.productId.length > 0 &&
    typeof item.productName === "string" &&
    item.productName.length > 0 &&
    typeof item.size === "string" &&
    item.size.length > 0 &&
    Number.isFinite(item.price) &&
    item.price >= 0 &&
    Number.isFinite(item.quantity) &&
    item.quantity >= 1 &&
    Number.isFinite(item.maxStock) &&
    item.maxStock >= item.quantity
  );
}

export function getCartValidationError(items: CartItem[]): string | null {
  if (items.length === 0) {
    return "Your cart is empty.";
  }

  const invalid = items.filter((item) => !isValidCartItem(item));
  if (invalid.length > 0) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[cart] Invalid cart items detected:", invalid);
    }
    return "Some items in your cart are invalid. Please remove them and add products again.";
  }

  return null;
}

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
  return items.reduce((sum, item) => {
    if (!Number.isFinite(item.price) || !Number.isFinite(item.quantity)) {
      return sum;
    }
    return sum + item.price * item.quantity;
  }, 0);
}

export function getCartItemKey(productId: string, size: string): string {
  return `${productId}:${size}`;
}
