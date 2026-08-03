import type { CSSProperties } from "react";
import { emailStyles } from "@/lib/email/styles/email-styles";

type EmailBadgeVariant = "success" | "warning" | "info";

interface EmailBadgeProps {
  children: string;
  variant?: EmailBadgeVariant;
  style?: CSSProperties;
}

const variantStyles: Record<EmailBadgeVariant, CSSProperties> = {
  success: emailStyles.badgeSuccess,
  warning: emailStyles.badgeWarning,
  info: emailStyles.badgeInfo,
};

export function EmailBadge({
  children,
  variant = "success",
  style,
}: EmailBadgeProps) {
  return (
    <span
      className="email-badge"
      style={{ ...emailStyles.badge, ...variantStyles[variant], ...style }}
    >
      {children}
    </span>
  );
}
