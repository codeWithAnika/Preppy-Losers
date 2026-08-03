import Image from "next/image";
import { formatDropLabel, type Product } from "@/lib/products";

interface PastDropsSectionProps {
  products: Product[];
}

function formatDropDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function PastDropsSection({ products }: PastDropsSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="mt-20 border-t border-white/10 pt-12 md:mt-28" aria-label="Past drops archive">
      <h2 className="mb-8 text-xs uppercase tracking-[0.35em] text-muted">
        Past Drops
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:max-w-xl">
        {products.map((product) => (
          <article
            key={product.id}
            className="group relative overflow-hidden border border-white/10 bg-white/[0.02]"
          >
            <div className="relative aspect-[4/5] w-full bg-neutral-900">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover opacity-70 transition-opacity duration-300 group-hover:opacity-85"
                sizes="(max-width: 640px) 100vw, 320px"
              />
              <div className="absolute inset-0 bg-black/35" aria-hidden="true" />
              <span className="absolute left-3 top-3 border border-white/20 bg-black/60 px-2 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-foreground/80 backdrop-blur-sm">
                Sold Out
              </span>
            </div>

            <div className="px-4 py-4">
              <p className="text-[0.65rem] uppercase tracking-[0.25em] text-muted">
                {formatDropLabel(product.dropNumber)}
              </p>
              <p className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-muted/70">
                {formatDropDate(product.dropDate)}
              </p>
              <h3 className="mt-2 text-sm uppercase tracking-widest text-foreground/80">
                {product.name}
              </h3>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
