import type { AdminProductRow } from "@/lib/admin/types";

function totalStock(product: AdminProductRow): number {
  return (product.size_stock ?? []).reduce((sum, entry) => sum + entry.stock, 0);
}

export function isOutOfStock(product: AdminProductRow): boolean {
  const stock = product.size_stock ?? [];
  return stock.length === 0 || stock.every((entry) => entry.stock === 0);
}

export function inventoryTotal(product: AdminProductRow): number {
  return totalStock(product);
}

export function groupProductsByDrop(products: AdminProductRow[]) {
  const map = new Map<number, AdminProductRow[]>();

  for (const product of products) {
    const dropNumber = product.drop_number ?? 0;
    const list = map.get(dropNumber) ?? [];
    list.push(product);
    map.set(dropNumber, list);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => b - a)
    .map(([dropNumber, dropProducts]) => {
      const sorted = [...dropProducts].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const hero =
        sorted.find((product) => product.is_active) ??
        sorted.find((product) => product.featured) ??
        sorted[0] ??
        null;

      return {
        dropNumber,
        title: `DROP ${String(dropNumber).padStart(2, "0")}`,
        releaseDate: sorted[0]?.drop_date ?? "",
        products: sorted,
        heroProduct: hero,
        isActive: sorted.some((product) => product.is_active),
      };
    });
}
