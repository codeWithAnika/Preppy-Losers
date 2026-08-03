import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(import.meta.dirname, "..");
const envPath = path.join(root, ".env.local");

function loadEnv(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
  return env;
}

const env = loadEnv(envPath);
const serviceKey =
  env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SERVICE_KEY ?? null;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const url = env.NEXT_PUBLIC_SUPABASE_URL;

const SIZE_STOCK = [
  { size: "XS", stock: 30 },
  { size: "S", stock: 30 },
  { size: "M", stock: 30 },
  { size: "L", stock: 30 },
  { size: "XL", stock: 30 },
];

const SQL_UPDATE = `UPDATE public.products
SET size_stock = '[
  {"size": "XS", "stock": 30},
  {"size": "S", "stock": 30},
  {"size": "M", "stock": 30},
  {"size": "L", "stock": 30},
  {"size": "XL", "stock": 30}
]'::jsonb
WHERE id = 'drop-02';`;

console.log("=== SQL UPDATE ===");
console.log(SQL_UPDATE);
console.log("");

const readClient = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: before } = await readClient
  .from("products")
  .select("id, name, size_stock")
  .eq("id", "drop-02")
  .maybeSingle();

console.log("=== BEFORE ===");
console.log(JSON.stringify(before, null, 2));
console.log("");

if (!serviceKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY required to run UPDATE.");
  process.exit(1);
}

const writeClient = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: updatedRows, error: updateError } = await writeClient
  .from("products")
  .update({ size_stock: SIZE_STOCK })
  .eq("id", "drop-02")
  .select("id, name, size_stock");

if (updateError) {
  console.error("UPDATE failed:", updateError.message);
  process.exit(1);
}

const updated = updatedRows?.[0];
if (!updated) {
  console.error("UPDATE affected 0 rows.");
  process.exit(1);
}

console.log("=== AFTER ===");
console.log(JSON.stringify(updated, null, 2));
console.log("");
console.log("size_stock array:");
console.log(JSON.stringify(updated.size_stock));

const sizes = updated.size_stock.map((entry) => entry.size);
const stocks = updated.size_stock.map((entry) => entry.stock);
const ok =
  sizes.length === 5 &&
  sizes.join(",") === "XS,S,M,L,XL" &&
  stocks.every((n) => n === 30);

console.log("");
console.log("verification:", ok ? "PASS (5 sizes, 30 each)" : "FAIL");
if (!ok) process.exit(1);
