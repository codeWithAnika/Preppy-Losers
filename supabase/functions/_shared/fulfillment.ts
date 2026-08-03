import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import type { ShippingAddressPayload } from "./address-validation.ts";
import { logPayment, logPaymentError } from "./logger.ts";
import { mapFulfillmentError } from "./payment-errors.ts";
import type { ValidatedLineItem } from "./order-validation.ts";

export interface FulfillmentLineItem {
  product_id: string;
  size: string;
  quantity: number;
  amount: number;
}

export interface FulfillmentResult {
  ok: boolean;
  duplicate: boolean;
  code?: string;
  error?: string;
}

export interface PaymentSessionRow {
  id: string;
  user_id: string;
  razorpay_order_id: string;
  items: FulfillmentLineItem[];
  shipping_address: ShippingAddressPayload;
  amount_paise: number;
  status: string;
  razorpay_payment_id: string | null;
  expires_at: string;
}

export interface PaymentSessionLookup {
  session: PaymentSessionRow | null;
  dbError: string | null;
}

export function toFulfillmentItems(
  items: ValidatedLineItem[]
): FulfillmentLineItem[] {
  return items.map((item) => ({
    product_id: item.productId,
    size: item.size,
    quantity: item.quantity,
    amount: item.lineAmount,
  }));
}

export async function getPaymentSession(
  supabaseAdmin: SupabaseClient,
  razorpayOrderId: string
): Promise<PaymentSessionLookup> {
  const { data, error } = await supabaseAdmin
    .from("payment_sessions")
    .select("*")
    .eq("razorpay_order_id", razorpayOrderId)
    .maybeSingle();

  if (error) {
    logPaymentError("fulfillment", "Payment session lookup failed", error, {
      razorpayOrderId,
      code: error.code,
      hint: error.hint,
      details: error.details,
    });
    return { session: null, dbError: error.message };
  }

  if (!data) {
    return { session: null, dbError: null };
  }

  const row = data as PaymentSessionRow;
  row.amount_paise = Number(row.amount_paise);
  row.items = normalizeFulfillmentItems(row.items);

  return { session: row, dbError: null };
}

export function normalizeFulfillmentItems(
  items: FulfillmentLineItem[] | unknown
): FulfillmentLineItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => ({
    product_id: String(item.product_id),
    size: String(item.size),
    quantity: Number(item.quantity),
    amount: Number(item.amount),
  }));
}

export async function createPaymentSession(
  supabaseAdmin: SupabaseClient,
  params: {
    userId: string;
    razorpayOrderId: string;
    items: FulfillmentLineItem[];
    shippingAddress: ShippingAddressPayload;
    amountPaise: number;
  }
): Promise<boolean> {
  const { error } = await supabaseAdmin.from("payment_sessions").insert({
    user_id: params.userId,
    razorpay_order_id: params.razorpayOrderId,
    items: params.items,
    shipping_address: params.shippingAddress,
    amount_paise: params.amountPaise,
    status: "pending",
  });

  if (error) {
    logPaymentError("fulfillment", "Payment session insert failed", error, {
      razorpayOrderId: params.razorpayOrderId,
      userId: params.userId,
    });
    return false;
  }

  logPayment("fulfillment", "Payment session created", {
    razorpayOrderId: params.razorpayOrderId,
    userId: params.userId,
    amountPaise: params.amountPaise,
  });

  return true;
}

export async function markPaymentSessionStatus(
  supabaseAdmin: SupabaseClient,
  razorpayOrderId: string,
  status: "fulfilled" | "failed" | "expired",
  razorpayPaymentId?: string
): Promise<void> {
  const update: Record<string, unknown> = { status };
  if (razorpayPaymentId) {
    update.razorpay_payment_id = razorpayPaymentId;
  }
  if (status === "fulfilled") {
    update.fulfilled_at = new Date().toISOString();
  }

  const { error } = await supabaseAdmin
    .from("payment_sessions")
    .update(update)
    .eq("razorpay_order_id", razorpayOrderId);

  if (error) {
    logPaymentError("fulfillment", "Payment session status update failed", error, {
      razorpayOrderId,
      status,
    });
    return;
  }

  logPayment("fulfillment", "Payment session status updated", {
    razorpayOrderId,
    status,
    razorpayPaymentId,
  });
}

export async function runFulfillment(
  supabaseAdmin: SupabaseClient,
  params: {
    userId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    shippingAddress: ShippingAddressPayload;
    items: FulfillmentLineItem[];
    scope: string;
  }
): Promise<FulfillmentResult> {
  logPayment(params.scope, "Calling fulfill_paid_order RPC", {
    userId: params.userId,
    razorpayOrderId: params.razorpayOrderId,
    razorpayPaymentId: params.razorpayPaymentId,
    itemCount: params.items.length,
  });

  const { data, error } = await supabaseAdmin.rpc("fulfill_paid_order", {
    p_user_id: params.userId,
    p_razorpay_order_id: params.razorpayOrderId,
    p_razorpay_payment_id: params.razorpayPaymentId,
    p_shipping_address: params.shippingAddress,
    p_items: params.items,
  });

  if (error) {
    logPaymentError(params.scope, "Fulfillment RPC error", error, {
      razorpayPaymentId: params.razorpayPaymentId,
      code: error.code,
      hint: error.hint,
      details: error.details,
    });
    const code = mapFulfillmentError(error.message);
    return { ok: false, duplicate: false, code, error: error.message };
  }

  const result = data as { ok?: boolean; duplicate?: boolean; error?: string };

  if (!result?.ok) {
    logPayment(params.scope, "Fulfillment RPC returned failure", { result }, "warn");
    const code = mapFulfillmentError(result?.error ?? "Fulfillment failed");
    return {
      ok: false,
      duplicate: false,
      code,
      error: result?.error ?? "Fulfillment failed",
    };
  }

  logPayment(params.scope, "Fulfillment RPC success", {
    razorpayPaymentId: params.razorpayPaymentId,
    duplicate: result.duplicate === true,
  });

  await markPaymentSessionStatus(
    supabaseAdmin,
    params.razorpayOrderId,
    "fulfilled",
    params.razorpayPaymentId
  );

  return { ok: true, duplicate: result.duplicate === true };
}

export async function upsertUserAddress(
  supabaseAdmin: SupabaseClient,
  userId: string,
  shippingAddress: ShippingAddressPayload,
  scope: string
): Promise<void> {
  const { data: existingAddress, error: lookupError } = await supabaseAdmin
    .from("addresses")
    .select("id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    logPaymentError(scope, "Address lookup failed", lookupError, { userId });
    return;
  }

  const addressPayload = {
    line1: shippingAddress.line1,
    line2: shippingAddress.line2 ?? null,
    city: shippingAddress.city,
    state: shippingAddress.state,
    pincode: shippingAddress.pincode,
    phone: shippingAddress.phone,
    is_default: true,
  };

  if (existingAddress?.id) {
    const { error: updateError } = await supabaseAdmin
      .from("addresses")
      .update(addressPayload)
      .eq("id", existingAddress.id);

    if (updateError) {
      logPaymentError(scope, "Address update failed", updateError, { userId });
      return;
    }

    logPayment(scope, "Address updated", { userId });
    return;
  }

  const { error: insertError } = await supabaseAdmin.from("addresses").insert({
    user_id: userId,
    ...addressPayload,
  });

  if (insertError) {
    logPaymentError(scope, "Address insert failed", insertError, { userId });
    return;
  }

  logPayment(scope, "Address inserted", { userId });
}

export function isSessionExpired(session: PaymentSessionRow): boolean {
  return new Date(session.expires_at).getTime() < Date.now();
}

export function itemsMatchSession(
  sessionItems: FulfillmentLineItem[],
  validatedItems: FulfillmentLineItem[]
): boolean {
  const normalizedSession = normalizeFulfillmentItems(sessionItems);
  const normalizedValidated = normalizeFulfillmentItems(validatedItems);

  if (normalizedSession.length !== normalizedValidated.length) return false;

  const sortKey = (item: FulfillmentLineItem) =>
    `${item.product_id}:${item.size}:${item.quantity}:${item.amount}`;

  const sessionKeys = normalizedSession.map(sortKey).sort();
  const validatedKeys = normalizedValidated.map(sortKey).sort();

  return sessionKeys.every((key, index) => key === validatedKeys[index]);
}
