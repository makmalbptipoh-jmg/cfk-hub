import { createClient } from '@/lib/supabase/server'
import { tarikhTempatan } from '@/lib/utils'
import Link from 'next/link'
import { CalendarCheck, Users, TrendingUp } from 'lucide-react'

export default async function DashboardJurulatihPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const tarikhHariIni = tarikhTempatan()

  // Minggu ini: Isnin hingga hari ini (ikut waktu Malaysia — medan UTC pada
  // instant yang ditambah 8 jam = kalendar MYT, betul walau pelayan UTC).
  const hariIniMyt = new Date(Date.now() + 8 * 60 * 60 * 1000)
  const hariDlmMinggu = hariIniMyt.getUTCDay()
  const hariIsnin = new Date(hariIniMyt)
  hariIsnin.setUTCDate(hariIniMyt.getUTCDate() - (hariDlmMinggu === 0 ? 6 : hariDlmMinggu - 1))
  const tarikhIsnin = hariIsnin.toISOString().split('T')[0]

  const [
    { data: kehadiranHariIni },
    { data: kehadiranMingguIni },
    { data: semuaPelajar },
    { data: sudahDitanda },
    { data: profil },
  ] = await Promise.all([
    supabase
      .from('kehadiran')
      .select('id, status')
      .eq('tarikh', tarikhHariIni),
    supabase
      .from('kehadiran')
      .select('id')
      .gte('tarikh', tarikhIsnin)
      .lte('tarikh', tarikhHariIni),
    supabase
      .from('pelajar')
      .select('id, nama_penuh, cawangan_daftar_id, cawangan:cawangan_daftar_id(nama)')
      .eq('status', 'Aktif')
      .order('nama_penuh'),
    supabase
      .from('kehadiran')
      .select('pelajar_id')
      .eq('tarikh', tarikhHariIni),
    supabase
      .from('pengguna_profil')
      .select('nama')
      .eq('id', user!.id)
      .single(),
  ])

  const idSudahDitanda = new Set((sudahDitanda ?? []).map((r: any) => r.pelajar_id))
  const belumDitanda = (semuaPelajar ?? []).filter((p: any) => !idSudahDitanda.has(p.id))

  const jumlahHadir = (kehadiranHariIni ?? []).filter((r: any) => r.status === 'Hadir').length
  const jumlahDitanda = (sudahDitanda ?? []).length
  const jumlahSesiMinggu = kehadiranMingguIni?.length ?? 0

  const tarikhPapar = new Date().toLocaleDateString('ms-MY', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Kuala_Lumpur',
  })

  return (
    <div style={{ padding: '20px 16px', paddingBottom: '100px' }}>
      {/* Salam */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '2px' }}>{tarikhPapar}</p>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)' }}>
          Selamat datang, {profil?.nama?.split(' ')[0] ?? 'Jurulatih'} 👋
        </h1>
      </div>

      {/* Kad Statistik */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <div style={{
          background: 'var(--hadir-bg)', borderRadius: '14px',
          padding: '16px', border: '1px solid #BBF7D0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <CalendarCheck size={16} style={{ color: 'var(--hadir-text)' }} />
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--hadir-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Hadir Hari Ini
            </span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--hadir-text)' }}>{jumlahHadir}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--hadir-text)', opacity: 0.7, marginTop: '2px' }}>
            {jumlahDitanda} ditanda setakat ini
          </div>
        </div>

        <div style={{
          background: '#EFF6FF', borderRadius: '14px',
          padding: '16px', border: '1px solid #BFDBFE',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <TrendingUp size={16} style={{ color: '#1D4ED8' }} />
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Sesi Minggu Ini
            </span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#1D4ED8' }}>{jumlahSesiMinggu}</div>
          <div style={{ fontSize: '11.5px', color: '#1D4ED8', opacity: 0.7, marginTop: '2px' }}>
            rekod dimasukkan
          </div>
        </div>
      </div>

      {/* Pintasan */}
      <Link href="/kehadiran"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--primary)', borderRadius: '14px',
          padding: '16px 20px', marginBottom: '20px',
          textDecoration: 'none',
        }}
      >
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '2px' }}>
            Rekod Kehadiran Hari Ini
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
            {belumDitanda.length} pelajar belum ditanda
          </div>
        </div>
        <CalendarCheck size={24} style={{ color: 'var(--accent)' }} />
      </Link>

      {/* Senarai Belum Ditanda */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <Users size={14} style={{ color: 'var(--text-muted)' }} />
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Belum Ditanda Hari Ini ({belumDitanda.length})
          </h2>
        </div>

        {belumDitanda.length === 0 ? (
          <div style={{
            background: 'var(--hadir-bg)', border: '1px solid #BBF7D0',
            borderRadius: '14px', padding: '24px 16px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎉</div>
            <p style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--hadir-text)' }}>
              Semua pelajar sudah ditanda!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {belumDitanda.slice(0, 10).map((p: any) => (
              <div key={p.id} style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '12px 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>{p.nama_penuh}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '1px' }}>
                    {p.cawangan?.nama ?? '—'}
                  </div>
                </div>
                <span style={{
                  fontSize: '11px', padding: '3px 8px', borderRadius: '20px', fontWeight: 600,
                  background: '#FEF9C3', color: '#92400E',
                }}>
                  Belum ditanda
                </span>
              </div>
            ))}
            {belumDitanda.length > 10 && (
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', textAlign: 'center', padding: '8px' }}>
                +{belumDitanda.length - 10} lagi — buka halaman Kehadiran untuk lihat semua
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
