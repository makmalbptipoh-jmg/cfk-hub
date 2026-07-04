import sharp from "sharp";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Latar penuh tanpa bucu lutsinar kerana manifest menanda ikon sebagai
// "any maskable" — teks dikekalkan dalam zon selamat 80% tengah.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#84CC16"/>
  <text x="256" y="256" font-family="Arial, Helvetica, sans-serif" font-size="150"
    font-weight="bold" fill="#1E293B" text-anchor="middle"
    dominant-baseline="central">CFK</text>
</svg>`;

for (const size of [192, 512]) {
  const out = path.join(root, "public", `icon-${size}.png`);
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(out);
  console.log(`Dijana: ${out}`);
}
