export const HEADER_SCROLL_OFFSET = -64;

export function getScrollTarget(selector: string): HTMLElement | null {
  if (typeof document === "undefined") return null;

  if (selector.startsWith("#")) {
    return document.getElementById(selector.slice(1));
  }

  return document.querySelector<HTMLElement>(selector);
}
