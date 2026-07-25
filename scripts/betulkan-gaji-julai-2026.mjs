// Pembetulan sekali-sahaja: rekod bayaran jurulatih 25 Julai 2026 mengira semula
// sesi sepenuh bulan, termasuk sesi yang sudah dibayar 5–7 Julai (gaji berganda).
// Skrip ini melaraskan bilangan_sesi turun kepada baki sebenar, dan melaraskan
// baris kewangan_perbelanjaan yang sepadan.
//
// Guna: node scripts/betulkan-gaji-julai-2026.mjs            → pratonton
//       node scripts/betulkan-gaji-julai-2026.mjs --commit   → laksana
//
// Keselamatan: setiap baris disemak dahulu terhadap nilai SEMASA yang dijangka.
// Jika tidak sepadan (skrip sudah dijalankan / data berubah), skrip BERHENTI.
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split(/\r?\n/).filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()])
)
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const COMMIT = process.argv.includes('--commit')
const rm = (n) => 'RM' + Number(n).toFixed(2)

// nama jurulatih → { sesiSekarang (dijangka), sesiBetul, kadar }
const PEMBETULAN = {
  'KHATIB BIN MD YAN':          { sesiSekarang: 17, sesiBetul: 13, kadar: 50 },
  'AISYAH UMAIRAH BINTI KHATIB': { sesiSekarang: 13, sesiBetul: 12, kadar: 7 },
  'AISYAH MAISARAH BINTI KHATIB': { sesiSekarang: 8, sesiBetul: 4, kadar: 7 },
  'AISYAH AZZAHRA BINTI KHATIB': { sesiSekarang: 7,  sesiBetul: 6,  kadar: 7 },
}
const TARIKH = '2026-07-25'

const { data: jurulatih } = await db.from('jurulatih').select('id, nama_penuh')
const namaId = Object.fromEntries(jurulatih.map((j) => [j.nama_penuh, j.id]))

const { data: bayaran } = await db.from('bayaran_jurulatih')
  .select('id, jurulatih_id, bilangan_sesi, kadar_per_sesi, jumlah, potongan_advance, tarikh_bayar')
  .eq('bulan_bayaran', 'Julai').eq('tahun_bayaran', 2026).eq('tarikh_bayar', TARIKH)
const { data: belanja } = await db.from('kewangan_perbelanjaan')
  .select('id, tarikh, penerangan, jumlah').eq('kategori', 'Gaji Jurulatih').eq('tarikh', TARIKH)

const kerja = []
for (const [nama, p] of Object.entries(PEMBETULAN)) {
  const jid = namaId[nama]
  if (!jid) { console.error(`✗ Jurulatih "${nama}" tiada dalam DB — BERHENTI.`); process.exit(1) }
  const rekod = (bayaran ?? []).filter((b) => b.jurulatih_id === jid)
  if (rekod.length !== 1) {
    console.error(`✗ ${nama}: jangka 1 rekod bertarikh ${TARIKH}, jumpa ${rekod.length} — BERHENTI.`)
    process.exit(1)
  }
  const b = rekod[0]
  if (b.bilangan_sesi !== p.sesiSekarang || Number(b.kadar_per_sesi) !== p.kadar) {
    console.error(`✗ ${nama}: nilai semasa ${b.bilangan_sesi} sesi × ${rm(b.kadar_per_sesi)} tidak sepadan jangkaan ${p.sesiSekarang} × ${rm(p.kadar)} — BERHENTI (mungkin sudah dibetulkan).`)
    process.exit(1)
  }
  const jumlahLama = p.sesiSekarang * p.kadar
  const jumlahBaru = p.sesiBetul * p.kadar
  // Padan baris kewangan ikut jumlah + nama dalam penerangan
  const barisBelanja = (belanja ?? []).filter(
    (x) => x.penerangan.includes(nama) && Math.abs(Number(x.jumlah) - jumlahLama) < 0.005
  )
  if (barisBelanja.length !== 1) {
    console.error(`✗ ${nama}: jangka 1 baris Kewangan ${rm(jumlahLama)} pada ${TARIKH}, jumpa ${barisBelanja.length} — BERHENTI.`)
    process.exit(1)
  }
  kerja.push({ nama, bayaranId: b.id, belanjaId: barisBelanja[0].id, ...p, jumlahLama, jumlahBaru })
}

console.log(`Pembetulan gaji Julai 2026 — rekod bertarikh ${TARIKH}\n`)
let jumlahKurang = 0
for (const k of kerja) {
  console.log(`── ${k.nama}`)
  console.log(`   bayaran_jurulatih : ${k.sesiSekarang} sesi × ${rm(k.kadar)} = ${rm(k.jumlahLama)}  →  ${k.sesiBetul} sesi × ${rm(k.kadar)} = ${rm(k.jumlahBaru)}`)
  console.log(`   kewangan          : ${rm(k.jumlahLama)}  →  ${rm(k.jumlahBaru)}`)
  jumlahKurang += k.jumlahLama - k.jumlahBaru
}
console.log(`\nJumlah dikurangkan: ${rm(jumlahKurang)}`)

if (!COMMIT) {
  console.log('\n(PRATONTON SAHAJA — tiada perubahan. Tambah --commit untuk laksana.)')
  process.exit(0)
}

console.log('\n--commit: melaksanakan...')
for (const k of kerja) {
  // jumlah adalah kolum GENERATED — jangan hantar, ia dikira semula sendiri
  const { error: e1 } = await db.from('bayaran_jurulatih')
    .update({ bilangan_sesi: k.sesiBetul, nota: `Dilaraskan ${TARIKH}: sesi awal Julai sudah dibayar berasingan` })
    .eq('id', k.bayaranId)
  if (e1) { console.error(`✗ ${k.nama} bayaran: ${e1.message} — BERHENTI.`); process.exit(1) }

  const { error: e2 } = await db.from('kewangan_perbelanjaan')
    .update({
      jumlah: k.jumlahBaru,
      penerangan: `Gaji ${k.nama} — Julai 2026 (${k.sesiBetul} sesi × RM${k.kadar.toFixed(2)})`,
    })
    .eq('id', k.belanjaId)
  if (e2) { console.error(`✗ ${k.nama} kewangan: ${e2.message} — BERHENTI.`); process.exit(1) }

  console.log(`   ✓ ${k.nama}: ${rm(k.jumlahLama)} → ${rm(k.jumlahBaru)}`)
}
console.log(`\nSelesai — jumlah dikurangkan ${rm(jumlahKurang)}.`)
