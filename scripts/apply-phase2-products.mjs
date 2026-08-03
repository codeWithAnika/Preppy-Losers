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
const url = env.NEXT_PUBLIC_SUPABASE_URL;

if (!url || !serviceKey) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const DROP_02 = {
  id: "drop-02",
  drop_number: 2,
  name: "HEXED SYSTEM",
  description: "Engineered for the streets.",
  details:
    "260 GSM Heavyweight Cotton\n100% Cotton Fabric\nPremium Screen Print\nCrop Boxy Fit",
  price: 859,
  size_stock: [
    { size: "XS", stock: 30 },
    { size: "S", stock: 30 },
    { size: "M", stock: 30 },
    { size: "L", stock: 30 },
    { size: "XL", stock: 30 },
  ],
  images: [
    "/photo1.webp",
    "/photo2.webp",
    "/photo3.webp",
    "/photo4.webp",
    "/photo5.webp",
  ],
  is_active: true,
  drop_date: "2026-03-15",
  accent_color: "#8b1e1e",
};

const DROP_01 = {
  id: "drop-01",
  drop_number: 1,
  name: "Streetlight Tee",
  description:
    "Midweight 240gsm cotton jersey in vintage wash. Boxy cut, screen-printed back graphic, pre-shrunk. The first drop — gone in forty-eight hours.",
  details: null,
  price: 45,
  size_stock: [
    { size: "S", stock: 0 },
    { size: "M", stock: 0 },
    { size: "L", stock: 0 },
    { size: "XL", stock: 0 },
  ],
  images: ["/drop-01.webp"],
  is_active: false,
  drop_date: "2025-11-08",
  accent_color: null,
};

const probe = await supabase.from("products").select("drop_number").limit(1);
if (probe.error) {
  console.error(
    "Column drop_number may not exist yet. Run supabase/migrations/20260713130000_product_drop_number.sql in SQL Editor first."
  );
  console.error("Error:", probe.error.message);
  process.exit(1);
}

for (const row of [DROP_02, DROP_01]) {
  const { error } = await supabase.from("products").upsert(row, { onConflict: "id" });
  if (error) {
    console.error(`upsert ${row.id} failed:`, error.message);
    process.exit(1);
  }
}

const { data: all, error: listError } = await supabase
  .from("products")
  .select("id, drop_number, name, is_active, price, size_stock, images")
  .order("drop_number", { ascending: true });

if (listError) {
  console.error("verify failed:", listError.message);
  process.exit(1);
}

console.log("=== FINAL PRODUCTS TABLE ===");
console.log(JSON.stringify(all, null, 2));
console.log("row_count:", all?.length ?? 0);
