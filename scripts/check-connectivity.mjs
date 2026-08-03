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

const start = performance.now();
const { data, error } = await supabase
  .from("products")
  .select("*")
  .order("drop_date", { ascending: false });
const ms = Math.round(performance.now() - start);

if (error) {
  console.error("FETCH_ERROR:", error.message);
  process.exit(1);
}

const active = data?.find((p) => p.is_active);
const past = data?.filter((p) => !p.is_active) ?? [];

console.log("latency_ms:", ms);
console.log("product_count:", data?.length ?? 0);
console.log("active:", active?.id, active?.name);
console.log("active_sizes:", active?.size_stock?.length);
console.log("active_images:", active?.images?.length);
console.log("past_drops:", past.map((p) => p.id).join(", ") || "none");
console.log("env_ok:", Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
