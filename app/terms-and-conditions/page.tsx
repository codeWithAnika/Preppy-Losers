import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { LegalSection } from "@/components/legal/LegalSection";
import {
  BRAND_NAME,
  BUSINESS_ADDRESS,
  GST_NUMBER,
  SUPPORT_EMAIL,
} from "@/lib/legal/constants";

export const metadata: Metadata = {
  title: "Terms & Conditions — PREPPY LOSERS",
  description:
    "Terms and conditions for shopping at PREPPY LOSERS, India's underground streetwear brand.",
};

const TOC = [
  { id: "acceptance", label: "Acceptance of Terms" },
  { id: "eligibility", label: "Eligibility" },
  { id: "account-responsibilities", label: "Account Responsibilities" },
  { id: "product-availability", label: "Product Availability" },
  { id: "pricing", label: "Pricing" },
  { id: "orders", label: "Orders" },
  { id: "payments", label: "Payments" },
  { id: "cancellations", label: "Cancellations" },
  { id: "intellectual-property", label: "Intellectual Property" },
  { id: "user-conduct", label: "User Conduct" },
  { id: "limitation-of-liability", label: "Limitation of Liability" },
  { id: "governing-law", label: "Governing Law" },
  { id: "contact", label: "Contact Information" },
] as const;

export default function TermsAndConditionsPage() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      breadcrumbLabel="Terms & Conditions"
      intro={`These Terms & Conditions ("Terms") govern your access to and use of the ${BRAND_NAME} website and your purchase of products from us. By browsing our site or placing an order, you agree to these Terms.`}
      toc={[...TOC]}
    >
      <LegalSection id="acceptance" title="Acceptance of Terms">
        <p>
          By accessing {BRAND_NAME}, creating an account, or completing a
          purchase, you confirm that you have read, understood, and agree to be
          bound by these Terms, our Privacy Policy, Refund Policy, and Shipping
          Policy.
        </p>
        <p>
          If you do not agree with any part of these Terms, please do not use
          our website or services.
        </p>
      </LegalSection>

      <LegalSection id="eligibility" title="Eligibility">
        <p>
          To shop on {BRAND_NAME}, you must be at least 18 years of age or the
          age of legal majority in your jurisdiction, and capable of entering
          into a binding contract under applicable law.
        </p>
        <p>
          By placing an order, you represent that the information you provide
          is accurate and that you are authorised to use the payment method
          selected at checkout.
        </p>
      </LegalSection>

      <LegalSection id="account-responsibilities" title="Account Responsibilities">
        <p>
          You may need an account to complete certain purchases or view order
          history. You are responsible for maintaining the confidentiality of
          your login credentials and for all activity that occurs under your
          account.
        </p>
        <p>
          Please notify us immediately at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> if you
          suspect unauthorised access to your account. {BRAND_NAME} is not
          liable for losses arising from your failure to safeguard account
          access.
        </p>
      </LegalSection>

      <LegalSection id="product-availability" title="Product Availability">
        <p>
          {BRAND_NAME} releases limited streetwear drops. Product availability,
          sizes, and quantities are subject to change without notice. Items in
          your cart are not reserved until your payment is successfully
          completed.
        </p>
        <p>
          We make reasonable efforts to display accurate product images and
          descriptions. Colours and details may vary slightly due to screen
          settings, photography, or manufacturing variations. If a product
          becomes unavailable after you order, we will contact you and offer a
          refund or alternative resolution.
        </p>
      </LegalSection>

      <LegalSection id="pricing" title="Pricing">
        <p>
          All prices on {BRAND_NAME} are listed in Indian Rupees (INR) unless
          stated otherwise. Prices include applicable taxes where shown at
          checkout, and exclude shipping charges unless a promotion explicitly
          states otherwise.
        </p>
        <p>
          We reserve the right to change prices, offers, and promotions at any
          time. The price charged will be the price displayed at the time you
          complete payment, subject to successful order confirmation.
        </p>
      </LegalSection>

      <LegalSection id="orders" title="Orders">
        <p>
          Placing an order constitutes an offer to purchase. An order is
          confirmed only after we receive successful payment confirmation from
          Razorpay and send you an order confirmation (by email or through your
          account, where applicable).
        </p>
        <p>
          We reserve the right to refuse or cancel any order for reasons
          including suspected fraud, pricing errors, stock unavailability, or
          violation of these Terms. If your order is cancelled after payment,
          we will initiate a refund to your original payment method.
        </p>
        <p>
          Please review your order details carefully before completing checkout,
          including size, quantity, and shipping address.
        </p>
      </LegalSection>

      <LegalSection id="payments" title="Payments">
        <p>
          Payments are processed securely through Razorpay. We accept payment
          methods supported by Razorpay at checkout, which may include credit
          cards, debit cards, UPI, net banking, and wallets.
        </p>
        <p>
          {BRAND_NAME} does not store your full payment credentials. By
          completing a transaction, you authorise Razorpay and your payment
          provider to charge the total order amount, including product price,
          applicable taxes, and shipping fees.
        </p>
        <p>
          If a payment fails or is declined, your order will not be processed.
          Please contact your bank or payment provider, or try an alternative
          payment method.
        </p>
      </LegalSection>

      <LegalSection id="cancellations" title="Cancellations">
        <p>
          You may request cancellation of an order before it has been shipped by
          contacting us at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with your
          order details. Once an order has been dispatched, cancellation may not
          be possible and our Refund Policy will apply instead.
        </p>
        <p>
          {BRAND_NAME} may cancel orders in cases of stock issues, payment
          disputes, incorrect pricing, or suspected fraudulent activity. Approved
          refunds for cancelled orders will be processed as described in our
          Refund Policy.
        </p>
      </LegalSection>

      <LegalSection id="intellectual-property" title="Intellectual Property">
        <p>
          All content on the {BRAND_NAME} website — including logos, brand
          names, product designs, graphics, photography, text, and layout — is
          owned by or licensed to {BRAND_NAME} and protected by applicable
          intellectual property laws.
        </p>
        <p>
          You may not copy, reproduce, distribute, modify, or use our content
          for commercial purposes without our prior written consent. Unauthorised
          use of {BRAND_NAME} trademarks or creative assets is strictly
          prohibited.
        </p>
      </LegalSection>

      <LegalSection id="user-conduct" title="User Conduct">
        <p>When using our website, you agree not to:</p>
        <ul>
          <li>Provide false, misleading, or fraudulent information</li>
          <li>Attempt to gain unauthorised access to our systems or accounts</li>
          <li>Interfere with the normal operation of the website</li>
          <li>Use automated tools to scrape data or bypass purchase limits</li>
          <li>Resell products obtained through {BRAND_NAME} in violation of drop terms or applicable law</li>
          <li>Engage in activity that harms other customers, our partners, or our brand</li>
        </ul>
        <p>
          We may suspend or terminate access for conduct that violates these
          Terms or applicable law.
        </p>
      </LegalSection>

      <LegalSection id="limitation-of-liability" title="Limitation of Liability">
        <p>
          To the fullest extent permitted by applicable law, {BRAND_NAME} and
          its founders, employees, and partners shall not be liable for any
          indirect, incidental, special, consequential, or punitive damages
          arising from your use of the website or purchase of products.
        </p>
        <p>
          Our total liability for any claim related to a product or order shall
          not exceed the amount you paid for that specific order.
        </p>
        <p>
          Nothing in these Terms limits liability that cannot be excluded under
          Indian law, including liability for fraud or wilful misconduct.
        </p>
      </LegalSection>

      <LegalSection id="governing-law" title="Governing Law">
        <p>
          These Terms are governed by and construed in accordance with the laws
          of India. Any disputes arising out of or relating to these Terms or
          your use of {BRAND_NAME} shall be subject to the exclusive
          jurisdiction of the courts located in India.
        </p>
        <p>
          We encourage you to contact us first at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> to resolve
          concerns amicably before pursuing formal legal action.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact Information">
        <p>
          For questions about these Terms, please contact:
        </p>
        <p>
          <strong>{BRAND_NAME}</strong>
          <br />
          Email:{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </p>
        {!BUSINESS_ADDRESS && (
          <p>
            {/* TODO: Add registered business address before launch */}
            Registered business address: [To be added before launch]
          </p>
        )}
        {!GST_NUMBER && (
          <p>
            {/* TODO: Add GSTIN if applicable before launch */}
            GSTIN: [To be added before launch, if applicable]
          </p>
        )}
      </LegalSection>
    </LegalLayout>
  );
}
