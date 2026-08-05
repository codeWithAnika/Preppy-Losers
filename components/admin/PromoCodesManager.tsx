"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAdminToast } from "@/components/admin/AdminProviders";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatPromoDate } from "@/lib/admin/format";
import {
  createPromoCodeAction,
  deletePromoCodeAction,
  togglePromoCodeActiveAction,
  updatePromoCodeAction,
} from "@/lib/admin/actions/promo-codes";
import {
  combineDateTime,
  dateFieldsFromIso,
  EMPTY_DATE_FIELDS,
  formatPromoDiscountLabel,
  formatPromoUsage,
  formatPromoValidity,
  mapDuplicateCodeError,
  PROMO_CODE_MAX_LENGTH,
  sanitizePromoCodeInput,
  validatePromoForm,
  type PromoDateFields,
  type PromoFormErrors,
} from "@/lib/admin/promo-form-utils";
import type { AdminPromoCodeRow, PromoCodeFormInput } from "@/lib/admin/types";
import {
  isPromoExpired,
  isPromoNotStarted,
  isPromoUsageExceeded,
} from "@/lib/promo-calculations";

interface PromoCodesManagerProps {
  promoCodes: AdminPromoCodeRow[];
}

const EMPTY_FORM: PromoCodeFormInput = {
  code: "",
  type: "percentage",
  value: 10,
  minimumOrder: 0,
  maximumDiscount: null,
  maxUses: null,
  active: true,
  startsAt: null,
  expiresAt: null,
};

function rowToForm(row: AdminPromoCodeRow): PromoCodeFormInput {
  return {
    id: row.id,
    code: row.code,
    type: row.type,
    value: Number(row.value),
    minimumOrder: Number(row.minimum_order),
    maximumDiscount:
      row.maximum_discount === null ? null : Number(row.maximum_discount),
    maxUses: row.max_uses === null ? null : Number(row.max_uses),
    active: row.active,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
  };
}

function getPromoStatus(row: AdminPromoCodeRow): string {
  if (!row.active) return "Inactive";
  if (isPromoNotStarted(row.starts_at)) return "Scheduled";
  if (isPromoExpired(row.expires_at)) return "Expired";
  if (isPromoUsageExceeded(row.used_count, row.max_uses)) return "Limit reached";
  return "Active";
}

function getStatusBadgeClass(status: string): string {
  if (status === "Active") return "admin-badge--accent";
  if (status === "Scheduled") return "admin-badge--pending";
  if (status === "Expired" || status === "Limit reached") {
    return "admin-badge--archived";
  }
  return "";
}

function parseOptionalInt(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function PromoCodesManager({ promoCodes }: PromoCodesManagerProps) {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [pending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<PromoCodeFormInput>(EMPTY_FORM);
  const [dateFields, setDateFields] = useState<PromoDateFields>(EMPTY_DATE_FIELDS);
  const [errors, setErrors] = useState<PromoFormErrors>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const editing = Boolean(form.id);

  const sortedCodes = useMemo(
    () =>
      [...promoCodes].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    [promoCodes]
  );

  const discountValueLabel =
    form.type === "percentage" ? "Discount Percentage (%)" : "Discount Amount (₹)";

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setDateFields(EMPTY_DATE_FIELDS);
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (row: AdminPromoCodeRow) => {
    setForm(rowToForm(row));
    setDateFields(dateFieldsFromIso(row.starts_at, row.expires_at));
    setErrors({});
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(EMPTY_FORM);
    setDateFields(EMPTY_DATE_FIELDS);
    setErrors({});
  };

  const buildSubmitPayload = (): PromoCodeFormInput => ({
    ...form,
    code: sanitizePromoCodeInput(form.code),
    startsAt: combineDateTime(dateFields.startDate, dateFields.startTime),
    expiresAt: combineDateTime(dateFields.expiryDate, dateFields.expiryTime),
  });

  const handleSubmit = () => {
    const payload = buildSubmitPayload();
    const nextErrors = validatePromoForm(payload, promoCodes, form.id);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    startTransition(async () => {
      const result = editing
        ? await updatePromoCodeAction(payload)
        : await createPromoCodeAction(payload);

      if (result.success) {
        toast(editing ? "Promo code updated" : "Promo code created", "success");
        closeForm();
        router.refresh();
        return;
      }

      const duplicateMessage = mapDuplicateCodeError(result.error);
      if (duplicateMessage) {
        setErrors((current) => ({ ...current, code: duplicateMessage }));
        return;
      }

      toast(result.error, "error");
    });
  };

  const handleToggleActive = (row: AdminPromoCodeRow) => {
    startTransition(async () => {
      const result = await togglePromoCodeActiveAction(row.id, !row.active);
      if (result.success) {
        toast(row.active ? "Promo code disabled" : "Promo code enabled", "success");
        router.refresh();
      } else {
        toast(result.error, "error");
      }
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;

    startTransition(async () => {
      const result = await deletePromoCodeAction(deleteId);
      if (result.success) {
        toast("Promo code deleted", "success");
        setDeleteId(null);
        router.refresh();
      } else {
        toast(result.error, "error");
      }
    });
  };

  const updateExpiryDate = (expiryDate: string) => {
    setDateFields((current) => ({ ...current, expiryDate }));
    if (dateFields.startDate && expiryDate && expiryDate < dateFields.startDate) {
      setErrors((current) => ({
        ...current,
        expiresAt: "Expiry date must be on or after the start date.",
      }));
    } else {
      setErrors((current) => ({ ...current, expiresAt: undefined }));
    }
  };

  return (
    <div className="admin-promo-codes">
      {sortedCodes.length > 0 ? (
        <div className="admin-toolbar">
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={openCreate}
            disabled={pending}
          >
            <Plus size={16} strokeWidth={1.75} />
            Create Promo Code
          </button>
        </div>
      ) : null}

      {sortedCodes.length === 0 ? (
        <div className="admin-promo-empty">
          <h2>No promo codes created yet</h2>
          <p>Create your first discount code for customers.</p>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={openCreate}
            disabled={pending}
          >
            <Plus size={16} strokeWidth={1.75} />
            Create Promo Code
          </button>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Minimum Order</th>
                <th>Usage</th>
                <th>Status</th>
                <th>Validity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedCodes.map((row) => {
                const status = getPromoStatus(row);

                return (
                  <tr key={row.id}>
                    <td>
                      <span className="admin-promo-code">{row.code}</span>
                    </td>
                    <td>
                      <strong>{formatPromoDiscountLabel(row)}</strong>
                      {row.type === "percentage" && row.maximum_discount !== null ? (
                        <span className="admin-table__sub">
                          Cap ₹{Number(row.maximum_discount)}
                        </span>
                      ) : null}
                    </td>
                    <td>Min ₹{Number(row.minimum_order)}</td>
                    <td>{formatPromoUsage(row)}</td>
                    <td>
                      <span className={`admin-badge ${getStatusBadgeClass(status)}`}>
                        {status}
                      </span>
                    </td>
                    <td>
                      {formatPromoValidity(row.starts_at, row.expires_at, formatPromoDate)}
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <button
                          type="button"
                          className="admin-btn admin-btn--ghost"
                          disabled={pending}
                          onClick={() => openEdit(row)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn--ghost"
                          disabled={pending}
                          onClick={() => handleToggleActive(row)}
                        >
                          {row.active ? "Disable" : "Enable"}
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn--ghost"
                          disabled={pending}
                          onClick={() => setDeleteId(row.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {formOpen ? (
        <div
          className="admin-dialog-backdrop"
          role="presentation"
          onClick={closeForm}
        >
          <div
            className="admin-dialog admin-dialog--promo"
            role="dialog"
            aria-modal="true"
            aria-labelledby="promo-form-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-dialog__header">
              <div>
                <p className="admin-page__kicker">Commerce</p>
                <h2 id="promo-form-title" className="admin-dialog__title">
                  {editing ? "Edit promo code" : "Create promo code"}
                </h2>
              </div>
            </div>

            <div className="admin-dialog__body">
              <section className="admin-form-section">
                <h2 className="admin-form-section__title">Promo Code Details</h2>

                <label className="admin-field">
                  <span>Code</span>
                  <input
                    className={`admin-input admin-input--code${
                      errors.code ? " admin-input--error" : ""
                    }`}
                    value={form.code}
                    maxLength={PROMO_CODE_MAX_LENGTH}
                    placeholder="Example: WELCOME5"
                    autoComplete="off"
                    spellCheck={false}
                    onChange={(event) => {
                      setForm((prev) => ({
                        ...prev,
                        code: sanitizePromoCodeInput(event.target.value),
                      }));
                      setErrors((prev) => ({ ...prev, code: undefined }));
                    }}
                  />
                  {errors.code ? (
                    <span className="admin-field-error" role="alert">
                      {errors.code}
                    </span>
                  ) : (
                    <span className="admin-field-hint">
                      Letters and numbers only, up to {PROMO_CODE_MAX_LENGTH} characters.
                    </span>
                  )}
                </label>

                <div className="admin-form-row">
                  <label className="admin-field">
                    <span>Discount Type</span>
                    <select
                      className="admin-select"
                      value={form.type}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          type: event.target.value as PromoCodeFormInput["type"],
                        }))
                      }
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed amount</option>
                    </select>
                  </label>

                  <label className="admin-field">
                    <span>{discountValueLabel}</span>
                    <input
                      className={`admin-input${errors.value ? " admin-input--error" : ""}`}
                      type="number"
                      min={1}
                      max={form.type === "percentage" ? 100 : undefined}
                      step={form.type === "percentage" ? 1 : 1}
                      value={form.value}
                      onChange={(event) => {
                        setForm((prev) => ({
                          ...prev,
                          value: Number(event.target.value),
                        }));
                        setErrors((prev) => ({ ...prev, value: undefined }));
                      }}
                      required
                    />
                    {errors.value ? (
                      <span className="admin-field-error" role="alert">
                        {errors.value}
                      </span>
                    ) : null}
                  </label>
                </div>
              </section>

              <section className="admin-form-section">
                <h2 className="admin-form-section__title">Order Rules</h2>

                <div className="admin-form-row">
                  <label className="admin-field">
                    <span>Minimum Order</span>
                    <input
                      className={`admin-input${
                        errors.minimumOrder ? " admin-input--error" : ""
                      }`}
                      type="number"
                      min={0}
                      value={form.minimumOrder}
                      placeholder="₹0"
                      onChange={(event) => {
                        setForm((prev) => ({
                          ...prev,
                          minimumOrder: Number(event.target.value),
                        }));
                        setErrors((prev) => ({ ...prev, minimumOrder: undefined }));
                      }}
                    />
                    {errors.minimumOrder ? (
                      <span className="admin-field-error" role="alert">
                        {errors.minimumOrder}
                      </span>
                    ) : null}
                  </label>

                  <label className="admin-field">
                    <span>Maximum Discount</span>
                    <input
                      className={`admin-input${
                        errors.maximumDiscount ? " admin-input--error" : ""
                      }`}
                      type="number"
                      min={0}
                      value={form.maximumDiscount ?? ""}
                      placeholder="Optional"
                      disabled={form.type === "fixed"}
                      onChange={(event) => {
                        setForm((prev) => ({
                          ...prev,
                          maximumDiscount: parseOptionalInt(event.target.value),
                        }));
                        setErrors((prev) => ({ ...prev, maximumDiscount: undefined }));
                      }}
                    />
                    {form.type === "fixed" ? (
                      <span className="admin-field-hint">
                        Maximum discount applies to percentage codes only.
                      </span>
                    ) : errors.maximumDiscount ? (
                      <span className="admin-field-error" role="alert">
                        {errors.maximumDiscount}
                      </span>
                    ) : (
                      <span className="admin-field-hint">Optional cap in rupees.</span>
                    )}
                  </label>
                </div>
              </section>

              <section className="admin-form-section">
                <h2 className="admin-form-section__title">Usage Limits</h2>

                <label className="admin-field">
                  <span>Maximum Uses</span>
                  <input
                    className={`admin-input${errors.maxUses ? " admin-input--error" : ""}`}
                    type="number"
                    min={1}
                    value={form.maxUses ?? ""}
                    placeholder="Unlimited"
                    onChange={(event) => {
                      setForm((prev) => ({
                        ...prev,
                        maxUses: parseOptionalInt(event.target.value),
                      }));
                      setErrors((prev) => ({ ...prev, maxUses: undefined }));
                    }}
                  />
                  {errors.maxUses ? (
                    <span className="admin-field-error" role="alert">
                      {errors.maxUses}
                    </span>
                  ) : (
                    <span className="admin-field-hint">Leave empty for unlimited uses.</span>
                  )}
                </label>
              </section>

              <section className="admin-form-section">
                <h2 className="admin-form-section__title">Schedule</h2>

                <label className="admin-field">
                  <span>Start Date</span>
                  <div className="admin-date-row">
                    <input
                      className="admin-input"
                      type="date"
                      value={dateFields.startDate}
                      onChange={(event) => {
                        const startDate = event.target.value;
                        setDateFields((current) => ({ ...current, startDate }));
                        if (
                          dateFields.expiryDate &&
                          startDate &&
                          dateFields.expiryDate < startDate
                        ) {
                          setErrors((current) => ({
                            ...current,
                            expiresAt:
                              "Expiry date must be on or after the start date.",
                          }));
                        } else {
                          setErrors((current) => ({ ...current, expiresAt: undefined }));
                        }
                      }}
                    />
                    <input
                      className="admin-input"
                      type="time"
                      value={dateFields.startTime}
                      placeholder="Optional time"
                      onChange={(event) =>
                        setDateFields((current) => ({
                          ...current,
                          startTime: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <span className="admin-field-hint">Time is optional. Leave blank for midnight.</span>
                </label>

                <label className="admin-field">
                  <span>Expiry Date</span>
                  <div className="admin-date-row">
                    <input
                      className={`admin-input${
                        errors.expiresAt ? " admin-input--error" : ""
                      }`}
                      type="date"
                      min={dateFields.startDate || undefined}
                      value={dateFields.expiryDate}
                      onChange={(event) => updateExpiryDate(event.target.value)}
                    />
                    <input
                      className="admin-input"
                      type="time"
                      value={dateFields.expiryTime}
                      onChange={(event) =>
                        setDateFields((current) => ({
                          ...current,
                          expiryTime: event.target.value,
                        }))
                      }
                    />
                  </div>
                  {errors.expiresAt ? (
                    <span className="admin-field-error" role="alert">
                      {errors.expiresAt}
                    </span>
                  ) : (
                    <span className="admin-field-hint">
                      Displayed as DD MMM YYYY in the table.
                    </span>
                  )}
                </label>
              </section>

              <section className="admin-form-section">
                <h2 className="admin-form-section__title">Status</h2>
                <label className="admin-check">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, active: event.target.checked }))
                    }
                  />
                  <span>Active</span>
                </label>
              </section>
            </div>

            <div className="admin-dialog__actions">
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                disabled={pending}
                onClick={closeForm}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--primary"
                disabled={pending}
                onClick={handleSubmit}
              >
                {pending
                  ? "Saving…"
                  : editing
                    ? "Save Changes"
                    : "Create Promo Code"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete promo code"
        description="This cannot be undone. Existing orders that used this code are not affected."
        confirmLabel="Delete"
        destructive
        loading={pending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
