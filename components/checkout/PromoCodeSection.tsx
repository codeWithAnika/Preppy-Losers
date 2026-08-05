"use client";

import { useRef, useState } from "react";
import type { CartItem } from "@/lib/cart";
import { formatINR } from "@/lib/cart";
import { createClient } from "@/lib/supabase/client";
import type { AppliedPromo } from "@/lib/promo.types";
import {
  getValidatePromoErrorMessage,
  invokeValidatePromo,
  logAppliedPromo,
  toAppliedPromo,
} from "@/lib/promo";

interface PromoCodeSectionProps {
  items: CartItem[];
  appliedPromo: AppliedPromo | null;
  onApplied: (promo: AppliedPromo) => void;
  onRemoved: () => void;
  disabled?: boolean;
}

const PROMO_CODE_MAX_LENGTH = 20;

function sanitizePromoInput(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, PROMO_CODE_MAX_LENGTH);
}

export function PromoCodeSection({
  items,
  appliedPromo,
  onApplied,
  onRemoved,
  disabled = false,
}: PromoCodeSectionProps) {
  const supabase = createClient();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const applyInFlightRef = useRef(false);

  const handleApply = async () => {
    if (applyInFlightRef.current || loading) {
      return;
    }

    const normalizedCode = sanitizePromoInput(code);
    if (!normalizedCode) {
      setError("Enter a promo code.");
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);
    setError(null);
    applyInFlightRef.current = true;

    try {
      const { data, error: invokeError } = await invokeValidatePromo(
        supabase,
        normalizedCode,
        items
      );

      const applied = data ? toAppliedPromo(data) : null;
      if (invokeError || !applied) {
        setError(await getValidatePromoErrorMessage(invokeError, data));
        return;
      }

      logAppliedPromo(applied);
      onApplied(applied);
      setCode("");
    } catch {
      setError("Unable to apply promo code.");
    } finally {
      applyInFlightRef.current = false;
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setError(null);
    setCode("");
    onRemoved();
  };

  if (appliedPromo) {
    return (
      <div className="mb-6 border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400/90">
              ✓ Promo Applied
            </p>
            <p className="mt-2 text-sm text-foreground">
              Code: <span className="font-mono">{appliedPromo.promoCode}</span>
            </p>
            <p className="mt-1 text-sm text-foreground">
              Discount:{" "}
              <span className="text-emerald-400/90">-{formatINR(appliedPromo.discount)}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled || loading}
            className="text-xs uppercase tracking-[0.15em] text-muted transition-colors hover:text-foreground disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted">
        Promo Code
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(event) => setCode(sanitizePromoInput(event.target.value))}
          placeholder="Example: WELCOME5"
          maxLength={PROMO_CODE_MAX_LENGTH}
          disabled={disabled || loading}
          className="min-w-0 flex-1 border border-white/10 bg-transparent px-3 py-2 text-sm uppercase tracking-wide text-foreground placeholder:normal-case placeholder:tracking-normal placeholder:text-muted focus:border-white/25 focus:outline-none disabled:opacity-50"
          autoComplete="off"
          spellCheck={false}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void handleApply();
            }
          }}
        />
        <button
          type="button"
          onClick={() => void handleApply()}
          disabled={disabled || loading || !code.trim()}
          className="shrink-0 border border-foreground px-4 py-2 text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:border-white/15 disabled:text-foreground/30"
        >
          {loading ? "Applying…" : "Apply"}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-accent" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
