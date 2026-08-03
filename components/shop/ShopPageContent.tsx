"use client";

import { useRef, useLayoutEffect, useEffect, useState } from "react";
import { gsap, registerGSAP } from "@/lib/animations/gsap";
import { PAGE_REVEAL_EVENT } from "@/lib/page-transition";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductDetails } from "@/components/shop/ProductDetails";
import { ProductAccordion } from "@/components/shop/ProductAccordion";
import { PastDropsSection } from "@/components/shop/PastDropsSection";
import type { Product } from "@/lib/products";

interface ShopPageContentProps {
  activeProduct: Product;
  pastProducts: Product[];
}

export function ShopPageContent({
  activeProduct,
  pastProducts,
}: ShopPageContentProps) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    setSelectedSize(null);
  }, [activeProduct.id]);

  useLayoutEffect(() => {
    registerGSAP();

    const gallery = galleryRef.current;
    if (!gallery) return;

    let hasPlayed = false;

    const playGalleryEntrance = (extraDelay = 0) => {
      if (hasPlayed) return;
      hasPlayed = true;

      gsap.fromTo(
        gallery,
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

    const handleTransitionReveal = () => playGalleryEntrance(0.12);
    window.addEventListener(PAGE_REVEAL_EVENT, handleTransitionReveal);

    const pending =
      typeof window !== "undefined" &&
      sessionStorage.getItem("pl-page-transition") === "1";

    if (!pending) {
      playGalleryEntrance(0);
    }

    return () => {
      window.removeEventListener(PAGE_REVEAL_EVENT, handleTransitionReveal);
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      <div className="relative z-[2] mx-auto max-w-6xl px-4 pb-20 pt-24 md:px-8 md:pb-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 lg:items-start">
          <div ref={galleryRef}>
            <ProductGallery
              images={activeProduct.images}
              productName={activeProduct.name}
            />
          </div>

          <ProductDetails
            product={activeProduct}
            selectedSize={selectedSize}
            onSelectedSizeChange={setSelectedSize}
          />
        </div>

        <ProductAccordion
          product={activeProduct}
          selectedSize={selectedSize}
        />

        <PastDropsSection products={pastProducts} />
      </div>
    </div>
  );
}
