import { createClient } from "@/lib/supabase/server";
import {
  mapProductRow,
  type Product,
} from "@/lib/products";

export async function getProducts(): Promise<Product[]> {
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
