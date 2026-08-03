import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile.server";
import {
  formatINR,
  formatOrderDate,
  getUserOrders,
} from "@/lib/orders.server";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { ProfileEditForm } from "@/components/account/ProfileEditForm";
import { PageEntrance } from "@/components/layout/PageEntrance";
import { isAdmin } from "@/lib/auth/admin-allowlist";

export const metadata: Metadata = {
  title: "Account — Preppy Losers",
  description: "Your Preppy Losers account.",
};

export const dynamic = "force-dynamic";

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

interface AccountPageProps {
  searchParams?: {
    order?: string;
    admin_denied?: string;
  };
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  const [profile, orders] = await Promise.all([
    getProfile(user.id),
    getUserOrders(user.id),
  ]);

  const orderSuccess = searchParams?.order === "success";
  const adminDenied = searchParams?.admin_denied === "1";
  const isAdminUser = isAdmin(user.id, profile?.role);

  return (
    <div className="min-h-screen px-4 pb-20 pt-24 md:px-8">
      <PageEntrance className="mx-auto max-w-3xl">
        <p
          data-fade-up
          className="mb-2 text-xs uppercase tracking-[0.3em] text-muted"
        >
          Account
        </p>
        <h1
          data-fade-up
          className="mb-10 text-2xl uppercase tracking-[0.15em] text-foreground md:text-3xl"
        >
          Profile
        </h1>

        {adminDenied && (
          <p
            data-fade-up
            className="mb-8 border border-white/15 bg-white/[0.03] px-4 py-3 text-sm text-foreground/80"
            role="status"
          >
            Admin access is restricted to approved accounts. You must be
            signed in with an allowlisted user id and{" "}
            <code className="text-xs">profiles.role = &apos;admin&apos;</code>{" "}
            set via the server.
          </p>
        )}

        {isAdminUser && (
          <p data-fade-up className="mb-8">
            <a
              href="/admin/dashboard"
              className="inline-flex items-center border border-accent/50 bg-accent/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-accent/20"
            >
              Open admin dashboard
            </a>
          </p>
        )}

        {orderSuccess && (
          <p
            data-fade-up
            className="mb-8 border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-foreground"
          >
            Order placed successfully. Thank you.
          </p>
        )}

        <section
          data-fade-up
          className="mb-10 border border-white/10 bg-white/[0.02] p-6 md:p-8"
        >
          <h2 className="mb-6 text-xs uppercase tracking-[0.25em] text-muted">
            Your details
          </h2>

          <dl className="space-y-4 text-sm">
            <div>
              <dt className="mb-1 text-xs uppercase tracking-[0.2em] text-muted">
                Name
              </dt>
              <dd className="text-foreground">
                {profile?.full_name || "—"}
              </dd>
            </div>
            <div>
              <dt className="mb-1 text-xs uppercase tracking-[0.2em] text-muted">
                Email
              </dt>
              <dd className="text-foreground">{user.email || "—"}</dd>
            </div>
            <div>
              <dt className="mb-1 text-xs uppercase tracking-[0.2em] text-muted">
                Member since
              </dt>
              <dd className="text-foreground">
                {profile?.created_at
                  ? formatDate(profile.created_at)
                  : "—"}
              </dd>
            </div>
          </dl>

          <div className="mt-8">
            <SignOutButton />
          </div>

          <ProfileEditForm initialName={profile?.full_name ?? ""} />
        </section>

        <section
          data-fade-up
          className="border border-white/10 bg-white/[0.02] p-6 md:p-8"
        >
          <h2 className="mb-6 text-xs uppercase tracking-[0.25em] text-muted">
            Order history
          </h2>

          {orders.length === 0 ? (
            <p className="text-sm text-foreground/60">No orders yet.</p>
          ) : (
            <ul className="space-y-4">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-wide text-foreground">
                        {order.product_name}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Size {order.size} × {order.quantity} ·{" "}
                        {formatOrderDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-foreground">
                        {formatINR(order.amount)}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.15em] text-muted">
                        {order.status}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </PageEntrance>
    </div>
  );
}
