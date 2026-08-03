interface BrandWordmarkProps {
  className?: string;
}

export function BrandWordmark({ className = "" }: BrandWordmarkProps) {
  return (
    <span
      className={["brand-wordmark", className].filter(Boolean).join(" ")}
      aria-label="Preppy Losers"
    >
      PREPPY LOSE
      <span className="brand-wordmark__flipped-r" aria-hidden="true">
        R
      </span>
      S
    </span>
  );
}
