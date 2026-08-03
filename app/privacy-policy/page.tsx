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
  title: "Privacy Policy — PREPPY LOSERS",
  description:
    "How PREPPY LOSERS collects, uses, and protects your personal information when you shop with us.",
};

const TOC = [
  { id: "information-collected", label: "Information We Collect" },
  { id: "account-information", label: "Account Information" },
  { id: "google-sign-in", label: "Google Sign-In" },
  { id: "order-information", label: "Order Information" },
  { id: "payment-information", label: "Payment Information" },
  { id: "cookies", label: "Cookies" },
  { id: "analytics", label: "Analytics" },
  { id: "marketing-communications", label: "Marketing Communications" },
  { id: "data-sharing", label: "Data Sharing" },
  { id: "data-retention", label: "Data Retention" },
  { id: "security", label: "Security" },
  { id: "user-rights", label: "Your Rights" },
  { id: "childrens-privacy", label: "Children's Privacy" },
  { id: "changes", label: "Changes to This Policy" },
  { id: "contact", label: "Contact Us" },
] as const;

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      breadcrumbLabel="Privacy Policy"
      intro={`This Privacy Policy explains how ${BRAND_NAME} ("we", "us", or "our") collects, uses, stores, and protects your personal information when you visit our website, create an account, or place an order. By using our website, you agree to the practices described here.`}
      toc={[...TOC]}
    >
      <LegalSection id="information-collected" title="Information We Collect">
        <p>
          We collect information that helps us operate our online store, process
          orders, and improve your shopping experience. This may include:
        </p>
        <ul>
          <li>
            Personal details such as your name and email address
          </li>
          <li>Shipping and billing addresses you provide at checkout</li>
          <li>
            Account credentials and profile information when you register or
            sign in
          </li>
          <li>
            Order history, product preferences, cart contents, and transaction
            records
          </li>
          <li>
            Device and usage information such as browser type, IP address, pages
            visited, and approximate location derived from your IP address
          </li>
          <li>
            Communications you send us, including support emails and feedback
          </li>
        </ul>
        <p>
          We collect this information directly from you when you interact with
          our website, and automatically through cookies and similar technologies
          as described below.
        </p>
      </LegalSection>

      <LegalSection id="account-information" title="Account Information">
        <p>
          When you create an account with {BRAND_NAME}, we collect the
          information you provide during registration — your name and email
          address. If you sign in with Google, we receive your name and email
          from your Google profile.
        </p>
        <p>
          Your account lets you view order history, track purchases, and manage
          your profile. We use account information to authenticate you, provide
          customer support, and maintain the security of your account.
        </p>
        <p>
          You are responsible for keeping your login credentials confidential.
          Please contact us immediately if you believe your account has been
          accessed without your permission.
        </p>
      </LegalSection>

      <LegalSection id="google-sign-in" title="Google Sign-In">
        <p>
          {BRAND_NAME} offers Google Sign-In through Supabase Authentication. If
          you choose to sign in with Google, we receive basic profile
          information from Google such as your name, email address, and profile
          picture (if available), as permitted by your Google account settings.
        </p>
        <p>
          We use this information solely to create and manage your {BRAND_NAME}{" "}
          account. Google&apos;s use of your data is governed by Google&apos;s
          Privacy Policy. We do not receive or store your Google password.
        </p>
      </LegalSection>

      <LegalSection id="order-information" title="Order Information">
        <p>
          When you place an order, we collect details required to fulfil it,
          including:
        </p>
        <ul>
          <li>Products, sizes, and quantities ordered</li>
          <li>Delivery name, phone number, and shipping address</li>
          <li>Order status, payment confirmation, and fulfilment updates</li>
        </ul>
        <p>
          We retain order records for accounting, customer support, and legal
          compliance purposes. Order information may be linked to your account
          if you are signed in at the time of purchase.
        </p>
      </LegalSection>

      <LegalSection id="payment-information" title="Payment Information">
        <p>
          All payments on {BRAND_NAME} are processed securely by Razorpay, our
          authorised payment partner. When you pay by card, UPI, net banking,
          wallet, or other supported methods, your payment details are entered
          directly on Razorpay&apos;s secure checkout interface.
        </p>
        <p>
          <strong>
            {BRAND_NAME} does not store your full card number, CVV, UPI PIN, or
            other sensitive payment credentials on our servers.
          </strong>{" "}
          We receive only limited payment-related information needed to confirm
          your order, such as payment status, transaction reference IDs, and the
          amount paid.
        </p>
        <p>
          Razorpay handles payment data in accordance with applicable security
          standards and its own privacy policy. We recommend reviewing
          Razorpay&apos;s policies for more information on how they process
          payments.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="Cookies">
        <p>
          We use cookies and similar technologies to keep our website working,
          remember your preferences, and understand how visitors use our store.
          Cookies are small text files stored on your device.
        </p>
        <p>We may use cookies for purposes such as:</p>
        <ul>
          <li>Keeping you signed in to your account</li>
          <li>Remembering items in your shopping cart</li>
          <li>Understanding website traffic and performance</li>
          <li>Improving site functionality and user experience</li>
        </ul>
        <p>
          You can control cookies through your browser settings. Disabling
          certain cookies may affect how some features work, such as staying
          logged in or completing checkout.
        </p>
      </LegalSection>

      <LegalSection id="analytics" title="Analytics">
        <p>
          We may use analytics tools to understand how customers interact with
          our website — for example, which pages are visited most often and
          where users encounter errors. This helps us improve our store layout,
          product presentation, and overall experience.
        </p>
        <p>
          Analytics data is generally collected in aggregated or anonymised form
          where possible. It may include information such as page views, session
          duration, device type, and referral source.
        </p>
      </LegalSection>

      <LegalSection id="marketing-communications" title="Marketing Communications">
        <p>
          With your consent where required, we may send you emails or messages
          about new drops, promotions, order updates, and brand news. You can
          opt out of promotional communications at any time by following the
          unsubscribe link in our emails or by contacting us directly.
        </p>
        <p>
          Even if you opt out of marketing messages, we may still send
          transactional communications related to your orders, account, or
          important service updates.
        </p>
      </LegalSection>

      <LegalSection id="data-sharing" title="Data Sharing">
        <p>
          We do not sell your personal information. We share data only when
          necessary to operate our business and fulfil your orders, including
          with:
        </p>
        <ul>
          <li>
            <strong>Payment processors</strong> — Razorpay, to process and
            confirm payments
          </li>
          <li>
            <strong>Authentication providers</strong> — such as Google and
            Supabase, to manage secure sign-in
          </li>
          <li>
            <strong>Shipping and logistics partners</strong> — to deliver your
            orders to the address you provide
          </li>
          <li>
            <strong>Technology service providers</strong> — such as hosting,
            database, and email services that help us run our website
          </li>
          <li>
            <strong>Legal and regulatory authorities</strong> — when required by
            applicable law, court order, or to protect our rights and customers
          </li>
        </ul>
        <p>
          We require service providers to handle your information responsibly
          and only for the purposes we specify.
        </p>
      </LegalSection>

      <LegalSection id="data-retention" title="Data Retention">
        <p>
          We retain personal information for as long as needed to provide our
          services, fulfil orders, resolve disputes, enforce our agreements, and
          comply with legal obligations.
        </p>
        <p>
          Account information is kept while your account remains active. Order
          and payment records may be retained for longer periods as required for
          tax, accounting, and regulatory purposes under Indian law.
        </p>
        <p>
          When information is no longer needed, we take reasonable steps to
          delete or anonymise it.
        </p>
      </LegalSection>

      <LegalSection id="security" title="Security">
        <p>
          We implement reasonable technical and organisational measures to
          protect your personal information against unauthorised access, loss,
          misuse, or alteration. These measures include secure connections
          (HTTPS), access controls, and trusted third-party providers for
          authentication and payments.
        </p>
        <p>
          No method of transmission or storage is completely secure. While we
          work to protect your data, we cannot guarantee absolute security.
          Please use a strong password and keep your account credentials private.
        </p>
      </LegalSection>

      <LegalSection id="user-rights" title="Your Rights">
        <p>
          Depending on applicable law, you may have the right to:
        </p>
        <ul>
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate or incomplete information</li>
          <li>Request deletion of your personal information, subject to legal retention requirements</li>
          <li>Withdraw consent for marketing communications</li>
          <li>Raise a concern or grievance regarding our use of your data</li>
        </ul>
        <p>
          To exercise these rights, contact us at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. We may need
          to verify your identity before processing certain requests.
        </p>
        <p>
          If you are not satisfied with our response, you may have the right to
          lodge a complaint with the relevant data protection authority in
          India, as applicable.
        </p>
      </LegalSection>

      <LegalSection id="childrens-privacy" title="Children's Privacy">
        <p>
          {BRAND_NAME} is intended for customers who are at least 18 years of
          age, or the age of majority in their jurisdiction. We do not knowingly
          collect personal information from children under 18.
        </p>
        <p>
          If you believe a child has provided us with personal information,
          please contact us and we will take steps to delete it promptly.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time to reflect changes
          in our practices, technology, or legal requirements. When we make
          material changes, we will update the &quot;Last Updated&quot; date at
          the top of this page.
        </p>
        <p>
          We encourage you to review this page periodically. Your continued use
          of our website after changes are posted constitutes acceptance of the
          updated policy.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact Us">
        <p>
          If you have questions, concerns, or requests regarding this Privacy
          Policy or your personal information, please contact:
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
