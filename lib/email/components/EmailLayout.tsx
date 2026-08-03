import type { ReactNode } from "react";
import { emailStyles, emailStylesheet } from "@/lib/email/styles/email-styles";

interface EmailLayoutProps {
  previewText: string;
  title?: string;
  children: ReactNode;
}

export function EmailLayout({ previewText, title, children }: EmailLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {title ? <title>{title}</title> : null}
        <style dangerouslySetInnerHTML={{ __html: emailStylesheet }} />
      </head>
      <body style={emailStyles.body}>
        <span style={emailStyles.preview}>{previewText}</span>
        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          className="email-outer"
          style={emailStyles.outerTable}
        >
          <tbody>
            <tr>
              <td align="center">
                <table
                  role="presentation"
                  width="100%"
                  cellPadding={0}
                  cellSpacing={0}
                  className="email-container"
                  style={emailStyles.container}
                >
                  <tbody>{children}</tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
