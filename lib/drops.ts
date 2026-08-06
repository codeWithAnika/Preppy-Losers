import type { Tables } from "@/lib/database.types";
import type { Product, ProductStatus } from "@/lib/products";
import { mapProductRow } from "@/lib/products";
import type { Drop, DropStatus, DropWithProducts } from "@/lib/drops.types";
import {
  filterPublishedProducts,
  filterPurchasableProducts,
  isDropListed,
  isDropPast,
} from "@/lib/purchasability";

export type { Drop, DropStatus, DropVisibility, DropWithProducts, DropFormInput } from "@/lib/drops.types";

export type DropRow = Tables<"drops">;

export function mapDropRow(row: DropRow): Drop {
  return {
    id: row.id,
    dropNumber: row.drop_number,
    name: row.name,
    slug: row.slug,
    description: row.description,
    heroImage: row.hero_image,
    bannerImage: row.banner_image,
    launchDate: row.launch_date,
    isActive: row.is_active,
    status: row.status as DropStatus,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    displayOrder: row.display_order ?? 0,
    startsAt: row.starts_at ?? null,
    endsAt: row.ends_at ?? null,
    featured: row.featured ?? false,
    themeColor: row.theme_color ?? null,
    visibility: (row.visibility ?? "public") as Drop["visibility"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function slugifyDropName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatDropLabel(dropNumber: number): string {
  return `Drop ${String(dropNumber).padStart(2, "0")}`;
}

export function attachProductsToDrops(
  drops: Drop[],
  products: Product[]
): DropWithProducts[] {
  const byDropId = new Map<string, Product[]>();

  for (const product of products) {
    const dropId = product.dropId;
    if (!dropId) continue;
    const list = byDropId.get(dropId) ?? [];
    list.push(product);
    byDropId.set(dropId, list);
  }

  return drops.map((drop) => ({
    ...drop,
    products: (byDropId.get(drop.id) ?? []).sort(
      (a, b) => a.name.localeCompare(b.name)
    ),
  }));
}

function sortListedDrops(a: DropWithProducts, b: DropWithProducts): number {
  if (a.displayOrder !== b.displayOrder) {
    return b.displayOrder - a.displayOrder;
  }
  return new Date(b.launchDate).getTime() - new Date(a.launchDate).getTime();
}

/** Drops visible on shop/homepage with published products. */
export function getListedDrops(
  drops: DropWithProducts[],
  at: Date = new Date()
): DropWithProducts[] {
  return drops
    .filter((drop) => isDropListed(drop, at))
    .map((drop) => ({
      ...drop,
      products: filterPublishedProducts(drop.products),
    }))
    .filter((drop) => drop.products.length > 0)
    .sort(sortListedDrops);
}

/** @deprecated Use getListedDrops */
export function getActiveDrops(drops: DropWithProducts[], at?: Date): DropWithProducts[] {
  return getListedDrops(drops, at);
}

/** Inactive/archived drops for the past-drops archive (excludes drafts). */
export function getPastDrops(drops: DropWithProducts[]): DropWithProducts[] {
  return drops
    .filter((drop) => isDropPast(drop))
    .map((drop) => ({
      ...drop,
      products: filterPublishedProducts(drop.products),
    }))
    .filter((drop) => drop.products.length > 0)
    .sort(
      (a, b) =>
        new Date(b.launchDate).getTime() - new Date(a.launchDate).getTime()
    );
}

/** Products that can be purchased within a listed drop. */
export function getPurchasableProductsForDrop(drop: DropWithProducts): Product[] {
  return filterPurchasableProducts(drop.products, drop);
}

export function mapProductsFromRows(rows: Tables<"products">[]): Product[] {
  return rows.map(mapProductRow);
}
