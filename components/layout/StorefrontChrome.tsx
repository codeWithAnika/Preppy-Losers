"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { LoadingScreen } from "@/components/LoadingScreen";
import { SiteAtmosphere } from "@/components/SiteAtmosphere";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { PageTransitionProvider } from "@/components/PageTransitionProvider";
import { TextDistressFilter } from "@/components/ui/TextDistressFilter";

export function StorefrontChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  return (
    <>
      <div className="site-background-overlay fixed inset-0 z-10" aria-hidden="true" />
      {!isHomepage && <SiteAtmosphere />}
      <TextDistressFilter />
      <SmoothScrollProvider>
        <PageTransitionProvider>
          <LoadingScreen />
          <Header />
          <CartDrawer />
          <main className="relative z-20">{children}</main>
          <Footer />
        </PageTransitionProvider>
      </SmoothScrollProvider>
    </>
  );
}
