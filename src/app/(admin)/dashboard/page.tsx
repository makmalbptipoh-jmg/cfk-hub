import { createClient } from '@/lib/supabase/server'
import { akhirBulan as akhirBulanUtil, formatRinggit, formatTarikh } from '@/lib/utils'
import Link from 'next/link'
import { Users, CalendarCheck, Wallet, AlertCircle, MessageCircle } from 'lucide-react'
import { DashboardFilter } from './_components/DashboardFilter'

export const dynamic = 'force-dynamic'

// Instant semasa ditambah 8 jam — medan getUTC* padanya = kalendar waktu
// Malaysia (UTC+8), betul walaupun pelayan Vercel berjalan dalam UTC.
function mytNow() {
  return new Date(Date.now() + 8 * 60 * 60 * 1000)
}

const NAMA_BULAN = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
]

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
  ] = await Promise.all([
    pelajarQuery,
    supabase.from('kehadiran').select('pelajar_id, status, cawangan_sesi_id').gte('tarikh', mulaB).lte('tarikh', akhirB),
    supabase.from('resit').select('pelajar_id, jumlah, status, pelajar:pelajar_id(cawangan_daftar_id)').eq('bulan_bayaran', bulan).eq('tahun_bayaran', tahun).eq('status', 'Aktif'),
    supabase.from('resit').select('id, nombor_resit, pelajar_id, jenis, jumlah, tarikh_bayar, status, pelajar:pelajar_id(nama_penuh)').order('created_at', { ascending: false }).limit(10),
    supabase.from('cawangan').select('id, nama').eq('status', 'Aktif').order('nama'),
    supabase.from('pengguna_profil').select('nama').eq('id', (await supabase.auth.getUser()).data.user?.id ?? '').single(),
  ])

  // Tapis resit ikut cawangan (melalui pelajar) jika cawangan dipilih
  const resitBulan = (resitBulanRaw ?? []).filter((r: any) => !cawId || r.pelajar?.cawangan_daftar_id === cawId)

  // === Widget 1: Pelajar Belum Bayar (dalam skop cawangan) ===
  const pelajarIdDgnResit = new Set(resitBulan.map((r: any) => r.pelajar_id))
  const kiraHadirBulan: Record<string, number> = {}
  for (const k of kehadiranBulan ?? []) {
    if ((k as any).status === 'Hadir') kiraHadirBulan[k.pelajar_id] = (kiraHadirBulan[k.pelajar_id] ?? 0) + 1
  }

  const pelajarBelumBayar = (pelajarAktif ?? [])
    .filter((p: any) => (kiraHadirBulan[p.id] ?? 0) >= 4 && !pelajarIdDgnResit.has(p.id))
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
