"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Register ScrollTrigger with the same gsap instance used everywhere.
 * Child useEffects run before parent useEffects in React, so section
 * components cannot rely on SmoothScrollProvider to register first.
 */
export function registerGSAP() {
  if (typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
}

// Eager client-side registration when this module is first imported.
if (typeof window !== "undefined") {
  registerGSAP();
}

export { gsap, ScrollTrigger };
