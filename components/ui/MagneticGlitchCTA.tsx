"use client";

import Link from "next/link";
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
  type ComponentProps,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { gsap } from "@/lib/animations/gsap";
import { isTouchDevice } from "@/lib/animations/scroll-utils";
import { usePageTransition } from "@/components/PageTransitionProvider";

const MAGNETIC_RADIUS = 72;
const MAX_OFFSET = 10;

interface MagneticGlitchCTAProps extends Omit<ComponentProps<typeof Link>, "children"> {
  children: ReactNode;
  variant?: "link" | "outline";
  /** Optional element rendered below the glitched label (e.g. hero divider line) */
  endAdornment?: ReactNode;
  layout?: "inline" | "stacked";
  /** Hero CTA: blood-red after product reveal completes */
  revealed?: boolean;
}

function GlitchLabel({
  children,
  active,
  onComplete,
}: {
  children: ReactNode;
  active: boolean;
  onComplete: () => void;
}) {
  const mainRef = useRef<HTMLSpanElement>(null);
  const redRef = useRef<HTMLSpanElement>(null);
  const blueRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!active) return;

    const main = mainRef.current;
    const red = redRef.current;
    const blue = blueRef.current;
    if (!main || !red || !blue) return;

    const tl = gsap.timeline({ onComplete });

    tl.set([red, blue], { opacity: 0.85 })
      .to(red, { x: 4, y: -2, duration: 0.045, ease: "none" })
      .to(blue, { x: -4, y: 2, duration: 0.045, ease: "none" }, "<")
      .to(main, { x: -1, duration: 0.04, ease: "none" })
      .to(red, { x: -3, y: 1, duration: 0.045, ease: "none" })
      .to(blue, { x: 3, y: -1, duration: 0.045, ease: "none" }, "<")
      .to(main, { x: 2, y: 1, duration: 0.04, ease: "none" })
      .to([main, red, blue], {
        x: 0,
        y: 0,
        duration: 0.06,
        ease: "power2.out",
      })
      .to([red, blue], { opacity: 0, duration: 0.05 }, "<");

    return () => {
      tl.kill();
    };
  }, [active, onComplete]);

  return (
    <span className="relative inline-block">
      <span ref={mainRef} className="relative z-10 inline-block">
        {children}
      </span>
      <span
        ref={redRef}
        className="pointer-events-none absolute inset-0 z-20 inline-block text-accent opacity-0"
        aria-hidden="true"
      >
        {children}
      </span>
      <span
        ref={blueRef}
        className="pointer-events-none absolute inset-0 z-20 inline-block text-sky-400 opacity-0"
        aria-hidden="true"
      >
        {children}
      </span>
    </span>
  );
}

export function MagneticGlitchCTA({
  children,
  variant = "link",
  endAdornment,
  layout = "inline",
  revealed = false,
  className = "",
  href,
  onClick,
  ...props
}: MagneticGlitchCTAProps) {
  const wrapperRef = useRef<HTMLAnchorElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const inRangeRef = useRef(false);
  const touchRef = useRef(false);
  const [hovered, setHovered] = useState(false);
  const [glitching, setGlitching] = useState(false);
  const { navigateWithFade } = usePageTransition();

  const snapBack = useCallback(() => {
    const inner = innerRef.current;
    if (!inner) return;
    gsap.to(inner, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: "elastic.out(1, 0.45)",
    });
  }, []);

  useEffect(() => {
    touchRef.current = isTouchDevice();
    if (touchRef.current) return;

    const wrapper = wrapperRef.current;
    const inner = innerRef.current;
    if (!wrapper || !inner) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;

      const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
      const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
      const edgeDistance = Math.sqrt(dx * dx + dy * dy);

      if (edgeDistance <= MAGNETIC_RADIUS) {
        inRangeRef.current = true;
        const proximity = 1 - edgeDistance / MAGNETIC_RADIUS;
        const pull = proximity * proximity;
        const x = Math.max(
          -MAX_OFFSET,
          Math.min(MAX_OFFSET, distX * 0.12 * pull)
        );
        const y = Math.max(
          -MAX_OFFSET,
          Math.min(MAX_OFFSET, distY * 0.12 * pull)
        );

        gsap.to(inner, {
          x,
          y,
          duration: 0.35,
          ease: "power2.out",
          overwrite: true,
        });
      } else if (inRangeRef.current) {
        inRangeRef.current = false;
        snapBack();
      }
    };

    const handleMouseLeave = () => {
      inRangeRef.current = false;
      setHovered(false);
      snapBack();
    };

    window.addEventListener("mousemove", handleMouseMove);
    wrapper.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      wrapper.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [snapBack]);

  const handleMouseEnter = () => {
    if (touchRef.current) return;
    setGlitching(true);
  };

  const handleGlitchComplete = () => {
    setGlitching(false);
    setHovered(true);
  };

  const handleClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;

    if (typeof href === "string" && href.startsWith("/") && !href.includes("#")) {
      event.preventDefault();
      navigateWithFade(href);
    }
  };

  const hoverLink = revealed
    ? hovered
      ? "text-blood-red-bright brightness-125"
      : "text-blood-red-bright [text-shadow:0_0_18px_rgba(196,30,30,0.45)]"
    : hovered
      ? "text-accent"
      : "text-foreground/80";
  const hoverOutline = hovered
    ? "border-accent bg-foreground/10 text-foreground"
    : "border-foreground text-foreground";

  const variantClass =
    variant === "outline"
      ? "relative inline-block px-10 py-4 text-xs uppercase tracking-[0.3em] border"
      : "relative inline-block text-xs uppercase tracking-[0.3em]";

  const hoverClass = variant === "outline" ? hoverOutline : hoverLink;
  const revealTransition = revealed ? "transition-colors duration-[1.4s] ease-out" : "";

  const innerLayout =
    layout === "stacked"
      ? "inline-flex flex-col items-center gap-3"
      : "inline-flex";

  return (
    <Link
      ref={wrapperRef}
      href={href}
      className={`${variantClass} ${hoverClass} ${revealTransition} ${className}`}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      {...props}
    >
      <div ref={innerRef} className={`${innerLayout} will-change-transform`}>
        <GlitchLabel active={glitching} onComplete={handleGlitchComplete}>
          {children}
        </GlitchLabel>
        {endAdornment}
      </div>
    </Link>
  );
}
