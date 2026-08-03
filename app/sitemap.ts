import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env/public";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  return [
    { url: siteUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/shop`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/login`, lastModified, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/signup`, lastModified, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/privacy-policy`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/terms-and-conditions`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/refund-policy`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/shipping-policy`, lastModified, changeFrequency: "yearly", priority: 0.2 },
  ];
}
