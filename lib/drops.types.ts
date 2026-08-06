import type { Product } from "@/lib/products";

export type DropStatus = "draft" | "published" | "archived";
export type DropVisibility = "public" | "hidden" | "unlisted";

/** Storefront/admin drop collection. */
export type Drop = {
  id: string;
  dropNumber: number;
  name: string;
  slug: string;
  description: string | null;
  heroImage: string | null;
  bannerImage: string | null;
  launchDate: string;
  isActive: boolean;
  status: DropStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  displayOrder: number;
  startsAt: string | null;
  endsAt: string | null;
  featured: boolean;
  themeColor: string | null;
  visibility: DropVisibility;
  createdAt: string;
  updatedAt: string;
};

/** Drop with nested products for shop/admin views. */
export type DropWithProducts = Drop & {
  products: Product[];
};

export type DropFormInput = {
  id?: string;
  dropNumber: number;
  name: string;
  slug: string;
  description: string;
  heroImage: string;
  bannerImage: string;
  launchDate: string;
  isActive: boolean;
  status: DropStatus;
  seoTitle: string;
  seoDescription: string;
};
