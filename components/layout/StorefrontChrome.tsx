"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { LiteStorefrontShell } from "@/components/layout/LiteStorefrontShell";
import { isLiteStorefrontRoute } from "@/lib/storefront-routes";

const AnimatedStorefrontShell = dynamic(
  () =>
    import("@/components/layout/AnimatedStorefrontShell").then((mod) => ({
      default: mod.AnimatedStorefrontShell,
    })),
  { ssr: false }
);

export function StorefrontChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const isLite = isLiteStorefrontRoute(pathname);

  if (isLite) {
    return <LiteStorefrontShell>{children}</LiteStorefrontShell>;
  }

  return <AnimatedStorefrontShell>{children}</AnimatedStorefrontShell>;
}
