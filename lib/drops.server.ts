import { createClient } from "@/lib/supabase/server";
import {
  attachProductsToDrops,
  getListedDrops,
  getPastDrops,
  mapDropRow,
  type Drop,
  type DropWithProducts,
} from "@/lib/drops";
import { mapProductRow, type Product } from "@/lib/products";

export async function fetchAllDrops(): Promise<Drop[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("drops")
    .select("*")
    .order("display_order", { ascending: false })
    .order("launch_date", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch drops: ${error.message}`);
  }

  return (data ?? []).map(mapDropRow);
}

export async function fetchDropBySlug(slug: string): Promise<Drop | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("drops")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch drop: ${error.message}`);
  }

  return data ? mapDropRow(data) : null;
}

export async function fetchDropById(id: string): Promise<Drop | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("drops")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch drop: ${error.message}`);
  }

  return data ? mapDropRow(data) : null;
}

export async function fetchAllProducts(): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("drop_date", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  return (data ?? []).map(mapProductRow);
}

export async function fetchDropsWithProducts(): Promise<DropWithProducts[]> {
  const [drops, products] = await Promise.all([
    fetchAllDrops(),
    fetchAllProducts(),
  ]);
  return attachProductsToDrops(drops, products);
}

export async function fetchListedDropsWithProducts(): Promise<DropWithProducts[]> {
  const drops = await fetchDropsWithProducts();
  return getListedDrops(drops);
}

/** @deprecated Use fetchListedDropsWithProducts */
export async function fetchActiveDropsWithProducts(): Promise<DropWithProducts[]> {
  return fetchListedDropsWithProducts();
}

export async function fetchPastDropsWithProducts(): Promise<DropWithProducts[]> {
  const drops = await fetchDropsWithProducts();
  return getPastDrops(drops);
}

export async function fetchShopCatalog(): Promise<{
  listedDrops: DropWithProducts[];
  pastDrops: DropWithProducts[];
}> {
  const drops = await fetchDropsWithProducts();
  return {
    listedDrops: getListedDrops(drops),
    pastDrops: getPastDrops(drops),
  };
}

export async function fetchDropWithProductsBySlug(
  slug: string
): Promise<DropWithProducts | null> {
  const drop = await fetchDropBySlug(slug);
  if (!drop) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("drop_id", drop.id)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch drop products: ${error.message}`);
  }

  return {
    ...drop,
    products: (data ?? []).map(mapProductRow),
  };
}

export async function getNextDropNumber(): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("drops")
    .select("drop_number")
    .order("drop_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to read drop numbers: ${error.message}`);
  }

  return (data?.drop_number ?? 0) + 1;
}
