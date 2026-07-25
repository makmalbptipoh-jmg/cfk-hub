import { createClient } from '@/lib/supabase/server'
import { tarikhTempatan } from '@/lib/utils'
import { JurulatihKehadiranKlient } from './_components/JurulatihKehadiranKlient'
import { AdminKehadiranKlient } from './_components/AdminKehadiranKlient'
import { KehadiranAdminTabs } from './_components/KehadiranAdminTabs'

export default async function KehadiranPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profil } = await supabase
    .from('pengguna_profil')
    .select('is_admin')
    .eq('id', user!.id)
    .single()

  const { data: cawangan } = await supabase
    .from('cawangan')
    .select('id, nama')
    .eq('status', 'Aktif')
    .order('nama')

  const tarikhHariIni = tarikhTempatan()

  // Data untuk mod Rekod (S-08) — diperlukan oleh jurulatih DAN admin
  const [{ data: pelajarRaw }, { data: rekodHariIni }] = await Promise.all([
    supabase
      .from('pelajar')
      .select('id, nama_penuh, cawangan_daftar_id, jenis_kelas, cawangan:cawangan_daftar_id(nama)')
      .eq('status', 'Aktif')
      .order('nama_penuh'),
    supabase
      .from('kehadiran')
      .select('pelajar_id, status, cawangan_sesi_id')
      .eq('tarikh', tarikhHariIni),
  ])

  const pelajar = (pelajarRaw ?? []).map((p: any) => ({
    id: p.id,
    nama_penuh: p.nama_penuh,
    cawangan_daftar_id: p.cawangan_daftar_id,
    cawangan_nama: p.cawangan?.nama ?? '—',
    jenis_kelas: p.jenis_kelas,
  }))

  const rekodSedia: Record<string, 'Hadir' | 'Tidak Hadir' | 'Cuti'> = {}
  // Rekod penuh hari ini — klien perlukan cawangan sesi untuk beri amaran bila
  // simpanan akan MENIMPA rekod sedia ada (kehadiran guna upsert pelajar+tarikh)
  const sesiSedia: Record<string, { status: string; cawangan_sesi_id: string | null }> = {}
  for (const r of rekodHariIni ?? []) {
    rekodSedia[r.pelajar_id] = r.status as any
    sesiSedia[r.pelajar_id] = { status: r.status, cawangan_sesi_id: r.cawangan_sesi_id }
  }

  const rekodView = (
    <JurulatihKehadiranKlient
      pelajar={pelajar}
      cawangan={cawangan ?? []}
      userId={user!.id}
      tarikhHariIni={tarikhHariIni}
      rekodSedia={rekodSedia}
      sesiSedia={sesiSedia}
    />
  )

  // Admin — tab Rekod (S-08) + Semak & Edit (S-07); admin juga jurulatih
  if (profil?.is_admin) {
    return (
      <KehadiranAdminTabs
        rekodView={rekodView}
        semakView={
          <div style={{ padding: '24px 28px' }}>
            <AdminKehadiranKlient
              cawangan={cawangan ?? []}
              tarikhAwal={tarikhHariIni}
            />
          </div>
        }
      />
    )
  }

  // Jurulatih — S-08 Rekod Kehadiran
  return rekodView
}
