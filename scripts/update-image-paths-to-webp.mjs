/**
 * One-time path update after WebP conversion.
 * Usage: node scripts/update-image-paths-to-webp.mjs
 */

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

const REPLACEMENTS = [
  ["/manifesto-bg.jpg", "/manifesto-bg.webp"],
  ["/blur.jpg", "/blur.webp"],
  ["/background.png", "/background.webp"],
  ["/logo-badge.png", "/logo-badge.webp"],
  ["/photo1.png", "/photo1.webp"],
  ["/photo2.jpeg", "/photo2.webp"],
  ["/photo3.png", "/photo3.webp"],
  ["/photo4.png", "/photo4.webp"],
  ["/photo5.jpeg", "/photo5.webp"],
  ["/photo6.jpeg", "/photo6.webp"],
  ["/placeholder1.JPG", "/placeholder1.webp"],
  ["/placeholder2.png", "/placeholder2.webp"],
  ["/placeholder3.JPG", "/placeholder3.webp"],
  ["/product-placeholder.png", "/product-placeholder.webp"],
];

const SKIP_DIRS = new Set(["node_modules", ".next", "public/_originals", ".git"]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(tsx?|mjs|sql|json)$/.test(entry.name)) files.push(full);
  }
  return files;
}

let changed = 0;
for (const file of walk(root)) {
  if (file.includes("update-image-paths-to-webp.mjs")) continue;
  if (file.includes("compress-public-images.mjs")) continue;

  let text = fs.readFileSync(file, "utf8");
  let next = text;
  for (const [from, to] of REPLACEMENTS) {
    next = next.split(from).join(to);
  }
  if (next !== text) {
    fs.writeFileSync(file, next);
    changed += 1;
    console.log("updated:", path.relative(root, file));
  }
}

console.log(`\nDone. ${changed} file(s) updated.`);
