"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { StorefrontChrome } from "@/components/layout/StorefrontChrome";
import { isAdminPath } from "@/lib/auth/admin-allowlist";

export function RootChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";

  if (isAdminPath(pathname)) {
    return children;
  }

  return <StorefrontChrome>{children}</StorefrontChrome>;
}
