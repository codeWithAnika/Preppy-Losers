"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, registerGSAP } from "@/lib/animations/gsap";
const MANIFESTO_WORDS = [
  "FOR",
  "THE",
  "ONES",
  "WHO",
  "STAYED.",
];
export function ManifestoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    registerGSAP();

    const section = sectionRef.current;
    const bg = bgRef.current;
    if (!section) return;

    const words = wordsRef.current.filter(Boolean);
    if (words.length === 0) return;

    const ctx = gsap.context(() => {
      if (bg) {
        gsap.fromTo(
          bg,
          { y: "-12%" },
          {
            y: "12%",
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }

      gsap.set(words, {
        filter: "blur(8px)",
        scale: 1.1,
        opacity: 0,
      });

      gsap.to(words, {
        filter: "blur(0px)",
        scale: 1,
        opacity: 1,
        duration: 0.8,
        stagger: 0.05,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          toggleActions: "play none none none",
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-10 overflow-hidden px-4 py-24 md:px-8 md:py-32"
      aria-label="Brand manifesto"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          ref={bgRef}
          className="absolute -top-[12%] left-0 h-[124%] w-full will-change-transform"
        >
          <Image
            src="/manifesto-bg.webp"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-black/65" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h2
          className="distressed-headline font-doctor-glitch text-3xl leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl"
        >
          {MANIFESTO_WORDS.map((word, i) => (
            <span key={`${word}-${i}`} className="inline-block">
              <span
                ref={(el) => {
                  if (el) wordsRef.current[i] = el;
                }}
                className="inline-block will-change-[filter,transform,opacity]"
              >
                {word}
              </span>
              {i < MANIFESTO_WORDS.length - 1 && "\u00A0"}
            </span>
          ))}
        </h2>
      </div>
    </section>
  );
}
