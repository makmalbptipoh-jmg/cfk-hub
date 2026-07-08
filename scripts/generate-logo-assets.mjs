// Jana aset logo CFK daripada fail sumber.
// Guna: node scripts/generate-logo-assets.mjs "<path-ke-logo-sumber.png>"
// Menghasilkan:
//   public/logo-cfk.png            — logo penuh (web UI)
//   src/components/pdf/logoCfk.ts  — logo kecil base64 (dikongsi semua PDF)
//   public/icon-192.png, icon-512.png — ikon app/favicon (logo atas kotak #1E293B)
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = process.argv[2] || 'C:/Users/admin/Desktop/khatib/LOGO_CFK-removebg-preview.png'
const BG = '#1E293B'

// 1) Logo penuh untuk web (lebar 400px cukup untuk paparan retina ~30-52px)
await sharp(SRC).resize({ width: 400 }).png({ compressionLevel: 9 }).toFile(join(ROOT, 'public/logo-cfk.png'))
console.log('OK public/logo-cfk.png')

// 2) Logo kecil base64 untuk PDF (lebar 180px → fail kecil)
const pdfBuf = await sharp(SRC).resize({ width: 180 }).png({ compressionLevel: 9 }).toBuffer()
const dataUri = `data:image/png;base64,${pdfBuf.toString('base64')}`
const ts = `// Auto-dijana oleh scripts/generate-logo-assets.mjs — JANGAN edit tangan.\n// Logo CFK (PNG ~180px) sebagai data URI untuk header PDF (@react-pdf/renderer Image).\nexport const LOGO_CFK = '${dataUri}'\n`
writeFileSync(join(ROOT, 'src/components/pdf/logoCfk.ts'), ts)
console.log(`OK src/components/pdf/logoCfk.ts (${Math.round(pdfBuf.length / 1024)}KB PNG)`)

// 3) Ikon app segi empat: logo atas kotak #1E293B dengan padding (maskable-safe)
for (const size of [192, 512]) {
  const pad = Math.round(size * 0.14)
  const inner = size - pad * 2
  const logo = await sharp(SRC)
    .resize({ width: inner, height: inner, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer()
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: logo, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(join(ROOT, `public/icon-${size}.png`))
  console.log(`OK public/icon-${size}.png`)
}
