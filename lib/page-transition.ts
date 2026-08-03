export const PAGE_TRANSITION_KEY = "pl-page-transition";

export function setPageTransitionPending() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PAGE_TRANSITION_KEY, "1");
}

export function consumePageTransition(): boolean {
  if (typeof window === "undefined") return false;
  const pending = sessionStorage.getItem(PAGE_TRANSITION_KEY) === "1";
  if (pending) sessionStorage.removeItem(PAGE_TRANSITION_KEY);
  return pending;
}

export const PAGE_REVEAL_EVENT = "pl-page-reveal-start";

/** @deprecated Use PAGE_REVEAL_EVENT */
export const SHOP_REVEAL_EVENT = PAGE_REVEAL_EVENT;
