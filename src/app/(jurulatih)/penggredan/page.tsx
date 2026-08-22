import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PenggredanDashboardKlient } from './_components/PenggredanDashboardKlient'

export const dynamic = 'force-dynamic'

export default async function PenggredanPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profil } = await supabase
    .from('pengguna_profil')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const isAdmin = profil?.is_admin ?? false

  // Jurulatih: had cawangan sendiri (default tapisan). Admin: semua.
  let cawanganSaya: string[] = []
  if (!isAdmin) {
    const { data: jurulatih } = await supabase
      .from('jurulatih')
      .select('cawangan_ids')
      .eq('pengguna_id', user.id)
      .maybeSingle()
    cawanganSaya = jurulatih?.cawangan_ids ?? []
  }

  const [rCawangan, rKitaran, rPelajar, rPenilaian, rLittlePawn] = await Promise.all([
    supabase.from('cawangan').select('id, nama').eq('status', 'Aktif').order('nama'),
    supabase.from('gred_kitaran').select('id, nama, tarikh_mula, tarikh_tamat, status').order('tarikh_mula', { ascending: false }),
    supabase.from('pelajar').select('id, nama_penuh, tarikh_lahir, cawangan_daftar_id, jenis_kelas').eq('status', 'Aktif').order('nama_penuh'),
    supabase.from('gred_penilaian').select('id, pelajar_id, kitaran_id, level_mula, naik_level, skor_akhir, gred, status'),
    supabase.from('gred_little_pawn').select('id, pelajar_id, kitaran_id, peringkat, graduasi, status'),
  ])

  return (
    <PenggredanDashboardKlient
      isAdmin={isAdmin}
      cawanganSaya={cawanganSaya}
      cawangan={rCawangan.data ?? []}
      kitaran={rKitaran.data ?? []}
      pelajar={rPelajar.data ?? []}
      penilaian={rPenilaian.data ?? []}
      littlePawn={rLittlePawn.data ?? []}
    />
  )
}
