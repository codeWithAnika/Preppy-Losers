import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ActiveDropSection } from "@/components/shop/ActiveDropSection";
import { PastDropsSection } from "@/components/shop/PastDropsSection";
import { fetchDropWithProductsBySlug } from "@/lib/drops.server";
import { isDropListed, isDropPageAccessible } from "@/lib/purchasability";

interface DropPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: DropPageProps): Promise<Metadata> {
  const drop = await fetchDropWithProductsBySlug(params.slug);
  if (!drop) {
    return { title: "Drop not found — Preppy Losers" };
  }

  return {
    title: drop.seoTitle ?? `${drop.name} — Preppy Losers`,
    description:
      drop.seoDescription ??
      drop.description ??
      `Explore ${drop.name} from Preppy Losers.`,
  };
}

export const dynamic = "force-dynamic";

export default async function DropPage({ params }: DropPageProps) {
  const drop = await fetchDropWithProductsBySlug(params.slug);
  if (!drop || !isDropPageAccessible(drop)) notFound();

  const isLive = isDropListed(drop);

  return (
    <div className="relative min-h-screen">
      <div className="relative z-[2] mx-auto max-w-6xl px-4 pb-20 pt-24 md:px-8 md:pb-24">
        {isLive ? (
          <ActiveDropSection drop={drop} />
        ) : (
          <PastDropsSection drops={[drop]} />
        )}
      </div>
    </div>
  );
}
