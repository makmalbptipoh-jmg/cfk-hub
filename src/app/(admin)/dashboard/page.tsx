import { createClient } from '@/lib/supabase/server'
import { akhirBulan as akhirBulanUtil, formatRinggit, formatTarikh, tarikhTempatan, hariMinggu, HARI, formatMasa, NAMA_BULAN } from '@/lib/utils'
import { perluBayarBulan } from '@/lib/tunggakan'
import { tapisSesiDibatalkan, SELECT_SESI_GAJI, SELECT_SLOT_GAJI, type SlotUntukGaji } from '@/lib/gajiSesi'
import Link from 'next/link'
import { Users, CalendarCheck, CalendarDays, Wallet, AlertCircle, MessageCircle } from 'lucide-react'
import { DashboardFilter } from './_components/DashboardFilter'
import { CartaTrend } from './_components/CartaTrend'

export const dynamic = 'force-dynamic'

// Instant semasa ditambah 8 jam — medan getUTC* padanya = kalendar waktu
// Malaysia (UTC+8), betul walaupun pelayan Vercel berjalan dalam UTC.
function mytNow() {
  return new Date(Date.now() + 8 * 60 * 60 * 1000)
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ cawangan?: string; bulan?: string; tahun?: string }>
}) {
  const supabase = await createClient()
  const sp = await searchParams

  // Tempoh dipilih (default: bulan semasa waktu Malaysia)
  const now = mytNow()
  const tahunSemasa = now.getUTCFullYear()
  const cawId = sp.cawangan ?? ''
  const tahun = sp.tahun ? +sp.tahun : tahunSemasa
  const bulanNum = sp.bulan ? +sp.bulan : now.getUTCMonth() + 1
  const bulan = NAMA_BULAN[bulanNum - 1]
  const mulaB = `${tahun}-${String(bulanNum).padStart(2, '0')}-01`
  const akhirB = akhirBulanUtil(tahun, bulanNum)

  // Jadual hari ini — SENTIASA hari semasa, tidak terjejas penapis bulan/cawangan
  const tarikhHariIni = tarikhTempatan()
  const hariIni = hariMinggu(tarikhHariIni)

  // Parallel fetch semua data
  let pelajarQuery = supabase.from('pelajar').select('id, nama_penuh, no_telefon, cawangan_daftar_id').eq('status', 'Aktif')
  if (cawId) pelajarQuery = pelajarQuery.eq('cawangan_daftar_id', cawId)

  const [
    { data: pelajarAktif },
    { data: kehadiranBulan },
    { data: resitBulanRaw },
    { data: resitTerkini },
    { data: cawangan },
    { data: profil },
    { data: resitTahun },
    { data: kehadiranTahun },
    { data: slotHariIni },
    { data: aktivitiHariIni },
    { data: senaraiJurulatih },
    { data: hadirJurulatihBulan },
    { data: gajiJurulatihBulan },
    { data: batalHariIni },
    { data: slotGaji },
    { data: batalBulanGaji },
  ] = await Promise.all([
    pelajarQuery,
    supabase.from('kehadiran').select('pelajar_id, status, cawangan_sesi_id').gte('tarikh', mulaB).lte('tarikh', akhirB),
    supabase.from('resit').select('pelajar_id, jumlah, status, pelajar:pelajar_id(cawangan_daftar_id)').eq('bulan_bayaran', bulan).eq('tahun_bayaran', tahun).eq('status', 'Aktif'),
    supabase.from('resit').select('id, nombor_resit, pelajar_id, jenis, jumlah, tarikh_bayar, status, pelajar:pelajar_id(nama_penuh)').order('created_at', { ascending: false }).limit(10),
    supabase.from('cawangan').select('id, nama').eq('status', 'Aktif').order('nama'),
    supabase.from('pengguna_profil').select('nama').eq('id', (await supabase.auth.getUser()).data.user?.id ?? '').single(),
    supabase.from('resit').select('jumlah, tarikh_bayar, pelajar:pelajar_id(cawangan_daftar_id)').eq('status', 'Aktif').gte('tarikh_bayar', `${tahun}-01-01`).lte('tarikh_bayar', `${tahun}-12-31`),
    supabase.from('kehadiran').select('tarikh, cawangan_sesi_id').eq('status', 'Hadir').gte('tarikh', `${tahun}-01-01`).lte('tarikh', `${tahun}-12-31`),
    supabase.from('jadual_slot').select('id, jenis, masa_mula, lokasi, jurulatih_ids, cawangan:cawangan_id(nama), pelajar:pelajar_id(nama_penuh)').eq('status', 'Aktif').eq('hari_minggu', hariIni).order('masa_mula'),
    supabase.from('aktiviti').select('id, nama, kategori, masa_mula, lokasi, pelajar:pelajar_id(nama_penuh)').eq('status', 'Aktif').eq('tarikh', tarikhHariIni).order('masa_mula'),
    supabase.from('jurulatih').select('id, nama_penuh, kadar_bayaran, status'),
    supabase.from('kehadiran_jurulatih').select(SELECT_SESI_GAJI).eq('status', 'Hadir').gte('tarikh', mulaB).lte('tarikh', akhirB),
    supabase.from('bayaran_jurulatih').select('jurulatih_id, jumlah, status').eq('bulan_bayaran', bulan).eq('tahun_bayaran', tahun),
    supabase.from('jadual_slot_batal').select('slot_id').eq('tarikh', tarikhHariIni),
    supabase.from('jadual_slot').select(SELECT_SLOT_GAJI),
    supabase.from('jadual_slot_batal').select('slot_id, tarikh').gte('tarikh', mulaB).lte('tarikh', akhirB),
  ])

  // Siri 12-bulan untuk carta trend (ikut cawangan dipilih)
  const pendapatanBulanan = Array(12).fill(0)
  for (const r of resitTahun ?? []) {
    if (cawId && (r as any).pelajar?.cawangan_daftar_id !== cawId) continue
    const m = +String((r as any).tarikh_bayar).slice(5, 7)
    if (m >= 1 && m <= 12) pendapatanBulanan[m - 1] += (r as any).jumlah ?? 0
  }
  const kehadiranBulanan = Array(12).fill(0)
  for (const k of kehadiranTahun ?? []) {
    if (cawId && (k as any).cawangan_sesi_id !== cawId) continue
    const m = +String((k as any).tarikh).slice(5, 7)
    if (m >= 1 && m <= 12) kehadiranBulanan[m - 1]++
  }

  // Tapis resit ikut cawangan (melalui pelajar) jika cawangan dipilih
  const resitBulan = (resitBulanRaw ?? []).filter((r: any) => !cawId || r.pelajar?.cawangan_daftar_id === cawId)

  // === Widget 1: Pelajar Belum Bayar (dalam skop cawangan) ===
  const pelajarIdDgnResit = new Set(resitBulan.map((r: any) => r.pelajar_id))
  const kiraHadirBulan: Record<string, number> = {}
  for (const k of kehadiranBulan ?? []) {
    if ((k as any).status === 'Hadir') kiraHadirBulan[k.pelajar_id] = (kiraHadirBulan[k.pelajar_id] ?? 0) + 1
  }

  const pelajarBelumBayar = (pelajarAktif ?? [])
    .filter((p: any) => perluBayarBulan(kiraHadirBulan[p.id] ?? 0, pelajarIdDgnResit.has(p.id)))
    .map((p: any) => ({
      id: p.id,
      nama_penuh: p.nama_penuh,
      no_telefon: p.no_telefon,
      bilHadir: kiraHadirBulan[p.id] ?? 0,
    }))

  // === Widget 2: Hadir (bulan dipilih, ikut cawangan sesi jika ditapis) ===
  const kehadiranSkop = (kehadiranBulan ?? []).filter((k: any) => !cawId || k.cawangan_sesi_id === cawId)
  const hadirBulan = kehadiranSkop.filter((k: any) => k.status === 'Hadir').length
  const tidakHadirBulan = kehadiranSkop.filter((k: any) => k.status === 'Tidak Hadir').length

  // === Widget 3: Pendapatan bulan dipilih ===
  const pendapatanBulan = resitBulan.reduce((sum: number, r: any) => sum + (r.jumlah ?? 0), 0)

  // === Widget 4: Jumlah Pelajar Aktif (skop cawangan) ===
  const jumlahAktif = (pelajarAktif ?? []).length

  // === Jadual: Kehadiran bulan dipilih Per Cawangan ===
  const kehadiranPerCawangan: Record<string, { nama: string; hadir: number; tidakHadir: number; cuti: number }> = {}
  for (const c of cawangan ?? []) {
    kehadiranPerCawangan[c.id] = { nama: c.nama, hadir: 0, tidakHadir: 0, cuti: 0 }
  }
  for (const k of kehadiranSkop) {
    const cid = (k as any).cawangan_sesi_id
    if (kehadiranPerCawangan[cid]) {
      if ((k as any).status === 'Hadir') kehadiranPerCawangan[cid].hadir++
      else if ((k as any).status === 'Tidak Hadir') kehadiranPerCawangan[cid].tidakHadir++
      else kehadiranPerCawangan[cid].cuti++
    }
  }
  const statCawangan = Object.values(kehadiranPerCawangan).filter((c) => c.hadir + c.tidakHadir + c.cuti > 0)

  // === Widget: Jadual Hari Ini (slot mingguan + aktiviti bertarikh) ===
  const namaJurulatihPeta = new Map((senaraiJurulatih ?? []).map((j) => [j.id, j.nama_penuh]))
  const namaJ = (ids: string[] | null) => (ids ?? []).map((id) => namaJurulatihPeta.get(id)).filter(Boolean).join(', ')
  const idSlotBatalHariIni = new Set((batalHariIni ?? []).map((b: any) => b.slot_id))
  type BarisJadual = { id: string; masa: string | null; label: string; nama: string; info: string; warnaBg: string; warnaText: string; dibatalkan: boolean }
  const barisJadual: BarisJadual[] = [
    ...(slotHariIni ?? []).map((s: any) => {
      const dibatalkan = idSlotBatalHariIni.has(s.id)
      return {
        id: `slot-${s.id}`,
        masa: s.masa_mula as string | null,
        label: dibatalkan ? 'Dibatalkan' : (s.jenis as string),
        nama: s.jenis === 'Kumpulan' ? (s.cawangan?.nama ?? '—') : (s.pelajar?.nama_penuh ?? '—'),
        info: [s.jurulatih_ids?.length ? `J: ${namaJ(s.jurulatih_ids)}` : null, s.lokasi].filter(Boolean).join(' · '),
        warnaBg: dibatalkan ? '#FEE2E2' : s.jenis === 'Kumpulan' ? '#ECFCCB' : '#DBEAFE',
        warnaText: dibatalkan ? '#DC2626' : s.jenis === 'Kumpulan' ? '#3F6212' : '#1E40AF',
        dibatalkan,
      }
    }),
    ...(aktivitiHariIni ?? []).map((a: any) => ({
      id: `akt-${a.id}`,
      masa: a.masa_mula as string | null,
      label: a.kategori as string,
      nama: a.nama as string,
      info: [a.pelajar?.nama_penuh, a.lokasi].filter(Boolean).join(' · '),
      warnaBg: '#FEF3C7',
      warnaText: '#92400E',
      dibatalkan: false,
    })),
  ].sort((a, b) => (a.masa ?? '99').localeCompare(b.masa ?? '99'))

  // === Widget: Gaji Jurulatih (hari gaji 30hb) ===
  // Sesi pada kelas DIBATALKAN tidak dikira dalam gaji
  const { sah: hadirJurulatihSah } = tapisSesiDibatalkan(
    (hadirJurulatihBulan ?? []) as { jurulatih_id: string; tarikh: string; cawangan_id: string | null; jenis_kelas: string | null }[],
    (slotGaji ?? []) as SlotUntukGaji[],
    batalBulanGaji ?? []
  )
  const sesiJurulatihBulan: Record<string, number> = {}
  for (const k of hadirJurulatihSah) {
    sesiJurulatihBulan[k.jurulatih_id] = (sesiJurulatihBulan[k.jurulatih_id] ?? 0) + 1
  }
  // Jumlah dibayar per jurulatih bulan ini (boleh >1 rekod — bayaran separa)
  const dibayarPerJurulatih: Record<string, number> = {}
  for (const b of (gajiJurulatihBulan ?? []).filter((b: any) => b.status === 'Sudah Bayar')) {
    dibayarPerJurulatih[(b as any).jurulatih_id] = (dibayarPerJurulatih[(b as any).jurulatih_id] ?? 0) + ((b as any).jumlah ?? 0)
  }
  const idJurulatihSudahBayar = new Set(Object.keys(dibayarPerJurulatih))
  const totalGajiDibayarBulan = Object.values(dibayarPerJurulatih).reduce((s, n) => s + n, 0)
  // Baki terhutang = sesi Hadir × kadar − sudah dibayar (clamp ≥ 0)
  const jurulatihBelumGaji = (senaraiJurulatih ?? [])
    .filter((j: any) => j.status === 'Aktif' && (sesiJurulatihBulan[j.id] ?? 0) > 0)
    .map((j: any) => {
      const sesi = sesiJurulatihBulan[j.id] ?? 0
      const anggaran = Math.max(0, sesi * (j.kadar_bayaran ?? 0) - (dibayarPerJurulatih[j.id] ?? 0))
      return { id: j.id, nama_penuh: j.nama_penuh, sesi, anggaran }
    })
    .filter((j) => j.anggaran > 0)
  const totalPerluBayarGaji = jurulatihBelumGaji.reduce((s, j) => s + j.anggaran, 0)
  const dekatHariGaji = now.getUTCDate() >= 27

  const namaPengguna = (profil as any)?.nama ?? 'Admin'
  const waktu = new Date().getHours()
  const salam = waktu < 12 ? 'Selamat Pagi' : waktu < 18 ? 'Selamat Petang' : 'Selamat Malam'

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Salam */}
      <div style={{ marginBottom: '18px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>
          {salam}, {namaPengguna} 👋
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Memaparkan <strong style={{ color: 'var(--text)' }}>{bulan} {tahun}</strong>
          {cawId ? <> · {(cawangan ?? []).find((c) => c.id === cawId)?.nama ?? 'Cawangan'}</> : ' · Semua Cawangan'}
        </p>
      </div>

      {/* Penapis */}
      <DashboardFilter
        cawangan={cawangan ?? []}
        cawId={cawId}
        bulanNum={bulanNum}
        tahun={tahun}
        tahunSemasa={tahunSemasa}
      />

      {/* 4 Widget */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {/* Belum Bayar */}
        <div style={{
          background: pelajarBelumBayar.length > 0 ? '#FFF7ED' : 'var(--card)',
          border: `1px solid ${pelajarBelumBayar.length > 0 ? '#FED7AA' : 'var(--border)'}`,
          borderRadius: '16px', padding: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <AlertCircle size={16} style={{ color: pelajarBelumBayar.length > 0 ? '#C2410C' : 'var(--text-muted)' }} />
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: pelajarBelumBayar.length > 0 ? '#C2410C' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Belum Bayar
            </span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: pelajarBelumBayar.length > 0 ? '#C2410C' : 'var(--text)', lineHeight: 1 }}>
            {pelajarBelumBayar.length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>pelajar bulan ini</div>
        </div>

        {/* Hadir Hari Ini */}
        <div style={{ background: 'var(--hadir-bg)', border: '1px solid #BBF7D0', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <CalendarCheck size={16} style={{ color: 'var(--hadir-text)' }} />
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--hadir-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Hadir {bulan}
            </span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--hadir-text)', lineHeight: 1 }}>
            {hadirBulan}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--hadir-text)', marginTop: '6px', opacity: 0.7 }}>
            {tidakHadirBulan > 0 ? `${tidakHadirBulan} tidak hadir` : 'tiada tidak hadir'}
          </div>
        </div>

        {/* Pendapatan */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Wallet size={16} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pendapatan {bulan}
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
            {formatRinggit(pendapatanBulan)}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
            {(resitBulan ?? []).length} resit aktif
          </div>
        </div>

        {/* Pelajar Aktif */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Users size={16} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pelajar Aktif
            </span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
            {jumlahAktif}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>pelajar berdaftar</div>
        </div>
      </div>

      {/* Carta Trend */}
      <CartaTrend pendapatan={pendapatanBulanan} kehadiran={kehadiranBulanan} tahun={tahun} />

      {/* Jadual Hari Ini */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', marginBottom: '18px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <CalendarDays size={15} style={{ color: 'var(--text-muted)' }} />
            Jadual Hari Ini — {HARI[hariIni]}
          </h2>
          <Link href="/jadual" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>
            Lihat jadual penuh →
          </Link>
        </div>
        {barisJadual.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            Tiada kelas atau aktiviti hari ini.
          </div>
        ) : (
          <div>
            {barisJadual.map((b, i) => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', borderTop: i > 0 ? '1px solid var(--border)' : 'none', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: b.dibatalkan ? '#94A3B8' : 'var(--text)', minWidth: '76px', textDecoration: b.dibatalkan ? 'line-through' : 'none' }}>
                  {b.masa ? formatMasa(b.masa) : '—'}
                </span>
                <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: b.warnaBg, color: b.warnaText }}>
                  {b.label}
                </span>
                <span style={{ fontSize: '13.5px', fontWeight: 600, color: b.dibatalkan ? '#94A3B8' : 'var(--text)', textDecoration: b.dibatalkan ? 'line-through' : 'none' }}>{b.nama}</span>
                {b.info && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.info}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2 Kolum Utama */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '18px', marginBottom: '18px' }}>
        {/* Kiri: Kehadiran Per Cawangan */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>Kehadiran {bulan} Per Cawangan</h2>
          </div>
          {statCawangan.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Tiada rekod kehadiran untuk {bulan} {tahun}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  {['Cawangan', 'Hadir', 'Tidak Hadir', '%'].map((h) => (
                    <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {statCawangan.map((c, i) => {
                  const total = c.hadir + c.tidakHadir + c.cuti
                  const pct = total > 0 ? Math.round((c.hadir / total) * 100) : 0
                  return (
                    <tr key={c.nama} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                      <td style={{ padding: '10px 16px', fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>{c.nama}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--hadir-text)' }}>{c.hadir}</span>
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ fontSize: '13.5px', color: c.tidakHadir > 0 ? '#9F1239' : 'var(--text-muted)' }}>{c.tidakHadir}</span>
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '5px', background: 'var(--border)', borderRadius: '3px', maxWidth: '60px' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: pct >= 80 ? '#22C55E' : pct >= 50 ? '#F59E0B' : '#EF4444', borderRadius: '3px' }} />
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', minWidth: '30px' }}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Kanan: Pelajar Belum Bayar */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
              Pelajar Belum Bayar — {bulan} {tahun}
            </h2>
            {pelajarBelumBayar.length > 5 && (
              <Link href="/pelajar" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>
                Lihat semua ({pelajarBelumBayar.length})
              </Link>
            )}
          </div>
          {pelajarBelumBayar.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>✓</div>
              <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--hadir-text)' }}>Semua pelajar sudah bayar!</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>atau belum mencapai 4 kehadiran</p>
            </div>
          ) : (
            <div>
              {pelajarBelumBayar.slice(0, 5).map((p, i) => {
                const noTel = p.no_telefon.replace(/\D/g, '').replace(/^0/, '60')
                const msgWA = encodeURIComponent(`Assalamualaikum, sebagai peringatan mesra, yuran kelas catur CFK bulan ${bulan} ${tahun} bagi ${p.nama_penuh} belum dijelaskan. Terima kasih atas kerjasama anda. 🙏`)
                return (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 20px',
                    borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>{p.nama_penuh}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '1px' }}>{p.bilHadir} sesi hadir</div>
                    </div>
                    <a
                      href={`https://wa.me/${noTel}?text=${msgWA}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: '6px 12px',
                        background: '#DCFCE7', border: '1px solid #86EFAC',
                        borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                        color: '#166534', textDecoration: 'none',
                      }}
                    >
                      <MessageCircle size={12} />
                      WA
                    </a>
                  </div>
                )
              })}
              {pelajarBelumBayar.length > 5 && (
                <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                  <Link href="/pelajar" style={{ fontSize: '12.5px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600 }}>
                    + {pelajarBelumBayar.length - 5} lagi pelajar
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Gaji Jurulatih — hari gaji 30hb */}
      <div style={{
        background: 'var(--card)',
        border: `1px solid ${jurulatihBelumGaji.length > 0 && dekatHariGaji ? '#FED7AA' : 'var(--border)'}`,
        borderRadius: '16px', overflow: 'hidden', marginBottom: '18px',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Wallet size={15} style={{ color: 'var(--text-muted)' }} />
            Gaji Jurulatih — {bulan} {tahun}
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Hari gaji: 30hb</span>
        </div>
        <div style={{ display: 'flex', gap: '24px', padding: '14px 20px', borderBottom: jurulatihBelumGaji.length > 0 ? '1px solid var(--border)' : 'none', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
              Perlu Dibayar
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: totalPerluBayarGaji > 0 && dekatHariGaji ? '#C2410C' : 'var(--text)' }}>
              {formatRinggit(totalPerluBayarGaji)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{jurulatihBelumGaji.length} jurulatih belum dibayar</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
              Sudah Dibayar
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--hadir-text)' }}>
              {formatRinggit(totalGajiDibayarBulan)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{idJurulatihSudahBayar.size} jurulatih</div>
          </div>
        </div>
        {jurulatihBelumGaji.length > 0 && (
          <div>
            {jurulatihBelumGaji.map((j, i) => (
              <div key={j.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '11px 20px',
                borderTop: i > 0 ? '1px solid var(--border)' : 'none',
              }}>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>{j.nama_penuh}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '1px' }}>
                    {j.sesi} sesi hadir · baki perlu dibayar {formatRinggit(j.anggaran)}
                  </div>
                </div>
                <Link href={`/jurulatih/${j.id}/bayaran`}
                  style={{
                    padding: '6px 12px',
                    background: 'var(--accent)', border: 'none',
                    borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                    color: 'var(--accent-text)', textDecoration: 'none',
                  }}
                >
                  Bayar Gaji
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resit Terkini */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>Resit Terkini</h2>
          <Link href="/bayaran" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>
            Lihat semua →
          </Link>
        </div>
        {(resitTerkini ?? []).length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13.5px' }}>
            Tiada resit lagi.{' '}
            <Link href="/bayaran/baharu" style={{ color: 'var(--accent-dark)', fontWeight: 600, textDecoration: 'none' }}>
              Rekod bayaran baharu
            </Link>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                {['No. Resit', 'Pelajar', 'Jenis', 'Jumlah', 'Tarikh', 'Status'].map((h) => (
                  <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(resitTerkini ?? []).map((r: any, i: number) => (
                <tr key={r.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '10px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text)', fontFamily: 'monospace' }}>
                    {r.nombor_resit}
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: '13.5px', color: 'var(--text)' }}>
                    {r.pelajar?.nama_penuh ?? '—'}
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    {r.jenis}
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>
                    {formatRinggit(r.jumlah)}
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    {formatTarikh(r.tarikh_bayar)}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{
                      fontSize: '11.5px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600,
                      background: r.status === 'Aktif' ? 'var(--hadir-bg)' : '#FFF1F2',
                      color: r.status === 'Aktif' ? 'var(--hadir-text)' : '#9F1239',
                    }}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
