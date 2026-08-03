"use client";

import { useRef, type ReactNode } from "react";
import { useFadeUpEntrance } from "@/lib/use-fade-up-entrance";

interface PageEntranceProps {
  children: ReactNode;
  className?: string;
}

export function PageEntrance({ children, className = "" }: PageEntranceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useFadeUpEntrance(containerRef);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
