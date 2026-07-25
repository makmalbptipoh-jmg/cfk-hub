// Semak (dan buang) pelajar duplikat — nama sama didaftar 2x atau lebih.
// Punca biasa: jurulatih guna app lama tapi data masuk ke DB baharu.
//
// Guna: node scripts/semak-pelajar-duplikat.mjs            → LAPORAN sahaja (tiada perubahan)
//       node scripts/semak-pelajar-duplikat.mjs --commit   → buang duplikat yang SELAMAT sahaja
//
// "Selamat" = rekod duplikat itu TIADA langsung rekod berkait (kehadiran, resit,
// jadual, aktiviti, silibus, permintaan bayaran). Jika ada, ia dilangkau dan
// dilaporkan untuk keputusan manual — jangan sesekali padam data kewangan/kehadiran.
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

// Jadual anak yang merujuk pelajar(id) — semua mesti kosong sebelum boleh padam
const ANAK = ['kehadiran', 'resit', 'jadual_slot', 'aktiviti', 'silibus', 'permintaan_bayaran']

const norm = (s) => (s ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim().toUpperCase()

const { data: pelajar, error } = await db
  .from('pelajar')
  .select('id, nama_penuh, tarikh_lahir, nama_ibu_bapa, no_telefon, cawangan_daftar_id, jenis_kelas, yuran_bulanan, status, tarikh_daftar, sumber_daftar, created_at')
  .order('created_at', { ascending: true })
if (error) { console.error('Gagal baca pelajar:', error.message); process.exit(1) }

const { data: cawangan } = await db.from('cawangan').select('id, nama')
const namaCawangan = Object.fromEntries((cawangan ?? []).map((c) => [c.id, c.nama]))

console.log(`Jumlah pelajar dalam DB: ${pelajar.length}\n`)

const kumpulan = new Map()
for (const p of pelajar) {
  const k = norm(p.nama_penuh)
  if (!kumpulan.has(k)) kumpulan.set(k, [])
  kumpulan.get(k).push(p)
}
const duplikat = [...kumpulan.entries()].filter(([, v]) => v.length > 1)

if (duplikat.length === 0) {
  console.log('✅ Tiada nama pelajar berulang. Tiada apa-apa perlu dibuang.')
  process.exit(0)
}

// Kira rekod berkait untuk setiap pelajar dalam kumpulan duplikat
const semuaId = duplikat.flatMap(([, v]) => v.map((p) => p.id))
const kiraan = Object.fromEntries(semuaId.map((id) => [id, {}]))
for (const jadual of ANAK) {
  const { data, error: e } = await db.from(jadual).select('pelajar_id').in('pelajar_id', semuaId)
  if (e) { console.error(`Gagal baca ${jadual}: ${e.message} — HENTI demi keselamatan.`); process.exit(1) }
  for (const r of data ?? []) kiraan[r.pelajar_id][jadual] = (kiraan[r.pelajar_id][jadual] ?? 0) + 1
}
const jumlahAnak = (id) => Object.values(kiraan[id]).reduce((a, b) => a + b, 0)
const ringkasAnak = (id) => {
  const e = Object.entries(kiraan[id]).filter(([, n]) => n > 0)
  return e.length ? e.map(([j, n]) => `${j}:${n}`).join(', ') : 'tiada rekod berkait'
}

const bolehBuang = []
const perluManual = []

console.log(`⚠️  ${duplikat.length} nama berulang dijumpai:\n`)
for (const [nama, senarai] of duplikat) {
  // Simpan yang PALING BANYAK rekod berkait; seri → yang paling awal didaftar (asal)
  const disusun = [...senarai].sort(
    (a, b) => jumlahAnak(b.id) - jumlahAnak(a.id) || new Date(a.created_at) - new Date(b.created_at)
  )
  const [simpan, ...buang] = disusun
  console.log(`── ${nama} (${senarai.length} rekod)`)
  for (const p of disusun) {
    const peranan = p === simpan ? 'SIMPAN ' : jumlahAnak(p.id) === 0 ? 'BUANG  ' : 'MANUAL '
    console.log(
      `   [${peranan}] ${p.id}  daftar:${p.tarikh_daftar}  cwgn:${namaCawangan[p.cawangan_daftar_id] ?? '?'}  ` +
      `tel:${p.no_telefon}  ibubapa:${p.nama_ibu_bapa}  ${p.jenis_kelas}  RM${p.yuran_bulanan}  ${p.status}  ` +
      `sumber:${p.sumber_daftar}\n              └─ ${ringkasAnak(p.id)}`
    )
  }
  for (const p of buang) (jumlahAnak(p.id) === 0 ? bolehBuang : perluManual).push({ nama, p })
  console.log('')
}

console.log('══════════════════════════════════════════')
console.log(`Selamat dibuang (kosong, tiada rekod berkait) : ${bolehBuang.length}`)
console.log(`Perlu semakan manual (ada kehadiran/bayaran)  : ${perluManual.length}`)
if (perluManual.length) {
  console.log('\nRekod berikut TIDAK disentuh — ada data sebenar, perlu digabung dahulu:')
  for (const { nama, p } of perluManual) console.log(`   ${nama} — ${p.id} (${ringkasAnak(p.id)})`)
}

if (!COMMIT) {
  console.log('\n(LAPORAN SAHAJA — tiada apa-apa dipadam.)')
  console.log('Untuk buang yang selamat: node scripts/semak-pelajar-duplikat.mjs --commit')
  process.exit(0)
}

if (!bolehBuang.length) { console.log('\nTiada rekod selamat untuk dibuang.'); process.exit(0) }

console.log('\n--commit: memadam rekod duplikat kosong...')
let ok = 0, gagal = 0
for (const { nama, p } of bolehBuang) {
  const { error: e } = await db.from('pelajar').delete().eq('id', p.id)
  if (e) { console.log(`   ✗ ${nama} ${p.id}: ${e.message}`); gagal++ }
  else { console.log(`   ✓ dibuang: ${nama} ${p.id}`); ok++ }
}
console.log(`\nSelesai — ${ok} dibuang, ${gagal} gagal.`)
