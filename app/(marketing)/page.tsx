import { HeroSection } from "@/components/sections/HeroSection";
import { ManifestoSection } from "@/components/sections/ManifestoSection";
import { ProductReveal } from "@/components/ProductReveal";
import { TeamSection } from "@/components/sections/TeamSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ManifestoSection />
      <ProductReveal />
      <TeamSection />
    </>
  );
}
