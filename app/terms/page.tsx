import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Terms — PREPPY LOSERS",
  description: "Terms and conditions for shopping at PREPPY LOSERS.",
};

export default function TermsRedirectPage() {
  redirect("/terms-and-conditions");
}
