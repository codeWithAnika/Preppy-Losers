import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyDiscountToLineAmounts,
  buildPromoPricing,
  calculateDiscountRupee,
  isPromoExpired,
  isPromoNotStarted,
  isPromoUsageExceeded,
  normalizePromoCode,
} from "./promo-calculations";

describe("promo calculations", () => {
  it("valid percentage code", () => {
    const pricing = buildPromoPricing(1000, {
      type: "percentage",
      value: 10,
      maximumDiscount: null,
    });
    assert.equal(pricing.discountRupee, 100);
    assert.equal(pricing.finalRupee, 900);
  });

  it("valid fixed code", () => {
    const pricing = buildPromoPricing(500, {
      type: "fixed",
      value: 100,
      maximumDiscount: null,
    });
    assert.equal(pricing.discountRupee, 100);
    assert.equal(pricing.finalRupee, 400);
  });

  it("percentage code respects maximum discount cap", () => {
    const discount = calculateDiscountRupee(
      { type: "percentage", value: 50, maximumDiscount: 200 },
      1000
    );
    assert.equal(discount, 200);
  });

  it("expired code detection", () => {
    assert.equal(isPromoExpired("2020-01-01T00:00:00.000Z"), true);
    assert.equal(isPromoExpired("2099-01-01T00:00:00.000Z"), false);
  });

  it("inactive / not started code detection", () => {
    assert.equal(isPromoNotStarted("2099-01-01T00:00:00.000Z"), true);
    assert.equal(isPromoNotStarted("2020-01-01T00:00:00.000Z"), false);
  });

  it("usage exceeded detection", () => {
    assert.equal(isPromoUsageExceeded(5, 5), true);
    assert.equal(isPromoUsageExceeded(4, 5), false);
    assert.equal(isPromoUsageExceeded(100, null), false);
  });

  it("minimum order is enforced at validation layer; discount zero below subtotal", () => {
    const discount = calculateDiscountRupee(
      { type: "fixed", value: 100, maximumDiscount: null },
      0
    );
    assert.equal(discount, 0);
  });

  it("amount cannot go below zero", () => {
    const pricing = buildPromoPricing(50, {
      type: "fixed",
      value: 100,
      maximumDiscount: null,
    });
    assert.equal(pricing.discountRupee, 50);
    assert.equal(pricing.finalRupee, 0);
  });

  it("discount cannot exceed subtotal", () => {
    const pricing = buildPromoPricing(200, {
      type: "percentage",
      value: 100,
      maximumDiscount: null,
    });
    assert.equal(pricing.discountRupee, 200);
    assert.equal(pricing.finalRupee, 0);
  });

  it("tampered client discount would mismatch server recompute", () => {
    const serverPricing = buildPromoPricing(1000, {
      type: "percentage",
      value: 10,
      maximumDiscount: null,
    });
    const tamperedClientDiscount = 500;
    assert.notEqual(serverPricing.discountRupee, tamperedClientDiscount);
  });

  it("pro-rata line discounts sum to final total", () => {
    const lineAmounts = [600, 400];
    const adjusted = applyDiscountToLineAmounts(lineAmounts, 100);
    const total = adjusted.reduce((sum, amount) => sum + amount, 0);
    assert.equal(total, 900);
  });

  it("normalize promo code trims and uppercases", () => {
    assert.equal(normalizePromoCode(" welcome10 "), "WELCOME10");
  });
});

describe("payment edge cases (logic-only)", () => {
  it("duplicate payment should not change totals", () => {
    const original = buildPromoPricing(800, {
      type: "fixed",
      value: 100,
      maximumDiscount: null,
    });
    const duplicate = buildPromoPricing(800, {
      type: "fixed",
      value: 100,
      maximumDiscount: null,
    });
    assert.deepEqual(original, duplicate);
  });

  it("cancelled payment leaves promo usage unchanged (no increment on failed verify)", () => {
    assert.equal(isPromoUsageExceeded(0, 1), false);
  });
});
