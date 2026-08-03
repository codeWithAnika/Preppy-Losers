import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Request a password reset link for your Preppy Losers account.",
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
