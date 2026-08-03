import { getServiceRoleClient } from "../_shared/auth.ts";
import {
  getPaymentSession,
  isSessionExpired,
  runFulfillment,
  markPaymentSessionStatus,
} from "../_shared/fulfillment.ts";
import { jsonResponse, okResponse } from "../_shared/http.ts";
import { logPayment, logPaymentError } from "../_shared/logger.ts";
import { paymentError } from "../_shared/payment-errors.ts";
import { verifyRazorpayWebhookSignature } from "../_shared/razorpay-signature.ts";

const SCOPE = "razorpay-webhook";

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment?: {
      entity?: {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
        method?: string;
      };
    };
    refund?: {
      entity?: {
        payment_id: string;
      };
    };
  };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
  if (!webhookSecret) {
    logPaymentError(SCOPE, "Webhook secret not configured", new Error("missing secret"));
    const { body, status } = paymentError("SERVER_ERROR", 500);
    return jsonResponse(body, status);
  }

  const signature = req.headers.get("x-razorpay-signature");
  if (!signature) {
    logPayment(SCOPE, "Missing webhook signature", {}, "warn");
    const { body, status } = paymentError("INVALID_SIGNATURE", 401);
    return jsonResponse(body, status);
  }

  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch (error) {
    logPaymentError(SCOPE, "Failed to read webhook body", error);
    const { body, status } = paymentError("INVALID_PAYLOAD", 400);
    return jsonResponse(body, status);
  }

  logPayment(SCOPE, "Webhook received", {
    bodyLength: rawBody.length,
  });

  const valid = await verifyRazorpayWebhookSignature(
    rawBody,
    signature,
    webhookSecret
  );

  if (!valid) {
    logPayment(SCOPE, "Webhook signature invalid", {}, "warn");
    const { body, status } = paymentError("INVALID_SIGNATURE", 401);
    return jsonResponse(body, status);
  }

  logPayment(SCOPE, "Webhook verified");

  let event: RazorpayWebhookPayload;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookPayload;
  } catch (error) {
    logPaymentError(SCOPE, "Invalid webhook JSON", error);
    const { body, status } = paymentError("INVALID_PAYLOAD", 400);
    return jsonResponse(body, status);
  }

  const supabaseAdmin = getServiceRoleClient();
  if (!supabaseAdmin) {
    const { body, status } = paymentError("SERVER_ERROR", 500);
    return jsonResponse(body, status);
  }

  const eventName = event.event;
  logPayment(SCOPE, "Processing webhook event", { event: eventName });

  try {
    switch (eventName) {
      case "payment.authorized":
      case "payment.captured": {
        const payment = event.payload.payment?.entity;
        if (!payment?.id || !payment.order_id) {
          const { body, status } = paymentError("INVALID_PAYLOAD", 400);
          return jsonResponse(body, status);
        }

        if (payment.status !== "captured" && eventName === "payment.captured") {
          logPayment(SCOPE, "Captured event with non-captured status", {
            status: payment.status,
            paymentId: payment.id,
          }, "warn");
        }

        if (eventName === "payment.authorized" && payment.status !== "authorized") {
          return okResponse({ received: true, action: "ignored" });
        }

        if (eventName === "payment.captured" && payment.status !== "captured") {
          return okResponse({ received: true, action: "ignored" });
        }

        const { session, dbError: sessionLookupError } = await getPaymentSession(
          supabaseAdmin,
          payment.order_id
        );

        if (sessionLookupError || !session) {
          logPayment(SCOPE, "No payment session for webhook", {
            orderId: payment.order_id,
            paymentId: payment.id,
            dbError: sessionLookupError,
          }, "warn");
          return okResponse({ received: true, action: "no_session" });
        }

        if (session.status === "fulfilled") {
          logPayment(SCOPE, "Webhook duplicate — already fulfilled", {
            paymentId: payment.id,
          });
          return okResponse({ received: true, action: "duplicate", duplicate: true });
        }

        if (isSessionExpired(session)) {
          await markPaymentSessionStatus(supabaseAdmin, payment.order_id, "expired");
          logPayment(SCOPE, "Webhook session expired", {
            orderId: payment.order_id,
          }, "warn");
          return okResponse({ received: true, action: "session_expired" });
        }

        if (Number(payment.amount) !== Number(session.amount_paise)) {
          logPayment(SCOPE, "Webhook amount mismatch", {
            webhookAmount: payment.amount,
            sessionAmount: session.amount_paise,
          }, "warn");
          const { body, status } = paymentError("AMOUNT_MISMATCH", 400);
          return jsonResponse(body, status);
        }

        logPayment(SCOPE, "Webhook fulfilling order", {
          paymentId: payment.id,
          orderId: payment.order_id,
          userId: session.user_id,
        });

        const fulfillment = await runFulfillment(supabaseAdmin, {
          userId: session.user_id,
          razorpayOrderId: payment.order_id,
          razorpayPaymentId: payment.id,
          shippingAddress: session.shipping_address,
          items: session.items,
          scope: SCOPE,
        });

        if (!fulfillment.ok) {
          logPayment(SCOPE, "Webhook fulfillment failed", {
            error: fulfillment.error,
            code: fulfillment.code,
          }, "error");
          const { body, status } = paymentError("FULFILLMENT_FAILED", 500);
          return jsonResponse(body, status);
        }

        logPayment(SCOPE, "Webhook fulfilled", {
          paymentId: payment.id,
          duplicate: fulfillment.duplicate,
        });

        return okResponse({
          received: true,
          action: "fulfilled",
          duplicate: fulfillment.duplicate,
        });
      }

      case "payment.failed": {
        const payment = event.payload.payment?.entity;
        if (payment?.order_id) {
          await markPaymentSessionStatus(
            supabaseAdmin,
            payment.order_id,
            "failed",
            payment.id
          );
          logPayment(SCOPE, "Payment failed — session marked failed", {
            orderId: payment.order_id,
            paymentId: payment.id,
          });
        }
        return okResponse({ received: true, action: "marked_failed" });
      }

      case "payment.refunded": {
        const paymentId =
          event.payload.payment?.entity?.id ??
          event.payload.refund?.entity?.payment_id;

        if (paymentId) {
          const { data: updatedCount, error } = await supabaseAdmin.rpc(
            "mark_orders_refunded",
            { p_razorpay_payment_id: paymentId }
          );

          if (error) {
            logPaymentError(SCOPE, "Refund marking failed", error, { paymentId });
          } else {
            logPayment(SCOPE, "Orders marked refunded", {
              paymentId,
              updatedCount,
            });
          }
        }

        return okResponse({ received: true, action: "refunded" });
      }

      default:
        logPayment(SCOPE, "Unhandled webhook event", { event: eventName });
        return okResponse({ received: true, action: "ignored" });
    }
  } catch (error) {
    logPaymentError(SCOPE, "Webhook processing error", error, { event: eventName });
    const { body, status } = paymentError("SERVER_UNAVAILABLE", 500);
    return jsonResponse(body, status);
  }
});
