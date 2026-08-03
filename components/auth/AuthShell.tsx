"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { BrandWordmark } from "@/components/BrandWordmark";
import { useFadeUpEntrance } from "@/lib/use-fade-up-entrance";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useFadeUpEntrance(containerRef);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-24 md:px-8">
      <div ref={containerRef} className="w-full max-w-md">
        <Link
          href="/"
          data-fade-up
          className="mb-10 inline-block text-xs uppercase tracking-[0.3em] text-muted transition-colors hover:text-foreground"
        >
          <BrandWordmark className="text-sm leading-none md:text-base" />
        </Link>

        <div
          data-fade-up
          className="border border-white/10 bg-white/[0.02] p-6 md:p-8"
        >
          <h1 className="mb-2 text-xl uppercase tracking-[0.2em] text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="mb-8 text-sm text-muted">{subtitle}</p>
          )}
          {!subtitle && <div className="mb-8" />}

          {children}
        </div>

        {footer && (
          <div data-fade-up className="mt-6 text-center text-sm">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
