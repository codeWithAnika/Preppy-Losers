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
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const { data, error } = await supabase
  .from("products")
  .select("id, name, images, is_active")
  .eq("id", "drop-02")
  .maybeSingle();

if (error) {
  console.error("SELECT failed:", error.message);
  process.exit(1);
}

console.log(JSON.stringify(data, null, 2));
console.log("");
console.log("images array:");
console.log(JSON.stringify(data?.images ?? null));
