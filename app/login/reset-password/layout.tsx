import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set new password",
  description: "Choose a new password for your Preppy Losers account.",
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
