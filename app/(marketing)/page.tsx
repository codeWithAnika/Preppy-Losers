import { HeroSection } from "@/components/sections/HeroSection";
import { LiveDropsSection } from "@/components/sections/LiveDropsSection";
import { ManifestoSection } from "@/components/sections/ManifestoSection";
import { ProductReveal } from "@/components/ProductReveal";
import { TeamSection } from "@/components/sections/TeamSection";
import { fetchListedDropsWithProducts } from "@/lib/drops.server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const listedDrops = await fetchListedDropsWithProducts();

  return (
    <>
      <HeroSection />
      <ManifestoSection />
      <LiveDropsSection drops={listedDrops} />
      <ProductReveal />
      <TeamSection />
    </>
  );
}
