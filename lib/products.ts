import type { Tables } from "@/lib/database.types";

export type SizeStock = {
  size: string;
  stock: number;
};

/** Default stock level for each size when a new drop launches. */
export const DEFAULT_STOCK_PER_SIZE = 30;

/** Standard purchasable sizes for new drops (XS–XL). */
export const STANDARD_DROP_SIZES = ["XS", "S", "M", "L", "XL"] as const;

export type SizeChartRow = {
  size: string;
  chest: number;
  shoulder: number;
  length: number;
  sleeves: number;
};

/** Reference measurements (inches) for the standard XS–XL size run. */
export const SIZE_CHART_ROWS: readonly SizeChartRow[] = [
  { size: "X-Small", chest: 40, shoulder: 19, length: 26, sleeves: 22.5 },
  { size: "Small", chest: 42, shoulder: 20, length: 27, sleeves: 23 },
  { size: "Medium", chest: 44, shoulder: 21, length: 28, sleeves: 23.5 },
  { size: "Large", chest: 46, shoulder: 22, length: 29, sleeves: 24 },
  { size: "X-Large", chest: 48, shoulder: 23, length: 30, sleeves: 24.5 },
];

/** Standalone sizing chart image (not part of the product gallery). */
export const SIZING_ILLUSTRATION_IMAGE = "/photo6.webp";

export function getSizingIllustrationImage(): string {
  return SIZING_ILLUSTRATION_IMAGE;
}

export function buildDefaultSizeStock(
  sizes: readonly string[] = STANDARD_DROP_SIZES
): SizeStock[] {
  return sizes.map((size) => ({ size, stock: DEFAULT_STOCK_PER_SIZE }));
}

export type Product = {
  id: string;
  dropNumber: number;
  name: string;
  description: string;
  details: string | null;
  price: number;
  images: string[];
  sizeStock: SizeStock[];
  isActive: boolean;
  dropDate: string;
};

export type ProductRow = Tables<"products">;

function inferDropNumber(id: string): number {
  const match = id.match(/^drop-(\d+)$/);
  if (!match) return 0;
  return Number.parseInt(match[1], 10);
}

export function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    dropNumber: row.drop_number ?? inferDropNumber(row.id),
    name: row.name,
    description: row.description,
    details: row.details ?? null,
    price: row.price,
    images: Array.isArray(row.images) ? (row.images as string[]) : [],
    sizeStock: Array.isArray(row.size_stock)
      ? (row.size_stock as SizeStock[])
      : [],
    isActive: row.is_active,
    dropDate: row.drop_date,
  };
}

export function formatDropLabel(dropNumber: number): string {
  return `Drop ${dropNumber}`;
}

/** Maps ProductDetails selector codes to size-chart row labels. */
export function chartSizeLabelForSelector(selectorSize: string): string {
  const map: Record<string, string> = {
    XS: "X-Small",
    S: "Small",
    M: "Medium",
    L: "Large",
    XL: "X-Large",
    "2XL": "2X-Large",
    "3XL": "3X-Large",
  };
  return map[selectorSize] ?? selectorSize;
}

export function isProductFullySoldOut(product: Product): boolean {
  return product.sizeStock.every((entry) => entry.stock === 0);
}

export function getSizeStock(product: Product, size: string): number {
  return product.sizeStock.find((entry) => entry.size === size)?.stock ?? 0;
}

export function getActiveProduct(products: Product[]): Product | undefined {
  return products.find((product) => product.isActive);
}

export function getPastProducts(products: Product[]): Product[] {
  return products.filter((product) => !product.isActive);
}
