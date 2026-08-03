import type { ReactNode } from "react";
import { PageEntrance } from "@/components/layout/PageEntrance";
import { TransitionLink } from "@/components/TransitionLink";
import {
  LegalMobileTableOfContents,
  LegalTableOfContents,
  type LegalTocItem,
} from "@/components/legal/LegalTableOfContents";
import { BRAND_NAME, LEGAL_LAST_UPDATED } from "@/lib/legal/constants";

interface LegalLayoutProps {
  title: string;
  breadcrumbLabel: string;
  intro?: string;
  toc: LegalTocItem[];
  children: ReactNode;
}

export function LegalLayout({
  title,
  breadcrumbLabel,
  intro,
  toc,
  children,
}: LegalLayoutProps) {
  return (
    <>
      <div className="min-h-screen px-4 pb-12 pt-24 md:px-8">
        <PageEntrance className="mx-auto max-w-6xl">
          <nav
            aria-label="Breadcrumb"
            data-fade-up
            className="mb-8 text-xs uppercase tracking-[0.2em] text-muted"
          >
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li>
                <TransitionLink
                  href="/"
                  className="transition-colors hover:text-foreground"
                >
                  Home
                </TransitionLink>
              </li>
              <li aria-hidden="true" className="text-white/25">
                /
              </li>
              <li>
                <span className="text-foreground/70">{breadcrumbLabel}</span>
              </li>
            </ol>
          </nav>

          <header data-fade-up className="mb-10 max-w-3xl">
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-muted">
              {BRAND_NAME}
            </p>
            <h1 className="mb-4 text-2xl uppercase tracking-[0.12em] text-foreground md:text-4xl">
              {title}
            </h1>
            <p className="text-sm text-muted">
              Last Updated: {LEGAL_LAST_UPDATED}
            </p>
            {intro && (
              <p className="mt-6 text-sm leading-relaxed text-foreground/70">
                {intro}
              </p>
            )}
          </header>

          <LegalMobileTableOfContents items={toc} pageTitle={title} />

          <div className="grid gap-12 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] lg:gap-16">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <LegalTableOfContents items={toc} pageTitle={title} />
            </aside>

            <article
              data-fade-up
              className="min-w-0 border border-white/10 bg-white/[0.02] px-5 py-2 md:px-8 md:py-4"
            >
              {children}
            </article>
          </div>
        </PageEntrance>
      </div>
    </>
  );
}
