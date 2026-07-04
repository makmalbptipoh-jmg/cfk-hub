import sharp from "sharp";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Latar penuh tanpa bucu lutsinar kerana manifest menanda ikon sebagai
// "any maskable" — teks dikekalkan dalam zon selamat 80% tengah.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#1E293B"/>
  <text x="256" y="256" font-family="serif" font-size="260"
    font-weight="bold" fill="#FFC94D" text-anchor="middle"
    dominant-baseline="central">♟</text>
</svg>`;

for (const size of [192, 512]) {
  const out = path.join(root, "public", `icon-${size}.png`);
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(out);
  console.log(`Dijana: ${out}`);
}
