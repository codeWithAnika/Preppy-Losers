import type { ReactNode } from "react";

interface LegalSectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

export function LegalSection({ id, title, children }: LegalSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="scroll-mt-28 border-b border-white/10 py-10 last:border-b-0 last:pb-0"
    >
      <h2
        id={`${id}-heading`}
        className="mb-5 text-sm uppercase tracking-[0.2em] text-foreground md:text-base"
      >
        {title}
      </h2>
      <div className="legal-prose">{children}</div>
    </section>
  );
}
