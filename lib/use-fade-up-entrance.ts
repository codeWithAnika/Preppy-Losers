"use client";

import { useLayoutEffect, type RefObject } from "react";
import { gsap, registerGSAP } from "@/lib/animations/gsap";
import { PAGE_REVEAL_EVENT } from "@/lib/page-transition";

interface FadeUpEntranceOptions {
  selector?: string;
  stagger?: number;
  delay?: number;
  fromY?: number;
}

export function useFadeUpEntrance(
  containerRef: RefObject<HTMLElement | null>,
  options: FadeUpEntranceOptions = {}
) {
  const {
    selector = "[data-fade-up]",
    stagger = 0.06,
    delay = 0,
    fromY = 20,
  } = options;

  useLayoutEffect(() => {
    registerGSAP();

    const container = containerRef.current;
    if (!container) return;

    let hasPlayed = false;

    const play = (extraDelay = 0) => {
      if (hasPlayed) return;

      const targets = container.querySelectorAll<HTMLElement>(selector);
      if (targets.length === 0) return;

      hasPlayed = true;

      gsap.fromTo(
        targets,
        { opacity: 0, y: fromY },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger,
          ease: "power2.out",
          delay: extraDelay + delay,
        }
      );
    };

    const handleReveal = () => play(0.12);
    window.addEventListener(PAGE_REVEAL_EVENT, handleReveal);

    const pending =
      typeof window !== "undefined" &&
      sessionStorage.getItem("pl-page-transition") === "1";

    if (!pending) {
      play(0.06);
    }

    return () => {
      window.removeEventListener(PAGE_REVEAL_EVENT, handleReveal);
    };
  }, [containerRef, selector, stagger, delay, fromY]);
}
