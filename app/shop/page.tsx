import type { Metadata } from "next";
import { ShopPageContent } from "@/components/shop/ShopPageContent";
import {
  getActiveProduct,
  getPastProducts,
} from "@/lib/products";
import { getProducts } from "@/lib/products.server";

export const metadata: Metadata = {
  title: "Shop — Preppy Losers",
  description: "Explore the current drop and past releases from Preppy Losers.",
};

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await getProducts();
  const activeProduct = getActiveProduct(products);
  const pastProducts = getPastProducts(products);

  if (!activeProduct) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 pt-24">
        <p className="text-sm uppercase tracking-[0.25em] text-muted">
          No active drop right now.
        </p>
      </div>
    );
  }

  return (
    <ShopPageContent
      activeProduct={activeProduct}
      pastProducts={pastProducts}
    />
  );
}
