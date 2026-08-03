"use client";

import { useRef, useLayoutEffect, useEffect } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, registerGSAP } from "@/lib/animations/gsap";
import { shouldDisableScrollEffects } from "@/lib/animations/scroll-utils";
import { BrandWordmark } from "@/components/BrandWordmark";

interface HeroSectionProps {
  logoSrc?: string;
}

function getLogoStartX(): number {
  if (typeof window === "undefined") return -800;
  return Math.min(-800, -window.innerWidth * 1.2);
}

export function HeroSection({ logoSrc = "/logo-badge.webp" }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    registerGSAP();

    const logo = logoRef.current;
    const glow = glowRef.current;
    const pin = pinRef.current;
    if (!logo || !pin) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      if (glow) {
        gsap.set(glow, { opacity: 0 });
        gsap.to(glow, {
          opacity: 0.25,
          duration: 1,
          ease: "power2.out",
        });
        gsap.to(glow, {
          opacity: 0.48,
          duration: 2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 1,
        });
      }

      if (prefersReducedMotion) {
        gsap.set(logo, { x: 0, rotation: 0, scale: 1 });
        return;
      }

      const ENTRANCE_DURATION = 3.75;

      const tl = gsap.timeline();

      tl.fromTo(
        logo,
        { x: getLogoStartX, rotation: 0, scale: 0.3 },
        {
          x: 0,
          rotation: 900,
          scale: 1,
          duration: ENTRANCE_DURATION,
          ease: "power3.out",
        },
        0
      ).to(
        logo,
        {
          rotation: "+=360",
          duration: 20,
          ease: "none",
          repeat: -1,
        },
        ENTRANCE_DURATION
      );
    }, pin);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    registerGSAP();

    const section = sectionRef.current;
    const pin = pinRef.current;
    if (!section || !pin) return;

    const ctx = gsap.context(() => {
      if (!shouldDisableScrollEffects()) {
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "+=100%",
          pin: pin,
          pinSpacing: true,
          anticipatePin: 1,
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen"
      aria-label="Hero"
    >
      <div
        ref={pinRef}
        className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden"
      >
        {/* Layer 1: blurred background texture */}
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{ filter: "blur(5px)" }}
          >
            <Image
              src="/blur.webp"
              alt=""
              fill
              className="scale-110 object-cover"
              sizes="100vw"
              priority
            />
          </div>
        </div>

        {/* Layer 2: pulsing red radial glow */}
        <div
          ref={glowRef}
          className="pointer-events-none absolute left-1/2 top-1/2 z-[1] h-[min(700px,80vw)] w-[min(700px,80vw)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
          style={{
            background:
              "radial-gradient(circle, #b02020 0%, rgba(139, 30, 30, 0.55) 40%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        {/* Layer 3: foreground content */}
        <p className="relative z-10 mb-8 text-[10px] uppercase leading-none tracking-[0.35em] text-muted md:text-xs">
          <BrandWordmark />
        </p>

        <div
          ref={logoRef}
          className="relative z-10 flex items-center justify-center will-change-transform"
        >
          <Image
            src={logoSrc}
            alt="Preppy Losers badge logo"
            width={320}
            height={320}
            className="h-[250px] w-[250px] md:h-[300px] md:w-[300px] lg:h-[350px] lg:w-[350px]"
            priority
          />
        </div>
      </div>
    </section>
  );
}
