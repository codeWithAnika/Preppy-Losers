import { getAuthenticatedUser, getServiceRoleClient } from "../_shared/auth.ts";
import { jsonResponse, okResponse } from "../_shared/http.ts";
import { logPayment, logPaymentError } from "../_shared/logger.ts";
import {
  validateOrderItems,
  type CartItemPayload,
} from "../_shared/order-validation.ts";
import {
  normalizePromoCode,
  validatePromoForSubtotal,
} from "../_shared/promo-validation.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface ValidatePromoBody {
  code: string;
  items: CartItemPayload[];
}

const SCOPE = "validate-promo-code";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authResult = await getAuthenticatedUser(req, SCOPE);
    if (authResult instanceof Response) {
      return authResult;
    }

    const body = (await req.json()) as ValidatePromoBody;
    const code = normalizePromoCode(body.code ?? "");
    const items = body.items;

    if (!code || !Array.isArray(items) || items.length === 0) {
      return jsonResponse(
        { success: false, error: "Invalid promo code.", code: "INVALID_CODE" },
        400
      );
    }

    const supabaseAdmin = getServiceRoleClient();
    if (!supabaseAdmin) {
      return jsonResponse({ success: false, error: "Server unavailable." }, 500);
    }

    const validation = await validateOrderItems(supabaseAdmin, items);
    if (!validation.ok) {
      return jsonResponse(
        {
          success: false,
          error: validation.error,
          code: validation.code,
        },
        validation.status
      );
    }

    const promoResult = await validatePromoForSubtotal(
      supabaseAdmin,
      code,
      validation.order.totalRupee
    );

    if (!promoResult.ok) {
      logPayment(SCOPE, "promo rejected", { code, reason: promoResult.code }, "warn");
      return jsonResponse(
        {
          success: false,
          error: promoResult.error,
          code: promoResult.code,
        },
        400
      );
    }

    const { pricing } = promoResult;

    logPayment(SCOPE, "promo validated", {
      code: pricing.promoCode,
      subtotal: pricing.subtotalRupee,
      discount: pricing.discountRupee,
      finalAmount: pricing.finalRupee,
    });

    return okResponse({
      success: true,
      promoCode: pricing.promoCode,
      subtotal: pricing.subtotalRupee,
      discount: pricing.discountRupee,
      finalAmount: pricing.finalRupee,
    });
  } catch (error) {
    logPaymentError(SCOPE, "unhandled exception", error);
    return jsonResponse({ success: false, error: "Server unavailable." }, 500);
  }
});
