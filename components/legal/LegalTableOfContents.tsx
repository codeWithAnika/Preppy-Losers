"use client";

import { TransitionLink } from "@/components/TransitionLink";

export interface LegalTocItem {
  id: string;
  label: string;
}

interface LegalTableOfContentsProps {
  items: LegalTocItem[];
  pageTitle: string;
}

export function LegalTableOfContents({
  items,
  pageTitle,
}: LegalTableOfContentsProps) {
  return (
    <nav
      aria-label={`${pageTitle} table of contents`}
      className="hidden lg:block"
    >
      <p className="mb-4 text-xs uppercase tracking-[0.25em] text-muted">
        On this page
      </p>
      <ol className="space-y-2 border-l border-white/10 pl-4">
        {items.map((item) => (
          <li key={item.id}>
            <TransitionLink
              href={`#${item.id}`}
              className="block py-1 text-sm leading-snug text-foreground/60 transition-colors hover:text-foreground"
            >
              {item.label}
            </TransitionLink>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function LegalMobileTableOfContents({
  items,
  pageTitle,
}: LegalTableOfContentsProps) {
  return (
    <nav
      aria-label={`${pageTitle} table of contents`}
      className="mb-10 border border-white/10 bg-white/[0.02] p-4 lg:hidden"
    >
      <p className="mb-3 text-xs uppercase tracking-[0.25em] text-muted">
        Jump to section
      </p>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <TransitionLink
              href={`#${item.id}`}
              className="inline-flex min-h-10 items-center text-sm text-foreground/70 transition-colors hover:text-foreground"
            >
              {item.label}
            </TransitionLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
