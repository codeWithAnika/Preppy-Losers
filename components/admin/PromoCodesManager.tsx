"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAdminToast } from "@/components/admin/AdminProviders";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatAdminDate } from "@/lib/admin/format";
import {
  createPromoCodeAction,
  deletePromoCodeAction,
  togglePromoCodeActiveAction,
  updatePromoCodeAction,
} from "@/lib/admin/actions/promo-codes";
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

function toDatetimeLocal(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function fromDatetimeLocal(value: string): string | null {
  if (!value.trim()) return null;
  return new Date(value).toISOString();
}

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

function getRemainingUses(row: AdminPromoCodeRow): string {
  if (row.max_uses === null) return "Unlimited";
  return String(Math.max(0, row.max_uses - row.used_count));
}

export function PromoCodesManager({ promoCodes }: PromoCodesManagerProps) {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [pending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<PromoCodeFormInput>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const editing = Boolean(form.id);

  const sortedCodes = useMemo(
    () =>
      [...promoCodes].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    [promoCodes]
  );

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (row: AdminPromoCodeRow) => {
    setForm(rowToForm(row));
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = () => {
    startTransition(async () => {
      const result = editing
        ? await updatePromoCodeAction(form)
        : await createPromoCodeAction(form);

      if (result.success) {
        toast(editing ? "Promo code updated" : "Promo code created", "success");
        closeForm();
        router.refresh();
      } else {
        toast(result.error, "error");
      }
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

  return (
    <div className="admin-promo-codes">
      <div className="admin-toolbar">
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={openCreate}
          disabled={pending}
        >
          Create promo code
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Value</th>
              <th>Min order</th>
              <th>Max discount</th>
              <th>Max uses</th>
              <th>Used</th>
              <th>Remaining</th>
              <th>Status</th>
              <th>Starts</th>
              <th>Expires</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedCodes.length === 0 ? (
              <tr>
                <td colSpan={12} className="admin-muted">
                  No promo codes yet.
                </td>
              </tr>
            ) : (
              sortedCodes.map((row) => (
                <tr key={row.id}>
                  <td>
                    <code>{row.code}</code>
                  </td>
                  <td>{row.type}</td>
                  <td>
                    {row.type === "percentage" ? `${row.value}%` : `₹${row.value}`}
                  </td>
                  <td>₹{row.minimum_order}</td>
                  <td>
                    {row.maximum_discount === null ? "—" : `₹${row.maximum_discount}`}
                  </td>
                  <td>{row.max_uses ?? "—"}</td>
                  <td>{row.used_count}</td>
                  <td>{getRemainingUses(row)}</td>
                  <td>
                    <span
                      className={`admin-badge ${
                        getPromoStatus(row) === "Active" ? "admin-badge--accent" : ""
                      }`}
                    >
                      {getPromoStatus(row)}
                    </span>
                  </td>
                  <td>{row.starts_at ? formatAdminDate(row.starts_at) : "—"}</td>
                  <td>{row.expires_at ? formatAdminDate(row.expires_at) : "—"}</td>
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {formOpen ? (
        <div className="admin-modal-backdrop" role="presentation">
          <div className="admin-modal" role="dialog" aria-modal="true">
            <div className="admin-modal__head">
              <h2>{editing ? "Edit promo code" : "Create promo code"}</h2>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={closeForm}>
                Close
              </button>
            </div>

            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Code</span>
                <input
                  value={form.code}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      code: event.target.value.toUpperCase(),
                    }))
                  }
                  required
                />
              </label>

              <label className="admin-field">
                <span>Type</span>
                <select
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
                <span>Value</span>
                <input
                  type="number"
                  min={1}
                  value={form.value}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      value: Number(event.target.value),
                    }))
                  }
                  required
                />
              </label>

              <label className="admin-field">
                <span>Minimum order (₹)</span>
                <input
                  type="number"
                  min={0}
                  value={form.minimumOrder}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      minimumOrder: Number(event.target.value),
                    }))
                  }
                />
              </label>

              <label className="admin-field">
                <span>Maximum discount (₹)</span>
                <input
                  type="number"
                  min={0}
                  value={form.maximumDiscount ?? ""}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      maximumDiscount:
                        event.target.value === "" ? null : Number(event.target.value),
                    }))
                  }
                  placeholder="Optional"
                />
              </label>

              <label className="admin-field">
                <span>Maximum uses</span>
                <input
                  type="number"
                  min={1}
                  value={form.maxUses ?? ""}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      maxUses:
                        event.target.value === "" ? null : Number(event.target.value),
                    }))
                  }
                  placeholder="Unlimited"
                />
              </label>

              <label className="admin-field">
                <span>Start date</span>
                <input
                  type="datetime-local"
                  value={toDatetimeLocal(form.startsAt)}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      startsAt: fromDatetimeLocal(event.target.value),
                    }))
                  }
                />
              </label>

              <label className="admin-field">
                <span>Expiry date</span>
                <input
                  type="datetime-local"
                  value={toDatetimeLocal(form.expiresAt)}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      expiresAt: fromDatetimeLocal(event.target.value),
                    }))
                  }
                />
              </label>

              <label className="admin-field admin-field--checkbox">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, active: event.target.checked }))
                  }
                />
                <span>Active</span>
              </label>
            </div>

            <div className="admin-modal__actions">
              <button
                type="button"
                className="admin-btn admin-btn--primary"
                disabled={pending}
                onClick={handleSubmit}
              >
                {editing ? "Save changes" : "Create promo code"}
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
