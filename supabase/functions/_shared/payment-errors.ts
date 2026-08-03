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
  | "ORDER_INSERT_FAILED"
  | "SESSION_LOOKUP_FAILED"
  | "RAZORPAY_FETCH_FAILED"
  | "PAYMENT_SESSION_NOT_CREATED"
  | "SERVER_ERROR"
  | "RAZORPAY_ERROR"
  | "SERVER_UNAVAILABLE";

export const USER_MESSAGES: Record<PaymentErrorCode, string> = {
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
  PAYMENT_NOT_CAPTURED: "Payment was not completed. Try again.",
  FULFILLMENT_FAILED: "Verification failed. Contact support if you were charged.",
  FULFILLMENT_RPC_FAILED: "Verification failed. Contact support if you were charged.",
  ORDER_INSERT_FAILED: "Verification failed. Contact support if you were charged.",
  SESSION_LOOKUP_FAILED: "Server unavailable. Please try again.",
  RAZORPAY_FETCH_FAILED: "Could not confirm payment with Razorpay. Try again.",
  PAYMENT_SESSION_NOT_CREATED: "Checkout session could not be saved. Please try again.",
  SERVER_ERROR: "Server unavailable. Please try again.",
  RAZORPAY_ERROR: "Payment gateway error. Please try again.",
  SERVER_UNAVAILABLE: "Server unavailable. Please try again.",
};

export interface VerifyErrorBody {
  success: false;
  code: PaymentErrorCode;
  error: string;
  message: string;
  details?: string;
}

export function verifyErrorResponse(
  code: PaymentErrorCode,
  status: number,
  details?: string,
  overrideMessage?: string
): { body: VerifyErrorBody; status: number } {
  const message = overrideMessage ?? USER_MESSAGES[code];
  return {
    body: {
      success: false,
      code,
      error: message,
      message,
      ...(details ? { details } : {}),
    },
    status,
  };
}

export function paymentError(
  code: PaymentErrorCode,
  status: number,
  overrideMessage?: string
): { body: VerifyErrorBody; status: number } {
  return verifyErrorResponse(code, status, undefined, overrideMessage);
}

export function mapFulfillmentError(message: string): PaymentErrorCode {
  const lower = message.toLowerCase();
  if (lower.includes("insufficient stock")) return "OUT_OF_STOCK";
  if (lower.includes("duplicate")) return "DUPLICATE_PAYMENT";
  if (lower.includes("invalid fulfillment") || lower.includes("invalid line")) {
    return "FULFILLMENT_RPC_FAILED";
  }
  return "FULFILLMENT_RPC_FAILED";
}

/** Razorpay payment statuses that indicate successful charge (auto-capture + paylater). */
export const RAZORPAY_SUCCESS_STATUSES = new Set([
  "captured",
  "authorized",
]);

export function isRazorpayPaymentSuccessful(status: string): boolean {
  return RAZORPAY_SUCCESS_STATUSES.has(status.toLowerCase());
}
