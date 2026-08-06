import Image from "next/image";
import Link from "next/link";
import { formatDropLabel } from "@/lib/drops";
import type { DropWithProducts } from "@/lib/drops.types";

interface PastDropsSectionProps {
  drops: DropWithProducts[];
}

function formatDropDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function PastDropsSection({ drops }: PastDropsSectionProps) {
  const archivedDrops = drops.filter((drop) => drop.products.length > 0);

  if (archivedDrops.length === 0) return null;

  return (
    <section className="mt-20 border-t border-white/10 pt-12 md:mt-28" aria-label="Past drops archive">
      <h2 className="mb-8 text-xs uppercase tracking-[0.35em] text-muted">
        Past Drops
      </h2>

      <div className="space-y-14">
        {archivedDrops.map((drop) => (
          <div key={drop.id}>
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.25em] text-muted">
                  {formatDropLabel(drop.dropNumber)}
                </p>
                <h3 className="mt-1 text-sm uppercase tracking-widest text-foreground/80">
                  {drop.name}
                </h3>
                <p className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-muted/70">
                  {formatDropDate(drop.launchDate)}
                </p>
              </div>
              <Link
                href={`/shop/${drop.slug}`}
                className="text-[0.65rem] uppercase tracking-[0.25em] text-muted transition-colors hover:text-foreground"
              >
                View archive
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {drop.products.map((product) => (
                <article
                  key={product.id}
                  className="group relative overflow-hidden border border-white/10 bg-white/[0.02]"
                >
                  <div className="relative aspect-[4/5] w-full bg-neutral-900">
                    <Image
                      src={product.images[0] ?? "/product-placeholder.webp"}
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
                    <h4 className="text-sm uppercase tracking-widest text-foreground/80">
                      {product.name}
                    </h4>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
