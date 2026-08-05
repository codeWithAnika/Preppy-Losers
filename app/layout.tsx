import type { Metadata } from "next";
import { Inter, Anton } from "next/font/google";
import "./globals.css";
import { RootChrome } from "@/components/layout/RootChrome";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { doctorGlitch } from "@/lib/fonts";
import { getSiteUrl } from "@/lib/env/public";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Preppy Losers — Underground Street Culture",
    template: "%s | Preppy Losers",
  },
  description:
    "Underground street culture for the bold. Premium streetwear drops from Preppy Losers.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Preppy Losers",
    title: "Preppy Losers — Underground Street Culture",
    description:
      "Underground street culture for the bold. Premium streetwear drops from Preppy Losers.",
    images: [{ url: "/logo-badge.webp", width: 512, height: 512, alt: "Preppy Losers" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Preppy Losers — Underground Street Culture",
    description:
      "Underground street culture for the bold. Premium streetwear drops from Preppy Losers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${anton.variable} ${doctorGlitch.variable}`}>
      <body className="relative z-0 bg-background font-sans">
        <GoogleAnalytics />
        <RootChrome>{children}</RootChrome>
      </body>
    </html>
  );
}
