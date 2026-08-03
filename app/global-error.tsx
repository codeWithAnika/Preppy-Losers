"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { BrandWordmark } from "@/components/BrandWordmark";
import { MagneticGlitchCTA } from "@/components/ui/MagneticGlitchCTA";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-24 text-center text-foreground">
        <BrandWordmark className="mb-6 text-2xl font-bold tracking-widest" />
        <h1 className="mb-4 text-xl uppercase tracking-[0.12em]">
          Something went wrong
        </h1>
        <p className="mb-10 max-w-md text-sm text-foreground/60">
          An unexpected error occurred. Our team has been notified.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <MagneticGlitchCTA href="/" variant="outline">
            Back to home
          </MagneticGlitchCTA>
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex min-h-11 items-center border border-white/20 px-6 text-xs uppercase tracking-[0.2em] transition-colors hover:border-white/40"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
