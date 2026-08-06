"use client";

import { useEffect, useRef, useState } from "react";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductDetails } from "@/components/shop/ProductDetails";
import { ProductAccordion } from "@/components/shop/ProductAccordion";
import type { Product } from "@/lib/products";

interface ActiveDropProductBlockProps {
  product: Product;
  dropLabel: string;
  showDivider?: boolean;
}

export function ActiveDropProductBlock({
  product,
  dropLabel,
  showDivider = false,
}: ActiveDropProductBlockProps) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    setSelectedSize(null);
  }, [product.id]);

  return (
    <div className={showDivider ? "border-t border-white/10 pt-14 md:pt-20" : undefined}>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 lg:items-start">
        <div ref={galleryRef}>
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        <ProductDetails
          product={product}
          dropLabel={dropLabel}
          selectedSize={selectedSize}
          onSelectedSizeChange={setSelectedSize}
        />
      </div>

      <ProductAccordion product={product} selectedSize={selectedSize} />
    </div>
  );
}
