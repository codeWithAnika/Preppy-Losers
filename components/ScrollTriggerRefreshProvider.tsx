"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ScrollTrigger, registerGSAP } from "@/lib/animations/gsap";

interface ScrollTriggerRefreshProviderProps {
  children: ReactNode;
}

export function ScrollTriggerRefreshProvider({
  children,
}: ScrollTriggerRefreshProviderProps) {
  const [sectionsMounted, setSectionsMounted] = useState(false);

  useEffect(() => {
    registerGSAP();

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setSectionsMounted(true);
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  useEffect(() => {
    registerGSAP();

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    return () => window.removeEventListener("load", refresh);
  }, []);

  useEffect(() => {
    if (!sectionsMounted) return;

    const raf = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => cancelAnimationFrame(raf);
  }, [sectionsMounted]);

  return <>{children}</>;
}
