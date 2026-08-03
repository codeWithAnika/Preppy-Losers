import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(import.meta.dirname, "..");
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(root, ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    })
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const { data: orders, error: ordersError } = await supabase
  .from("orders")
  .select("id, product_id, size, quantity, amount, status, created_at")
  .order("created_at", { ascending: false });

if (ordersError) {
  console.error("orders error:", ordersError.message);
} else {
  console.log("=== ORDERS (product references) ===");
  console.log("count:", orders?.length ?? 0);
  if (!orders?.length) {
    console.log("(no orders)");
  } else {
    for (const o of orders) {
      console.log(
        JSON.stringify({
          id: o.id,
          product_id: o.product_id,
          size: o.size,
          quantity: o.quantity,
          amount: o.amount,
          status: o.status,
          created_at: o.created_at,
        })
      );
    }
    const ids = [...new Set(orders.map((o) => o.product_id))];
    console.log("distinct product_ids:", ids.join(", "));
  }
}

const { data: products, error: productsError } = await supabase
  .from("products")
  .select("id")
  .order("id");

if (productsError) {
  console.error("products error:", productsError.message);
  process.exit(1);
}

const productIds = new Set((products ?? []).map((p) => p.id));
if (orders?.length) {
  const orphanRefs = orders.filter((o) => !productIds.has(o.product_id));
  console.log("orders referencing missing product ids:", orphanRefs.length);
  for (const o of orphanRefs) {
    console.log("  orphan:", o.id, "->", o.product_id);
  }
}
