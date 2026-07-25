// Audit penuh akaun gaji jurulatih (READ-ONLY — tiada perubahan langsung).
// Guna: node scripts/audit-gaji-jurulatih.mjs
//
// Semak:
//  1. Nama bulan tersimpan dalam bayaran_jurulatih (ejaan tak standard?)
//  2. Sesi Hadir (tolak kelas dibatalkan) × kadar  lawan  rekod bayaran
//  3. Advance: jumlah vs baki vs potongan yang direkod
//  4. Perbelanjaan 'Gaji Jurulatih' dalam Kewangan lawan gaji bersih
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split(/\r?\n/).filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()])
)
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

const NAMA_BULAN = ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember']
const hariMinggu = (t) => { const [y,m,d]=t.split('-').map(Number); return new Date(Date.UTC(y,m-1,d)).getUTCDay() }
const rm = (n) => 'RM' + Number(n).toFixed(2)

const [{ data: jurulatih }, { data: hadir }, { data: bayaran }, { data: advance }, { data: slot }, { data: batal }, { data: belanja }] =
  await Promise.all([
    db.from('jurulatih').select('id, nama_penuh, kadar_bayaran, status').order('nama_penuh'),
    db.from('kehadiran_jurulatih').select('jurulatih_id, tarikh, cawangan_id, jenis_kelas').eq('status', 'Hadir'),
    db.from('bayaran_jurulatih').select('id, jurulatih_id, bulan_bayaran, tahun_bayaran, bilangan_sesi, kadar_per_sesi, jumlah, potongan_advance, kaedah_bayaran, tarikh_bayar, status, created_at'),
    db.from('advance_jurulatih').select('id, jurulatih_id, jumlah, baki, tarikh_advance, status, bayaran_id'),
    db.from('jadual_slot').select('id, hari_minggu, cawangan_id, jenis, jurulatih_ids'),
    db.from('jadual_slot_batal').select('slot_id, tarikh'),
    db.from('kewangan_perbelanjaan').select('id, tarikh, kategori, penerangan, jumlah').eq('kategori', 'Gaji Jurulatih'),
  ])

const J = Object.fromEntries(jurulatih.map((j) => [j.id, j]))

// ── Tapis sesi pada kelas DIBATALKAN (rule sama dgn src/lib/gajiSesi.ts)
const setBatal = new Set((batal ?? []).map((b) => `${b.slot_id}:${b.tarikh}`))
const sesiSah = []
const sesiDibuang = []
for (const s of hadir ?? []) {
  const hari = hariMinggu(s.tarikh)
  const sepadan = (slot ?? []).filter((x) =>
    x.hari_minggu === hari &&
    (x.cawangan_id ?? '') === (s.cawangan_id ?? '') &&
    x.jenis === (s.jenis_kelas ?? 'Kumpulan') &&
    (x.jurulatih_ids ?? []).includes(s.jurulatih_id))
  const semuaBatal = sepadan.length > 0 && sepadan.every((x) => setBatal.has(`${x.id}:${s.tarikh}`))
  ;(semuaBatal ? sesiDibuang : sesiSah).push(s)
}

console.log('══ 1. NAMA BULAN DALAM bayaran_jurulatih ══')
const bulanUnik = [...new Set((bayaran ?? []).map((b) => b.bulan_bayaran))]
for (const b of bulanUnik) {
  console.log(`   "${b}" ${NAMA_BULAN.includes(b) ? '✓ standard' : '✗ TIDAK PADAN dengan NAMA_BULAN — laporan gaji takkan jumpa rekod ini!'}`)
}

console.log('\n══ 2. SESI HADIR lawan REKOD BAYARAN (per jurulatih / bulan) ══')
const sesiPerBulan = new Map() // `${jid}:${YYYY-MM}` → n
for (const s of sesiSah) {
  const k = `${s.jurulatih_id}:${s.tarikh.slice(0, 7)}`
  sesiPerBulan.set(k, (sesiPerBulan.get(k) ?? 0) + 1)
}
const bayarPerBulan = new Map() // `${jid}:${YYYY-MM}` → [rekod]
for (const b of bayaran ?? []) {
  const idx = NAMA_BULAN.indexOf(b.bulan_bayaran)
  const kunci = idx >= 0 ? `${b.jurulatih_id}:${b.tahun_bayaran}-${String(idx + 1).padStart(2, '0')}` : `${b.jurulatih_id}:??${b.bulan_bayaran}`
  if (!bayarPerBulan.has(kunci)) bayarPerBulan.set(kunci, [])
  bayarPerBulan.get(kunci).push(b)
}

const masalah = []
const semuaKunci = [...new Set([...sesiPerBulan.keys(), ...bayarPerBulan.keys()])].sort()
for (const k of semuaKunci) {
  const [jid, bln] = k.split(':')
  const nama = J[jid]?.nama_penuh ?? '(jurulatih dipadam?)'
  const sesi = sesiPerBulan.get(k) ?? 0
  const rekod = bayarPerBulan.get(k) ?? []
  const kadarJ = Number(J[jid]?.kadar_bayaran ?? 0)
  const sesiDibayar = rekod.reduce((t, r) => t + r.bilangan_sesi, 0)
  const kasar = rekod.reduce((t, r) => t + Number(r.jumlah), 0)
  const pot = rekod.reduce((t, r) => t + Number(r.potongan_advance), 0)
  const kadarRekod = [...new Set(rekod.map((r) => Number(r.kadar_per_sesi)))]

  // Beberapa rekod dalam bulan sama adalah NORMAL (bayaran berperingkat) —
  // yang penting jumlah sesi direkod = jumlah sesi hadir. Begitu juga kadar
  // berbeza antara rekod (sesi Personal boleh dibayar lebih tinggi).
  const isu = []
  const nota = []
  if (rekod.length === 0 && sesi === 0) continue
  if (sesi > 0 && rekod.length === 0) isu.push(`${sesi} sesi hadir TIADA rekod bayaran langsung`)
  if (rekod.length && sesiDibayar > sesi) isu.push(`LEBIH BAYAR: ${sesiDibayar} sesi direkod > ${sesi} sesi hadir (+${sesiDibayar - sesi})`)
  if (rekod.length && sesiDibayar < sesi) isu.push(`BELUM PENUH: ${sesiDibayar} sesi direkod < ${sesi} sesi hadir (baki ${sesi - sesiDibayar} sesi)`)
  if (rekod.some((r) => r.status !== 'Sudah Bayar')) isu.push(`ada rekod status "${rekod.find((r) => r.status !== 'Sudah Bayar').status}"`)
  if (rekod.length > 1) nota.push(`${rekod.length} rekod (bayaran berperingkat)`)
  if (kadarJ > 0 && kadarRekod.some((x) => x !== kadarJ)) nota.push(`kadar berbeza ${kadarRekod.map(rm).join('/')} (profil ${rm(kadarJ)})`)

  const tanda = isu.length ? '⚠' : '✓'
  console.log(`${tanda} ${nama} · ${bln} — hadir:${sesi} sesi | rekod:${sesiDibayar} sesi, kasar ${rm(kasar)}, potongan ${rm(pot)}, bersih ${rm(kasar - pot)}`)
  for (const n of nota) console.log(`      · ${n}`)
  for (const i of isu) console.log(`      └─ ${i}`)
  if (isu.length) masalah.push({ nama, bln, isu })
}

console.log('\n══ 3. ADVANCE ══')
const potPerJ = {}
for (const b of bayaran ?? []) potPerJ[b.jurulatih_id] = (potPerJ[b.jurulatih_id] ?? 0) + Number(b.potongan_advance)
for (const j of jurulatih) {
  const adv = (advance ?? []).filter((a) => a.jurulatih_id === j.id)
  if (!adv.length && !(potPerJ[j.id] > 0)) continue
  const totalAdv = adv.reduce((t, a) => t + Number(a.jumlah), 0)
  const totalBaki = adv.reduce((t, a) => t + Number(a.baki), 0)
  const dibayarBalik = totalAdv - totalBaki
  const potongan = potPerJ[j.id] ?? 0
  const padan = Math.abs(dibayarBalik - potongan) < 0.005
  console.log(`${padan ? '✓' : '⚠'} ${j.nama_penuh} — advance diberi ${rm(totalAdv)}, baki ${rm(totalBaki)}, sudah tolak ${rm(dibayarBalik)} | potongan direkod dalam gaji ${rm(potongan)}`)
  if (!padan) { console.log(`      └─ TAK PADAN: beza ${rm(Math.abs(dibayarBalik - potongan))}`); masalah.push({ nama: j.nama_penuh, bln: 'advance', isu: ['baki advance tak padan potongan'] }) }
  for (const a of adv) console.log(`      · ${a.tarikh_advance} beri ${rm(a.jumlah)} baki ${rm(a.baki)} [${a.status}]`)
}

console.log('\n══ 4. PERBELANJAAN "Gaji Jurulatih" DALAM KEWANGAN ══')
const totalBersih = (bayaran ?? []).reduce((t, b) => t + (Number(b.jumlah) - Number(b.potongan_advance)), 0)
const totalAdvSemua = (advance ?? []).reduce((t, a) => t + Number(a.jumlah), 0)
const totalBelanja = (belanja ?? []).reduce((t, b) => t + Number(b.jumlah), 0)
console.log(`   Gaji bersih terkumpul (bayaran_jurulatih)     : ${rm(totalBersih)}`)
console.log(`   Advance diberi terkumpul (advance_jurulatih)  : ${rm(totalAdvSemua)}`)
console.log(`   Sepatutnya dalam Kewangan (bersih + advance)  : ${rm(totalBersih + totalAdvSemua)}`)
console.log(`   Sebenar dalam kewangan_perbelanjaan           : ${rm(totalBelanja)} (${(belanja ?? []).length} baris)`)
const beza = totalBelanja - (totalBersih + totalAdvSemua)
console.log(`   ${Math.abs(beza) < 0.005 ? '✓ PADAN' : `⚠ BEZA ${rm(beza)}`}`)
for (const b of belanja ?? []) console.log(`      · ${b.tarikh} ${rm(b.jumlah)} — ${b.penerangan}`)

console.log('\n══ RINGKASAN ══')
console.log(`Sesi dibuang kerana kelas dibatalkan: ${sesiDibuang.length}`)
console.log(`Isu dijumpai: ${masalah.length}`)
