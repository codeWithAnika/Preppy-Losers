import { registerGSAP, ScrollTrigger } from "@/lib/animations/gsap";

/**
 * Revert all ScrollTrigger pin/reparent changes before React unmounts pinned
 * sections. Component useEffect cleanups run after React's DOM deletion phase,
 * so pins must be cleared proactively on route change.
 */
export function revertAllScrollTriggers() {
  if (typeof window === "undefined") return;

  registerGSAP();
  ScrollTrigger.getAll().forEach((trigger) => {
    trigger.kill(true);
  });
}
