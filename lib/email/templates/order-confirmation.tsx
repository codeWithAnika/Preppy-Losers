import "server-only";

import { BRAND_NAME } from "@/lib/legal/constants";
import { getSiteUrl } from "@/lib/env/public";
import {
  EmailBadge,
  EmailButton,
  EmailContent,
  EmailFooter,
  EmailHeader,
  EmailLayout,
  EmailSummaryBox,
  EmailSummaryRow,
  EmailTable,
  EmailTableRow,
  EmailTableTotal,
} from "@/lib/email/components";
import { emailStyles } from "@/lib/email/styles/email-styles";
import type {
  OrderConfirmationEmailProps,
  ShippingAddressDisplay,
} from "@/lib/email/types/order-email";
import { formatInr } from "@/lib/email/utils/format-inr";

export type {
  OrderConfirmationEmailProps,
  OrderEmailItem,
  ShippingAddressDisplay,
} from "@/lib/email/types/order-email";

/** Legacy shape used by admin-new-order HTML builder. */
export interface OrderConfirmationEmailData {
  customerName: string;
  orderRef: string;
  paymentId?: string;
  amountInr: number;
  items: OrderConfirmationEmailProps["items"];
  shippingLine?: string;
}

function formatShippingAddress(address: ShippingAddressDisplay): string[] {
  const lines = [
    address.line1,
    address.line2,
    `${address.city}, ${address.state} ${address.pincode}`,
  ].filter(Boolean) as string[];

  if (address.phone) {
    lines.push(`Phone: ${address.phone}`);
  }

  return lines;
}

export function OrderConfirmationEmail({
  customerName,
  orderRef,
  paymentId,
  amountInr,
  items,
  shippingAddress,
  previewText,
}: OrderConfirmationEmailProps) {
  const name = customerName.trim() || "Customer";
  const resolvedPreview =
    previewText ?? `Your ${BRAND_NAME} order ${orderRef} is confirmed.`;
  const siteUrl = getSiteUrl();
  const shippingLines = shippingAddress
    ? formatShippingAddress(shippingAddress)
    : null;

  return (
    <EmailLayout
      previewText={resolvedPreview}
      title={`Order confirmed — ${orderRef}`}
    >
      <EmailHeader />
      <EmailContent heading="Order confirmed">
        <p className="email-text" style={emailStyles.text}>
          Hi {name}, thanks for your order. Payment was received successfully
          and we&apos;re preparing your items.
        </p>

        <EmailSummaryBox>
          <EmailSummaryRow
            label="Order ref"
            value={<strong style={emailStyles.textStrong}>{orderRef}</strong>}
          />
          {paymentId ? (
            <EmailSummaryRow label="Payment ID" value={paymentId} />
          ) : null}
          <EmailSummaryRow
            label="Status"
            value={<EmailBadge variant="success">Paid</EmailBadge>}
          />
          <EmailSummaryRow
            label="Payment"
            value="Confirmed via Razorpay"
          />
        </EmailSummaryBox>

        <div className="email-section" style={emailStyles.section}>
          <p
            className="email-text-small"
            style={{ ...emailStyles.textSmall, marginBottom: 12 }}
          >
            Order summary
          </p>
          <EmailTable>
            {items.map((item) => (
              <EmailTableRow
                key={`${item.productName}-${item.size}-${item.quantity}`}
                label={item.productName}
                meta={`Size ${item.size} × ${item.quantity}`}
                value={formatInr(item.lineTotalInr)}
              />
            ))}
            <EmailTableTotal label="Total" value={formatInr(amountInr)} />
          </EmailTable>
        </div>

        {shippingLines ? (
          <div className="email-section" style={emailStyles.section}>
            <p
              className="email-text-small"
              style={{ ...emailStyles.textSmall, marginBottom: 8 }}
            >
              <strong style={emailStyles.textStrong}>Shipping to</strong>
            </p>
            {shippingLines.map((line) => (
              <p
                key={line}
                className="email-text-small"
                style={{ ...emailStyles.textSmall, margin: "0 0 4px" }}
              >
                {line}
              </p>
            ))}
          </div>
        ) : null}

        <p
          className="email-text"
          style={{ ...emailStyles.text, marginBottom: 0 }}
        >
          We&apos;ll notify you when your order ships. You can review your order
          history anytime in your account.
        </p>

        <EmailButton href={`${siteUrl}/account`}>View account</EmailButton>
        <EmailButton href={`${siteUrl}/shop`} variant="secondary">
          Continue shopping
        </EmailButton>
      </EmailContent>
      <EmailFooter />
    </EmailLayout>
  );
}

export function buildOrderConfirmationSubject(orderRef: string): string {
  return `Order confirmed — ${orderRef} | ${BRAND_NAME}`;
}
