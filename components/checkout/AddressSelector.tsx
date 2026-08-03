"use client";

import type { CustomerAddress } from "@/lib/customer-addresses";
import { formatAddressOneLine } from "@/lib/customer-addresses";

export type AddressSelection = { type: "saved"; id: string } | { type: "new" };

interface AddressSelectorProps {
  addresses: CustomerAddress[];
  selection: AddressSelection;
  onSelect: (selection: AddressSelection) => void;
}

export function AddressSelector({
  addresses,
  selection,
  onSelect,
}: AddressSelectorProps) {
  if (addresses.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 space-y-3">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">
        Select delivery address
      </p>
      <ul className="space-y-3">
        {addresses.map((address) => {
          const selected =
            selection.type === "saved" && selection.id === address.id;
          return (
            <li key={address.id}>
              <button
                type="button"
                onClick={() => onSelect({ type: "saved", id: address.id })}
                className={`w-full border p-4 text-left transition-colors ${
                  selected
                    ? "border-accent/60 bg-accent/5"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      selected ? "border-accent" : "border-white/30"
                    }`}
                    aria-hidden="true"
                  >
                    {selected && (
                      <span className="h-2 w-2 rounded-full bg-accent" />
                    )}
                  </span>
                  <div>
                    <p className="text-sm uppercase tracking-wide text-foreground">
                      {address.fullName}
                      {address.isDefault && (
                        <span className="ml-2 text-[0.65rem] text-muted">
                          Default
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {formatAddressOneLine(address)}
                    </p>
                    <p className="mt-1 text-xs text-muted">{address.phone}</p>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={() => onSelect({ type: "new" })}
            className={`w-full border p-4 text-left text-sm uppercase tracking-[0.15em] transition-colors ${
              selection.type === "new"
                ? "border-accent/60 bg-accent/5 text-foreground"
                : "border-white/10 text-muted hover:border-white/20 hover:text-foreground"
            }`}
          >
            + Add new address
          </button>
        </li>
      </ul>
    </div>
  );
}
