"use client";

import Link from "next/link";

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 pt-24 text-center">
      <p className="mb-2 text-xs uppercase tracking-[0.3em] text-muted">Checkout</p>
      <h1 className="mb-4 text-xl uppercase tracking-[0.15em] text-foreground">
        Checkout unavailable
      </h1>
      <p className="mb-8 max-w-md text-sm text-muted">
        {error.message || "We could not load your checkout session. Please try again."}
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
          href="/shop"
          className="border border-white/20 px-6 py-3 text-xs uppercase tracking-[0.2em] text-muted"
        >
          Back to shop
        </Link>
      </div>
    </div>
  );
}
