import type { RazorpayOptions } from "@/lib/razorpay";

export class RazorpayCheckoutValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RazorpayCheckoutValidationError";
  }
}

export interface CreateOrderCheckoutData {
  orderId?: string;
  id?: string;
  keyId?: string;
  amount?: number;
  currency?: string;
  sessionVerified?: boolean;
}

export interface ValidatedCheckoutParams {
  orderId: string;
  keyId: string;
  amountPaise: number;
  currency: string;
  amountRupee: number;
}

export function validateCreateOrderResponse(
  order: CreateOrderCheckoutData | null | undefined
): ValidatedCheckoutParams {
  if (!order) {
    throw new RazorpayCheckoutValidationError(
      "Missing order response from server."
    );
  }

  const orderId = order.orderId ?? order.id;
  if (!orderId) {
    throw new RazorpayCheckoutValidationError("Missing Razorpay order ID.");
  }

  if (!orderId.startsWith("order_")) {
    throw new RazorpayCheckoutValidationError(
      "Invalid Razorpay order ID format."
    );
  }

  if (!order.keyId || !order.keyId.startsWith("rzp_")) {
    throw new RazorpayCheckoutValidationError(
      "Missing payment gateway key from server. Redeploy create-razorpay-order."
    );
  }

  const amountPaise = Math.trunc(Number(order.amount));
  if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
    throw new RazorpayCheckoutValidationError(
      "Invalid payment amount from server."
    );
  }

  const currency = (order.currency ?? "INR").toUpperCase();
  if (currency !== "INR") {
    throw new RazorpayCheckoutValidationError(
      `Unsupported currency: ${currency}. Only INR is supported.`
    );
  }

  if (order.sessionVerified === false) {
    throw new RazorpayCheckoutValidationError(
      "Checkout session was not saved. Please try again."
    );
  }

  return {
    orderId,
    keyId: order.keyId,
    amountPaise,
    currency,
    amountRupee: amountPaise / 100,
  };
}

export function warnIfEnvKeyMismatch(
  serverKeyId: string,
  envKeyId: string | undefined
): void {
  if (!envKeyId || serverKeyId === envKeyId) {
    return;
  }

  console.warn("[checkout] NEXT_PUBLIC_RAZORPAY_KEY_ID differs from server keyId", {
    serverKeyPrefix: serverKeyId.slice(0, 15),
    envKeyPrefix: envKeyId.slice(0, 15),
    note: "Using server keyId (required for order_id binding)",
  });
}

export function buildRazorpayCheckoutOptions(
  params: ValidatedCheckoutParams,
  extras: Pick<
    RazorpayOptions,
    "name" | "description" | "prefill" | "theme" | "handler" | "modal"
  >
): RazorpayOptions {
  const prefill = extras.prefill
    ? Object.fromEntries(
        Object.entries(extras.prefill).filter(
          ([, value]) => value !== undefined && value !== null && value !== ""
        )
      )
    : undefined;

  return {
    key: params.keyId,
    order_id: params.orderId,
    amount: params.amountPaise,
    currency: params.currency,
    name: extras.name,
    description: extras.description,
    prefill: prefill && Object.keys(prefill).length > 0 ? prefill : undefined,
    theme: extras.theme,
    handler: extras.handler,
    modal: extras.modal,
  };
}

export function logCheckoutDebug(params: ValidatedCheckoutParams): void {
  console.log("[checkout] Razorpay checkout payload", {
    keyPrefix: params.keyId.slice(0, 15),
    order_id: params.orderId,
    amount: params.amountPaise,
    currency: params.currency,
  });
}
