import { BRAND_NAME } from "@/lib/legal/constants";
import { wrapEmailHtml } from "@/lib/email/templates/base";
import type { OrderConfirmationEmailData } from "@/lib/email/templates/order-confirmation";

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function buildAdminNewOrderEmailHtml(
  data: OrderConfirmationEmailData & { customerEmail: string }
): string {
  const itemList = data.items
    .map(
      (item) =>
        `<li style="margin:0 0 8px;color:#cccccc;">${item.productName} — Size ${item.size} × ${item.quantity} (${formatInr(item.lineTotalInr)})</li>`
    )
    .join("");

  return wrapEmailHtml({
    previewText: `New ${BRAND_NAME} order ${data.orderRef} — ${formatInr(data.amountInr)}`,
    heading: "New order placed",
    bodyHtml: `
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#cccccc;">
        A new paid order was placed on ${BRAND_NAME}.
      </p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 16px;font-size:14px;color:#cccccc;">
        <tr><td style="padding:4px 0;color:#888;">Customer</td><td style="padding:4px 0;">${data.customerName} (${data.customerEmail})</td></tr>
        <tr><td style="padding:4px 0;color:#888;">Order ref</td><td style="padding:4px 0;">${data.orderRef}</td></tr>
        ${data.paymentId ? `<tr><td style="padding:4px 0;color:#888;">Payment ID</td><td style="padding:4px 0;">${data.paymentId}</td></tr>` : ""}
        <tr><td style="padding:4px 0;color:#888;">Total</td><td style="padding:4px 0;font-weight:600;">${formatInr(data.amountInr)}</td></tr>
      </table>
      <ul style="margin:0 0 16px;padding-left:20px;">${itemList}</ul>
      ${data.shippingLine ? `<p style="margin:0;font-size:13px;color:#888;"><strong style="color:#ccc;">Ship to:</strong><br />${data.shippingLine}</p>` : ""}
    `,
  });
}

export function buildAdminNewOrderSubject(orderRef: string, amountInr: number): string {
  return `[${BRAND_NAME}] New order ${orderRef} — ${formatInr(amountInr)}`;
}
