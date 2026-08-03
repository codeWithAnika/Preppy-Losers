export function shouldDisableSmoothScroll(): boolean {
  if (typeof window === "undefined") return false;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

  return prefersReducedMotion || isTouchDevice;
}

export function shouldDisableScrollEffects(): boolean {
  if (typeof window === "undefined") return false;

  return (
    shouldDisableSmoothScroll() ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}
