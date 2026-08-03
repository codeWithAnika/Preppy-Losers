import { gsap } from "@/lib/animations/gsap";

const MIN_INTERVAL_MS = 3000;
const MAX_INTERVAL_MS = 6000;
const MIN_GLITCH_S = 0.1;
const MAX_GLITCH_S = 0.2;

export interface BgGlitchLayerRefs {
  container: HTMLElement;
  red: HTMLElement;
  blue: HTMLElement;
  slice: HTMLElement;
  sliceInner: HTMLElement;
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function playGlitchMoment(layers: BgGlitchLayerRefs): void {
  const { container, red, blue, slice, sliceInner } = layers;

  const duration = randomBetween(MIN_GLITCH_S, MAX_GLITCH_S);
  const half = duration * 0.35;
  const redOffset = -randomBetween(2, 5);
  const blueOffset = randomBetween(2, 5);
  const bandTop = randomBetween(18, 72);
  const bandHeight = randomBetween(1.2, 3.5);
  const sliceJitter = (Math.random() > 0.5 ? 1 : -1) * randomBetween(4, 10);

  sliceInner.style.clipPath = `inset(${bandTop}% 0 ${100 - bandTop - bandHeight}% 0)`;

  gsap.killTweensOf([container, red, blue, slice, sliceInner]);

  gsap.set([red, blue, slice], { clearProps: "opacity,transform,x" });
  gsap.set(sliceInner, { clearProps: "x" });
  gsap.set(container, { clearProps: "opacity" });

  const tl = gsap.timeline();

  tl.set(red, { opacity: 0, x: 0 })
    .set(blue, { opacity: 0, x: 0 })
    .set(slice, { opacity: 0 })
    .set(sliceInner, { x: 0 })
    .to(
      red,
      { opacity: 0.72, x: redOffset, duration: half, ease: "power2.out" },
      0
    )
    .to(
      blue,
      { opacity: 0.72, x: blueOffset, duration: half, ease: "power2.out" },
      0
    )
    .to(
      slice,
      { opacity: 1, duration: half * 0.6, ease: "power2.out" },
      0
    )
    .to(
      sliceInner,
      { x: sliceJitter, duration: half * 0.5, ease: "steps(2)" },
      0
    )
    .to(
      container,
      { opacity: 0.9, duration: half * 0.45, ease: "power2.inOut" },
      half * 0.15
    )
    .to(
      container,
      { opacity: 1, duration: half * 0.55, ease: "power2.out" },
      half * 0.6
    )
    .to(
      sliceInner,
      { x: -sliceJitter * 0.6, duration: half * 0.4, ease: "steps(2)" },
      half * 0.5
    )
    .to(
      [red, blue, slice],
      { opacity: 0, duration: duration - half, ease: "power2.in" },
      half
    )
    .to(
      [red, blue],
      { x: 0, duration: duration - half, ease: "power2.in" },
      half
    )
    .to(
      sliceInner,
      { x: 0, duration: duration - half, ease: "power2.in" },
      half
    );
}

export function initPeriodicBgGlitch(
  layers: BgGlitchLayerRefs,
  root?: HTMLElement | null
): () => void {
  if (prefersReducedMotion()) {
    return () => undefined;
  }

  let timeoutId = 0;
  let visible = true;
  let disposed = false;

  const schedule = () => {
    window.clearTimeout(timeoutId);
    if (disposed || !visible) return;

    const delay = randomBetween(MIN_INTERVAL_MS, MAX_INTERVAL_MS);
    timeoutId = window.setTimeout(() => {
      if (!disposed && visible) {
        playGlitchMoment(layers);
      }
      schedule();
    }, delay);
  };

  let observer: IntersectionObserver | undefined;

  if (root) {
    observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !disposed) {
          schedule();
        } else {
          window.clearTimeout(timeoutId);
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(root);
  } else {
    schedule();
  }

  return () => {
    disposed = true;
    window.clearTimeout(timeoutId);
    observer?.disconnect();
    gsap.killTweensOf([
      layers.container,
      layers.red,
      layers.blue,
      layers.slice,
      layers.sliceInner,
    ]);
  };
}
