import type { Metadata } from "next";
import { Inter, Anton } from "next/font/google";
import "./globals.css";
import { RootChrome } from "@/components/layout/RootChrome";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { doctorGlitch } from "@/lib/fonts";

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
  title: "Preppy Losers — Underground Street Culture",
  description:
    "Underground street culture for the bold. Premium streetwear drops from Preppy Losers.",
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
