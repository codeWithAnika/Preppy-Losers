import { getAuthenticatedUser, getServiceRoleClient } from "../_shared/auth.ts";
import {
  isValidShippingAddress,
  mergeShippingSnapshot,
  normalizeShippingSnapshot,
  type ShippingAddressPayload,
} from "../_shared/address-validation.ts";
import {
  getPaymentSession,
  isSessionExpired,
  itemsMatchSessionIdentity,
  normalizeFulfillmentItems,
  runFulfillment,
  toFulfillmentItems,
  upsertUserAddress,
} from "../_shared/fulfillment.ts";
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
import {
  isRazorpayPaymentSuccessful,
  verifyErrorResponse,
} from "../_shared/payment-errors.ts";
import {
  fetchRazorpayPayment,
  verifyRazorpaySignature,
} from "../_shared/razorpay-signature.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface VerifyPaymentBody {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  items: CartItemPayload[];
  shippingAddress: ShippingAddressPayload;
  amount: number;
  promoCode?: string;
}

const SCOPE = "verify-razorpay-payment";

function step(message: string, payload?: Record<string, unknown>): void {
  logPayment(SCOPE, message, payload);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  step("start");

  try {
    step("authenticating user");
    const authResult = await getAuthenticatedUser(req, SCOPE);
    if (authResult instanceof Response) {
      step("authentication failed");
      return authResult;
    }

    const { user } = authResult;
    step("user authenticated", { userId: user.id });

    let body: VerifyPaymentBody;
    try {
      body = (await req.json()) as VerifyPaymentBody;
    } catch (parseError) {
      logPaymentError(SCOPE, "request body parse failed", parseError);
      const { body: errBody, status } = verifyErrorResponse(
        "INVALID_PAYLOAD",
        400,
        parseError instanceof Error ? parseError.message : "Invalid JSON"
      );
      return jsonResponse(errBody, status);
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      shippingAddress,
      amount: clientAmountRupee,
      promoCode: clientPromoCode,
    } = body;

    step("payload received", {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      itemCount: items?.length ?? 0,
      clientAmountRupee,
    });

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !isValidShippingAddress(shippingAddress)
    ) {
      step("invalid payload", {}, "warn");
      const { body: errBody, status } = verifyErrorResponse("INVALID_PAYLOAD", 400);
      return jsonResponse(errBody, status);
    }

    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");

    if (!keySecret || !keyId) {
      logPaymentError(SCOPE, "Razorpay keys missing", new Error("missing keys"));
      const { body: errBody, status } = verifyErrorResponse(
        "SERVER_ERROR",
        500,
        "RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set"
      );
      return jsonResponse(errBody, status);
    }

    step("verifying signature", { orderId: razorpay_order_id, paymentId: razorpay_payment_id });

    const validSignature = await verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      keySecret
    );

    if (!validSignature) {
      step("signature invalid", { orderId: razorpay_order_id }, "warn");
      const { body: errBody, status } = verifyErrorResponse("INVALID_SIGNATURE", 400);
      return jsonResponse(errBody, status);
    }

    step("signature valid");

    step("initializing service role client");
    const supabaseAdmin = getServiceRoleClient();
    if (!supabaseAdmin) {
      const { body: errBody, status } = verifyErrorResponse(
        "SERVER_ERROR",
        500,
        "SUPABASE_SERVICE_ROLE_KEY not set"
      );
      return jsonResponse(errBody, status);
    }

    step("validating items against database");
    const validation = await validateOrderItems(supabaseAdmin, items);
    if (!validation.ok) {
      step("item validation failed", { code: validation.code, error: validation.error }, "warn");
      return jsonResponse(
        {
          success: false,
          code: validation.code,
          error: validation.error,
          message: validation.error,
        },
        validation.status
      );
    }

    step("items validated", {
      totalRupee: validation.order.totalRupee,
      totalPaise: validation.order.totalPaise,
      lineCount: validation.order.items.length,
    });

    const subtotalRupee = validation.order.totalRupee;
    const subtotalPaise = validation.order.totalPaise;

    let discountRupee = 0;
    let finalRupee = subtotalRupee;
    let finalPaise = subtotalPaise;
    let appliedPromoCode: string | null = null;

    const validatedItems = normalizeFulfillmentItems(
      toFulfillmentItems(validation.order.items)
    );

    step("checking payment session", { orderId: razorpay_order_id });
    const { session, dbError } = await getPaymentSession(supabaseAdmin, razorpay_order_id);

    if (dbError) {
      const { body: errBody, status } = verifyErrorResponse(
        "SESSION_LOOKUP_FAILED",
        500,
        dbError
      );
      return jsonResponse(errBody, status);
    }

    let shippingForFulfillment: ShippingAddressPayload = shippingAddress;
    let fulfillmentItems = validatedItems;
    let useSessionAmountPaise = subtotalPaise;
    let sessionlessFallback = false;

    if (!session) {
      sessionlessFallback = true;
      step(
        "payment session not found — using validated request fallback",
        { orderId: razorpay_order_id },
        "warn"
      );
      shippingForFulfillment = normalizeShippingSnapshot(shippingAddress);

      const normalizedClientPromo = clientPromoCode
        ? normalizePromoCode(clientPromoCode)
        : "";
      if (normalizedClientPromo) {
        const promoResult = await validatePromoForSubtotal(
          supabaseAdmin,
          normalizedClientPromo,
          subtotalRupee
        );
        if (!promoResult.ok) {
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
        discountRupee = promoResult.pricing.discountRupee;
        finalRupee = promoResult.pricing.finalRupee;
        finalPaise = promoResult.pricing.finalPaise;
        appliedPromoCode = promoResult.pricing.promoCode;
        useSessionAmountPaise = finalPaise;

        const lineAmounts = validation.order.items.map((item) => item.lineAmount);
        const adjustedAmounts = applyDiscountToLineAmounts(lineAmounts, discountRupee);
        fulfillmentItems = validation.order.items.map((item, index) => ({
          product_id: item.productId,
          size: item.size,
          quantity: item.quantity,
          amount: adjustedAmounts[index] ?? item.lineAmount,
        }));
      }
    } else {
      step("payment session found", {
        sessionId: session.id,
        status: session.status,
        amountPaise: session.amount_paise,
        promoCode: session.promo_code,
      });

      if (session.user_id !== user.id) {
        step("session user mismatch", { sessionUserId: session.user_id }, "warn");
        const { body: errBody, status } = verifyErrorResponse(
          "SESSION_MISMATCH",
          403,
          `session user ${session.user_id} !== ${user.id}`
        );
        return jsonResponse(errBody, status);
      }

      if (session.status === "fulfilled") {
        step("duplicate payment verification", { paymentId: razorpay_payment_id });
        return okResponse({
          success: true,
          duplicate: true,
          code: "DUPLICATE_PAYMENT",
        });
      }

      if (session.status === "failed") {
        const { body: errBody, status } = verifyErrorResponse(
          "PAYMENT_NOT_CAPTURED",
          409,
          "payment session marked failed"
        );
        return jsonResponse(errBody, status);
      }

      if (isSessionExpired(session)) {
        step("session expired", { expiresAt: session.expires_at }, "warn");
        await supabaseAdmin
          .from("payment_sessions")
          .update({ status: "expired" })
          .eq("razorpay_order_id", razorpay_order_id);
        const { body: errBody, status } = verifyErrorResponse(
          "SESSION_EXPIRED",
          410,
          session.expires_at
        );
        return jsonResponse(errBody, status);
      }

      if (session.subtotal_paise !== subtotalPaise) {
        step(
          "session subtotal mismatch",
          {
            sessionSubtotalPaise: session.subtotal_paise,
            validatedTotalPaise: subtotalPaise,
          },
          "warn"
        );
        const { body: errBody, status } = verifyErrorResponse(
          "AMOUNT_MISMATCH",
          400,
          `session subtotal=${session.subtotal_paise} validated=${subtotalPaise}`
        );
        return jsonResponse(errBody, status);
      }

      useSessionAmountPaise = Number(session.amount_paise);
      discountRupee = Number(session.discount_paise) / 100;
      finalPaise = useSessionAmountPaise;
      finalRupee = finalPaise / 100;
      appliedPromoCode = session.promo_code;

      const normalizedClientPromo = clientPromoCode
        ? normalizePromoCode(clientPromoCode)
        : "";
      const normalizedSessionPromo = session.promo_code
        ? normalizePromoCode(session.promo_code)
        : "";

      if (normalizedClientPromo !== normalizedSessionPromo) {
        step(
          "promo code tamper detected",
          {
            clientPromo: normalizedClientPromo,
            sessionPromo: normalizedSessionPromo,
          },
          "warn"
        );
        const { body: errBody, status } = verifyErrorResponse(
          "SESSION_MISMATCH",
          400,
          "promo code does not match checkout session"
        );
        return jsonResponse(errBody, status);
      }

      if (normalizedSessionPromo) {
        const promoResult = await validatePromoForSubtotal(
          supabaseAdmin,
          normalizedSessionPromo,
          subtotalRupee
        );
        if (!promoResult.ok) {
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

        if (promoResult.pricing.discountPaise !== Number(session.discount_paise)) {
          step("session discount mismatch", {
            sessionDiscount: session.discount_paise,
            recomputedDiscount: promoResult.pricing.discountPaise,
          }, "warn");
          const { body: errBody, status } = verifyErrorResponse(
            "AMOUNT_MISMATCH",
            400,
            "promo discount mismatch"
          );
          return jsonResponse(errBody, status);
        }

        if (promoResult.pricing.finalPaise !== useSessionAmountPaise) {
          const { body: errBody, status } = verifyErrorResponse(
            "AMOUNT_MISMATCH",
            400,
            "promo final amount mismatch"
          );
          return jsonResponse(errBody, status);
        }

        discountRupee = promoResult.pricing.discountRupee;
        finalRupee = promoResult.pricing.finalRupee;
        appliedPromoCode = promoResult.pricing.promoCode;
      } else if (Number(session.discount_paise) > 0 || session.promo_code) {
        const { body: errBody, status } = verifyErrorResponse(
          "SESSION_MISMATCH",
          400,
          "unexpected promo on session"
        );
        return jsonResponse(errBody, status);
      }

      if (!itemsMatchSessionIdentity(session.items, validatedItems)) {
        step(
          "session items mismatch",
          {
            sessionItems: session.items,
            validatedItems,
          },
          "warn"
        );
        const { body: errBody, status } = verifyErrorResponse(
          "SESSION_MISMATCH",
          400,
          "cart items do not match checkout session snapshot"
        );
        return jsonResponse(errBody, status);
      }

      fulfillmentItems = normalizeFulfillmentItems(session.items);
      shippingForFulfillment = mergeShippingSnapshot(
        session.shipping_address,
        shippingAddress
      );
      step("payment session checks passed");
    }

    const amountMismatch = assertClientAmountMatches(
      Number(clientAmountRupee),
      finalRupee
    );
    if (amountMismatch) {
      step(
        "amount mismatch",
        {
          clientAmountRupee: Number(clientAmountRupee),
          serverFinalRupee: finalRupee,
        },
        "warn"
      );
      const { body: errBody, status } = verifyErrorResponse(
        "AMOUNT_MISMATCH",
        400,
        `client=${clientAmountRupee} server=${finalRupee}`
      );
      return jsonResponse(errBody, status);
    }

    if (finalPaise <= 0) {
      const { body: errBody, status } = verifyErrorResponse(
        "INVALID_PAYLOAD",
        400,
        "final amount must be positive"
      );
      return jsonResponse(errBody, status);
    }

    step("fetching payment from Razorpay API", { paymentId: razorpay_payment_id });
    const payment = await fetchRazorpayPayment(
      razorpay_payment_id,
      keyId,
      keySecret
    );

    if (!payment) {
      const { body: errBody, status } = verifyErrorResponse(
        "RAZORPAY_FETCH_FAILED",
        502,
        `Could not fetch payment ${razorpay_payment_id}`
      );
      return jsonResponse(errBody, status);
    }

    step("razorpay payment fetched", {
      status: payment.status,
      amount: payment.amount,
      orderId: payment.order_id,
    });

    if (payment.order_id !== razorpay_order_id) {
      const { body: errBody, status } = verifyErrorResponse(
        "INVALID_SIGNATURE",
        400,
        `payment order_id ${payment.order_id} !== ${razorpay_order_id}`
      );
      return jsonResponse(errBody, status);
    }

    if (Number(payment.amount) !== useSessionAmountPaise) {
      const { body: errBody, status } = verifyErrorResponse(
        "AMOUNT_MISMATCH",
        400,
        `razorpay=${payment.amount} expected=${useSessionAmountPaise}`
      );
      return jsonResponse(errBody, status);
    }

    if (!isRazorpayPaymentSuccessful(payment.status)) {
      step("payment not captured", { status: payment.status }, "warn");
      const { body: errBody, status } = verifyErrorResponse(
        "PAYMENT_NOT_CAPTURED",
        402,
        `Razorpay payment status is ${payment.status}`
      );
      return jsonResponse(errBody, status);
    }

    step("calling fulfill_paid_order RPC", {
      paymentId: razorpay_payment_id,
      itemCount: fulfillmentItems.length,
      sessionlessFallback,
    });

    shippingForFulfillment = normalizeShippingSnapshot(shippingForFulfillment);

    if (appliedPromoCode) {
      const { data: incremented, error: promoIncrementError } = await supabaseAdmin.rpc(
        "increment_promo_used_count",
        { p_code: appliedPromoCode }
      );

      if (promoIncrementError || incremented !== true) {
        step(
          "promo usage increment failed before fulfillment",
          { promoCode: appliedPromoCode, incremented, promoIncrementError },
          "warn"
        );
        const { body: errBody, status } = verifyErrorResponse(
          "USAGE_EXCEEDED",
          409,
          "promo code usage limit reached"
        );
        return jsonResponse(errBody, status);
      }

      step("promo usage reserved", { promoCode: appliedPromoCode });
    }

    const fulfillment = await runFulfillment(supabaseAdmin, {
      userId: user.id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      shippingAddress: shippingForFulfillment,
      items: fulfillmentItems,
      scope: SCOPE,
      promoCode: appliedPromoCode,
      discountAmount: Math.round(discountRupee),
      originalSubtotal: Math.round(subtotalRupee),
      finalTotal: Math.round(finalRupee),
    });

    if (!fulfillment.ok) {
      step("fulfillment failed", { error: fulfillment.error, code: fulfillment.code }, "error");
      const code =
        fulfillment.code === "OUT_OF_STOCK" ? "OUT_OF_STOCK" : "FULFILLMENT_RPC_FAILED";
      const { body: errBody, status } = verifyErrorResponse(
        code,
        code === "OUT_OF_STOCK" ? 409 : 500,
        fulfillment.error
      );
      return jsonResponse(errBody, status);
    }

    step("fulfillment succeeded", { duplicate: fulfillment.duplicate });

    step("updating address");
    await upsertUserAddress(
      supabaseAdmin,
      user.id,
      shippingForFulfillment,
      SCOPE
    );

    step("completed", {
      userId: user.id,
      paymentId: razorpay_payment_id,
      subtotal: subtotalRupee,
      discount: discountRupee,
      amount: finalRupee,
      promoCode: appliedPromoCode,
      duplicate: fulfillment.duplicate,
    });

    return okResponse({
      success: true,
      amount: finalRupee,
      subtotal: subtotalRupee,
      discount: discountRupee,
      promoCode: appliedPromoCode,
      duplicate: fulfillment.duplicate,
      code: fulfillment.duplicate ? "DUPLICATE_PAYMENT" : undefined,
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
