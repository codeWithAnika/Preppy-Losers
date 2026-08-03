"use client";

import Link from "next/link";
import { MagneticGlitchButton } from "@/components/ui/MagneticGlitchButton";
import { formatINR } from "@/lib/cart";
import { SHIPPING_POLICY } from "@/lib/legal/constants";

export interface OrderSuccessDetails {
  orderId: string;
  amountInr: number;
  items: Array<{
    productName: string;
    size: string;
    quantity: number;
    lineTotalInr: number;
  }>;
}

interface OrderSuccessModalProps {
  details: OrderSuccessDetails;
  onClose: () => void;
}

export function OrderSuccessModal({ details, onClose }: OrderSuccessModalProps) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-success-title"
    >
      <div className="w-full max-w-md border border-white/15 bg-background p-6 md:p-8">
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-accent">
          Success
        </p>
        <h2
          id="order-success-title"
          className="mb-4 text-xl uppercase tracking-[0.12em] text-foreground"
        >
          Order Placed Successfully 🎉
        </h2>
        <p className="mb-6 text-sm text-muted">
          Your payment was verified. We&apos;ll process your order within{" "}
          {SHIPPING_POLICY.processingBusinessDays} business days.
        </p>

        <dl className="mb-6 space-y-3 border border-white/10 bg-white/[0.02] p-4 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-[0.15em] text-muted">
              Order ID
            </dt>
            <dd className="mt-1 break-all font-mono text-xs text-foreground">
              {details.orderId}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.15em] text-muted">
              Amount paid
            </dt>
            <dd className="mt-1 text-foreground">
              {formatINR(details.amountInr)}
            </dd>
          </div>
        </dl>

        <ul className="mb-6 space-y-3">
          {details.items.map((item) => (
            <li
              key={`${item.productName}-${item.size}-${item.quantity}`}
              className="flex items-start justify-between gap-4 border-b border-white/10 pb-3 text-sm last:border-b-0 last:pb-0"
            >
              <div>
                <p className="uppercase tracking-wide text-foreground">
                  {item.productName}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Size {item.size} × {item.quantity}
                </p>
              </div>
              <p className="text-foreground">{formatINR(item.lineTotalInr)}</p>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/shop" className="flex-1" onClick={onClose}>
            <MagneticGlitchButton variant="outline" className="w-full">
              Continue Shopping
            </MagneticGlitchButton>
          </Link>
          <Link href="/account/orders" className="flex-1" onClick={onClose}>
            <MagneticGlitchButton variant="outline" className="w-full">
              View Orders
            </MagneticGlitchButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
