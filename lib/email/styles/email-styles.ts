import type { CSSProperties } from "react";

export const EMAIL_COLORS = {
  brand: "#8b1e1e",
  bg: "#0a0a0a",
  surface: "#111111",
  surfaceRaised: "#1a1a1a",
  border: "#222222",
  text: "#f5f5f5",
  textSecondary: "#cccccc",
  textMuted: "#888888",
  success: "#4ade80",
  warning: "#fbbf24",
  info: "#60a5fa",
} as const;

/** Reusable class → inline style map (inline styles are the email-safe default). */
export const emailStyles = {
  body: {
    margin: 0,
    padding: 0,
    backgroundColor: EMAIL_COLORS.bg,
    fontFamily: "Inter, Segoe UI, Helvetica, Arial, sans-serif",
  } satisfies CSSProperties,

  preview: {
    display: "none",
    maxHeight: 0,
    overflow: "hidden",
  } satisfies CSSProperties,

  outerTable: {
    backgroundColor: EMAIL_COLORS.bg,
    padding: "32px 16px",
  } satisfies CSSProperties,

  container: {
    maxWidth: 560,
    width: "100%",
    backgroundColor: EMAIL_COLORS.surface,
    border: `1px solid ${EMAIL_COLORS.border}`,
  } satisfies CSSProperties,

  header: {
    padding: "32px 28px 16px",
    borderBottom: `1px solid ${EMAIL_COLORS.border}`,
  } satisfies CSSProperties,

  brand: {
    margin: 0,
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: "0.2em",
    textTransform: "uppercase" as const,
    color: EMAIL_COLORS.text,
  } satisfies CSSProperties,

  content: {
    padding: 28,
    color: EMAIL_COLORS.text,
  } satisfies CSSProperties,

  heading: {
    margin: "0 0 20px",
    fontSize: 22,
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    color: EMAIL_COLORS.text,
  } satisfies CSSProperties,

  section: {
    margin: "0 0 24px",
  } satisfies CSSProperties,

  text: {
    margin: "0 0 16px",
    fontSize: 15,
    lineHeight: 1.7,
    color: EMAIL_COLORS.textSecondary,
  } satisfies CSSProperties,

  textSmall: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.6,
    color: EMAIL_COLORS.textMuted,
  } satisfies CSSProperties,

  textStrong: {
    color: EMAIL_COLORS.textSecondary,
    fontWeight: 600,
  } satisfies CSSProperties,

  button: {
    display: "inline-block",
    backgroundColor: EMAIL_COLORS.brand,
    color: "#ffffff",
    textDecoration: "none",
    padding: "14px 28px",
    fontSize: 12,
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    fontWeight: 600,
    borderRadius: 0,
  } satisfies CSSProperties,

  buttonSecondary: {
    display: "inline-block",
    backgroundColor: "transparent",
    color: EMAIL_COLORS.text,
    textDecoration: "none",
    padding: "12px 24px",
    fontSize: 12,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    fontWeight: 600,
    border: `1px solid ${EMAIL_COLORS.border}`,
  } satisfies CSSProperties,

  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    margin: "0 0 8px",
  } satisfies CSSProperties,

  tableCell: {
    padding: "12px 0",
    borderBottom: `1px solid ${EMAIL_COLORS.border}`,
    fontSize: 14,
    color: EMAIL_COLORS.textSecondary,
    verticalAlign: "top" as const,
  } satisfies CSSProperties,

  tableCellRight: {
    padding: "12px 0",
    borderBottom: `1px solid ${EMAIL_COLORS.border}`,
    fontSize: 14,
    color: EMAIL_COLORS.textSecondary,
    textAlign: "right" as const,
    whiteSpace: "nowrap" as const,
    verticalAlign: "top" as const,
  } satisfies CSSProperties,

  tableTotalLabel: {
    padding: "16px 0 0",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: EMAIL_COLORS.text,
  } satisfies CSSProperties,

  tableTotalValue: {
    padding: "16px 0 0",
    fontSize: 16,
    fontWeight: 600,
    color: EMAIL_COLORS.text,
    textAlign: "right" as const,
  } satisfies CSSProperties,

  badge: {
    display: "inline-block",
    padding: "4px 10px",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    borderRadius: 2,
  } satisfies CSSProperties,

  badgeSuccess: {
    backgroundColor: "rgba(74, 222, 128, 0.12)",
    color: EMAIL_COLORS.success,
    border: `1px solid rgba(74, 222, 128, 0.35)`,
  } satisfies CSSProperties,

  badgeWarning: {
    backgroundColor: "rgba(251, 191, 36, 0.12)",
    color: EMAIL_COLORS.warning,
    border: `1px solid rgba(251, 191, 36, 0.35)`,
  } satisfies CSSProperties,

  badgeInfo: {
    backgroundColor: "rgba(96, 165, 250, 0.12)",
    color: EMAIL_COLORS.info,
    border: `1px solid rgba(96, 165, 250, 0.35)`,
  } satisfies CSSProperties,

  summaryBox: {
    backgroundColor: EMAIL_COLORS.surfaceRaised,
    border: `1px solid ${EMAIL_COLORS.border}`,
    padding: "16px 18px",
    margin: "0 0 24px",
  } satisfies CSSProperties,

  summaryRow: {
    padding: "4px 0",
    fontSize: 13,
    color: EMAIL_COLORS.textSecondary,
  } satisfies CSSProperties,

  summaryLabel: {
    color: EMAIL_COLORS.textMuted,
    paddingRight: 12,
    verticalAlign: "top" as const,
    width: "38%",
  } satisfies CSSProperties,

  footer: {
    padding: "20px 28px 28px",
    borderTop: `1px solid ${EMAIL_COLORS.border}`,
    color: EMAIL_COLORS.textMuted,
    fontSize: 12,
    lineHeight: 1.6,
  } satisfies CSSProperties,

  footerLink: {
    color: EMAIL_COLORS.text,
    textDecoration: "none",
  } satisfies CSSProperties,

  footerLinkMuted: {
    color: EMAIL_COLORS.textMuted,
    textDecoration: "none",
  } satisfies CSSProperties,

  itemMeta: {
    fontSize: 12,
    color: EMAIL_COLORS.textMuted,
  } satisfies CSSProperties,

  ctaRow: {
    margin: "32px 0 0",
  } satisfies CSSProperties,
} as const;

/** Embedded stylesheet for clients that support `<style>` (mobile overrides). */
export const emailStylesheet = `
  .email-container { max-width: 560px !important; width: 100% !important; }
  .email-content { padding: 28px !important; }
  .email-button { display: inline-block !important; text-align: center !important; }
  .email-table-cell { word-break: break-word !important; }
  @media only screen and (max-width: 600px) {
    .email-outer { padding: 16px 8px !important; }
    .email-content { padding: 20px 16px !important; }
    .email-header { padding: 24px 16px 12px !important; }
    .email-footer { padding: 16px 16px 24px !important; }
    .email-button {
      display: block !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    .email-summary-label {
      display: block !important;
      width: 100% !important;
      padding-bottom: 2px !important;
    }
    .email-table-cell-right {
      text-align: left !important;
      padding-top: 0 !important;
    }
  }
`;
