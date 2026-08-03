import { ScrollTriggerRefreshProvider } from "@/components/ScrollTriggerRefreshProvider";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ScrollTriggerRefreshProvider>{children}</ScrollTriggerRefreshProvider>;
}