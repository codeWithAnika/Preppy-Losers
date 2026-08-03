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

const GALLERY_IMAGES = [
  "/photo1.webp",
  "/photo2.webp",
  "/photo3.webp",
  "/photo4.webp",
  "/photo5.webp",
];

const SIZING_ILLUSTRATION = "/photo6.webp";

console.log("=== Disk check ===");
for (const ref of [...GALLERY_IMAGES, SIZING_ILLUSTRATION]) {
  const file = ref.replace(/^\//, "");
  const exists = fs.existsSync(path.join(publicDir, file));
  console.log(exists ? "OK" : "MISSING", ref);
}

const SQL_UPDATE = `UPDATE public.products
SET images = '[
  "/photo1.webp",
  "/photo2.webp",
  "/photo3.webp",
  "/photo4.webp",
  "/photo5.webp"
]'::jsonb
WHERE id = 'drop-02';`;

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
  .select("id, name, images")
  .eq("id", "drop-02")
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
  .update({ images: GALLERY_IMAGES })
  .eq("id", "drop-02")
  .select("id, name, images");

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

const expected = JSON.stringify(GALLERY_IMAGES);
const actual = JSON.stringify(updated.images);
const ok = actual === expected;

console.log("\n=== VERIFICATION ===");
console.log("expected:", expected);
console.log("actual:  ", actual);
console.log("match:", ok ? "PASS" : "FAIL");
console.log("sizing illustration path:", SIZING_ILLUSTRATION);

if (!ok) process.exit(1);
