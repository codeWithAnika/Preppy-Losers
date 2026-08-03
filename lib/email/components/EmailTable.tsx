import type { ReactNode } from "react";
import { emailStyles } from "@/lib/email/styles/email-styles";

interface EmailTableProps {
  children: ReactNode;
}

export function EmailTable({ children }: EmailTableProps) {
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      className="email-table"
      style={emailStyles.table}
    >
      <tbody>{children}</tbody>
    </table>
  );
}

interface EmailTableRowProps {
  label: ReactNode;
  value: ReactNode;
  meta?: ReactNode;
}

export function EmailTableRow({ label, value, meta }: EmailTableRowProps) {
  return (
    <tr>
      <td className="email-table-cell" style={emailStyles.tableCell}>
        {label}
        {meta ? <div style={emailStyles.itemMeta}>{meta}</div> : null}
      </td>
      <td
        className="email-table-cell-right"
        style={emailStyles.tableCellRight}
        align="right"
      >
        {value}
      </td>
    </tr>
  );
}

interface EmailTableTotalProps {
  label: string;
  value: string;
}

export function EmailTableTotal({ label, value }: EmailTableTotalProps) {
  return (
    <tr>
      <td style={emailStyles.tableTotalLabel}>{label}</td>
      <td style={emailStyles.tableTotalValue} align="right">
        {value}
      </td>
    </tr>
  );
}
