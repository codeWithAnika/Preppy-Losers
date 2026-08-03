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

console.log("=== Disk check ===");
const file = DROP01_IMAGE.replace(/^\//, "");
const exists = fs.existsSync(path.join(publicDir, file));
console.log(exists ? "OK" : "MISSING", DROP01_IMAGE);
if (!exists) process.exit(1);

const SQL_UPDATE = `UPDATE public.products
SET
  images = '["/drop-01.webp"]'::jsonb,
  primary_image = '/drop-01.webp'
WHERE id = 'drop-01';`;

console.log("\n=== SQL UPDATE ===");
console.log(SQL_UPDATE);

const env = loadEnv(envPath);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey =
  env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SERVICE_KEY ?? null;

const readClient = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: before } = await readClient
  .from("products")
  .select("id, name, slug, images, primary_image, status")
  .eq("id", "drop-01")
  .maybeSingle();

console.log("\n=== BEFORE ===");
console.log(JSON.stringify(before, null, 2));

if (!serviceKey) {
  console.error("\nSUPABASE_SERVICE_ROLE_KEY required to run UPDATE.");
  process.exit(1);
}

const writeClient = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: updatedRows, error: updateError } = await writeClient
  .from("products")
  .update({
    images: GALLERY_IMAGES,
    primary_image: DROP01_IMAGE,
  })
  .eq("id", "drop-01")
  .select("id, name, slug, images, primary_image, status");

if (updateError) {
  console.error("\nUPDATE failed:", updateError.message);
  process.exit(1);
}

const updated = updatedRows?.[0];
if (!updated) {
  console.error("\nUPDATE affected 0 rows.");
  process.exit(1);
}

console.log("\n=== AFTER ===");
console.log(JSON.stringify(updated, null, 2));

const imagesOk = JSON.stringify(updated.images) === JSON.stringify(GALLERY_IMAGES);
const primaryOk = updated.primary_image === DROP01_IMAGE;

console.log("\n=== VERIFICATION ===");
console.log("images match:", imagesOk ? "PASS" : "FAIL");
console.log("primary_image match:", primaryOk ? "PASS" : "FAIL");

if (!imagesOk || !primaryOk) process.exit(1);
