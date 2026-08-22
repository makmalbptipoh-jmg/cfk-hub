import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ratingSemasaDariKeputusan } from '@/lib/grading'
import { BatchEntryKlient } from '../_components/BatchEntryKlient'

export const dynamic = 'force-dynamic'

export default async function BatchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profil } = await supabase.from('pengguna_profil').select('is_admin').eq('id', user.id).single()
  const isAdmin = profil?.is_admin ?? false
  let cawanganSaya: string[] = []
  if (!isAdmin) {
    const { data: jl } = await supabase.from('jurulatih').select('cawangan_ids').eq('pengguna_id', user.id).maybeSingle()
    cawanganSaya = jl?.cawangan_ids ?? []
  }

  const [rCawangan, rKitaran, rPelajar, rPenilaian, rKeputusan] = await Promise.all([
    supabase.from('cawangan').select('id, nama').eq('status', 'Aktif').order('nama'),
    supabase.from('gred_kitaran').select('id, nama, status').order('tarikh_mula', { ascending: false }),
    supabase.from('pelajar').select('id, nama_penuh, tarikh_lahir, cawangan_daftar_id').eq('status', 'Aktif').order('nama_penuh'),
    supabase.from('gred_penilaian').select('pelajar_id, kitaran_id, level_mula, theory_raw, theory_max, puzzle_raw, puzzle_max, club_points, tournament_points, sesi_hadir, sesi_jumlah, att_hormat, att_fokus, att_sportsmanship, att_usaha, bonus_helper, status'),
    supabase.from('pertandingan_keputusan').select('pelajar_id, kedudukan, jumlah_peserta, mata, pingat'),
  ])

  // Rating semasa setiap pelajar (dari pertandingan).
  const petaKeputusan = new Map<string, { kedudukan: number; jumlah_peserta: number; mata: number; pingat: 'Emas' | 'Perak' | 'Gangsa' | null }[]>()
  for (const k of rKeputusan.data ?? []) {
    if (!k.pelajar_id) continue
    if (!petaKeputusan.has(k.pelajar_id)) petaKeputusan.set(k.pelajar_id, [])
    petaKeputusan.get(k.pelajar_id)!.push({ kedudukan: k.kedudukan, jumlah_peserta: k.jumlah_peserta, mata: k.mata, pingat: k.pingat })
  }
  const ratingPelajar: Record<string, number> = {}
  for (const p of rPelajar.data ?? []) ratingPelajar[p.id] = ratingSemasaDariKeputusan(petaKeputusan.get(p.id) ?? [])

  return (
    <BatchEntryKlient
      isAdmin={isAdmin}
      cawanganSaya={cawanganSaya}
      cawangan={rCawangan.data ?? []}
      kitaran={rKitaran.data ?? []}
      pelajar={rPelajar.data ?? []}
      penilaian={rPenilaian.data ?? []}
      ratingPelajar={ratingPelajar}
    />
  )
}
