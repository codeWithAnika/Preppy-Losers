import Image from "next/image";
import Link from "next/link";
import { formatDropLabel, getPurchasableProductsForDrop } from "@/lib/drops";
import type { DropWithProducts } from "@/lib/drops.types";
import { ActiveDropProductBlock } from "@/components/shop/ActiveDropProductBlock";

interface ActiveDropSectionProps {
  drop: DropWithProducts;
  showDivider?: boolean;
}

function formatDropDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function ActiveDropSection({ drop, showDivider = false }: ActiveDropSectionProps) {
  const purchasableProducts = getPurchasableProductsForDrop(drop);

  if (purchasableProducts.length === 0) return null;

  const dropLabel = formatDropLabel(drop.dropNumber);

  return (
    <section
      className={showDivider ? "mt-20 border-t border-white/10 pt-14 md:mt-28 md:pt-20" : undefined}
      aria-label={`${drop.name} collection`}
    >
      {drop.bannerImage ? (
        <div className="relative mb-10 aspect-[21/9] w-full overflow-hidden border border-white/10 bg-neutral-900 md:mb-14">
          <Image
            src={drop.bannerImage}
            alt={`${drop.name} banner`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1152px"
            priority={!showDivider}
          />
        </div>
      ) : null}

      <header className="mb-10 flex flex-col gap-3 md:mb-14 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-muted">{dropLabel}</p>
          <h2 className="mt-2 text-2xl uppercase tracking-widest text-foreground md:text-3xl">
            {drop.name}
          </h2>
          <p className="mt-2 text-[0.65rem] uppercase tracking-[0.25em] text-muted/80">
            {formatDropDate(drop.launchDate)}
          </p>
          {drop.description ? (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/70">
              {drop.description}
            </p>
          ) : null}
        </div>
        <Link
          href={`/shop/${drop.slug}`}
          className="text-[0.65rem] uppercase tracking-[0.25em] text-muted transition-colors hover:text-foreground"
        >
          View drop page
        </Link>
      </header>

      {drop.heroImage && purchasableProducts.length > 1 ? (
        <div className="relative mb-10 aspect-[16/9] max-w-3xl overflow-hidden border border-white/10 bg-neutral-900">
          <Image
            src={drop.heroImage}
            alt={`${drop.name} hero`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      ) : null}

      {purchasableProducts.map((product, index) => (
        <ActiveDropProductBlock
          key={product.id}
          product={product}
          dropLabel={dropLabel}
          showDivider={index > 0}
        />
      ))}
    </section>
  );
}
