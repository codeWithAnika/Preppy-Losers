import type { CSSProperties } from "react";
import { emailStyles } from "@/lib/email/styles/email-styles";

type EmailButtonVariant = "primary" | "secondary";

interface EmailButtonProps {
  href: string;
  children: string;
  variant?: EmailButtonVariant;
  style?: CSSProperties;
}

export function EmailButton({
  href,
  children,
  variant = "primary",
  style,
}: EmailButtonProps) {
  const baseStyle =
    variant === "secondary" ? emailStyles.buttonSecondary : emailStyles.button;

  return (
    <p className="email-button-row" style={emailStyles.ctaRow}>
      <a
        href={href}
        className="email-button"
        style={{ ...baseStyle, ...style }}
      >
        {children}
      </a>
    </p>
  );
}
