"use client";

import { useRef, useLayoutEffect } from "react";
import Image from "next/image";
import { gsap, registerGSAP } from "@/lib/animations/gsap";
import { shouldDisableScrollEffects } from "@/lib/animations/scroll-utils";
import { DistressedHeadline } from "@/components/ui/DistressedHeadline";
import {
  chartSizeLabelForSelector,
  getSizingIllustrationImage,
  SIZE_CHART_ROWS,
  type Product,
} from "@/lib/products";

const TABLE_HEADER_CLASS =
  "py-2.5 font-display text-[0.65rem] font-normal uppercase tracking-[0.22em] text-foreground/90 sm:text-xs sm:tracking-[0.25em]";

interface SizeChartSectionProps {
  product: Product;
  selectedSize: string | null;
  isOpen: boolean;
}

function GarmentMeasurementIllustration({
  imageSrc,
  productName,
}: {
  imageSrc: string;
  productName: string;
}) {
  return (
    <div className="relative mx-auto w-full max-w-[17rem] sm:max-w-xs md:max-w-sm">
      <div className="relative aspect-[3/4] w-full">
        <Image
          src={imageSrc}
          alt={`${productName} measurement guide`}
          fill
          className="object-contain object-center"
          sizes="(max-width: 768px) 60vw, 320px"
        />
      </div>
    </div>
  );
}

export function SizeChartSection({
  product,
  selectedSize,
  isOpen,
}: SizeChartSectionProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const activeChartSize = selectedSize
    ? chartSizeLabelForSelector(selectedSize)
    : null;

  const purchasableChartLabels = new Set(
    product.sizeStock.map((entry) => chartSizeLabelForSelector(entry.size))
  );
  const visibleChartRows = SIZE_CHART_ROWS.filter((row) =>
    purchasableChartLabels.has(row.size)
  );

  const garmentImage = getSizingIllustrationImage();

  useLayoutEffect(() => {
    registerGSAP();

    const container = chartRef.current;
    if (!container) return;

    const rows = container.querySelectorAll<HTMLElement>("[data-size-chart-row]");
    if (rows.length === 0) return;

    if (!isOpen) {
      if (!shouldDisableScrollEffects()) {
        gsap.set(rows, { opacity: 0, y: 14 });
      }
      return;
    }

    if (shouldDisableScrollEffects()) {
      gsap.set(rows, { opacity: 1, y: 0 });
      return;
    }

    gsap.fromTo(
      rows,
      { opacity: 0, y: 14 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.06,
        ease: "power2.out",
        delay: 0.12,
      }
    );
  }, [isOpen]);

  return (
    <div className="relative pb-5">
      <div className="relative overflow-hidden border border-white/10 bg-[#050505] px-5 py-8 md:px-8 md:py-10 lg:px-10 lg:py-12">
        <div
          className="grain-overlay pointer-events-none absolute inset-0"
          aria-hidden="true"
        />

        <div className="relative grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-14 xl:gap-20">
          {/* Left: heading + table */}
          <div className="min-w-0">
            <DistressedHeadline
              as="h3"
              className="mb-6 text-3xl text-foreground sm:text-4xl md:mb-8 md:text-[2.75rem]"
            >
              Size Chart
            </DistressedHeadline>

            <div
              ref={chartRef}
              className="relative border-l border-accent/80 pl-3 sm:pl-4"
            >
              <div className="-mx-1 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20">
                <table className="w-full min-w-[28rem] border-collapse text-left text-xs text-foreground/75 sm:text-sm">
                  <thead>
                    <tr className="border-b border-white/15">
                      <th className={`${TABLE_HEADER_CLASS} pr-3`}>Size</th>
                      <th className={`${TABLE_HEADER_CLASS} px-3`}>Chest</th>
                      <th className={`${TABLE_HEADER_CLASS} px-3`}>
                        Shoulder
                      </th>
                      <th className={`${TABLE_HEADER_CLASS} px-3`}>Length</th>
                      <th className={`${TABLE_HEADER_CLASS} pl-3`}>Sleeves</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleChartRows.map((row) => {
                      const isSelected = activeChartSize === row.size;

                      return (
                        <tr
                          key={row.size}
                          data-size-chart-row
                          className={`border-b border-white/8 transition-colors duration-300 last:border-b-0 ${
                            isSelected ? "bg-accent/10" : ""
                          }`}
                        >
                          <td className="py-2.5 pr-3 font-medium text-accent">
                            {row.size}
                          </td>
                          <td className="py-2.5 px-3 tabular-nums">
                            {row.chest}
                          </td>
                          <td className="py-2.5 px-3 tabular-nums">
                            {row.shoulder}
                          </td>
                          <td className="py-2.5 px-3 tabular-nums">
                            {row.length}
                          </td>
                          <td className="py-2.5 pl-3 tabular-nums">
                            {row.sleeves}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="mt-5 text-xs leading-relaxed text-foreground/50">
              All measurements in inches. Please allow a size tolerance of 0.5
              inches.
            </p>
          </div>

          {/* Right: garment illustration (stacks below table on mobile) */}
          <div className="flex items-center justify-center lg:justify-end lg:pt-4">
            <GarmentMeasurementIllustration
              imageSrc={garmentImage}
              productName={product.name}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
