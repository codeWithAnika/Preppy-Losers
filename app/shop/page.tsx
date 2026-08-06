import type { Metadata } from "next";
import { ShopPageContent } from "@/components/shop/ShopPageContent";
import { fetchShopCatalog } from "@/lib/drops.server";

export const metadata: Metadata = {
  title: "Shop — Preppy Losers",
  description: "Explore live drops and past releases from Preppy Losers.",
};

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const { listedDrops, pastDrops } = await fetchShopCatalog();

  if (listedDrops.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 pt-24">
        <p className="text-sm uppercase tracking-[0.25em] text-muted">
          No active drops right now.
        </p>
        {pastDrops.length > 0 ? (
          <ShopPageContent activeDrops={[]} pastDrops={pastDrops} />
        ) : null}
      </div>
    );
  }

  return <ShopPageContent activeDrops={listedDrops} pastDrops={pastDrops} />;
}
