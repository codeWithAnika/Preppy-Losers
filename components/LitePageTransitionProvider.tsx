"use client";

import { useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { PageTransitionContext } from "@/components/PageTransitionProvider";

/** Instant navigation — no GSAP overlay (lite storefront routes). */
export function LitePageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const navigateWithFade = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router]
  );

  return (
    <PageTransitionContext.Provider value={{ navigateWithFade }}>
      {children}
    </PageTransitionContext.Provider>
  );
}
