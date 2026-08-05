import { BRAND_NAME } from "@/lib/legal/constants";
import { getEmailSiteUrl } from "@/lib/env/public";
import { wrapEmailHtml } from "@/lib/email/templates/base";

export function buildWelcomeEmailHtml(customerName: string): string {
  const name = customerName.trim() || "there";

  return wrapEmailHtml({
    previewText: `Welcome to ${BRAND_NAME} — you're in.`,
    heading: "Welcome to the underground",
    bodyHtml: `
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#cccccc;">
        Hey ${name},
      </p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#cccccc;">
        Your ${BRAND_NAME} account is ready. You're now on the list for limited streetwear drops,
        order updates, and archive access.
      </p>
      <p style="margin:0;font-size:15px;line-height:1.7;color:#cccccc;">
        When the next drop goes live, you'll be first to know.
      </p>
    `,
    ctaLabel: "Shop the drop",
    ctaHref: `${getEmailSiteUrl()}/shop`,
  });
}

export function buildWelcomeEmailSubject(): string {
  return `Welcome to ${BRAND_NAME}`;
}
