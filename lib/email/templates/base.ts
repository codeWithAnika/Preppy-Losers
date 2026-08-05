import { BRAND_NAME, SUPPORT_EMAIL } from "@/lib/legal/constants";
import { getEmailSiteUrl } from "@/lib/env/public";

const BRAND_COLOR = "#8b1e1e";
const BG_COLOR = "#0a0a0a";
const TEXT_COLOR = "#f5f5f5";
const MUTED_COLOR = "#888888";

export function wrapEmailHtml(params: {
  previewText: string;
  heading: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaHref?: string;
}): string {
  const siteUrl = getEmailSiteUrl();
  const ctaBlock =
    params.ctaLabel && params.ctaHref
      ? `<p style="margin:32px 0 0;">
          <a href="${params.ctaHref}" style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;text-decoration:none;padding:14px 28px;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;">
            ${params.ctaLabel}
          </a>
        </p>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${params.heading}</title>
</head>
<body style="margin:0;padding:0;background:${BG_COLOR};font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;">${params.previewText}</span>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BG_COLOR};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#111111;border:1px solid #222;">
          <tr>
            <td style="padding:32px 28px 16px;border-bottom:1px solid #222;">
              <p style="margin:0;font-size:14px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${TEXT_COLOR};">${BRAND_NAME}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;color:${TEXT_COLOR};">
              <h1 style="margin:0 0 20px;font-size:22px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:${TEXT_COLOR};">${params.heading}</h1>
              ${params.bodyHtml}
              ${ctaBlock}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 28px;border-top:1px solid #222;color:${MUTED_COLOR};font-size:12px;line-height:1.6;">
              <p style="margin:0 0 8px;">Questions? Reply to this email or contact <a href="mailto:${SUPPORT_EMAIL}" style="color:${TEXT_COLOR};">${SUPPORT_EMAIL}</a></p>
              <p style="margin:0;"><a href="${siteUrl}" style="color:${MUTED_COLOR};">${siteUrl.replace(/^https?:\/\//, "")}</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
