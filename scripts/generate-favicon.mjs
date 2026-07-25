// Jana src/app/favicon.ico daripada public/icon-512.png (logo CFK atas kotak #1E293B).
// Guna: node scripts/generate-favicon.mjs
// ICO dibina tangan: entri PNG (disokong semua browser moden) pada 16/32/48px.
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'public/icon-512.png')
const SAIZ = [16, 32, 48]

const imej = []
for (const s of SAIZ) {
  imej.push({ saiz: s, buf: await sharp(SRC).resize(s, s).png({ compressionLevel: 9 }).toBuffer() })
}

// ICONDIR (6 bait) + ICONDIRENTRY (16 bait setiap satu) + data PNG
const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0) // reserved
header.writeUInt16LE(1, 2) // type 1 = ikon
header.writeUInt16LE(imej.length, 4)

let offset = 6 + imej.length * 16
const entri = []
for (const { saiz, buf } of imej) {
  const e = Buffer.alloc(16)
  e.writeUInt8(saiz === 256 ? 0 : saiz, 0) // lebar
  e.writeUInt8(saiz === 256 ? 0 : saiz, 1) // tinggi
  e.writeUInt8(0, 2) // bilangan warna palet (0 = truecolor)
  e.writeUInt8(0, 3) // reserved
  e.writeUInt16LE(1, 4) // color planes
  e.writeUInt16LE(32, 6) // bit per piksel
  e.writeUInt32LE(buf.length, 8)
  e.writeUInt32LE(offset, 12)
  entri.push(e)
  offset += buf.length
}

const ico = Buffer.concat([header, ...entri, ...imej.map((i) => i.buf)])
writeFileSync(join(ROOT, 'src/app/favicon.ico'), ico)
console.log(`OK src/app/favicon.ico (${SAIZ.join('/')}px, ${ico.length} bait)`)
