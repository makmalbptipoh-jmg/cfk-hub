import { createClient } from '@/lib/supabase/server'
import { JurulatihKehadiranKlient } from './_components/JurulatihKehadiranKlient'
import { AdminKehadiranKlient } from './_components/AdminKehadiranKlient'

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

  const tarikhHariIni = new Date().toISOString().split('T')[0]

  // Admin — S-07 Semak Kehadiran
  if (profil?.is_admin) {
    return (
      <div style={{ padding: '24px 28px' }}>
        <AdminKehadiranKlient
          cawangan={cawangan ?? []}
          tarikhAwal={tarikhHariIni}
        />
      </div>
    )
  }

  // Jurulatih — S-08 Rekod Kehadiran
  const [{ data: pelajarRaw }, { data: rekodHariIni }] = await Promise.all([
    supabase
      .from('pelajar')
      .select('id, nama_penuh, cawangan_daftar_id, cawangan:cawangan_daftar_id(nama)')
      .eq('status', 'Aktif')
      .order('nama_penuh'),
    supabase
      .from('kehadiran')
      .select('pelajar_id, status')
      .eq('tarikh', tarikhHariIni),
  ])

  const pelajar = (pelajarRaw ?? []).map((p: any) => ({
    id: p.id,
    nama_penuh: p.nama_penuh,
    cawangan_daftar_id: p.cawangan_daftar_id,
    cawangan_nama: p.cawangan?.nama ?? '—',
  }))

  const rekodSedia: Record<string, 'Hadir' | 'Tidak Hadir' | 'Cuti'> = {}
  for (const r of rekodHariIni ?? []) {
    rekodSedia[r.pelajar_id] = r.status as any
  }

  return (
    <JurulatihKehadiranKlient
      pelajar={pelajar}
      cawangan={cawangan ?? []}
      userId={user!.id}
      tarikhHariIni={tarikhHariIni}
      rekodSedia={rekodSedia}
    />
  )
}
