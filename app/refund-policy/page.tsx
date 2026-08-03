import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { LegalSection } from "@/components/legal/LegalSection";
import {
  BRAND_NAME,
  RETURN_WAREHOUSE_ADDRESS,
  SUPPORT_EMAIL,
} from "@/lib/legal/constants";

export const metadata: Metadata = {
  title: "Refund Policy — PREPPY LOSERS",
  description:
    "Return, refund, and exchange policy for PREPPY LOSERS orders paid via Razorpay.",
};

const TOC = [
  { id: "order-cancellation", label: "Order Cancellation" },
  { id: "return-eligibility", label: "Return Eligibility" },
  { id: "non-returnable-items", label: "Non-Returnable Items" },
  { id: "damaged-products", label: "Damaged Products" },
  { id: "wrong-item", label: "Wrong Item Received" },
  { id: "refund-timeline", label: "Refund Timeline" },
  { id: "refund-method", label: "Refund Method" },
  { id: "exchange-process", label: "Exchange Process" },
  { id: "contact", label: "Contact Support" },
] as const;

export default function RefundPolicyPage() {
  return (
    <LegalLayout
      title="Refund Policy"
      breadcrumbLabel="Refund Policy"
      intro={`At ${BRAND_NAME}, we want you to love what you ordered. This Refund Policy explains when you can cancel an order, request a return or exchange, and how refunds are processed for purchases made on our website.`}
      toc={[...TOC]}
    >
      <LegalSection id="order-cancellation" title="Order Cancellation">
        <p>
          You may request cancellation of your order before it has been shipped.
          To cancel, email us at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with your
          order number and registered email address as soon as possible.
        </p>
        <p>
          If your order has already been packed or dispatched, cancellation may
          no longer be available. In that case, please refer to the return
          eligibility section below once you receive the delivery.
        </p>
        <p>
          {BRAND_NAME} reserves the right to cancel orders due to stock
          unavailability, payment issues, or suspected fraud. If we cancel your
          order after payment, a full refund will be initiated to your original
          payment method.
        </p>
      </LegalSection>

      <LegalSection id="return-eligibility" title="Return Eligibility">
        <p>
          We accept returns on eligible items within <strong>7 days</strong> of
          delivery, provided all of the following conditions are met:
        </p>
        <ul>
          <li>The item is unused, unworn, unwashed, and in original condition</li>
          <li>All original tags and labels are intact and attached</li>
          <li>The item is returned in its original packaging where applicable</li>
          <li>You contact us within the return window to initiate the request</li>
        </ul>
        <p>
          To start a return, email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with your
          order number, item details, and reason for return. We will review your
          request and provide return instructions if approved.
        </p>
        <p>
          Return shipping costs may apply unless the return is due to our error
          (such as a defective or incorrect item). Any applicable return shipping
          fee will be communicated before you send the item back.
        </p>
      </LegalSection>

      <LegalSection id="non-returnable-items" title="Non-Returnable Items">
        <p>The following are generally not eligible for return or exchange:</p>
        <ul>
          <li>Items marked as final sale or non-returnable at the time of purchase</li>
          <li>Products that show signs of wear, washing, alteration, or damage caused after delivery</li>
          <li>Items returned without original tags or packaging</li>
          <li>Limited-edition drop items explicitly stated as non-returnable</li>
          <li>Items returned after the 7-day return window has expired</li>
        </ul>
        <p>
          Hygiene and quality standards apply to all returns. We reserve the
          right to refuse a return that does not meet the conditions above.
        </p>
      </LegalSection>

      <LegalSection id="damaged-products" title="Damaged Products">
        <p>
          If your order arrives damaged or defective, please contact us within{" "}
          <strong>48 hours</strong> of delivery at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Include your
          order number and clear photos of the product and packaging.
        </p>
        <p>
          After review, we may offer a replacement (subject to stock
          availability), an exchange, or a full refund including standard
          shipping charges paid on the original order. We may arrange a pickup
          or provide a return label for damaged or defective items at no extra
          cost to you.
        </p>
      </LegalSection>

      <LegalSection id="wrong-item" title="Wrong Item Received">
        <p>
          If you receive an incorrect item or size due to our fulfilment error,
          contact us within <strong>48 hours</strong> of delivery with your
          order number and photos of the item received.
        </p>
        <p>
          We will arrange for the correct item to be shipped to you or process a
          refund, including any standard shipping fees you paid on the original
          order. Return shipping for wrong items sent by us will be covered by{" "}
          {BRAND_NAME}.
        </p>
      </LegalSection>

      <LegalSection id="refund-timeline" title="Refund Timeline">
        <p>
          Once we receive and inspect your returned item, we will notify you of
          the approval or rejection of your refund.
        </p>
        <p>
          Approved refunds are initiated within <strong>5–7 business days</strong>{" "}
          of receiving the returned product. Depending on your bank or payment
          provider, it may take an additional{" "}
          <strong>5–10 business days</strong> for the amount to reflect in your
          account.
        </p>
        <p>
          Refund timelines may vary for UPI, card, net banking, and wallet
          payments as processed by Razorpay and your financial institution.
        </p>
      </LegalSection>

      <LegalSection id="refund-method" title="Refund Method">
        <p>
          Refunds are processed to the <strong>original payment method</strong>{" "}
          used at checkout through Razorpay. {BRAND_NAME} cannot refund to a
          different card, UPI ID, or bank account than the one used for the
          original transaction.
        </p>
        <p>
          If the original payment method is no longer valid, please contact us
          and we will work with you to find a reasonable solution within
          Razorpay and banking guidelines.
        </p>
        <p>
          Shipping charges are non-refundable on returns unless the return is
          due to a damaged, defective, or incorrect item sent by us.
        </p>
      </LegalSection>

      <LegalSection id="exchange-process" title="Exchange Process">
        <p>
          Exchanges for a different size are available on eligible items,
          subject to stock availability. To request an exchange, email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with your
          order number and the size you need.
        </p>
        <p>
          If the requested size is unavailable, we will offer a refund instead.
          Exchanges follow the same condition requirements as returns — items
          must be unused, with tags attached, and in original packaging.
        </p>
        <p>
          Any price difference for exchanges between product variants will be
          communicated before the exchange is confirmed.
        </p>
        {!RETURN_WAREHOUSE_ADDRESS && (
          <p>
            {/* TODO: Add return warehouse / pickup address before launch */}
            Return address: [To be added before launch]
          </p>
        )}
      </LegalSection>

      <LegalSection id="contact" title="Contact Support">
        <p>
          For cancellation, return, refund, or exchange requests, reach out to:
        </p>
        <p>
          <strong>{BRAND_NAME}</strong>
          <br />
          Email:{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </p>
        <p>
          Please include your order number, registered email, and a brief
          description of your request. Our team will respond as soon as
          possible during business hours.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
