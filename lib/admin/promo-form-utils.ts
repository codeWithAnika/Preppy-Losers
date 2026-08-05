import type { AdminPromoCodeRow, PromoCodeFormInput } from "@/lib/admin/types";
import { normalizePromoCode } from "@/lib/promo-calculations";

export const PROMO_CODE_MAX_LENGTH = 20;
const PROMO_CODE_PATTERN = /^[A-Z0-9]+$/;

export interface PromoFormErrors {
  code?: string;
  value?: string;
  minimumOrder?: string;
  maximumDiscount?: string;
  maxUses?: string;
  expiresAt?: string;
}

export interface PromoDateFields {
  startDate: string;
  startTime: string;
  expiryDate: string;
  expiryTime: string;
}

export const EMPTY_DATE_FIELDS: PromoDateFields = {
  startDate: "",
  startTime: "",
  expiryDate: "",
  expiryTime: "",
};

export function sanitizePromoCodeInput(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, PROMO_CODE_MAX_LENGTH);
}

export function isoToDateInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}

export function isoToTimeInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(11, 16);
}

export function dateFieldsFromIso(
  startsAt: string | null,
  expiresAt: string | null
): PromoDateFields {
  return {
    startDate: isoToDateInput(startsAt),
    startTime: isoToTimeInput(startsAt),
    expiryDate: isoToDateInput(expiresAt),
    expiryTime: isoToTimeInput(expiresAt),
  };
}

export function combineDateTime(date: string, time: string): string | null {
  const trimmedDate = date.trim();
  if (!trimmedDate) return null;

  const trimmedTime = time.trim();
  const localValue = trimmedTime ? `${trimmedDate}T${trimmedTime}` : `${trimmedDate}T00:00`;
  const parsed = new Date(localValue);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export function validatePromoForm(
  form: PromoCodeFormInput,
  existingCodes: AdminPromoCodeRow[],
  editingId?: string
): PromoFormErrors {
  const errors: PromoFormErrors = {};
  const code = normalizePromoCode(form.code);

  if (!code) {
    errors.code = "Promo code is required.";
  } else if (!PROMO_CODE_PATTERN.test(code)) {
    errors.code = "Use letters and numbers only (A–Z, 0–9).";
  } else if (
    existingCodes.some(
      (entry) =>
        entry.code.toUpperCase() === code && entry.id !== editingId
    )
  ) {
    errors.code = "This promo code already exists. Choose a different code.";
  }

  if (!Number.isFinite(form.value) || form.value <= 0) {
    errors.value = "Discount value is required.";
  } else if (form.type === "percentage" && form.value > 100) {
    errors.value = "Discount percentage cannot exceed 100%.";
  } else if (form.value < 0) {
    errors.value = "Discount cannot be negative.";
  }

  if (form.minimumOrder < 0) {
    errors.minimumOrder = "Minimum order cannot be negative.";
  }

  if (form.maximumDiscount !== null) {
    if (!Number.isFinite(form.maximumDiscount) || form.maximumDiscount < 0) {
      errors.maximumDiscount = "Maximum discount cannot be negative.";
    }
  }

  if (form.maxUses !== null) {
    if (!Number.isFinite(form.maxUses) || form.maxUses < 0) {
      errors.maxUses = "Maximum uses cannot be negative.";
    }
  }

  if (form.startsAt && form.expiresAt) {
    if (new Date(form.expiresAt).getTime() < new Date(form.startsAt).getTime()) {
      errors.expiresAt = "Expiry date must be on or after the start date.";
    }
  }

  return errors;
}

export function formatPromoDiscountLabel(row: AdminPromoCodeRow): string {
  if (row.type === "percentage") {
    return `${Number(row.value)}% OFF`;
  }
  return `₹${Number(row.value)} OFF`;
}

export function formatPromoUsage(row: AdminPromoCodeRow): string {
  if (row.max_uses === null) {
    return `${row.used_count} / Unlimited`;
  }
  return `${row.used_count} / ${row.max_uses}`;
}

export function formatPromoValidity(
  startsAt: string | null,
  expiresAt: string | null,
  formatDate: (value: string) => string
): string {
  if (!startsAt && !expiresAt) {
    return "No expiry";
  }

  if (startsAt && expiresAt) {
    return `${formatDate(startsAt)} – ${formatDate(expiresAt)}`;
  }

  if (startsAt) {
    return `From ${formatDate(startsAt)}`;
  }

  return `Until ${formatDate(expiresAt!)}`;
}

export function mapDuplicateCodeError(message: string): string | null {
  const lower = message.toLowerCase();
  if (lower.includes("duplicate") || lower.includes("unique")) {
    return "This promo code already exists. Choose a different code.";
  }
  return null;
}
