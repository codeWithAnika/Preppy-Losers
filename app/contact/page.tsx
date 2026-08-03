import type { Metadata } from "next";
import Link from "next/link";
import { Instagram } from "lucide-react";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { LegalSection } from "@/components/legal/LegalSection";
import {
  BRAND_NAME,
  LEGAL_CONTACT_PARAGRAPH,
  SUPPORT_EMAIL,
  SUPPORT_RESPONSE_TIME,
  SUPPORT_TOPICS,
} from "@/lib/legal/constants";
import { SOCIAL_LINKS } from "@/types";

export const metadata: Metadata = {
  title: "Contact — PREPPY LOSERS",
  description:
    "Contact PREPPY LOSERS for order support, payments, shipping, and returns.",
};

const TOC = [
  { id: "email", label: "Email Support" },
  { id: "orders", label: "Order Help" },
  { id: "payments", label: "Payments & Refunds" },
  { id: "shipping", label: "Shipping" },
  { id: "policies", label: "Policies" },
] as const;

function ThreadsIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.186 2.063c-2.683 0-4.79 1.023-6.26 3.054C4.46 7.146 3.75 9.78 3.75 13.01v.01c0 3.23.71 5.864 2.176 7.893 1.47 2.031 3.577 3.054 6.26 3.054 2.29 0 4.1-.68 5.44-2.04 1.34-1.36 2.01-3.25 2.01-5.67 0-.55-.04-1.05-.12-1.5h-3.89c.08.35.12.78.12 1.29 0 1.45-.39 2.58-1.17 3.39-.78.81-1.89 1.22-3.33 1.22-1.52 0-2.66-.55-3.42-1.65-.7-.99-1.05-2.39-1.05-4.2 0-1.81.35-3.21 1.05-4.2.76-1.1 1.9-1.65 3.42-1.65 1.01 0 1.84.28 2.49.84.65.56 1.04 1.33 1.17 2.31h3.89c-.18-2.01-.86-3.6-2.04-4.77-1.4-1.41-3.21-2.12-5.43-2.12zm-1.01 4.24h5.74v2.28h-5.74V6.303zm0 3.8h5.74v2.28h-5.74v-2.28z" />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <LegalLayout
      title="Contact"
      breadcrumbLabel="Contact"
      intro={`Need help with an order or have a question about ${BRAND_NAME}? Reach out by email — we typically respond within ${SUPPORT_RESPONSE_TIME}.`}
      toc={[...TOC]}
    >
      <LegalSection id="email" title="Email Support">
        <p>{LEGAL_CONTACT_PARAGRAPH}</p>
        <p>
          <strong>{BRAND_NAME}</strong>
          <br />
          Email:{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent">
            {SUPPORT_EMAIL}
          </a>
          <br />
          Response time: {SUPPORT_RESPONSE_TIME}
        </p>
        <div className="mt-6 flex gap-4">
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 min-w-11 items-center justify-center border border-white/15 text-foreground/70 transition-colors hover:border-white/30 hover:text-foreground"
              aria-label={social.label}
            >
              {social.icon === "instagram" ? (
                <Instagram size={18} />
              ) : (
                <ThreadsIcon />
              )}
            </a>
          ))}
        </div>
      </LegalSection>

      <LegalSection id="orders" title="Order Help">
        <p>{SUPPORT_TOPICS.orders}</p>
      </LegalSection>

      <LegalSection id="payments" title="Payments & Refunds">
        <p>{SUPPORT_TOPICS.payments}</p>
        <p className="mt-4">{SUPPORT_TOPICS.returns}</p>
      </LegalSection>

      <LegalSection id="shipping" title="Shipping">
        <p>{SUPPORT_TOPICS.shipping}</p>
      </LegalSection>

      <LegalSection id="policies" title="Policies">
        <p>For full details, please read our policy pages:</p>
        <ul>
          <li>
            <Link href="/privacy-policy" className="text-accent hover:underline">
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link href="/terms-and-conditions" className="text-accent hover:underline">
              Terms & Conditions
            </Link>
          </li>
          <li>
            <Link href="/refund-policy" className="text-accent hover:underline">
              Refund Policy
            </Link>
          </li>
          <li>
            <Link href="/shipping-policy" className="text-accent hover:underline">
              Shipping Policy
            </Link>
          </li>
        </ul>
      </LegalSection>
    </LegalLayout>
  );
}
