/** Routes that skip Lenis/GSAP for faster, payment-focused UX. */
export function isLiteStorefrontRoute(pathname: string): boolean {
  return /^\/(checkout|account)(\/|$)/.test(pathname);
}
