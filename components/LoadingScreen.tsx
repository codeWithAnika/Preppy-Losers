"use client";

import { useEffect, useState } from "react";
import { BrandWordmark } from "@/components/BrandWordmark";

const SESSION_KEY = "pl-visited";

export function LoadingScreen() {
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem(SESSION_KEY);

    if (hasVisited) return;

    setVisible(true);
    sessionStorage.setItem(SESSION_KEY, "true");

    const minDisplay = setTimeout(() => {
      setFadeOut(true);
    }, 1200);

    const hide = setTimeout(() => {
      setVisible(false);
    }, 1800);

    return () => {
      clearTimeout(minDisplay);
      clearTimeout(hide);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-500 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden={fadeOut}
    >
      <BrandWordmark className="text-2xl font-bold leading-none tracking-widest md:text-4xl" />
    </div>
  );
}
