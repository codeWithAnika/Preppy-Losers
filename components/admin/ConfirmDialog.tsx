"use client";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="admin-dialog-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="admin-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="admin-dialog-title" className="admin-dialog__title">
          {title}
        </h2>
        <p className="admin-dialog__description">{description}</p>
        <div className="admin-dialog__actions">
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={`admin-btn ${destructive ? "admin-btn--danger" : "admin-btn--primary"}`}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
