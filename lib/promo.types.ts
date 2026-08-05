export type PromoErrorCode =
  | "INVALID_CODE"
  | "INACTIVE_CODE"
  | "EXPIRED_CODE"
  | "NOT_STARTED"
  | "MINIMUM_NOT_MET"
  | "USAGE_EXCEEDED";

export interface PromoCartItemPayload {
  productId: string;
  productName: string;
  price: number;
  size: string;
  quantity: number;
}

export interface AppliedPromo {
  promoCode: string;
  subtotal: number;
  discount: number;
  finalAmount: number;
}

export interface ValidatePromoSuccess {
  success: true;
  promoCode: string;
  subtotal: number;
  discount: number;
  finalAmount: number;
}

export interface ValidatePromoFailure {
  success: false;
  error: string;
  code:
    | PromoErrorCode
    | "INVALID_PAYLOAD"
    | "OUT_OF_STOCK"
    | "PRICE_MISMATCH"
    | "SERVER_UNAVAILABLE"
    | "UNAUTHORIZED";
}

export type ValidatePromoResult = ValidatePromoSuccess | ValidatePromoFailure;
