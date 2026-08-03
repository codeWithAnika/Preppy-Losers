import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { LegalSection } from "@/components/legal/LegalSection";
import { BRAND_NAME, SUPPORT_EMAIL } from "@/lib/legal/constants";

export const metadata: Metadata = {
  title: "Shipping Policy — PREPPY LOSERS",
  description:
    "Shipping timelines, charges, and delivery information for PREPPY LOSERS orders across India.",
};

const TOC = [
  { id: "order-processing", label: "Order Processing Time" },
  { id: "delivery-timelines", label: "Delivery Timelines" },
  { id: "shipping-charges", label: "Shipping Charges" },
  { id: "serviceable-locations", label: "Serviceable Locations" },
  { id: "tracking", label: "Tracking Information" },
  { id: "delays", label: "Delays" },
  { id: "failed-delivery", label: "Failed Delivery Attempts" },
  { id: "incorrect-address", label: "Incorrect Addresses" },
  { id: "contact", label: "Contact Support" },
] as const;

export default function ShippingPolicyPage() {
  return (
    <LegalLayout
      title="Shipping Policy"
      breadcrumbLabel="Shipping Policy"
      intro={`This Shipping Policy explains how ${BRAND_NAME} processes, ships, and delivers orders placed on our website within India.`}
      toc={[...TOC]}
    >
      <LegalSection id="order-processing" title="Order Processing Time">
        <p>
          Orders are processed after successful payment confirmation through
          Razorpay. Processing typically takes <strong>1–3 business days</strong>{" "}
          from the date of order confirmation, excluding weekends and public
          holidays.
        </p>
        <p>
          During high-volume drop periods, processing may take slightly longer.
          We will notify you by email if there is an unexpected delay with your
          order.
        </p>
        <p>
          You will receive a confirmation once your order has been packed and
          handed over to our courier partner.
        </p>
      </LegalSection>

      <LegalSection id="delivery-timelines" title="Delivery Timelines">
        <p>
          Estimated delivery times after dispatch are:
        </p>
        <ul>
          <li>
            <strong>Metro cities:</strong> 3–7 business days
          </li>
          <li>
            <strong>Other serviceable locations in India:</strong> 5–10 business
            days
          </li>
        </ul>
        <p>
          Delivery timelines are estimates and not guaranteed. Actual delivery
          may vary based on your location, courier partner performance, weather,
          and local conditions.
        </p>
        <p>
          {BRAND_NAME} is not responsible for delays caused by courier partners,
          customs (if applicable in future international shipping), or events
          outside our reasonable control.
        </p>
      </LegalSection>

      <LegalSection id="shipping-charges" title="Shipping Charges">
        <p>
          Shipping charges, if applicable, are calculated and displayed at
          checkout before you complete payment. The final amount shown includes
          product price, applicable taxes, and shipping fees.
        </p>
        <p>
          From time to time, {BRAND_NAME} may offer free or discounted shipping
          promotions. Promotional shipping terms will be stated clearly during
          the offer period and apply only as described.
        </p>
      </LegalSection>

      <LegalSection id="serviceable-locations" title="Serviceable Locations">
        <p>
          Currently, {BRAND_NAME} ships to serviceable pin codes across India
          through our courier partners. We do not ship internationally at this
          time unless explicitly announced on our website.
        </p>
        <p>
          If your pin code is not serviceable at checkout, please contact us at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> and we will
          try to assist where possible.
        </p>
      </LegalSection>

      <LegalSection id="tracking" title="Tracking Information">
        <p>
          Once your order is dispatched, we will share tracking details by email
          or through your account (where available). You can use the tracking
          link or AWB number to follow your shipment with the courier partner.
        </p>
        <p>
          Tracking updates are provided by the courier and may take up to 24
          hours to appear after dispatch. If you do not receive tracking
          information within 3 business days of order confirmation, please
          contact us.
        </p>
      </LegalSection>

      <LegalSection id="delays" title="Delays">
        <p>
          While we work to dispatch orders promptly, delays can occur due to:
        </p>
        <ul>
          <li>High order volume during limited drops</li>
          <li>Courier partner disruptions or route changes</li>
          <li>Weather events, strikes, or local restrictions</li>
          <li>Incomplete or unverifiable shipping details</li>
        </ul>
        <p>
          If your order is significantly delayed, email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with your
          order number and we will investigate with our shipping partner.
        </p>
      </LegalSection>

      <LegalSection id="failed-delivery" title="Failed Delivery Attempts">
        <p>
          Couriers typically make multiple delivery attempts. If delivery cannot
          be completed because no one is available to receive the package, the
          shipment may be returned to us or held at a local hub depending on the
          courier&apos;s policy.
        </p>
        <p>
          If a package is returned to {BRAND_NAME} due to failed delivery
          attempts or refusal at the door, we will contact you to arrange
          re-shipment. Additional shipping charges may apply for re-delivery.
        </p>
        <p>
          If you prefer to cancel a returned shipment, we will process a refund
          for the product cost in accordance with our Refund Policy. Original
          shipping fees may be non-refundable unless the failure was due to our
          error.
        </p>
      </LegalSection>

      <LegalSection id="incorrect-address" title="Incorrect Addresses">
        <p>
          Please double-check your shipping address, pin code, and phone number
          at checkout. {BRAND_NAME} is not responsible for delays or failed
          deliveries caused by incorrect or incomplete addresses provided by the
          customer.
        </p>
        <p>
          If you notice an error after placing your order, contact us
          immediately at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. We will try
          to update the address before dispatch, but changes cannot be
          guaranteed once the order has been handed to the courier.
        </p>
        <p>
          Re-shipping costs arising from incorrect customer-provided addresses
          will be borne by the customer.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact Support">
        <p>
          For shipping-related questions, tracking help, or delivery issues,
          contact:
        </p>
        <p>
          <strong>{BRAND_NAME}</strong>
          <br />
          Email:{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </p>
        <p>
          Include your order number and a description of the issue so we can
          assist you faster.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
