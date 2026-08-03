export interface NavLink {
  label: string;
  href: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Shop", href: "/shop" },
];

export const FOOTER_NAV_LINKS: NavLink[] = [
  { label: "Account", href: "/account" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms-and-conditions" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Shipping Policy", href: "/shipping-policy" },
];

export const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/preppylosers",
    icon: "instagram" as const,
  },
  { label: "Threads", href: "https://threads.net", icon: "threads" as const },
];

export const CONTACT_EMAIL = "loserspreppy@gmail.com";
