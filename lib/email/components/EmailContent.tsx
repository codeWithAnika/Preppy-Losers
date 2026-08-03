import type { ReactNode } from "react";
import { emailStyles } from "@/lib/email/styles/email-styles";

interface EmailContentProps {
  heading: string;
  children: ReactNode;
}

export function EmailContent({ heading, children }: EmailContentProps) {
  return (
    <tr>
      <td className="email-content" style={emailStyles.content}>
        <h1 className="email-heading" style={emailStyles.heading}>
          {heading}
        </h1>
        {children}
      </td>
    </tr>
  );
}
