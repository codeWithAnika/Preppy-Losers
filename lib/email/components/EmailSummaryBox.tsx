import type { ReactNode } from "react";
import { emailStyles } from "@/lib/email/styles/email-styles";

interface EmailSummaryBoxProps {
  children: ReactNode;
}

export function EmailSummaryBox({ children }: EmailSummaryBoxProps) {
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      className="email-summary-box"
      style={emailStyles.summaryBox}
    >
      <tbody>{children}</tbody>
    </table>
  );
}

interface EmailSummaryRowProps {
  label: string;
  value: ReactNode;
}

export function EmailSummaryRow({ label, value }: EmailSummaryRowProps) {
  return (
    <tr className="email-summary-row" style={emailStyles.summaryRow}>
      <td className="email-summary-label" style={emailStyles.summaryLabel}>
        {label}
      </td>
      <td>{value}</td>
    </tr>
  );
}
