/**
 * Compress /public marketing and product images to WebP.
 * Originals are moved to public/_originals/ (not deleted).
 *
 * Usage: node scripts/compress-public-images.mjs
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const publicDir = path.join(root, "public");
const originalsDir = path.join(publicDir, "_originals");

/** @type {Array<{ input: string | string[]; output: string; maxWidth: number; maxBytes: number }>} */
const ASSETS = [
  { input: "manifesto-bg.jpg", output: "manifesto-bg.webp", maxWidth: 1920, maxBytes: 480_000 },
  { input: "blur.jpg", output: "blur.webp", maxWidth: 1600, maxBytes: 350_000 },
  { input: "background.png", output: "background.webp", maxWidth: 1920, maxBytes: 480_000 },
  { input: "logo-badge.png", output: "logo-badge.webp", maxWidth: 512, maxBytes: 64_000 },
  {
    input: ["photo1.JPEG", "photo1.jpeg", "photo1.jpg", "photo1.png"],
    output: "photo1.webp",
    maxWidth: 1400,
    maxBytes: 450_000,
  },
  {
    input: ["photo2.png", "photo2.jpeg", "photo2.jpg", "photo2.JPEG"],
    output: "photo2.webp",
    maxWidth: 1400,
    maxBytes: 450_000,
  },
  {
    input: ["photo3.png", "photo3.jpeg", "photo3.jpg", "photo3.JPEG"],
    output: "photo3.webp",
    maxWidth: 1400,
    maxBytes: 450_000,
  },
  {
    input: ["photo4.png", "photo4.jpeg", "photo4.jpg", "photo4.JPEG"],
    output: "photo4.webp",
    maxWidth: 1400,
    maxBytes: 450_000,
  },
  {
    input: ["photo5.png", "photo5.jpeg", "photo5.jpg", "photo5.JPEG"],
    output: "photo5.webp",
    maxWidth: 1400,
    maxBytes: 450_000,
  },
  { input: "photo6.jpeg", output: "photo6.webp", maxWidth: 1200, maxBytes: 200_000 },
  { input: "placeholder1.JPG", output: "placeholder1.webp", maxWidth: 1200, maxBytes: 450_000 },
  { input: "placeholder2.png", output: "placeholder2.webp", maxWidth: 1200, maxBytes: 450_000 },
  { input: "placeholder3.JPG", output: "placeholder3.webp", maxWidth: 1200, maxBytes: 450_000 },
  {
    input: "product-placeholder.png",
    output: "product-placeholder.webp",
    maxWidth: 1400,
    maxBytes: 450_000,
  },
  {
    input: ["drop01.jpeg", "drop01.jpg", "drop01.png", "drop 01.png", "drop1.png", "drop-01.png"],
    output: "drop-01.webp",
    maxWidth: 1400,
    maxBytes: 450_000,
  },
  {
    input: ["Nishant.jpeg", "nishant.jpeg"],
    output: "nishant.webp",
    maxWidth: 900,
    maxBytes: 120_000,
  },
  {
    input: ["Govinda.jpeg", "govinda.jpeg"],
    output: "govinda.webp",
    maxWidth: 900,
    maxBytes: 120_000,
  },
  { input: "team1.jpeg", output: "team1.webp", maxWidth: 900, maxBytes: 120_000 },
  { input: "team2.jpeg", output: "team2.webp", maxWidth: 900, maxBytes: 120_000 },
];

function resolvePublicInput(input) {
  const candidates = Array.isArray(input) ? input : [input];

  for (const name of candidates) {
    const exact = path.join(publicDir, name);
    if (fs.existsSync(exact)) return { name, path: exact };
  }

  const publicFiles = fs.readdirSync(publicDir);
  for (const name of candidates) {
    const match = publicFiles.find((file) => file.toLowerCase() === name.toLowerCase());
    if (match) return { name: match, path: path.join(publicDir, match) };
  }

  return null;
}

async function encodeWebpUnderBudget(inputPath, maxWidth, maxBytes) {
  const pipeline = sharp(inputPath).rotate().resize({
    width: maxWidth,
    fit: "inside",
    withoutEnlargement: true,
  });

  let quality = 82;
  let lastBuffer = null;

  while (quality >= 48) {
    lastBuffer = await pipeline.clone().webp({ quality, effort: 6 }).toBuffer();
    if (lastBuffer.length <= maxBytes) {
      return { buffer: lastBuffer, quality };
    }
    quality -= 4;
  }

  return { buffer: lastBuffer, quality: 48 };
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

async function main() {
  fs.mkdirSync(originalsDir, { recursive: true });

  const report = [];

  for (const asset of ASSETS) {
    const resolved = resolvePublicInput(asset.input);
    const outputPath = path.join(publicDir, asset.output);
    const label = Array.isArray(asset.input) ? asset.input.join(" | ") : asset.input;

    if (!resolved) {
      console.warn(`SKIP (missing): ${label}`);
      continue;
    }

    const inputPath = resolved.path;
    const backupPath = path.join(originalsDir, resolved.name);

    const beforeBytes = fs.statSync(inputPath).size;
    const { buffer, quality } = await encodeWebpUnderBudget(
      inputPath,
      asset.maxWidth,
      asset.maxBytes
    );

    if (!buffer) {
      throw new Error(`Failed to encode ${resolved.name}`);
    }

    fs.writeFileSync(outputPath, buffer);

    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(inputPath, backupPath);
    }

    fs.unlinkSync(inputPath);

    report.push({
      input: resolved.name,
      output: asset.output,
      beforeBytes,
      afterBytes: buffer.length,
      quality,
      withinBudget: buffer.length <= asset.maxBytes,
    });
  }

  console.log("\n=== Compression report ===\n");
  for (const row of report) {
    const pct = ((1 - row.afterBytes / row.beforeBytes) * 100).toFixed(1);
    console.log(
      `${row.input} → ${row.output}\n  before: ${formatKb(row.beforeBytes)} | after: ${formatKb(row.afterBytes)} (${pct}% smaller) | q=${row.quality}${row.withinBudget ? "" : " [OVER BUDGET]"}`
    );
  }

  const totalBefore = report.reduce((sum, row) => sum + row.beforeBytes, 0);
  const totalAfter = report.reduce((sum, row) => sum + row.afterBytes, 0);
  console.log(
    `\nTotal: ${formatKb(totalBefore)} → ${formatKb(totalAfter)} (${((1 - totalAfter / totalBefore) * 100).toFixed(1)}% reduction)`
  );
  console.log(`\nOriginals backed up to public/_originals/`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
