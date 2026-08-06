import Image from "next/image";
import Link from "next/link";
import { formatDropLabel } from "@/lib/drops";
import type { DropWithProducts } from "@/lib/drops.types";
import { isProductPublished } from "@/lib/purchasability";
import { formatINR } from "@/lib/cart";

interface LiveDropsSectionProps {
  drops: DropWithProducts[];
}

export function LiveDropsSection({ drops }: LiveDropsSectionProps) {
  const liveDrops = drops.filter((drop) =>
    drop.products.some((product) => isProductPublished(product))
  );

  if (liveDrops.length === 0) return null;

  return (
    <section className="border-t border-white/10 bg-black px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs uppercase tracking-[0.35em] text-muted">Live Now</p>
        <h2 className="mt-3 text-2xl uppercase tracking-widest text-foreground md:text-3xl">
          Active Drops
        </h2>

        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {liveDrops.map((drop) => {
            const publishedProducts = drop.products.filter(isProductPublished);
            const heroImage =
              drop.heroImage ??
              drop.bannerImage ??
              publishedProducts[0]?.images[0] ??
              "/product-placeholder.webp";
            const fromPrice = Math.min(...publishedProducts.map((product) => product.price));

            return (
              <article
                key={drop.id}
                className="group overflow-hidden border border-white/10 bg-white/[0.02]"
              >
                <Link href={`/shop/${drop.slug}`} className="block">
                  <div className="relative aspect-[4/5] bg-neutral-900">
                    <Image
                      src={heroImage}
                      alt={drop.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) 100vw, 384px"
                    />
                  </div>
                  <div className="px-5 py-5">
                    <p className="text-[0.65rem] uppercase tracking-[0.25em] text-muted">
                      {formatDropLabel(drop.dropNumber)}
                    </p>
                    <h3 className="mt-2 text-sm uppercase tracking-widest text-foreground">
                      {drop.name}
                    </h3>
                    <p className="mt-2 text-xs text-muted">
                      {publishedProducts.length}{" "}
                      {publishedProducts.length === 1 ? "piece" : "pieces"} · from{" "}
                      {formatINR(fromPrice)}
                    </p>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>

        <div className="mt-10">
          <Link
            href="/shop"
            className="text-xs uppercase tracking-[0.3em] text-muted transition-colors hover:text-foreground"
          >
            View all drops →
          </Link>
        </div>
      </div>
    </section>
  );
}
