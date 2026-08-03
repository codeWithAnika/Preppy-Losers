/** Global SVG filters for distressed display type — mount once in root layout */
export function TextDistressFilter() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute h-0 w-0 overflow-hidden"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter
          id="pl-text-distress"
          x="-8%"
          y="-8%"
          width="116%"
          height="116%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.055"
            numOctaves={4}
            seed={3}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={4.5}
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          <feMorphology operator="erode" radius={0.35} in="displaced" result="eroded" />
          <feMorphology operator="dilate" radius={0.2} in="eroded" />
        </filter>
      </defs>
    </svg>
  );
}
