"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, registerGSAP } from "@/lib/animations/gsap";
import { PAGE_REVEAL_EVENT } from "@/lib/page-transition";
import { ActiveDropSection } from "@/components/shop/ActiveDropSection";
import { PastDropsSection } from "@/components/shop/PastDropsSection";
import type { DropWithProducts } from "@/lib/drops.types";

interface ShopPageContentProps {
  activeDrops: DropWithProducts[];
  pastDrops: DropWithProducts[];
}

export function ShopPageContent({ activeDrops, pastDrops }: ShopPageContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    registerGSAP();

    const container = containerRef.current;
    if (!container) return;

    let hasPlayed = false;

    const playEntrance = (extraDelay = 0) => {
      if (hasPlayed) return;
      hasPlayed = true;

      gsap.fromTo(
        container,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: "power2.out",
          delay: extraDelay,
        }
      );
    };

    const handleTransitionReveal = () => playEntrance(0.12);
    window.addEventListener(PAGE_REVEAL_EVENT, handleTransitionReveal);

    const pending =
      typeof window !== "undefined" &&
      sessionStorage.getItem("pl-page-transition") === "1";

    if (!pending) {
      playEntrance(0);
    }

    return () => {
      window.removeEventListener(PAGE_REVEAL_EVENT, handleTransitionReveal);
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      <div
        ref={containerRef}
        className="relative z-[2] mx-auto max-w-6xl px-4 pb-20 pt-24 md:px-8 md:pb-24"
      >
        {activeDrops.map((drop, index) => (
          <ActiveDropSection key={drop.id} drop={drop} showDivider={index > 0} />
        ))}

        <PastDropsSection drops={pastDrops} />
      </div>
    </div>
  );
}
