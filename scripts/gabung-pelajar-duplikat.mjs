// Gabung rekod pelajar duplikat: pindah SEMUA rekod berkait dari rekod lama
// ke rekod utama, kemudian buang rekod lama yang sudah kosong.
//
// Guna: node scripts/gabung-pelajar-duplikat.mjs            → pratonton sahaja
//       node scripts/gabung-pelajar-duplikat.mjs --commit   → laksana
//
// Keselamatan: kehadiran ada UNIQUE(pelajar_id, tarikh). Jika rekod utama sudah
// ada kehadiran pada tarikh yang sama, baris itu DILANGKAU (bukan ditimpa) dan
// dilaporkan — elak padam rekod kehadiran sedia ada.
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()])
)
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})
const COMMIT = process.argv.includes('--commit')

// { nama, lama: id-yang-dibuang, simpan: id-yang-kekal }
const GABUNG = [
  { nama: 'MUHAMMAD RAIHAN BIN MOHD HALIM', lama: 'bcb97a02-4ffb-4e39-aede-de0373f0c809', simpan: 'd6ba9a5e-bacd-49af-a35b-1516be33c7a7' },
  { nama: 'ILYAS MUKHLIS BIN AMIR RIDZWAN',  lama: '5be61479-58c2-432a-91a5-ac789ce498b4', simpan: '086c408c-88cc-42b4-8520-cce069373b5d' },
  { nama: 'YAHYA AYYASH BIN AMIR RIDZWAN',   lama: '9711fe7d-1e63-4edb-9622-3b065324f69c', simpan: '3fb329df-ce05-49fa-b180-1ebf666e2fe6' },
]

const ANAK = ['resit', 'jadual_slot', 'aktiviti', 'silibus', 'permintaan_bayaran'] // kehadiran diurus berasingan

for (const { nama, lama, simpan } of GABUNG) {
  console.log(`\n── ${nama}`)
  console.log(`   lama  : ${lama}`)
  console.log(`   simpan: ${simpan}`)

  // Sahkan kedua-dua rekod masih wujud sebelum sentuh apa-apa
  const { data: ada } = await db.from('pelajar').select('id, nama_penuh').in('id', [lama, simpan])
  if ((ada ?? []).length !== 2) {
    console.log('   ✗ LANGKAU — salah satu rekod tiada dalam DB.')
    continue
  }

  // 1) Kehadiran: semak pertindihan tarikh dahulu
  const { data: kLama } = await db.from('kehadiran').select('id, tarikh').eq('pelajar_id', lama)
  const { data: kSimpan } = await db.from('kehadiran').select('tarikh').eq('pelajar_id', simpan)
  const tarikhSimpan = new Set((kSimpan ?? []).map((r) => r.tarikh))
  const bolehPindah = (kLama ?? []).filter((r) => !tarikhSimpan.has(r.tarikh))
  const bertindih = (kLama ?? []).filter((r) => tarikhSimpan.has(r.tarikh))

  for (const r of bertindih) console.log(`   ! kehadiran ${r.tarikh} bertindih — DILANGKAU (rekod utama sudah ada)`)
  if (bolehPindah.length) {
    console.log(`   → pindah kehadiran: ${bolehPindah.map((r) => r.tarikh).join(', ')}`)
    if (COMMIT) {
      const { error } = await db.from('kehadiran').update({ pelajar_id: simpan }).in('id', bolehPindah.map((r) => r.id))
      if (error) { console.log(`   ✗ gagal pindah kehadiran: ${error.message} — HENTI.`); process.exit(1) }
    }
  }

  // 2) Jadual anak lain: pindah terus (tiada unique constraint pada pelajar_id)
  for (const jadual of ANAK) {
    const { data, error: e } = await db.from(jadual).select('id').eq('pelajar_id', lama)
    if (e) { console.log(`   ✗ gagal baca ${jadual}: ${e.message} — HENTI.`); process.exit(1) }
    if (!data?.length) continue
    console.log(`   → pindah ${jadual}: ${data.length} rekod`)
    if (COMMIT) {
      const { error } = await db.from(jadual).update({ pelajar_id: simpan }).eq('pelajar_id', lama)
      if (error) { console.log(`   ✗ gagal pindah ${jadual}: ${error.message} — HENTI.`); process.exit(1) }
    }
  }

  // 3) Buang rekod lama — HANYA jika benar-benar kosong sekarang
  if (COMMIT) {
    const baki = []
    for (const jadual of ['kehadiran', ...ANAK]) {
      const { data } = await db.from(jadual).select('id').eq('pelajar_id', lama).limit(1)
      if (data?.length) baki.push(jadual)
    }
    if (baki.length) {
      console.log(`   ! rekod lama DIKEKALKAN — masih ada baki dalam: ${baki.join(', ')}`)
    } else {
      const { error } = await db.from('pelajar').delete().eq('id', lama)
      console.log(error ? `   ✗ gagal buang rekod lama: ${error.message}` : '   ✓ rekod lama dibuang')
    }
  }
}

console.log(COMMIT ? '\nSelesai.' : '\n(PRATONTON SAHAJA — tiada perubahan. Tambah --commit untuk laksana.)')
