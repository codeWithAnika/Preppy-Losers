import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(import.meta.dirname, "..");
const envPath = path.join(root, ".env.local");
const publicDir = path.join(root, "public");

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

const DROP01_IMAGE = "/drop-01.webp";
const GALLERY_IMAGES = [DROP01_IMAGE];
const DETAILS =
  "240 GSM Heavyweight Cotton\r\n100% Cotton Fabric\r\nPremium Screen Print & Stone washed\r\nCrop Boxy Fit";

const SQL_UPDATE = `UPDATE public.products
SET
  name = 'BLACK LITURGY',
  price = 1299,
  details = E'240 GSM Heavyweight Cotton\\r\\n100% Cotton Fabric\\r\\nPremium Screen Print & Stone washed\\r\\nCrop Boxy Fit',
  description = '240gsm heavyweight cotton in stone wash. Boxy crop fit with premium screen print. The first drop — sold out.',
  images = '["/drop-01.webp"]'::jsonb,
  primary_image = '/drop-01.webp',
  updated_at = now()
WHERE id = 'drop-01';`;

console.log("=== Disk check ===");
const file = DROP01_IMAGE.replace(/^\//, "");
const exists = fs.existsSync(path.join(publicDir, file));
console.log(exists ? "OK" : "MISSING", DROP01_IMAGE);
if (!exists) process.exit(1);

console.log("\n=== SQL UPDATE ===");
console.log(SQL_UPDATE);

const env = loadEnv(envPath);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SERVICE_KEY ?? null;

if (!url || !serviceKey) {
  console.error("\nMissing Supabase env vars.");
  process.exit(1);
}

const client = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: before } = await client
  .from("products")
  .select("id, name, price, details, description, images, primary_image, status, is_active")
  .eq("id", "drop-01")
  .maybeSingle();

console.log("\n=== BEFORE ===");
console.log(JSON.stringify(before, null, 2));

const { data: updatedRows, error: updateError } = await client
  .from("products")
  .update({
    name: "BLACK LITURGY",
    price: 1299,
    details: DETAILS,
    description:
      "240gsm heavyweight cotton in stone wash. Boxy crop fit with premium screen print. The first drop — sold out.",
    images: GALLERY_IMAGES,
    primary_image: DROP01_IMAGE,
    updated_at: new Date().toISOString(),
  })
  .eq("id", "drop-01")
  .select("id, name, price, details, description, images, primary_image, status, is_active");

if (updateError) {
  console.error("\nUPDATE failed:", updateError.message);
  process.exit(1);
}

const updated = updatedRows?.[0];
console.log("\n=== AFTER ===");
console.log(JSON.stringify(updated, null, 2));

const checks = [
  ["name", updated?.name === "BLACK LITURGY"],
  ["price", updated?.price === 1299],
  ["images", JSON.stringify(updated?.images) === JSON.stringify(GALLERY_IMAGES)],
  ["primary_image", updated?.primary_image === DROP01_IMAGE],
  ["details bullets", (updated?.details ?? "").split(/\r?\n/).length === 4],
];

console.log("\n=== VERIFICATION ===");
for (const [label, ok] of checks) {
  console.log(`${label}:`, ok ? "PASS" : "FAIL");
}

if (checks.some(([, ok]) => !ok)) process.exit(1);
