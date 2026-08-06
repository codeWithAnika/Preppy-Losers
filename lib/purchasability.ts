import type { Drop } from "@/lib/drops.types";
import type { Product } from "@/lib/products";

/** Drop controls storefront visibility; product.status controls catalog eligibility. */
export function isWithinSchedule(
  startsAt: string | null | undefined,
  endsAt: string | null | undefined,
  at: Date = new Date()
): boolean {
  if (startsAt && new Date(startsAt) > at) return false;
  if (endsAt && new Date(endsAt) < at) return false;
  return true;
}

export function isProductPublished(product: Pick<Product, "status">): boolean {
  return product.status === "published";
}

/** Drop appears on shop listings and homepage (public + active + scheduled). */
export function isDropListed(drop: Drop, at: Date = new Date()): boolean {
  if (drop.status === "draft") return false;
  if (drop.visibility === "hidden") return false;
  if (drop.visibility === "unlisted") return false;
  if (!drop.isActive) return false;
  if (drop.status !== "published") return false;
  return isWithinSchedule(drop.startsAt, drop.endsAt, at);
}

/** Drop page reachable by direct slug (includes unlisted archives). */
export function isDropPageAccessible(drop: Drop, at: Date = new Date()): boolean {
  if (drop.status === "draft") return false;
  if (drop.visibility === "hidden") return false;
  return isWithinSchedule(drop.startsAt, drop.endsAt, at);
}

/** Product can be added to cart and purchased (inventory validated separately at checkout). */
export function isProductPurchasable(
  product: Pick<Product, "status" | "dropId">,
  drop: Drop | null | undefined,
  at: Date = new Date()
): boolean {
  if (!isProductPublished(product)) return false;
  if (!product.dropId || !drop) return false;
  if (!drop.isActive) return false;
  if (drop.status !== "published") return false;
  if (drop.visibility === "hidden") return false;
  return isWithinSchedule(drop.startsAt, drop.endsAt, at);
}

/** Historical / inactive drops for the past-drops archive. */
export function isDropPast(drop: Drop): boolean {
  if (drop.status === "draft") return false;
  return !drop.isActive || drop.status === "archived";
}

export function filterPublishedProducts(products: Product[]): Product[] {
  return products.filter(isProductPublished);
}

export function filterPurchasableProducts(products: Product[], drop: Drop): Product[] {
  return products.filter((product) => isProductPurchasable(product, drop));
}
