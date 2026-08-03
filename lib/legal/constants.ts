/** Central legal & support configuration — edit values here for all policy pages. */
export const BRAND_NAME = "PREPPY LOSERS";
export const SUPPORT_EMAIL = "loserspreppy@gmail.com";
export const LEGAL_LAST_UPDATED = "August 2026";

/** Typical support response window shown on contact page. */
export const SUPPORT_RESPONSE_TIME = "1–2 business days";

/** Order / payment / shipping support copy for contact page. */
export const SUPPORT_TOPICS = {
  orders:
    "Questions about your order status, tracking, or delivery — include your order ID and registered email.",
  payments:
    "Payment issues, failed transactions, or refund requests — include your Razorpay payment ID if available.",
  shipping:
    "Shipping timelines, pincode serviceability, or address changes before dispatch.",
  returns:
    "Return, exchange, or cancellation requests — see our Refund Policy for eligibility.",
} as const;

export const RETURN_POLICY = {
  returnWindowDays: 7,
  damagedReportHours: 48,
  wrongItemReportHours: 48,
  refundProcessingBusinessDays: "5–7",
  refundBankDays: "5–10",
  returnShippingNote:
    "Return shipping may apply unless the return is due to our error (damaged, defective, or wrong item).",
} as const;

export const SHIPPING_POLICY = {
  processingBusinessDays: "1–3",
  metroDeliveryDays: "3–7",
  otherDeliveryDays: "5–10",
  defaultCountry: "India",
  internationalNote:
    "We currently ship within India only unless announced otherwise on our website.",
} as const;

export const LEGAL_CONTACT_PARAGRAPH =
  "PREPPY LOSERS is an independent online streetwear brand based in India. For any questions about orders, payments, shipping, or returns, email us and we will respond as soon as possible during business hours.";

export const LEGAL_BREADCRUMB = {
  label: "Legal",
  href: "/privacy-policy",
} as const;
