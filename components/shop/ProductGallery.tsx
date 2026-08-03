"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

const SWIPE_THRESHOLD = 48;

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  const goTo = useCallback(
    (index: number) => {
      if (images.length === 0) return;
      const next = ((index % images.length) + images.length) % images.length;
      setActiveIndex(next);
    },
    [images.length]
  );

  const goPrev = () => goTo(activeIndex - 1);
  const goNext = () => goTo(activeIndex + 1);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (touchDeltaX.current > SWIPE_THRESHOLD) goPrev();
    else if (touchDeltaX.current < -SWIPE_THRESHOLD) goNext();
    touchDeltaX.current = 0;
  };

  if (images.length === 0) return null;

  return (
    <div className="w-full">
      <div
        className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-900"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          key={images[activeIndex]}
          src={images[activeIndex]}
          alt={`${productName} — image ${activeIndex + 1}`}
          fill
          className="object-cover transition-opacity duration-500 ease-out"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 560px"
          priority={activeIndex === 0}
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 border border-white/20 bg-black/50 p-2 text-foreground/80 backdrop-blur-sm transition-colors hover:border-white/40 hover:text-foreground md:flex"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 border border-white/20 bg-black/50 p-2 text-foreground/80 backdrop-blur-sm transition-colors hover:border-white/40 hover:text-foreground md:flex"
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div
          className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mt-4"
          role="tablist"
          aria-label={`${productName} image thumbnails`}
        >
          {images.map((src, i) => (
            <button
              key={`thumb-${src}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`View image ${i + 1}`}
              onClick={() => goTo(i)}
              className={`relative h-16 w-14 shrink-0 overflow-hidden border transition-colors md:h-20 md:w-[4.5rem] ${
                i === activeIndex
                  ? "border-foreground"
                  : "border-white/15 opacity-60 hover:border-white/40 hover:opacity-100"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="72px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
