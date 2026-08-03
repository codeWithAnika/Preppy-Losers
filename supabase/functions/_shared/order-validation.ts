import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import type { PaymentErrorCode } from "./payment-errors.ts";

export interface CartItemPayload {
  productId: string;
  productName: string;
  price: number;
  size: string;
  quantity: number;
}

interface SizeStockEntry {
  size: string;
  stock: number;
}

interface ProductRow {
  id: string;
  name: string;
  price: number;
  size_stock: SizeStockEntry[];
  is_active: boolean;
}

export interface ValidatedLineItem {
  productId: string;
  productName: string;
  size: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
}

export interface ValidatedOrder {
  items: ValidatedLineItem[];
  totalRupee: number;
  totalPaise: number;
}

type ValidationFailure = {
  ok: false;
  error: string;
  code: PaymentErrorCode;
  status: number;
};
type ValidationSuccess = { ok: true; order: ValidatedOrder };

const STOCK_ERROR = "Out of stock for the selected size.";
const PRICE_ERROR = "Prices changed. Refresh your cart and try again.";

export async function validateOrderItems(
  supabase: SupabaseClient,
  items: CartItemPayload[]
): Promise<ValidationSuccess | ValidationFailure> {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      ok: false,
      error: "Cart is empty",
      code: "INVALID_PAYLOAD",
      status: 400,
    };
  }

  const productIds = [...new Set(items.map((item) => item.productId))];

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, price, size_stock, is_active")
    .in("id", productIds);

  if (productsError) {
    return {
      ok: false,
      error: "Server unavailable. Please try again.",
      code: "SERVER_UNAVAILABLE",
      status: 500,
    };
  }

  const productMap = new Map(
    ((products ?? []) as ProductRow[]).map((product) => [product.id, product])
  );

  const validated: ValidatedLineItem[] = [];

  for (const item of items) {
    if (!item.productId || !item.size) {
      return {
        ok: false,
        error: "Invalid cart item",
        code: "INVALID_PAYLOAD",
        status: 400,
      };
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return {
        ok: false,
        error: "Invalid quantity",
        code: "INVALID_PAYLOAD",
        status: 400,
      };
    }

    const product = productMap.get(item.productId);
    if (!product) {
      return {
        ok: false,
        error: `Unknown product: ${item.productId}`,
        code: "INVALID_PAYLOAD",
        status: 400,
      };
    }

    if (!product.is_active) {
      return {
        ok: false,
        error: `Product is not available: ${product.name}`,
        code: "INVALID_PAYLOAD",
        status: 400,
      };
    }

    const sizeEntry = (product.size_stock ?? []).find(
      (entry) => entry.size === item.size
    );

    if (!sizeEntry) {
      return {
        ok: false,
        error: `Invalid size ${item.size} for ${product.name}`,
        code: "INVALID_PAYLOAD",
        status: 400,
      };
    }

    if (sizeEntry.stock < item.quantity) {
      return {
        ok: false,
        error: STOCK_ERROR,
        code: "OUT_OF_STOCK",
        status: 409,
      };
    }

    const unitPrice = product.price;

    if (item.price !== unitPrice) {
      return {
        ok: false,
        error: PRICE_ERROR,
        code: "PRICE_MISMATCH",
        status: 400,
      };
    }

    validated.push({
      productId: item.productId,
      productName: product.name,
      size: item.size,
      quantity: item.quantity,
      unitPrice,
      lineAmount: unitPrice * item.quantity,
    });
  }

  const totalRupee = validated.reduce((sum, line) => sum + line.lineAmount, 0);
  const totalPaise = Math.round(totalRupee * 100);

  return {
    ok: true,
    order: {
      items: validated,
      totalRupee,
      totalPaise,
    },
  };
}

export function assertClientAmountMatches(
  clientAmount: number,
  serverAmount: number
): ValidationFailure | null {
  if (!Number.isFinite(clientAmount) || clientAmount <= 0) {
    return {
      ok: false,
      error: "Invalid amount",
      code: "INVALID_PAYLOAD",
      status: 400,
    };
  }

  if (clientAmount !== serverAmount) {
    return {
      ok: false,
      error: "Cart total changed. Refresh your cart and try again.",
      code: "AMOUNT_MISMATCH",
      status: 400,
    };
  }

  return null;
}
