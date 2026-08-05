"use client";

import Link from "next/link";

export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 pt-24 text-center">
      <p className="mb-2 text-xs uppercase tracking-[0.3em] text-muted">Account</p>
      <h1 className="mb-4 text-xl uppercase tracking-[0.15em] text-foreground">
        Account unavailable
      </h1>
      <p className="mb-8 max-w-md text-sm text-muted">
        {error.message || "We could not load your account. Please try again."}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="border border-foreground px-6 py-3 text-xs uppercase tracking-[0.2em] text-foreground"
        >
          Try again
        </button>
        <Link
          href="/login?next=/account"
          className="border border-white/20 px-6 py-3 text-xs uppercase tracking-[0.2em] text-muted"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
