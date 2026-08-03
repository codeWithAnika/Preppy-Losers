import Image from "next/image";

/** Fixed ambient layers: rotating watermark (z-11) + film grain (z-12), above site-background-overlay (z-10). */
export function SiteAtmosphere() {
  return (
    <div className="pointer-events-none" aria-hidden="true">
      <div className="site-logo-watermark fixed inset-0 overflow-hidden">
        <div className="absolute left-[52%] top-[42%] -translate-x-1/2 -translate-y-1/2">
          <div className="logo-badge-spin-atmosphere will-change-transform">
            <Image
              src="/logo-badge.webp"
              alt=""
              width={480}
              height={480}
              className="h-[min(420px,88vw)] w-[min(420px,88vw)] max-w-none opacity-[0.24] sm:h-[min(480px,72vw)] sm:w-[min(480px,72vw)]"
            />
          </div>
        </div>
      </div>

      <div className="grain-overlay site-atmosphere-grain fixed inset-0" />
    </div>
  );
}
