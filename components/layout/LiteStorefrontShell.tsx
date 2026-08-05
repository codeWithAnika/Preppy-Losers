"use client";

import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { LitePageTransitionProvider } from "@/components/LitePageTransitionProvider";
import { TextDistressFilter } from "@/components/ui/TextDistressFilter";

/** Lightweight storefront shell — no Lenis/GSAP (checkout, account). */
export function LiteStorefrontShell({ children }: { children: ReactNode }) {
  return (
    <LitePageTransitionProvider>
      <div className="site-background-overlay fixed inset-0 z-10" aria-hidden="true" />
      <TextDistressFilter />
      <Header />
      <CartDrawer />
      <main className="relative z-20">{children}</main>
      <Footer />
    </LitePageTransitionProvider>
  );
}
