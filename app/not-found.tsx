"use client";

import { useRef } from "react";
import { BrandWordmark } from "@/components/BrandWordmark";
import { MagneticGlitchCTA } from "@/components/ui/MagneticGlitchCTA";
import { useFadeUpEntrance } from "@/lib/use-fade-up-entrance";

export default function NotFound() {
  const containerRef = useRef<HTMLDivElement>(null);
  useFadeUpEntrance(containerRef);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-24 text-center">
      <div ref={containerRef} className="max-w-md">
        <p
          data-fade-up
          className="mb-4 text-xs uppercase tracking-[0.35em] text-muted"
        >
          404
        </p>

        <BrandWordmark
          className="mb-6 block text-2xl font-bold leading-none tracking-widest md:text-4xl"
        />

        <h1
          data-fade-up
          className="mb-4 text-xl uppercase tracking-[0.12em] text-foreground md:text-2xl"
        >
          This page doesn&apos;t exist
        </h1>

        <p
          data-fade-up
          className="mb-10 text-sm leading-relaxed text-foreground/60"
        >
          Wrong turn in the underground. The drop you&apos;re looking for
          isn&apos;t here.
        </p>

        <MagneticGlitchCTA
          data-fade-up
          href="/"
          variant="outline"
          className="inline-block"
        >
          Back to home
        </MagneticGlitchCTA>
      </div>
    </div>
  );
}
