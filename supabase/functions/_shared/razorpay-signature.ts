import { logPaymentError } from "./logger.ts";

/**
 * Razorpay payment signature verification using Web Crypto (Deno-compatible).
 * Payload: HMAC-SHA256 of "{order_id}|{payment_id}" with key secret.
 */
export async function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const expected = await hmacSha256Hex(`${orderId}|${paymentId}`, secret);
  return timingSafeEqual(expected, signature);
}

/**
 * Razorpay webhook signature verification.
 * Payload: HMAC-SHA256 of raw request body with webhook secret.
 */
export async function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string,
  webhookSecret: string
): Promise<boolean> {
  const expected = await hmacSha256Hex(rawBody, webhookSecret);
  return timingSafeEqual(expected, signature);
}

async function hmacSha256Hex(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(expected: string, actual: string): boolean {
  if (expected.length !== actual.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ actual.charCodeAt(i);
  }
  return mismatch === 0;
}

export interface RazorpayPaymentEntity {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  method?: string;
}

export async function fetchRazorpayPayment(
  paymentId: string,
  keyId: string,
  keySecret: string
): Promise<RazorpayPaymentEntity | null> {
  const auth = btoa(`${keyId}:${keySecret}`);

  try {
    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Basic ${auth}` },
    });

    const data = await response.json();

    if (!response.ok) {
      logPaymentError("razorpay-api", "Payment fetch failed", new Error(JSON.stringify(data)), {
        paymentId,
        status: response.status,
      });
      return null;
    }

    return data as RazorpayPaymentEntity;
  } catch (error) {
    logPaymentError("razorpay-api", "Payment fetch error", error, { paymentId });
    return null;
  }
}
