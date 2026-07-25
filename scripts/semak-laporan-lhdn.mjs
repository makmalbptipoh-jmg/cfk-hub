// Semak ketepatan Laporan LHDN (READ-ONLY) — hasilkan semula angka yang akan
// keluar dalam Excel, dan cari wang yang TERCICIR daripada laporan.
// Guna: node scripts/semak-laporan-lhdn.mjs [tahun]
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split(/\r?\n/).filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()])
)
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const TAHUN = Number(process.argv[2]) || 2026
const rm = (n) => 'RM' + Number(n).toFixed(2)
const mula = `${TAHUN}-01-01`, akhir = `${TAHUN}-12-31`

const [{ data: resit }, { data: belanja }, { data: pLain }, { data: dokumen }, { data: resitSemua }] = await Promise.all([
  db.from('resit').select('nombor_resit, jenis, jumlah, tarikh_bayar, kaedah_bayaran, status').eq('status', 'Aktif').gte('tarikh_bayar', mula).lte('tarikh_bayar', akhir),
  db.from('kewangan_perbelanjaan').select('tarikh, kategori, penerangan, jumlah').gte('tarikh', mula).lte('tarikh', akhir),
  db.from('pendapatan_lain').select('tarikh, sumber, kategori, jumlah, kaedah, dokumen_id').gte('tarikh', mula).lte('tarikh', akhir),
  db.from('dokumen_jualan').select('id, no_dokumen, tarikh, peringkat, kategori, pembeli_nama, tarikh_bayar').gte('tarikh', mula).lte('tarikh', akhir),
  db.from('resit').select('nombor_resit, jumlah, tarikh_bayar, status'),
])

console.log(`═══ LAPORAN LHDN ${TAHUN} — SEMAKAN ═══\n`)

// ── PENYATA PENDAPATAN (seperti sheet 1)
const perJenis = {}
for (const r of resit ?? []) perJenis[r.jenis] = (perJenis[r.jenis] ?? 0) + Number(r.jumlah)
const perKatLain = {}
for (const p of pLain ?? []) perKatLain[p.kategori] = (perKatLain[p.kategori] ?? 0) + Number(p.jumlah)
const perKatBelanja = {}
for (const b of belanja ?? []) perKatBelanja[b.kategori] = (perKatBelanja[b.kategori] ?? 0) + Number(b.jumlah)

const totResit = (resit ?? []).reduce((s, r) => s + Number(r.jumlah), 0)
const totLain = (pLain ?? []).reduce((s, p) => s + Number(p.jumlah), 0)
const totBelanja = (belanja ?? []).reduce((s, b) => s + Number(b.jumlah), 0)

console.log('PENDAPATAN')
for (const [k, v] of Object.entries(perJenis)) console.log(`   ${k.padEnd(28)} ${rm(v).padStart(12)}`)
for (const [k, v] of Object.entries(perKatLain)) console.log(`   ${k.padEnd(28)} ${rm(v).padStart(12)}`)
console.log(`   ${'JUMLAH PENDAPATAN'.padEnd(28)} ${rm(totResit + totLain).padStart(12)}`)
console.log('\nTOLAK: PERBELANJAAN')
for (const [k, v] of Object.entries(perKatBelanja)) console.log(`   ${k.padEnd(28)} ${rm(v).padStart(12)}`)
console.log(`   ${'JUMLAH PERBELANJAAN'.padEnd(28)} ${rm(totBelanja).padStart(12)}`)
console.log(`\n   ${'PENDAPATAN BERSIH'.padEnd(28)} ${rm(totResit + totLain - totBelanja).padStart(12)}`)

// ── SEMAKAN KETIRISAN
console.log('\n═══ SEMAKAN KETIRISAN ═══')
let isu = 0

// 1. Dokumen jualan peringkat 'Resit' TANPA pendapatan_lain sepadan
const adaDok = new Set((pLain ?? []).map((p) => p.dokumen_id).filter(Boolean))
const dokResit = (dokumen ?? []).filter((d) => d.peringkat === 'Resit')
const dokTercicir = dokResit.filter((d) => !adaDok.has(d.id))
if (dokTercicir.length) {
  isu++
  console.log(`⚠ ${dokTercicir.length} dokumen jualan peringkat "Resit" TIADA rekod pendapatan — duit masuk tak dikira:`)
  for (const d of dokTercicir) console.log(`     ${d.no_dokumen} ${d.tarikh} ${d.pembeli_nama} (${d.kategori})`)
} else {
  console.log(`✓ Dokumen jualan: ${dokResit.length} peringkat "Resit", semua ada rekod pendapatan`)
}
const dokInvois = (dokumen ?? []).filter((d) => d.peringkat === 'Invois')
if (dokInvois.length) {
  console.log(`   · ${dokInvois.length} invois belum jadi resit (belum dibayar) — betul, tidak dikira sebagai pendapatan (asas tunai)`)
}

// 2. Resit dengan tarikh_bayar di luar tahun / kosong
const resitLuar = (resitSemua ?? []).filter((r) => r.status === 'Aktif' && (!r.tarikh_bayar || r.tarikh_bayar < mula || r.tarikh_bayar > akhir))
if (resitLuar.length) {
  console.log(`   · ${resitLuar.length} resit aktif di luar tahun ${TAHUN} (${rm(resitLuar.reduce((s, r) => s + Number(r.jumlah), 0))}) — tidak dimasukkan, betul jika tahun lain`)
}
const resitBatal = (resitSemua ?? []).filter((r) => r.status !== 'Aktif')
console.log(`✓ Resit dibatalkan dikecualikan: ${resitBatal.length} rekod`)

// 3. Kaedah bayaran kosong (jatuh ke "Transfer" dalam rekonsiliasi bank)
const tiadaKaedah = (resit ?? []).filter((r) => !r.kaedah_bayaran)
if (tiadaKaedah.length) {
  isu++
  console.log(`⚠ ${tiadaKaedah.length} resit TIADA kaedah bayaran (${rm(tiadaKaedah.reduce((s, r) => s + Number(r.jumlah), 0))}) — sheet Rekonsiliasi Bank akan anggap ia Transfer/masuk bank:`)
  for (const r of tiadaKaedah.slice(0, 10)) console.log(`     ${r.nombor_resit} ${r.tarikh_bayar} ${rm(r.jumlah)}`)
  if (tiadaKaedah.length > 10) console.log(`     ... dan ${tiadaKaedah.length - 10} lagi`)
} else {
  console.log('✓ Semua resit ada kaedah bayaran')
}
const lainTiadaKaedah = (pLain ?? []).filter((p) => !p.kaedah)
if (lainTiadaKaedah.length) console.log(`   · ${lainTiadaKaedah.length} pendapatan lain tiada kaedah — dianggap Transfer`)

// 4. Perbelanjaan tanpa kategori/penerangan
const belanjaKosong = (belanja ?? []).filter((b) => !b.kategori?.trim() || !b.penerangan?.trim())
if (belanjaKosong.length) { isu++; console.log(`⚠ ${belanjaKosong.length} perbelanjaan tiada kategori/penerangan — LHDN perlu butiran`) }
else console.log('✓ Semua perbelanjaan ada kategori & penerangan')

// 5. Silang-semak gaji jurulatih: kewangan vs bayaran_jurulatih + advance
const { data: bayarJ } = await db.from('bayaran_jurulatih').select('jumlah, potongan_advance, status, tarikh_bayar').gte('tarikh_bayar', mula).lte('tarikh_bayar', akhir)
const { data: advJ } = await db.from('advance_jurulatih').select('jumlah, tarikh_advance').gte('tarikh_advance', mula).lte('tarikh_advance', akhir)
const gajiBersih = (bayarJ ?? []).filter((b) => b.status === 'Sudah Bayar').reduce((s, b) => s + Number(b.jumlah) - Number(b.potongan_advance), 0)
const advTotal = (advJ ?? []).reduce((s, a) => s + Number(a.jumlah), 0)
const gajiKewangan = perKatBelanja['Gaji Jurulatih'] ?? 0
const bezaGaji = gajiKewangan - (gajiBersih + advTotal)
if (Math.abs(bezaGaji) > 0.005) {
  isu++
  console.log(`⚠ Gaji Jurulatih dalam Kewangan ${rm(gajiKewangan)} ≠ gaji bersih ${rm(gajiBersih)} + advance ${rm(advTotal)} = ${rm(gajiBersih + advTotal)} (beza ${rm(bezaGaji)})`)
} else {
  console.log(`✓ Gaji Jurulatih: Kewangan ${rm(gajiKewangan)} = bersih ${rm(gajiBersih)} + advance ${rm(advTotal)}`)
}

// 6. Pembundaran
const sen = (n) => Math.round(Number(n) * 100)
const jumSen = (resit ?? []).reduce((s, r) => s + sen(r.jumlah), 0) + (pLain ?? []).reduce((s, p) => s + sen(p.jumlah), 0)
if (Math.abs(jumSen / 100 - (totResit + totLain)) > 0.005) { isu++; console.log('⚠ Ralat pembundaran dikesan dalam jumlah pendapatan') }
else console.log('✓ Tiada ralat pembundaran')

// 7. Jumlah antara sheet mesti BERTAUT (pemeriksa LHDN akan silang-semak)
console.log('\n═══ TAUTAN ANTARA SHEET ═══')
const bulat = (n) => Math.round(n * 100) / 100
const penyataJum = bulat(totResit + totLain)

// Sheet "Pendapatan Bulanan" = resit ikut jenis + pendapatan lain
const bulanan = Array.from({ length: 12 }, () => [0, 0, 0, 0])
const idxJenis = { Kumpulan: 0, Personal: 1, Pendaftaran: 2 }
for (const r of resit ?? []) {
  const m = Number(r.tarikh_bayar.slice(5, 7)) - 1
  const j = idxJenis[r.jenis]
  if (j !== undefined) bulanan[m][j] = bulat(bulanan[m][j] + Number(r.jumlah))
}
for (const p of pLain ?? []) {
  const m = Number(p.tarikh.slice(5, 7)) - 1
  bulanan[m][3] = bulat(bulanan[m][3] + Number(p.jumlah))
}
const bulananJum = bulat(bulanan.reduce((s, b) => s + b[0] + b[1] + b[2] + b[3], 0))

// Sheet "Rekonsiliasi Bank" = Masuk Bank + Tunai + Tidak Dinyatakan
let bank = 0, tunai = 0, takPasti = 0
const letak = (kaedah, nilai) => {
  if (!kaedah) takPasti = bulat(takPasti + nilai)
  else if (kaedah === 'Tunai') tunai = bulat(tunai + nilai)
  else bank = bulat(bank + nilai)
}
for (const r of resit ?? []) letak(r.kaedah_bayaran, Number(r.jumlah))
for (const p of pLain ?? []) letak(p.kaedah, Number(p.jumlah))
const rekonJum = bulat(bank + tunai + takPasti)

console.log(`   Penyata Pendapatan  → JUMLAH PENDAPATAN : ${rm(penyataJum)}`)
console.log(`   Pendapatan Bulanan  → JUMLAH            : ${rm(bulananJum)}`)
console.log(`   Rekonsiliasi Bank   → B + C + D         : ${rm(rekonJum)}`)
console.log(`        (bank ${rm(bank)} + tunai ${rm(tunai)} + tidak dinyatakan ${rm(takPasti)})`)
if (Math.abs(penyataJum - bulananJum) < 0.005 && Math.abs(penyataJum - rekonJum) < 0.005) {
  console.log('   ✓ KETIGA-TIGA SHEET BERTAUT TEPAT')
} else {
  isu++
  console.log('   ⚠ TIDAK BERTAUT — pemeriksa LHDN akan bertanya')
}

console.log(`\nIsu perlu tindakan: ${isu}`)
