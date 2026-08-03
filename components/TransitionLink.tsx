"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";
import { usePageTransition } from "@/components/PageTransitionProvider";
import { useLenisControl } from "@/components/SmoothScrollProvider";
import { getScrollTarget, HEADER_SCROLL_OFFSET } from "@/lib/scroll-to-section";

type TransitionLinkProps = ComponentProps<typeof Link>;

function isInternalHref(href: TransitionLinkProps["href"]): href is string {
  return typeof href === "string" && href.startsWith("/");
}

function isHashHref(href: string): boolean {
  return href.includes("#");
}

export function TransitionLink({
  href,
  onClick,
  ...props
}: TransitionLinkProps) {
  const pathname = usePathname();
  const { navigateWithFade } = usePageTransition();
  const { scrollTo } = useLenisControl();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;

    if (!isInternalHref(href)) return;

    if (isHashHref(href)) {
      const [path, hash] = href.split("#");
      const targetPath = path || "/";
      const selector = `#${hash}`;

      if (targetPath === pathname || (targetPath === "/" && pathname === "/")) {
        event.preventDefault();
        const target = getScrollTarget(selector);
        if (target) {
          scrollTo(target, { offset: HEADER_SCROLL_OFFSET });
        }
      } else {
        event.preventDefault();
        navigateWithFade(href);
      }
      return;
    }

    if (href !== pathname) {
      event.preventDefault();
      navigateWithFade(href);
    }
  };

  return <Link href={href} onClick={handleClick} {...props} />;
}
