import type { ReactNode } from "react";

interface ShopAccordionPanelProps {
  children: ReactNode;
}

/** Dark grain + accent-left panel — matches Sizing section treatment. */
export function ShopAccordionPanel({ children }: ShopAccordionPanelProps) {
  return (
    <div className="relative pb-5">
      <div className="relative overflow-hidden border border-white/10 bg-[#050505] px-5 py-6 md:px-8 md:py-8">
        <div
          className="grain-overlay pointer-events-none absolute inset-0"
          aria-hidden="true"
        />
        <div className="relative border-l border-accent/80 pl-4 sm:pl-5">
          {children}
        </div>
      </div>
    </div>
  );
}
