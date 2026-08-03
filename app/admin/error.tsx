"use client";

import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="admin-page">
      <div className="admin-panel">
        <p className="admin-page__kicker">Admin</p>
        <h1>Something went wrong</h1>
        <p className="admin-muted" style={{ marginTop: "0.75rem" }}>
          {error.message || "The admin page failed to load."}
        </p>
        <div className="admin-form-actions" style={{ marginTop: "1.25rem" }}>
          <button type="button" className="admin-btn admin-btn--primary" onClick={reset}>
            Try again
          </button>
          <Link href="/admin/dashboard" className="admin-btn admin-btn--ghost">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
