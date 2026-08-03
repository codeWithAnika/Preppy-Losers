"use client";

import { useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useShopRevealEntrance } from "@/lib/use-shop-reveal-entrance";
import { SizeChartSection } from "@/components/shop/SizeChartSection";
import { ShopAccordionPanel } from "@/components/shop/ShopAccordionPanel";
import type { Product } from "@/lib/products";

interface AccordionItem {
  id: string;
  title: string;
  content?: string;
  bullets?: string[];
  customContent?: ReactNode;
}

interface ProductAccordionProps {
  product: Product;
  selectedSize: string | null;
}

const SHIPPING_PLACEHOLDER =
  "Ships within 5–7 business days via tracked courier. Free domestic shipping on orders over $100. International rates calculated at checkout. Exchanges accepted within 14 days on unworn items with tags attached. Final sale on archive drops.";

function parseDetailBullets(details: string | null): string[] {
  if (!details) return [];
  return details
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function ProductAccordion({
  product,
  selectedSize,
}: ProductAccordionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const detailBullets = parseDetailBullets(product.details);

  const items: AccordionItem[] = [
    {
      id: "details",
      title: "Details",
      content: detailBullets.length === 0 ? product.description : "",
      bullets: detailBullets.length > 0 ? detailBullets : undefined,
    },
    { id: "sizing", title: "Sizing" },
    { id: "shipping", title: "Shipping", content: SHIPPING_PLACEHOLDER },
  ];

  useShopRevealEntrance(containerRef, { stagger: 0.1, delay: 0.28 });

  return (
    <div
      ref={containerRef}
      className="mt-12 border-t border-white/10 pt-8 md:mt-16"
    >
      {items.map((item) => {
        const isOpen = openId === item.id;

        return (
          <div
            key={item.id}
            data-shop-reveal
            className="border-b border-white/10"
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex w-full items-center justify-between py-5 text-left text-xs uppercase tracking-[0.25em] text-foreground/80 transition-colors hover:text-foreground"
              aria-expanded={isOpen}
            >
              {item.title}
              <ChevronDown
                size={16}
                className={`shrink-0 transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className="accordion-panel"
              data-open={isOpen}
              aria-hidden={!isOpen}
            >
              <div className="accordion-panel-inner">
                {item.id === "sizing" ? (
                  <SizeChartSection
                    product={product}
                    selectedSize={selectedSize}
                    isOpen={isOpen}
                  />
                ) : item.bullets ? (
                  <ShopAccordionPanel>
                    <ul className="space-y-3 text-sm leading-relaxed text-foreground/70">
                      {item.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="relative pl-4 before:absolute before:left-0 before:top-[0.55em] before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:bg-accent before:content-['']"
                        >
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </ShopAccordionPanel>
                ) : item.content ? (
                  <ShopAccordionPanel>
                    <p className="text-sm leading-relaxed text-foreground/70">
                      {item.content}
                    </p>
                  </ShopAccordionPanel>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
