import { getAuthenticatedUser, getServiceRoleClient } from "../_shared/auth.ts";
import type { ShippingAddressPayload } from "../_shared/address-validation.ts";
import {
  isValidShippingAddress,
  normalizeShippingSnapshot,
} from "../_shared/address-validation.ts";
import { jsonResponse, okResponse } from "../_shared/http.ts";
import { logPayment, logPaymentError } from "../_shared/logger.ts";
import {
  assertClientAmountMatches,
  type CartItemPayload,
  validateOrderItems,
} from "../_shared/order-validation.ts";
import {
  applyDiscountToLineAmounts,
  normalizePromoCode,
  validatePromoForSubtotal,
} from "../_shared/promo-validation.ts";
import { paymentError, verifyErrorResponse } from "../_shared/payment-errors.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface CreateOrderBody {
  amount: number;
  currency?: string;
  items: CartItemPayload[];
  shippingAddress: ShippingAddressPayload;
  promoCode?: string;
}

const SCOPE = "create-razorpay-order";

function step(message: string, payload?: Record<string, unknown>): void {
  console.log(`[create] ${message}`, payload ? JSON.stringify(payload) : "");
  logPayment(SCOPE, message, payload);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  step("start");

  try {
    const authResult = await getAuthenticatedUser(req, SCOPE);
    if (authResult instanceof Response) {
      step("authentication failed");
      return authResult;
    }

    const { user } = authResult;
    step("user authenticated", { userId: user.id });

    const body = (await req.json()) as CreateOrderBody;
    const {
      amount: clientAmountPaise,
      currency = "INR",
      items,
      shippingAddress,
      promoCode: rawPromoCode,
    } = body;

    if (
      !clientAmountPaise ||
      clientAmountPaise <= 0 ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      step("invalid payload — early return before session", { reason: "items/amount" });
      const { body: errBody, status } = paymentError("INVALID_PAYLOAD", 400);
      return jsonResponse(errBody, status);
    }

    if (!isValidShippingAddress(shippingAddress)) {
      step("invalid address — early return before session", {
        hasLine1: Boolean(shippingAddress?.line1),
        hasPincode: Boolean(shippingAddress?.pincode),
      });
      const { body: errBody, status } = paymentError("INVALID_ADDRESS", 400);
      return jsonResponse(errBody, status);
    }

    const shippingSnapshot = normalizeShippingSnapshot(shippingAddress);

    const supabaseAdmin = getServiceRoleClient();
    if (!supabaseAdmin) {
      step("service role client unavailable — early return before session");
      const { body: errBody, status } = paymentError("SERVER_ERROR", 500);
      return jsonResponse(errBody, status);
    }

    step("validating items");
    const validation = await validateOrderItems(supabaseAdmin, items);
    if (!validation.ok) {
      step("item validation failed — early return before session", {
        code: validation.code,
        error: validation.error,
      });
      return jsonResponse(
        { error: validation.error, code: validation.code, success: false },
        validation.status
      );
    }

    const subtotalPaise = validation.order.totalPaise;
    const subtotalRupee = validation.order.totalRupee;

    let discountPaise = 0;
    let finalPaise = subtotalPaise;
    let appliedPromoCode: string | null = null;

    const normalizedPromoCode = rawPromoCode
      ? normalizePromoCode(rawPromoCode)
      : "";

    if (normalizedPromoCode) {
      const promoResult = await validatePromoForSubtotal(
        supabaseAdmin,
        normalizedPromoCode,
        subtotalRupee
      );

      if (!promoResult.ok) {
        step("promo validation failed", {
          code: promoResult.code,
          error: promoResult.error,
        });
        return jsonResponse(
          {
            success: false,
            code: promoResult.code,
            error: promoResult.error,
            message: promoResult.error,
          },
          400
        );
      }

      discountPaise = promoResult.pricing.discountPaise;
      finalPaise = promoResult.pricing.finalPaise;
      appliedPromoCode = promoResult.pricing.promoCode;
    }

    if (finalPaise <= 0) {
      step("invalid final amount after promo", { finalPaise, discountPaise });
      const { body: errBody, status } = paymentError("INVALID_PAYLOAD", 400);
      return jsonResponse(errBody, status);
    }

    const amountMismatch = assertClientAmountMatches(clientAmountPaise, finalPaise);
    if (amountMismatch) {
      step("amount mismatch — early return before session", {
        clientAmountPaise,
        serverFinalPaise: finalPaise,
        subtotalPaise,
        discountPaise,
      });
      return jsonResponse(
        {
          error: amountMismatch.error,
          code: amountMismatch.code,
          success: false,
        },
        amountMismatch.status
      );
    }

    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!keyId || !keySecret) {
      step("razorpay keys missing — early return before session");
      const { body: errBody, status } = paymentError("SERVER_ERROR", 500);
      return jsonResponse(errBody, status);
    }

    if (!keyId.startsWith("rzp_test_") && !keyId.startsWith("rzp_live_")) {
      step("razorpay key id format invalid", { keyPrefix: keyId.slice(0, 8) });
      const { body: errBody, status } = paymentError("SERVER_ERROR", 500);
      return jsonResponse(errBody, status);
    }

    const receipt = `pl_${user.id.slice(0, 8)}_${Date.now()}`;
    const auth = btoa(`${keyId}:${keySecret}`);

    step("creating razorpay order", {
      amountPaise: finalPaise,
      subtotalPaise,
      discountPaise,
      currency,
      keyPrefix: keyId.slice(0, 12),
      promoCode: appliedPromoCode,
    });

    const razorpayOrderPayload = {
      amount: Math.trunc(finalPaise),
      currency,
      receipt,
      notes: {
        user_id: user.id,
        item_count: String(items.length),
        ...(appliedPromoCode ? { promo_code: appliedPromoCode } : {}),
      },
    };

    console.log(
      "[create] razorpay order request payload",
      JSON.stringify(razorpayOrderPayload)
    );

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(razorpayOrderPayload),
    });

    const razorpayData = await razorpayResponse.json();

    console.log(
      "[create] razorpay order response",
      JSON.stringify({
        ok: razorpayResponse.ok,
        status: razorpayResponse.status,
        id: razorpayData?.id,
        amount: razorpayData?.amount,
        currency: razorpayData?.currency,
        error: razorpayData?.error?.description,
      })
    );

    if (!razorpayResponse.ok) {
      step("razorpay order creation failed — early return before session", {
        status: razorpayResponse.status,
        razorpayError: razorpayData,
      });
      const { body: errBody, status } = paymentError("RAZORPAY_ERROR", 500);
      return jsonResponse(errBody, status);
    }

    const razorpay_order_id = razorpayData.id as string | undefined;
    if (!razorpay_order_id || !razorpay_order_id.startsWith("order_")) {
      step("razorpay order id missing or invalid — early return before session", {
        id: razorpay_order_id,
      });
      const { body: errBody, status } = verifyErrorResponse(
        "RAZORPAY_ERROR",
        500,
        "Razorpay response missing order id"
      );
      return jsonResponse(errBody, status);
    }

    step("razorpay order created", {
      razorpay_order_id,
      amount: razorpayData.amount,
    });

    const lineAmounts = validation.order.items.map((item) => item.lineAmount);
    const discountRupee = discountPaise / 100;
    const adjustedLineAmounts = applyDiscountToLineAmounts(lineAmounts, discountRupee);

    const fulfillmentItems = validation.order.items.map((item, index) => ({
      product_id: item.productId,
      size: item.size,
      quantity: item.quantity,
      amount: adjustedLineAmounts[index] ?? item.lineAmount,
    }));

    step("inserting payment session", {
      razorpay_order_id,
      user_id: user.id,
      amount: finalPaise,
      subtotalPaise,
      discountPaise,
      promoCode: appliedPromoCode,
      itemCount: fulfillmentItems.length,
    });

    let insertData: Record<string, unknown> | null = null;
    let insertError: { message: string; code?: string; details?: string; hint?: string } | null =
      null;

    try {
      const insertResult = await supabaseAdmin
        .from("payment_sessions")
        .insert({
          user_id: user.id,
          razorpay_order_id,
          items: fulfillmentItems,
          shipping_address: shippingSnapshot,
          amount_paise: finalPaise,
          subtotal_paise: subtotalPaise,
          discount_paise: discountPaise,
          promo_code: appliedPromoCode,
          status: "pending",
        })
        .select("*")
        .single();

      insertData = insertResult.data as Record<string, unknown> | null;
      insertError = insertResult.error;
    } catch (insertException) {
      logPaymentError(SCOPE, "payment session insert threw", insertException);
      insertError = {
        message:
          insertException instanceof Error
            ? insertException.message
            : String(insertException),
      };
    }

    console.log(
      "[create] insert result",
      JSON.stringify({ data: insertData, error: insertError })
    );

    if (insertError) {
      step("payment session insert failed", {
        message: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint,
      });
      const { body: errBody, status } = verifyErrorResponse(
        "PAYMENT_SESSION_NOT_CREATED",
        500,
        insertError.message
      );
      return jsonResponse(errBody, status);
    }

    step("payment session inserted", { sessionId: insertData?.id });

    const check = await supabaseAdmin
      .from("payment_sessions")
      .select("*")
      .eq("razorpay_order_id", razorpay_order_id)
      .maybeSingle();

    console.log("[create] read after insert", JSON.stringify(check));

    if (check.error) {
      logPaymentError(SCOPE, "read after insert failed", check.error, {
        razorpay_order_id,
      });
      const { body: errBody, status } = verifyErrorResponse(
        "PAYMENT_SESSION_NOT_CREATED",
        500,
        check.error.message
      );
      return jsonResponse(errBody, status);
    }

    if (!check.data) {
      step("payment session missing after insert", { razorpay_order_id });
      const { body: errBody, status } = verifyErrorResponse(
        "PAYMENT_SESSION_NOT_CREATED",
        500,
        "Row not found immediately after insert"
      );
      return jsonResponse(errBody, status);
    }

    step("payment session verified", {
      sessionId: check.data.id,
      razorpay_order_id,
    });

    step("success", {
      userId: user.id,
      orderId: razorpay_order_id,
      subtotal: subtotalRupee,
      discount: discountRupee,
      finalAmount: finalPaise / 100,
    });

    const responseAmount = Math.trunc(Number(razorpayData.amount));
    const responseCurrency = razorpayData.currency ?? "INR";

    console.log(
      "[create] checkout-ready order",
      JSON.stringify({
        keyPrefix: keyId.slice(0, 15),
        orderId: razorpay_order_id,
        amount: responseAmount,
        currency: responseCurrency,
        sessionVerified: true,
      })
    );

    return okResponse({
      id: razorpay_order_id,
      orderId: razorpay_order_id,
      amount: responseAmount,
      currency: responseCurrency,
      keyId,
      sessionVerified: true,
      subtotal: subtotalRupee,
      discount: discountRupee,
      promoCode: appliedPromoCode,
      finalAmount: finalPaise / 100,
    });
  } catch (error) {
    logPaymentError(SCOPE, "unhandled exception", error);
    const { body: errBody, status } = verifyErrorResponse(
      "SERVER_UNAVAILABLE",
      500,
      error instanceof Error ? error.message : String(error)
    );
    return jsonResponse(errBody, status);
  }
});
