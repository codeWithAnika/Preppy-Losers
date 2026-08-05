import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageEntrance } from "@/components/layout/PageEntrance";
import { createClient } from "@/lib/supabase/server";
import {
  formatINR,
  formatOrderDate,
  getUserOrders,
  groupOrdersByPayment,
} from "@/lib/orders.server";
import { formatAddressOneLine } from "@/lib/customer-addresses";

export const metadata: Metadata = {
  title: "Orders — Preppy Losers",
  description: "View your Preppy Losers order history.",
};

export const dynamic = "force-dynamic";

export default async function AccountOrdersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account/orders");
  }

  const orders = await getUserOrders(user.id);
  const orderGroups = groupOrdersByPayment(orders);

  return (
    <div className="min-h-screen px-4 pb-20 pt-24 md:px-8">
      <PageEntrance className="mx-auto max-w-3xl">
        <p
          data-fade-up
          className="mb-2 text-xs uppercase tracking-[0.3em] text-muted"
        >
          Account
        </p>
        <div
          data-fade-up
          className="mb-10 flex flex-wrap items-end justify-between gap-4"
        >
          <h1 className="text-2xl uppercase tracking-[0.15em] text-foreground md:text-3xl">
            Order history
          </h1>
          <Link
            href="/account"
            className="text-xs uppercase tracking-[0.2em] text-muted transition-colors hover:text-foreground"
          >
            Back to account
          </Link>
        </div>

        {orderGroups.length === 0 ? (
          <p data-fade-up className="text-sm text-foreground/60">
            No orders yet.{" "}
            <Link href="/shop" className="text-accent hover:underline">
              Shop the latest drop
            </Link>
          </p>
        ) : (
          <ul data-fade-up className="space-y-6">
            {orderGroups.map((group) => (
              <li
                key={group.key}
                className="border border-white/10 bg-white/[0.02] p-6 md:p-8"
              >
                <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">
                      {formatOrderDate(group.created_at)}
                    </p>
                    {group.razorpay_order_id && (
                      <p className="mt-2 break-all font-mono text-xs text-muted">
                        {group.razorpay_order_id}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-foreground">
                      {formatINR(group.final_total ?? group.total_amount)}
                    </p>
                    {group.promo_code && group.discount_amount > 0 ? (
                      <p className="mt-1 text-xs text-emerald-400/90">
                        Saved {formatINR(group.discount_amount)}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs uppercase tracking-[0.15em] text-muted">
                      {group.status}
                      {group.delivery_status
                        ? ` · ${group.delivery_status}`
                        : ""}
                    </p>
                  </div>
                </div>

                <ul className="mb-5 space-y-3">
                  {group.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start justify-between gap-4 text-sm"
                    >
                      <div>
                        <p className="uppercase tracking-wide text-foreground">
                          {item.product_name}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          Size {item.size} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-foreground">{formatINR(item.amount)}</p>
                    </li>
                  ))}
                </ul>

                {group.promo_code && group.discount_amount > 0 ? (
                  <div className="mb-5 border-t border-white/10 pt-4 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted">Promo</span>
                      <span className="font-mono text-foreground">{group.promo_code}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-4">
                      <span className="text-muted">Discount</span>
                      <span className="text-emerald-400/90">
                        {formatINR(group.discount_amount)}
                      </span>
                    </div>
                  </div>
                ) : null}

                {group.shipping_address && (
                  <div className="border-t border-white/10 pt-4 text-xs text-muted">
                    <p className="mb-1 uppercase tracking-[0.15em]">
                      Shipping address
                    </p>
                    {group.shipping_address.fullName && (
                      <p className="text-foreground/80">
                        {group.shipping_address.fullName}
                      </p>
                    )}
                    <p>{formatAddressOneLine(group.shipping_address)}</p>
                    <p className="mt-1">{group.shipping_address.phone}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </PageEntrance>
    </div>
  );
}
