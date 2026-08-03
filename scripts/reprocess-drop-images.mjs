/**
 * Re-convert drop-01 hero + homepage product reveal image from latest sources.
 * Usage: node scripts/reprocess-drop-images.mjs
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const publicDir = path.join(root, "public");
const originalsDir = path.join(publicDir, "_originals");

async function encodeWebpUnderBudget(inputPath, { maxWidth, maxBytes, flatten }) {
  let pipeline = sharp(inputPath).rotate().resize({
    width: maxWidth,
    fit: "inside",
    withoutEnlargement: true,
  });

  if (flatten) {
    pipeline = pipeline.flatten({ background: { r: 255, g: 255, b: 255 } });
  }

  let quality = 82;
  let lastBuffer = null;

  while (quality >= 48) {
    lastBuffer = await pipeline.clone().webp({ quality, effort: 6 }).toBuffer();
    if (lastBuffer.length <= maxBytes) break;
    quality -= 4;
  }

  return { buffer: lastBuffer, quality };
}

async function writeWebpOutput(buffer, outputPath) {
  const tempPath = `${outputPath}.tmp`;
  fs.writeFileSync(tempPath, buffer);
  try {
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    fs.renameSync(tempPath, outputPath);
  } catch {
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    fs.writeFileSync(outputPath, buffer);
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
}

function resolveInput(candidates) {
  for (const name of candidates) {
    const exact = path.join(publicDir, name);
    if (fs.existsSync(exact)) return { name, path: exact };
  }

  for (const name of candidates) {
    const backup = path.join(originalsDir, name);
    if (fs.existsSync(backup)) return { name, path: backup, fromOriginals: true };
  }

  const publicFiles = fs.readdirSync(publicDir);
  for (const name of candidates) {
    const match = publicFiles.find((file) => file.toLowerCase() === name.toLowerCase());
    if (match) return { name: match, path: path.join(publicDir, match) };
  }

  return null;
}

async function main() {
  fs.mkdirSync(originalsDir, { recursive: true });

  const jobs = [
    {
      label: "drop-01",
      candidates: ["drop01.jpeg", "drop01.jpg", "drop01.png", "drop 01.png"],
      output: "drop-01.webp",
      maxWidth: 1400,
      maxBytes: 450_000,
      flatten: false,
    },
    {
      label: "product-placeholder (homepage reveal)",
      candidates: [
        "product-placeholder.png",
        "product-placeholder.jpeg",
        "product-placeholder.jpg",
        "product-placeholder.webp",
        "photo1.JPEG",
        "photo1.jpeg",
        "photo1.png",
      ],
      output: "product-reveal.webp",
      maxWidth: 1400,
      maxBytes: 450_000,
      // Opaque white backing — dark cutouts disappear on the warehouse scene.
      flatten: true,
    },
  ];

  for (const job of jobs) {
    const resolved = resolveInput(job.candidates);
    if (!resolved) {
      console.error(`MISSING source for ${job.label}:`, job.candidates.join(", "));
      process.exit(1);
    }

    const outputPath = path.join(publicDir, job.output);
    const backupPath = path.join(originalsDir, resolved.name);

    if (!resolved.fromOriginals && !fs.existsSync(backupPath)) {
      fs.copyFileSync(resolved.path, backupPath);
    }

    const result = await encodeWebpUnderBudget(resolved.path, job);
    await writeWebpOutput(result.buffer, outputPath);
    console.log(
      `${resolved.name} → ${job.output} (${(result.buffer.length / 1024).toFixed(1)} KB, q=${result.quality})`
    );

    if (
      !resolved.fromOriginals &&
      resolved.path.startsWith(publicDir) &&
      path.basename(resolved.path) !== job.output &&
      !resolved.name.endsWith(".webp")
    ) {
      fs.unlinkSync(resolved.path);
      console.log(`  removed source ${resolved.name}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
