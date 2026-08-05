"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "@/lib/animations/gsap";
import { revertAllScrollTriggers } from "@/lib/animations/revert-scroll-triggers";
import {
  PAGE_REVEAL_EVENT,
  PAGE_TRANSITION_KEY,
  setPageTransitionPending,
} from "@/lib/page-transition";

/** Fade-out duration (seconds) — overlay reaches full black. */
const FADE_OUT_DURATION = 0.18;
/** Navigate while fade-out is in progress (seconds), not after it finishes. */
const NAVIGATE_AT = 0.1;
/** Fade-in duration (seconds) after the new route mounts. */
const FADE_IN_DURATION = 0.22;

interface PageTransitionContextValue {
  navigateWithFade: (href: string) => void;
}

export const PageTransitionContext = createContext<PageTransitionContextValue | null>(
  null
);

export function usePageTransition() {
  const ctx = useContext(PageTransitionContext);
  if (!ctx) {
    throw new Error("usePageTransition must be used within PageTransitionProvider");
  }
  return ctx;
}

interface PageTransitionProviderProps {
  children: ReactNode;
}

export function PageTransitionProvider({ children }: PageTransitionProviderProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const navigationTimerRef = useRef<ReturnType<typeof gsap.delayedCall> | null>(
    null
  );

  const navigateWithFade = useCallback(
    (href: string) => {
      const pushRoute = () => {
        revertAllScrollTriggers();
        router.push(href);
      };

      const overlay = overlayRef.current;
      if (!overlay) {
        pushRoute();
        return;
      }

      if (navigationTimerRef.current) {
        navigationTimerRef.current.kill();
        navigationTimerRef.current = null;
      }

      setPageTransitionPending();

      gsap.killTweensOf(overlay);
      gsap.to(overlay, {
        opacity: 1,
        duration: FADE_OUT_DURATION,
        ease: "power2.in",
      });

      navigationTimerRef.current = gsap.delayedCall(NAVIGATE_AT, pushRoute);
    },
    [router]
  );

  useEffect(() => {
    const handlePopState = () => {
      revertAllScrollTriggers();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    return () => {
      if (navigationTimerRef.current) {
        navigationTimerRef.current.kill();
      }
    };
  }, []);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const pending = sessionStorage.getItem(PAGE_TRANSITION_KEY) === "1";
    if (!pending) return;

    gsap.killTweensOf(overlay);
    gsap.set(overlay, { opacity: 1 });
    sessionStorage.removeItem(PAGE_TRANSITION_KEY);

    window.dispatchEvent(new CustomEvent(PAGE_REVEAL_EVENT));

    gsap.to(overlay, {
      opacity: 0,
      duration: FADE_IN_DURATION,
      ease: "power2.out",
    });
  }, [pathname]);

  return (
    <PageTransitionContext.Provider value={{ navigateWithFade }}>
      <div
        ref={overlayRef}
        className="pointer-events-none fixed inset-0 z-[200] bg-black opacity-0"
        aria-hidden="true"
      />
      {children}
    </PageTransitionContext.Provider>
  );
}
