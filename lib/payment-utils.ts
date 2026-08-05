import { FunctionsHttpError, type SupabaseClient } from "@supabase/supabase-js";

export {
  isValidShippingAddress,
  normalizeShippingAddressInput,
} from "@/lib/shipping-validation";

const VERIFY_MAX_ATTEMPTS = 3;
const VERIFY_RETRY_DELAY_MS = 1200;
const CREATE_ORDER_MAX_ATTEMPTS = 2;

export type PaymentErrorCode =
  | "UNAUTHORIZED"
  | "INVALID_PAYLOAD"
  | "INVALID_ADDRESS"
  | "AMOUNT_MISMATCH"
  | "OUT_OF_STOCK"
  | "PRICE_MISMATCH"
  | "INVALID_SIGNATURE"
  | "DUPLICATE_PAYMENT"
  | "SESSION_NOT_FOUND"
  | "SESSION_EXPIRED"
  | "SESSION_MISMATCH"
  | "PAYMENT_NOT_CAPTURED"
  | "FULFILLMENT_FAILED"
  | "FULFILLMENT_RPC_FAILED"
  | "SESSION_LOOKUP_FAILED"
  | "RAZORPAY_FETCH_FAILED"
  | "PAYMENT_SESSION_NOT_CREATED"
  | "SERVER_ERROR"
  | "RAZORPAY_ERROR"
  | "INVALID_CODE"
  | "INACTIVE_CODE"
  | "EXPIRED_CODE"
  | "NOT_STARTED"
  | "MINIMUM_NOT_MET"
  | "USAGE_EXCEEDED"
  | "SERVER_UNAVAILABLE";

export interface FunctionResponseBody {
  error?: string;
  message?: string;
  details?: string;
  code?: PaymentErrorCode | string;
  success?: boolean;
  duplicate?: boolean;
  orderId?: string;
  id?: string;
  keyId?: string;
  amount?: number;
  currency?: string;
  sessionVerified?: boolean;
  subtotal?: number;
  discount?: number;
  promoCode?: string | null;
  finalAmount?: number;
}

const USER_MESSAGES: Partial<Record<string, string>> = {
  UNAUTHORIZED: "Your session expired. Please sign in again.",
  INVALID_PAYLOAD: "Invalid checkout request. Refresh and try again.",
  INVALID_ADDRESS: "Please enter a complete shipping address.",
  AMOUNT_MISMATCH: "Cart total changed. Refresh your cart and try again.",
  OUT_OF_STOCK: "Out of stock for the selected size.",
  PRICE_MISMATCH: "Prices changed. Refresh your cart and try again.",
  INVALID_SIGNATURE: "Verification failed. Contact support if you were charged.",
  DUPLICATE_PAYMENT: "This payment was already processed.",
  SESSION_NOT_FOUND: "Checkout session not found. Start checkout again.",
  SESSION_EXPIRED: "Checkout session expired. Start checkout again.",
  SESSION_MISMATCH: "Checkout session mismatch. Start checkout again.",
  PAYMENT_NOT_CAPTURED: "Payment failed. Please try again.",
  FULFILLMENT_FAILED: "Verification failed. Contact support if you were charged.",
  FULFILLMENT_RPC_FAILED: "Verification failed. Contact support if you were charged.",
  SESSION_LOOKUP_FAILED: "Server unavailable. Please try again.",
  RAZORPAY_FETCH_FAILED: "Could not confirm payment. Try again or contact support.",
  PAYMENT_SESSION_NOT_CREATED: "Checkout session could not be saved. Please try again.",
  SERVER_ERROR: "Server unavailable. Please try again.",
  RAZORPAY_ERROR: "Payment gateway error. Please try again.",
  SERVER_UNAVAILABLE: "Server unavailable. Please try again.",
  INVALID_CODE: "Invalid promo code.",
  INACTIVE_CODE: "This promo code is inactive.",
  EXPIRED_CODE: "This promo code has expired.",
  NOT_STARTED: "This promo code is not active yet.",
  MINIMUM_NOT_MET: "Minimum order amount not reached for this code.",
  USAGE_EXCEEDED: "This promo code has reached its usage limit.",
};

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function parseFunctionsHttpError(
  error: FunctionsHttpError
): Promise<FunctionResponseBody | null> {
  try {
    return (await error.context.json()) as FunctionResponseBody;
  } catch {
    return null;
  }
}

export function mapPaymentErrorToUserMessage(
  data: FunctionResponseBody | null,
  fallback: string
): string {
  if (!data) return fallback;

  if (data.message && data.message !== "Edge Function returned a non-2xx status code") {
    if (data.details) {
      return `${data.message} (${data.details})`;
    }
    return data.message;
  }

  if (data.code && USER_MESSAGES[data.code]) {
    const base = USER_MESSAGES[data.code]!;
    return data.details ? `${base} (${data.details})` : base;
  }

  if (data.error && data.error !== "Edge Function returned a non-2xx status code") {
    return mapLegacyErrorMessage(data.error, fallback);
  }

  return fallback;
}

function mapLegacyErrorMessage(error: string, fallback: string): string {
  const lower = error.toLowerCase();
  if (lower.includes("insufficient stock") || lower.includes("out of stock")) {
    return USER_MESSAGES.OUT_OF_STOCK ?? fallback;
  }
  if (lower.includes("amount mismatch")) {
    return USER_MESSAGES.AMOUNT_MISMATCH ?? fallback;
  }
  if (lower.includes("unauthorized")) {
    return USER_MESSAGES.UNAUTHORIZED ?? fallback;
  }
  if (lower.includes("duplicate")) {
    return USER_MESSAGES.DUPLICATE_PAYMENT ?? fallback;
  }
  if (lower.includes("signature")) {
    return USER_MESSAGES.INVALID_SIGNATURE ?? fallback;
  }
  if (lower.includes("registered claims verification failed")) {
    return "Payment failed at the bank/card gateway. Try UPI or a different card.";
  }
  return error || fallback;
}

export async function getFunctionErrorMessage(
  error: unknown,
  data: FunctionResponseBody | null,
  fallback = "Request failed."
): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    const body = (await parseFunctionsHttpError(error)) ?? data;
    const mapped = mapPaymentErrorToUserMessage(body, fallback);
    if (mapped !== fallback) {
      return mapped;
    }

    if (
      error.context.status === 502 ||
      error.context.status === 503 ||
      error.context.status === 504
    ) {
      return USER_MESSAGES.SERVER_UNAVAILABLE ?? fallback;
    }

    if (error.context.status === 401) {
      return USER_MESSAGES.UNAUTHORIZED ?? fallback;
    }

    if (error.context.status === 409 && body?.code === "OUT_OF_STOCK") {
      return USER_MESSAGES.OUT_OF_STOCK ?? fallback;
    }
  }

  if (data) {
    const mapped = mapPaymentErrorToUserMessage(data, fallback);
    if (mapped !== fallback) {
      return mapped;
    }
  }

  if (error instanceof Error && error.message) {
    if (error.message === "Edge Function returned a non-2xx status code") {
      return fallback;
    }
    return mapLegacyErrorMessage(error.message, fallback);
  }

  return fallback;
}

function isRetryableError(error: unknown): boolean {
  return (
    error instanceof FunctionsHttpError &&
    (error.context.status === 502 ||
      error.context.status === 503 ||
      error.context.status === 504 ||
      error.context.status === 429)
  );
}

async function enrichInvokeResult<T extends FunctionResponseBody>(
  data: T | null,
  error: unknown
): Promise<{ data: T | null; error: unknown }> {
  if (error instanceof FunctionsHttpError) {
    const body = await parseFunctionsHttpError(error);
    if (body) {
      return { data: { ...data, ...body } as T, error };
    }
  }
  return { data, error };
}

export async function invokeCreateOrderWithRetry(
  supabase: SupabaseClient,
  body: Record<string, unknown>
): Promise<{ data: FunctionResponseBody | null; error: unknown }> {
  let lastError: unknown = null;
  let lastData: FunctionResponseBody | null = null;

  for (let attempt = 1; attempt <= CREATE_ORDER_MAX_ATTEMPTS; attempt++) {
    const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
      body,
    });

    lastData = data as FunctionResponseBody | null;
    lastError = error;

    if (
      !error &&
      (lastData?.orderId || lastData?.id) &&
      lastData?.keyId &&
      Number.isFinite(Number(lastData?.amount))
    ) {
      return { data: lastData, error: null };
    }

    const enriched = await enrichInvokeResult(lastData, error);
    lastData = enriched.data;

    if (!isRetryableError(error) || attempt === CREATE_ORDER_MAX_ATTEMPTS) {
      break;
    }

    await sleep(VERIFY_RETRY_DELAY_MS * attempt);
  }

  return { data: lastData, error: lastError };
}

export async function invokeVerifyPaymentWithRetry(
  supabase: SupabaseClient,
  body: Record<string, unknown>
): Promise<{ data: FunctionResponseBody | null; error: unknown }> {
  let lastError: unknown = null;
  let lastData: FunctionResponseBody | null = null;

  for (let attempt = 1; attempt <= VERIFY_MAX_ATTEMPTS; attempt++) {
    const { data, error } = await supabase.functions.invoke("verify-razorpay-payment", {
      body,
    });

    lastData = data as FunctionResponseBody | null;
    lastError = error;

    const enriched = await enrichInvokeResult(lastData, error);
    lastData = enriched.data;

    if (!error && lastData?.success) {
      return { data: lastData, error: null };
    }

    if (lastData?.code === "DUPLICATE_PAYMENT" && lastData.success) {
      return { data: lastData, error: null };
    }

    if (!isRetryableError(error) || attempt === VERIFY_MAX_ATTEMPTS) {
      break;
    }

    await sleep(VERIFY_RETRY_DELAY_MS * attempt);
  }

  return { data: lastData, error: lastError };
}

export function mapRazorpayFailureDescription(description: string): string {
  const lower = description.toLowerCase();
  if (lower.includes("international")) {
    return "International cards are not enabled. Use an Indian card or UPI.";
  }
  if (lower.includes("registered claims verification failed")) {
    return "Payment failed at the bank/card gateway. Try UPI or a different test card.";
  }
  if (lower.includes("cancel")) {
    return "Payment cancelled.";
  }
  return description || "Payment failed.";
}
