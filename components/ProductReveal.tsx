"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { gsap, registerGSAP } from "@/lib/animations/gsap";
import { shouldDisableScrollEffects } from "@/lib/animations/scroll-utils";
import { initPeriodicBgGlitch } from "@/lib/product-reveal-bg-glitch";
import { MagneticGlitchCTA } from "@/components/ui/MagneticGlitchCTA";

const BACKGROUND_IMAGE = "/background.webp";
/** Generic homepage product placeholder — not tied to any active drop. */
const PRODUCT_IMAGE = "/product-placeholder.webp";

/** Warehouse layer opacity is fixed at 1 — darkness comes from filter only. */
const BG_LAYER_OPACITY = 1;

const SCROLL_TRIGGER_ID = "product-reveal-pin";
const SCROLL_START = "top top";

/** Pin distance scales with total sequence length (~1.75× prior pacing). */
const SEQUENCE_PACE = 1.75;
const SCROLL_END = `+=${Math.round(450 * SEQUENCE_PACE)}%`;

const DARKNESS_DURATION = 1.8;
const GRAIN_OPACITY = 0.08;

const FLASH = {
  RISE: 0.14,
  HOLD: 0.22,
  FADE: 0.2,
  PEAK_FLASH: 0.28,
  PEAK_BLOOM: 0.15,
  BG_SETTLE: 2,
} as const;

/** Breathing room after flash settles, before product light reveal. */
const POST_FLASH_BREATHE = 1.5;

const LIGHT_REVEAL_STEPS = [
  { y: 12, w: 46, duration: 1.1 },
  { y: 26, w: 64, duration: 1.1 },
  { y: 46, w: 98, duration: 1.15 },
  { y: 64, w: 100, duration: 1.1 },
  { y: 100, w: 100, duration: 1.3 },
] as const;

/** Hold on fully revealed product before atmosphere recedes. */
const PRE_FINAL_HOLD = 1.2;

const BG_RECEDE = {
  DURATION: 2.25,
} as const;

const ATMOSPHERE = {
  FADE_IN: 1.65,
  FOG_OPACITY: 0.08,
  DUST_OPACITY: 0.5,
} as const;

const HOLD = {
  DURATION: 9,
  PUSH_SCALE: 1.03,
} as const;

const PRODUCT_HEIGHT_VH = 84;
const DUST_COUNT = 6;

const FLASH_WARM = "rgba(255, 248, 238, 0.52)";
const BLOOM_GRADIENT =
  "radial-gradient(circle at center, rgba(255, 244, 230, 0.22) 0%, transparent 58%)";

const GRAIN_TEXTURE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const EASE = {
  cinematic: "power3.inOut",
  flashIn: "power3.in",
  flashOut: "power3.out",
  dolly: "power1.inOut",
  hold: "power2.inOut",
} as const;

const MASK_BAND = 8;
const MASK_SOFT = MASK_BAND * 0.4;
const MASK_FADE = MASK_BAND * 0.65;

const PRODUCT_MASK_STYLE = {
  WebkitMaskImage: `linear-gradient(to bottom, black 0%, black calc(var(--reveal-y, 0) * 1% - ${MASK_BAND}%), rgba(0,0,0,0.42) calc(var(--reveal-y, 0) * 1% - ${MASK_SOFT}%), transparent calc(var(--reveal-y, 0) * 1% + ${MASK_FADE}%)), linear-gradient(to right, transparent calc((100 - var(--reveal-w, 46)) * 0.5%), black calc((100 - var(--reveal-w, 46)) * 0.5% + 2%), black calc(100% - (100 - var(--reveal-w, 46)) * 0.5% - 2%), transparent calc(100% - (100 - var(--reveal-w, 46)) * 0.5%))`,
  maskImage: `linear-gradient(to bottom, black 0%, black calc(var(--reveal-y, 0) * 1% - ${MASK_BAND}%), rgba(0,0,0,0.42) calc(var(--reveal-y, 0) * 1% - ${MASK_SOFT}%), transparent calc(var(--reveal-y, 0) * 1% + ${MASK_FADE}%)), linear-gradient(to right, transparent calc((100 - var(--reveal-w, 46)) * 0.5%), black calc((100 - var(--reveal-w, 46)) * 0.5% + 2%), black calc(100% - (100 - var(--reveal-w, 46)) * 0.5% - 2%), transparent calc(100% - (100 - var(--reveal-w, 46)) * 0.5%))`,
  WebkitMaskComposite: "source-in",
  maskComposite: "intersect",
} as const;

type BgFilter = {
  blur: number;
  brightness: number;
  saturate: number;
};

const BG_INTRO_FILTER: BgFilter = { blur: 6, brightness: 0.32, saturate: 0.68 };
const BG_FLASH_FILTER: BgFilter = { blur: 0, brightness: 1, saturate: 0.88 };
const BG_SETTLE_FILTER: BgFilter = { blur: 6, brightness: 0.35, saturate: 0.65 };
const BG_FINAL_FILTER: BgFilter = { blur: 7, brightness: 0.28, saturate: 0.62 };

const VIGNETTE_INTRO = 0.22;
const VIGNETTE_FINAL = 0.4;

/** Soft edge framing only — center stays fully transparent */
const VIGNETTE_GRADIENT =
  "radial-gradient(ellipse 92% 85% at 50% 46%, transparent 52%, rgba(0,0,0,0.16) 78%, rgba(0,0,0,0.42) 100%)";

/** z-index stack: warehouse → flash → bloom → vignette → fog → dust → grain → product */
const Z = {
  WAREHOUSE: 0,
  FLASH: 2,
  BLOOM: 3,
  VIGNETTE: 4,
  FOG: 5,
  DUST: 6,
  GRAIN: 7,
  PRODUCT: 10,
  CTA: 15,
} as const;

function syncCtaPointerEvents(el: HTMLElement, opacity: number) {
  el.style.pointerEvents = opacity > 0.15 ? "auto" : "none";
}

function applyBgFilter(el: HTMLElement, filter: BgFilter) {
  el.style.opacity = String(BG_LAYER_OPACITY);
  el.style.visibility = "visible";
  el.style.display = "block";
  el.style.filter = `blur(${filter.blur}px) brightness(${filter.brightness}) saturate(${filter.saturate})`;
}

function lightBandGradient(y: number): string {
  const edge = Math.max(0, y);
  const warm = y < 22 ? 0.09 : 0.11;
  return `linear-gradient(to bottom, transparent ${edge - 5}%, rgba(245,238,228,${warm}) ${edge}%, rgba(245,238,228,0.025) ${edge + 2}%, transparent ${edge + 7}%)`;
}

export function ProductReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const glitchRedRef = useRef<HTMLDivElement>(null);
  const glitchBlueRef = useRef<HTMLDivElement>(null);
  const glitchSliceRef = useRef<HTMLDivElement>(null);
  const glitchSliceInnerRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);
  const fogRef = useRef<HTMLDivElement>(null);
  const dustWrapRef = useRef<HTMLDivElement>(null);
  const productMaskRef = useRef<HTMLDivElement>(null);
  const lightBandRef = useRef<HTMLDivElement>(null);
  const ctaWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGSAP();

    const section = sectionRef.current;
    const scene = sceneRef.current;
    const bg = bgRef.current;
    const flash = flashRef.current;
    const bloom = bloomRef.current;
    const fog = fogRef.current;
    const dustWrap = dustWrapRef.current;
    const productMask = productMaskRef.current;
    const lightBand = lightBandRef.current;
    const vignette = vignetteRef.current;
    const ctaWrap = ctaWrapRef.current;

    if (
      !section || !scene || !bg || !vignette || !flash || !bloom || !fog ||
      !dustWrap || !productMask || !lightBand || !ctaWrap
    ) {
      return;
    }

    const fadeInShopCta = () => {
      gsap.fromTo(
        ctaWrap,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: "power2.out",
          onUpdate: function () {
            syncCtaPointerEvents(ctaWrap, Number(gsap.getProperty(ctaWrap, "opacity")) || 0);
          },
        }
      );
    };

    const useSimplifiedReveal =
      shouldDisableScrollEffects() ||
      window.matchMedia("(max-width: 768px)").matches;

    if (useSimplifiedReveal) {
      const ctx = gsap.context(() => {
        gsap.set(ctaWrap, { opacity: 0, y: 14 });
        syncCtaPointerEvents(ctaWrap, 0);

        applyBgFilter(bg, BG_FINAL_FILTER);
        gsap.set(vignette, { opacity: VIGNETTE_FINAL });
        gsap.set(fog, { opacity: ATMOSPHERE.FOG_OPACITY });
        gsap.set(dustWrap, { opacity: ATMOSPHERE.DUST_OPACITY * 0.6 });
        gsap.set(productMask, {
          "--reveal-y": 100,
          "--reveal-w": 100,
        });
        gsap.set(scene, { scale: 1, force3D: true });

        gsap.fromTo(
          scene,
          { opacity: 0.35 },
          {
            opacity: 1,
            duration: 1.1,
            ease: "power2.out",
            onComplete: fadeInShopCta,
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }, section);

      return () => ctx.revert();
    }

    const syncLightBand = (y: number) => {
      lightBand.style.background = lightBandGradient(y);
      lightBand.style.opacity = String(Math.min(0.85, Math.max(0, y / 18) * 0.7));
    };

    const ctx = gsap.context(() => {
      const bgFilter = { ...BG_INTRO_FILTER };

      gsap.set(scene, { scale: 1, force3D: true });
      applyBgFilter(bg, BG_INTRO_FILTER);
      gsap.set(vignette, { opacity: VIGNETTE_INTRO });
      gsap.set(flash, { opacity: 0 });
      gsap.set(bloom, { opacity: 0 });
      gsap.set(fog, { opacity: 0 });
      gsap.set(dustWrap, { opacity: 0 });
      gsap.set(productMask, { "--reveal-y": 0, "--reveal-w": LIGHT_REVEAL_STEPS[0].w });
      gsap.set(lightBand, { opacity: 0 });
      syncLightBand(0);
      gsap.set(ctaWrap, { opacity: 0, y: 14 });
      syncCtaPointerEvents(ctaWrap, 0);

      const masterTl = gsap.timeline({
        scrollTrigger: {
          id: SCROLL_TRIGGER_ID,
          trigger: section,
          start: SCROLL_START,
          end: SCROLL_END,
          pin: true,
          pinSpacing: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      masterTl.addLabel("darkness").to({}, { duration: DARKNESS_DURATION });

      const flashAt = masterTl.duration();
      masterTl
        .addLabel("flash", flashAt)
        .to(flash, { opacity: FLASH.PEAK_FLASH, duration: FLASH.RISE, ease: EASE.flashIn }, flashAt)
        .to(bloom, { opacity: FLASH.PEAK_BLOOM, duration: FLASH.RISE, ease: EASE.flashIn }, flashAt)
        .to(bgFilter, {
          blur: BG_FLASH_FILTER.blur,
          brightness: BG_FLASH_FILTER.brightness,
          saturate: BG_FLASH_FILTER.saturate,
          duration: FLASH.RISE,
          ease: EASE.flashIn,
          onUpdate: () => applyBgFilter(bg, bgFilter),
        }, flashAt)
        .to(flash, { opacity: FLASH.PEAK_FLASH * 0.82, duration: FLASH.HOLD, ease: EASE.hold })
        .to(bloom, { opacity: FLASH.PEAK_BLOOM * 0.55, duration: FLASH.HOLD, ease: EASE.hold }, "<")
        .to(flash, { opacity: 0, duration: FLASH.FADE, ease: EASE.flashOut })
        .to(bloom, { opacity: 0, duration: FLASH.FADE, ease: EASE.flashOut }, "<")
        .to(bgFilter, {
          blur: BG_SETTLE_FILTER.blur,
          brightness: BG_SETTLE_FILTER.brightness,
          saturate: BG_SETTLE_FILTER.saturate,
          duration: FLASH.BG_SETTLE,
          ease: EASE.cinematic,
          onUpdate: () => applyBgFilter(bg, bgFilter),
        }, `-=${FLASH.FADE * 0.55}`);

      masterTl
        .addLabel("postFlashBreathe")
        .to({}, { duration: POST_FLASH_BREATHE });

      masterTl.addLabel("lightReveal");
      LIGHT_REVEAL_STEPS.forEach((step) => {
        masterTl.to(
          productMask,
          {
            "--reveal-y": step.y,
            "--reveal-w": step.w,
            duration: step.duration,
            ease: EASE.cinematic,
            onUpdate: () => {
              const y =
                parseFloat(getComputedStyle(productMask).getPropertyValue("--reveal-y")) || 0;
              syncLightBand(y);
            },
          }
        );
      });

      masterTl.addLabel("preFinalHold").to({}, { duration: PRE_FINAL_HOLD });

      masterTl
        .addLabel("bgRecede")
        .to(bgFilter, {
          blur: BG_FINAL_FILTER.blur,
          brightness: BG_FINAL_FILTER.brightness,
          saturate: BG_FINAL_FILTER.saturate,
          duration: BG_RECEDE.DURATION,
          ease: EASE.cinematic,
          onUpdate: () => applyBgFilter(bg, bgFilter),
        }, `-=${BG_RECEDE.DURATION * 0.35}`)
        .to(vignette, { opacity: VIGNETTE_FINAL, duration: BG_RECEDE.DURATION, ease: EASE.cinematic }, `-=${BG_RECEDE.DURATION * 0.35}`)
        .to(fog, { opacity: ATMOSPHERE.FOG_OPACITY, duration: ATMOSPHERE.FADE_IN, ease: EASE.cinematic }, "<0.2")
        .to(dustWrap, { opacity: ATMOSPHERE.DUST_OPACITY, duration: ATMOSPHERE.FADE_IN, ease: EASE.cinematic }, "<0.25");

      masterTl.to(
        ctaWrap,
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: "power2.out",
          onUpdate: function () {
            syncCtaPointerEvents(ctaWrap, Number(gsap.getProperty(ctaWrap, "opacity")) || 0);
          },
        },
        "bgRecede+=0.2"
      );

      masterTl.addLabel("hold").to(scene, {
        scale: HOLD.PUSH_SCALE,
        duration: HOLD.DURATION,
        ease: EASE.dolly,
        force3D: true,
      });
    }, section);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const bg = bgRef.current;
    const red = glitchRedRef.current;
    const blue = glitchBlueRef.current;
    const slice = glitchSliceRef.current;
    const sliceInner = glitchSliceInnerRef.current;
    const section = sectionRef.current;

    if (!bg || !red || !blue || !slice || !sliceInner) return;

    return initPeriodicBgGlitch(
      { container: bg, red, blue, slice, sliceInner },
      section
    );
  }, []);

  return (
    <section
      ref={sectionRef}
      id="product-reveal"
      className="relative min-h-screen w-full overflow-hidden"
      aria-label="Product reveal"
    >
      <div
        ref={sceneRef}
        className="relative h-screen w-full"
        style={{ transformOrigin: "50% 46%", willChange: "transform" }}
      >
        {/* Layer 0 — permanent warehouse environment (single image, filter-only darkening) */}
        <div
          ref={bgRef}
          className="absolute inset-0 h-full w-full overflow-hidden"
          style={{
            zIndex: Z.WAREHOUSE,
            opacity: BG_LAYER_OPACITY,
            visibility: "visible",
            filter: `blur(${BG_INTRO_FILTER.blur}px) brightness(${BG_INTRO_FILTER.brightness}) saturate(${BG_INTRO_FILTER.saturate})`,
            willChange: "filter",
          }}
        >
          <Image src={BACKGROUND_IMAGE} alt="" fill className="object-cover" sizes="100vw" priority />

          <div
            ref={glitchRedRef}
            className="pointer-events-none absolute inset-0 opacity-0 mix-blend-screen"
            style={{
              backgroundImage: `url(${BACKGROUND_IMAGE})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter:
                "sepia(1) saturate(8) hue-rotate(-18deg) brightness(1.05) contrast(1.05)",
            }}
            aria-hidden="true"
          />
          <div
            ref={glitchBlueRef}
            className="pointer-events-none absolute inset-0 opacity-0 mix-blend-screen"
            style={{
              backgroundImage: `url(${BACKGROUND_IMAGE})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter:
                "sepia(1) saturate(8) hue-rotate(195deg) brightness(1.05) contrast(1.05)",
            }}
            aria-hidden="true"
          />
          <div
            ref={glitchSliceRef}
            className="pointer-events-none absolute inset-0 overflow-hidden opacity-0"
            aria-hidden="true"
          >
            <div
              ref={glitchSliceInnerRef}
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${BACKGROUND_IMAGE})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </div>
        </div>

        {/* Layers 2–7 — atmosphere above warehouse, below product */}
        <div
          ref={flashRef}
          className="pointer-events-none absolute inset-0 opacity-0"
          style={{ zIndex: Z.FLASH, backgroundColor: FLASH_WARM }}
          aria-hidden="true"
        />
        <div
          ref={bloomRef}
          className="pointer-events-none absolute inset-0 opacity-0"
          style={{ zIndex: Z.BLOOM, background: BLOOM_GRADIENT }}
          aria-hidden="true"
        />
        <div
          ref={vignetteRef}
          className="pointer-events-none absolute inset-0"
          style={{ zIndex: Z.VIGNETTE, background: VIGNETTE_GRADIENT, opacity: VIGNETTE_INTRO }}
          aria-hidden="true"
        />
        <div
          ref={fogRef}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%] opacity-0"
          style={{ zIndex: Z.FOG }}
          aria-hidden="true"
        >
          <div className="absolute bottom-[8%] left-[18%] h-24 w-64 rounded-full bg-white/[0.03] blur-3xl" />
          <div className="absolute bottom-[4%] left-[42%] h-32 w-72 rounded-full bg-gray-200/[0.028] blur-3xl" />
          <div className="absolute bottom-[10%] right-[16%] h-20 w-52 rounded-full bg-white/[0.025] blur-3xl" />
        </div>
        <div
          ref={dustWrapRef}
          className="pointer-events-none absolute inset-0 opacity-0"
          style={{ zIndex: Z.DUST }}
          aria-hidden="true"
        >
          {Array.from({ length: DUST_COUNT }).map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white/20"
              style={{
                width: 1 + (i % 2),
                height: 1 + (i % 2),
                left: `${40 + ((i * 3.6) % 20)}%`,
                top: `${38 + ((i * 2.8) % 22)}%`,
              }}
            />
          ))}
        </div>
        <div
          className="pointer-events-none absolute inset-0 mix-blend-overlay"
          style={{
            zIndex: Z.GRAIN,
            backgroundImage: GRAIN_TEXTURE,
            backgroundSize: "cover",
            opacity: GRAIN_OPACITY,
          }}
          aria-hidden="true"
        />

        {/* Layer 10 — product always above warehouse and atmosphere */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ zIndex: Z.PRODUCT }}
        >
          <div
            className="relative"
            style={{
              height: `${PRODUCT_HEIGHT_VH}vh`,
              width: `calc(${PRODUCT_HEIGHT_VH}vh * 0.75)`,
              maxWidth: "92vw",
            }}
          >
            <div
              ref={productMaskRef}
              className="relative h-full w-full"
              style={{
                ...PRODUCT_MASK_STYLE,
                ["--reveal-y" as string]: 0,
                ["--reveal-w" as string]: LIGHT_REVEAL_STEPS[0].w,
              }}
            >
              <Image
                src={PRODUCT_IMAGE}
                alt="Product placeholder"
                fill
                className="object-contain drop-shadow-[0_24px_80px_rgba(255,255,255,0.12)]"
                sizes="84vh"
                priority
              />
            </div>
            <div
              ref={lightBandRef}
              className="pointer-events-none absolute inset-0 z-[2] opacity-0 mix-blend-soft-light"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Shop CTA — fades in at atmosphere/hold phase (scrub-synced on desktop) */}
        <div
          ref={ctaWrapRef}
          className="absolute inset-x-0 bottom-[7vh] flex justify-center opacity-0"
          style={{ zIndex: Z.CTA, pointerEvents: "none" }}
        >
          <MagneticGlitchCTA
            href="/shop"
            layout="stacked"
            revealed
            className="text-[10px] tracking-[0.35em] md:text-xs"
            endAdornment={
              <span
                className="block h-7 w-px bg-blood-red-bright transition-colors duration-[1.4s] ease-out"
                aria-hidden="true"
              />
            }
          >
            Shop The Drop
          </MagneticGlitchCTA>
        </div>
      </div>
    </section>
  );
}
