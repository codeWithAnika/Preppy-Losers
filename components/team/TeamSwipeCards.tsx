"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { gsap, registerGSAP } from "@/lib/animations/gsap";
import type { TeamMember } from "@/lib/team";

const SWIPE_THRESHOLD = 72;

interface TeamSwipeCardsProps {
  members: TeamMember[];
}

export function TeamSwipeCards({ members }: TeamSwipeCardsProps) {
  const [index, setIndex] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  const member = members[index];

  useEffect(() => {
    registerGSAP();
  }, []);

  const dismissHint = useCallback(() => {
    if (!showHint || !hintRef.current) return;
    gsap.to(hintRef.current, {
      opacity: 0,
      y: 6,
      duration: 0.35,
      ease: "power2.in",
      onComplete: () => setShowHint(false),
    });
  }, [showHint]);

  const advance = useCallback(() => {
    if (isAnimating || members.length <= 1) return;

    const card = cardRef.current;
    if (!card) return;

    setIsAnimating(true);
    dismissHint();

    gsap.to(card, {
      x: 160,
      rotation: 10,
      opacity: 0,
      scale: 0.92,
      duration: 0.42,
      ease: "power3.in",
      onComplete: () => {
        const nextIndex = (indexRef.current + 1) % members.length;
        indexRef.current = nextIndex;
        setIndex(nextIndex);

        gsap.set(card, { x: -52, rotation: -5, opacity: 0, scale: 0.96 });
        gsap.to(card, {
          x: 0,
          rotation: 0,
          opacity: 1,
          scale: 1,
          duration: 0.48,
          ease: "power3.out",
          onComplete: () => setIsAnimating(false),
        });
      },
    });
  }, [isAnimating, members.length, dismissHint]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return;
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isAnimating) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    const card = cardRef.current;
    if (!card || touchDeltaX.current <= 0) return;

    gsap.set(card, {
      x: touchDeltaX.current * 0.55,
      rotation: touchDeltaX.current * 0.04,
    });
  };

  const handleTouchEnd = () => {
    if (isAnimating) return;

    if (touchDeltaX.current > SWIPE_THRESHOLD) {
      advance();
    } else {
      gsap.to(cardRef.current, {
        x: 0,
        rotation: 0,
        duration: 0.28,
        ease: "power2.out",
      });
    }

    touchDeltaX.current = 0;
  };

  if (members.length === 0) return null;

  return (
    <div className="relative mx-auto w-full max-w-sm">
      {showHint && (
        <div
          ref={hintRef}
          className="pointer-events-none absolute -top-10 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-foreground/45"
          aria-hidden="true"
        >
          <span>Swipe right</span>
          <ChevronRight size={14} className="opacity-70" />
        </div>
      )}

      <div
        ref={cardRef}
        className="relative touch-pan-y will-change-transform"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <article className="overflow-hidden border border-white/12 bg-neutral-950/80 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-sm">
          <div className="relative aspect-[3/4] w-full bg-neutral-900">
            <Image
              key={member.photoUrl + index}
              src={member.photoUrl}
              alt={member.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 88vw, 384px"
              priority={index === 0}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
          </div>

          <div className="border-t border-white/10 px-5 py-5 text-center">
            <h3 className="font-doctor-glitch text-xl tracking-tight text-foreground md:text-2xl">
              {member.name}
            </h3>
            <p className="mt-1.5 text-[11px] uppercase tracking-[0.28em] text-foreground/50">
              {member.role}
            </p>
          </div>
        </article>
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <div className="flex gap-1.5" aria-hidden="true">
          {members.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                i === index ? "bg-foreground" : "bg-foreground/20"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={advance}
          disabled={isAnimating}
          className="inline-flex min-h-11 min-w-11 items-center justify-center border border-white/20 bg-black/40 text-foreground/80 backdrop-blur-sm transition-colors hover:border-white/40 hover:text-foreground disabled:opacity-40"
          aria-label="Next team member"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <p className="mt-3 text-center text-[10px] uppercase tracking-[0.25em] text-foreground/30">
        {index + 1} / {members.length}
      </p>
    </div>
  );
}
