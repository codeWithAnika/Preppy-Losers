import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { PageEntrance } from "@/components/layout/PageEntrance";
import { getDefaultAddress } from "@/lib/address.server";
import { getProfile } from "@/lib/profile.server";
import { createClient } from "@/lib/supabase/server";

const CheckoutForm = nextDynamic(
  () =>
    import("@/components/checkout/CheckoutForm").then((mod) => ({
      default: mod.CheckoutForm,
    })),
  {
    loading: () => (
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="h-96 animate-pulse border border-white/10 bg-white/[0.02]" />
        <div className="h-64 animate-pulse border border-white/10 bg-white/[0.02]" />
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: "Checkout — Preppy Losers",
  description: "Complete your Preppy Losers order.",
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/checkout");
  }

  const profile = await getProfile(user.id);
  const defaultAddress = await getDefaultAddress(user.id);

  return (
    <div className="min-h-screen px-4 pb-20 pt-24 md:px-8">
      <PageEntrance className="mx-auto max-w-5xl">
        <p
          data-fade-up
          className="mb-2 text-xs uppercase tracking-[0.3em] text-muted"
        >
          Checkout
        </p>
        <h1
          data-fade-up
          className="mb-10 text-2xl uppercase tracking-[0.15em] text-foreground md:text-3xl"
        >
          Complete your order
        </h1>

        <CheckoutForm
          userEmail={user.email ?? ""}
          userName={profile?.full_name ?? ""}
          defaultAddress={defaultAddress}
        />
      </PageEntrance>
    </div>
  );
}
