"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, registerGSAP } from "@/lib/animations/gsap";
import { shouldDisableSmoothScroll } from "@/lib/animations/scroll-utils";

interface ScrollToOptions {
  offset?: number;
}

interface LenisControlValue {
  stop: () => void;
  start: () => void;
  scrollTo: (target: string | HTMLElement, options?: ScrollToOptions) => void;
  isAvailable: boolean;
}

const noop = () => {};

function nativeScrollTo(
  target: string | HTMLElement,
  options?: ScrollToOptions
) {
  const offset = options?.offset ?? 0;
  const element =
    typeof target === "string"
      ? document.querySelector<HTMLElement>(target.startsWith("#") ? target : target)
      : target;

  if (!element) return;

  const top = element.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: "smooth" });
}

const LenisControlContext = createContext<LenisControlValue>({
  stop: noop,
  start: noop,
  scrollTo: nativeScrollTo,
  isAvailable: false,
});

export function useLenisControl() {
  return useContext(LenisControlContext);
}

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const [control, setControl] = useState<LenisControlValue>({
    stop: noop,
    start: noop,
    scrollTo: nativeScrollTo,
    isAvailable: false,
  });

  useEffect(() => {
    registerGSAP();

    const disableSmooth = shouldDisableSmoothScroll();

    if (disableSmooth) {
      setControl({
        stop: noop,
        start: noop,
        scrollTo: nativeScrollTo,
        isAvailable: false,
      });

      const handleResize = () => ScrollTrigger.refresh();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }

    const lenis = new Lenis({
      lerp: 0.07,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    document.documentElement.classList.add("lenis", "lenis-smooth");

    lenisRef.current = lenis;
    setControl({
      stop: () => lenis.stop(),
      start: () => lenis.start(),
      scrollTo: (target, options) => {
        const offset = options?.offset ?? 0;
        if (typeof target === "string") {
          const element = document.querySelector<HTMLElement>(
            target.startsWith("#") ? target : target
          );
          if (element) {
            lenis.scrollTo(element, { offset });
          }
          return;
        }

        lenis.scrollTo(target, { offset });
      },
      isAvailable: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    const handleResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", handleResize);

    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener("resize", handleResize);
      document.documentElement.classList.remove("lenis", "lenis-smooth");
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisRef.current = null;
      setControl({
        stop: noop,
        start: noop,
        scrollTo: nativeScrollTo,
        isAvailable: false,
      });
    };
  }, []);

  return (
    <LenisControlContext.Provider value={control}>
      {children}
    </LenisControlContext.Provider>
  );
}
