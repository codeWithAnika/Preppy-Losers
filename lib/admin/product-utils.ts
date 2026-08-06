import type { Tables } from "@/lib/database.types";
import type { AdminDropRow, AdminProductRow, DropGroup, ProductStatus } from "@/lib/admin/types";
import { parseSizeStock } from "@/lib/products";

export function mapAdminProductRow(row: Tables<"products">): AdminProductRow {
  return {
    ...row,
    size_stock: parseSizeStock(row.size_stock),
    images: Array.isArray(row.images) ? (row.images as string[]) : [],
    status: (row.status ?? "draft") as ProductStatus,
  };
}

function totalStock(product: AdminProductRow): number {
  return (product.size_stock ?? []).reduce((sum, entry) => sum + entry.stock, 0);
}

export function formatSizeStockSummary(product: AdminProductRow): string {
  const stock = product.size_stock ?? [];
  if (stock.length === 0) return "No sizes";
  return stock.map((entry) => `${entry.size} (${entry.stock})`).join(" · ");
}

export function isOutOfStock(product: AdminProductRow): boolean {
  const stock = product.size_stock ?? [];
  return stock.length === 0 || stock.every((entry) => entry.stock === 0);
}

export function inventoryTotal(product: AdminProductRow): number {
  return totalStock(product);
}

export function buildDropGroups(
  drops: AdminDropRow[],
  products: AdminProductRow[]
): DropGroup[] {
  const productsByDrop = new Map<string, AdminProductRow[]>();

  for (const product of products) {
    if (!product.drop_id) continue;
    const list = productsByDrop.get(product.drop_id) ?? [];
    list.push(product);
    productsByDrop.set(product.drop_id, list);
  }

  return drops
    .map((drop) => ({
      drop: {
        ...drop,
        product_count: (productsByDrop.get(drop.id) ?? []).length,
      },
      products: (productsByDrop.get(drop.id) ?? []).sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    }))
    .sort((a, b) => {
      const orderDiff = (b.drop.display_order ?? 0) - (a.drop.display_order ?? 0);
      if (orderDiff !== 0) return orderDiff;
      return b.drop.drop_number - a.drop.drop_number;
    });
}
