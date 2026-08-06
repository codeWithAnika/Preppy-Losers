/** Deno edge-function mirror of lib/purchasability.ts — keep rules in sync. */

export interface DropPurchasabilityRow {
  is_active: boolean;
  status: string;
  visibility: string;
  starts_at: string | null;
  ends_at: string | null;
}

function isWithinSchedule(
  startsAt: string | null,
  endsAt: string | null,
  at = new Date()
): boolean {
  if (startsAt && new Date(startsAt) > at) return false;
  if (endsAt && new Date(endsAt) < at) return false;
  return true;
}

export function isProductPurchasableFromRows(
  productStatus: string,
  dropId: string | null,
  drop: DropPurchasabilityRow | null | undefined,
  at = new Date()
): boolean {
  if (productStatus !== "published") return false;
  if (!dropId || !drop) return false;
  if (!drop.is_active) return false;
  if (drop.status !== "published") return false;
  if (drop.visibility === "hidden") return false;
  return isWithinSchedule(drop.starts_at, drop.ends_at, at);
}
