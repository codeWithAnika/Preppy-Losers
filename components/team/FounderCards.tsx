import Image from "next/image";
import { User } from "lucide-react";
import type { Founder } from "@/lib/team";

interface FounderCardsProps {
  founders: Founder[];
}

export function FounderCards({ founders }: FounderCardsProps) {
  return (
    <div className="mx-auto grid max-w-2xl grid-cols-2 gap-4 md:gap-6">
      {founders.map((founder) => (
        <article
          key={founder.name}
          className="overflow-hidden border border-white/12 bg-neutral-950/60 backdrop-blur-sm"
        >
          <div className="relative aspect-[4/5] w-full bg-neutral-900">
            {founder.photoUrl ? (
              <>
                <Image
                  src={founder.photoUrl}
                  alt={founder.name}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 44vw, 280px"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 border border-dashed border-white/15 bg-neutral-950/80 p-4 text-center">
                <User
                  size={32}
                  strokeWidth={1.25}
                  className="text-foreground/25"
                  aria-hidden="true"
                />
                <p className="text-[10px] uppercase tracking-[0.28em] text-foreground/35">
                  Photo coming soon
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 px-3 py-4 text-center md:px-4">
            <h3 className="font-doctor-glitch text-sm tracking-tight text-foreground md:text-base">
              {founder.name}
            </h3>
            {founder.role ? (
              <p className="mt-1 text-[10px] uppercase tracking-[0.26em] text-foreground/45 md:text-[11px]">
                {founder.role}
              </p>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
