"use client";

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
  type ButtonHTMLAttributes,
} from "react";
import { gsap } from "@/lib/animations/gsap";
import { isTouchDevice } from "@/lib/animations/scroll-utils";

const MAGNETIC_RADIUS = 72;
const MAX_OFFSET = 10;

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

interface MagneticGlitchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "outline" | "solid";
}

export function MagneticGlitchButton({
  children,
  variant = "outline",
  className = "",
  disabled,
  type = "button",
  ...props
}: MagneticGlitchButtonProps) {
  const wrapperRef = useRef<HTMLButtonElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const inRangeRef = useRef(false);
  const touchRef = useRef(false);
  const [hovered, setHovered] = useState(false);
  const [glitching, setGlitching] = useState(false);

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
    if (touchRef.current || disabled) return;

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
  }, [disabled, snapBack]);

  const handleMouseEnter = () => {
    if (touchRef.current || disabled) return;
    setGlitching(true);
  };

  const handleGlitchComplete = () => {
    setGlitching(false);
    if (!disabled) setHovered(true);
  };

  const baseClass =
    variant === "outline"
      ? "relative block w-full border px-10 py-4 text-xs uppercase tracking-[0.3em] transition-colors duration-300"
      : "relative block w-full border px-10 py-4 text-xs uppercase tracking-[0.3em] transition-colors duration-300";

  const variantClass =
    variant === "outline"
      ? disabled
        ? "cursor-not-allowed border-white/15 text-foreground/30"
        : hovered
          ? "border-accent bg-foreground/10 text-foreground"
          : "border-foreground text-foreground"
      : disabled
        ? "cursor-not-allowed border-white/15 bg-white/5 text-foreground/30"
        : hovered
          ? "border-accent bg-accent/90 text-white"
          : "border-accent bg-accent text-white";

  return (
    <button
      ref={wrapperRef}
      type={type}
      disabled={disabled}
      className={`${baseClass} ${variantClass} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => {
        if (!disabled) setHovered(false);
      }}
      {...props}
    >
      <div ref={innerRef} className="inline-flex will-change-transform">
        <GlitchLabel active={glitching} onComplete={handleGlitchComplete}>
          {children}
        </GlitchLabel>
      </div>
    </button>
  );
}
