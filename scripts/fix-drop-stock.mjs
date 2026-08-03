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

if (!serviceKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY required for stock updates.");
  process.exit(1);
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const drop01Stock = [
  { size: "S", stock: 0 },
  { size: "M", stock: 0 },
  { size: "L", stock: 0 },
  { size: "XL", stock: 0 },
];

const drop02Stock = [
  { size: "XS", stock: 5 },
  { size: "S", stock: 5 },
  { size: "M", stock: 5 },
  { size: "L", stock: 5 },
  { size: "XL", stock: 5 },
  { size: "2XL", stock: 5 },
  { size: "3XL", stock: 5 },
];

const { error: drop01Error } = await supabase.from("products").upsert(
  {
    id: "drop-01",
    name: "Streetlight Tee",
    description:
      "Midweight 240gsm cotton jersey in vintage wash. Boxy cut, screen-printed back graphic, pre-shrunk. The first drop — gone in forty-eight hours.",
    details: null,
    price: 45,
    size_stock: drop01Stock,
    images: ["/drop-01.webp"],
    is_active: false,
    drop_date: "2025-11-08",
    accent_color: null,
  },
  { onConflict: "id" }
);

if (drop01Error) {
  console.error("drop-01 upsert failed:", drop01Error.message);
  process.exit(1);
}

const { error: drop02Error } = await supabase
  .from("products")
  .update({
    is_active: true,
    drop_date: "2026-03-15",
    accent_color: "#8b1e1e",
    size_stock: drop02Stock,
  })
  .eq("id", "drop-02");

if (drop02Error) {
  console.error("drop-02 update failed:", drop02Error.message);
  process.exit(1);
}

const { data, error } = await supabase
  .from("products")
  .select("id, name, is_active, size_stock")
  .order("drop_date", { ascending: false });

if (error) {
  console.error("verify failed:", error.message);
  process.exit(1);
}

console.log(JSON.stringify(data, null, 2));
