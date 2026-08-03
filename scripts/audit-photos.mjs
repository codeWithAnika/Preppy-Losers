import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(import.meta.dirname, "..");
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

const CODE_REFS = [
  "/product-placeholder.webp",
  "/photo2.webp",
  "/photo3.webp",
  "/photo4.webp",
  "/photo5.webp",
  "/drop-01.webp",
  "/logo-badge.webp",
  "/background.webp",
  "/blur.webp",
  "/manifesto-bg.webp",
];

const publicFiles = fs.readdirSync(publicDir).sort();
console.log("=== public/ files ===");
console.log(publicFiles.join("\n"));

const env = loadEnv(path.join(root, ".env.local"));
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const { data: products, error } = await supabase
  .from("products")
  .select("id, name, is_active, images, primary_image")
  .order("drop_date", { ascending: false });

if (error) {
  console.error("\nDB error:", error.message);
} else {
  console.log("\n=== DB product images ===");
  for (const p of products ?? []) {
    console.log(`\n${p.id} (${p.is_active ? "active" : "past"})`);
    console.log("  primary_image:", p.primary_image ?? "(null)");
    console.log("  images:", JSON.stringify(p.images));
  }
}

const dbPaths = new Set();
for (const p of products ?? []) {
  for (const img of p.images ?? []) dbPaths.add(img);
  if (p.primary_image) dbPaths.add(p.primary_image);
}

const allRefs = new Set([...CODE_REFS, ...dbPaths]);

console.log("\n=== Missing files (referenced but not in public/) ===");
for (const ref of [...allRefs].sort()) {
  const file = ref.replace(/^\//, "");
  if (!publicFiles.includes(file)) {
    console.log("  MISSING:", ref, `(expected ${file})`);
  }
}

console.log("\n=== Orphan files (in public/ but not referenced) ===");
for (const file of publicFiles) {
  const webPath = `/${file}`;
  if (!allRefs.has(webPath)) {
    console.log("  ORPHAN:", webPath);
  }
}

console.log("\n=== Case-sensitivity check ===");
for (const ref of [...allRefs].sort()) {
  const file = ref.replace(/^\//, "");
  if (publicFiles.includes(file)) continue;
  const lower = publicFiles.find((f) => f.toLowerCase() === file.toLowerCase());
  if (lower) {
    console.log("  CASE MISMATCH:", ref, "-> file on disk:", lower);
  }
}
