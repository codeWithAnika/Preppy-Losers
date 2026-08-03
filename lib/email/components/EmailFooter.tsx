import { BRAND_NAME, SUPPORT_EMAIL } from "@/lib/legal/constants";
import { getSiteUrl } from "@/lib/env/public";
import { emailStyles } from "@/lib/email/styles/email-styles";

export function EmailFooter() {
  const siteUrl = getSiteUrl();
  const siteHost = siteUrl.replace(/^https?:\/\//, "");

  return (
    <tr>
      <td className="email-footer" style={emailStyles.footer}>
        <p style={{ margin: "0 0 8px" }}>
          Questions? Reply to this email or contact{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} style={emailStyles.footerLink}>
            {SUPPORT_EMAIL}
          </a>
        </p>
        <p style={{ margin: 0 }}>
          <a href={siteUrl} style={emailStyles.footerLinkMuted}>
            {siteHost}
          </a>
          {" · "}
          {BRAND_NAME}
        </p>
      </td>
    </tr>
  );
}
