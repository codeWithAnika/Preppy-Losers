import Image, { type ImageProps } from "next/image";

type RotatingLogoBadgeProps = Omit<ImageProps, "src" | "alt"> & {
  src?: string;
  alt?: string;
};

/** Circular badge logo with continuous 20s rotation (static when reduced motion). */
export function RotatingLogoBadge({
  src = "/logo-badge.webp",
  alt = "Preppy Losers",
  className,
  ...props
}: RotatingLogoBadgeProps) {
  return (
    <div className="logo-badge-spin inline-flex will-change-transform">
      <Image
        src={src}
        alt={alt}
        className={className}
        {...props}
      />
    </div>
  );
}
