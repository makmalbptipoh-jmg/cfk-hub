import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ratingSemasaDariKeputusan, RATING_ASAS, umurDariTarikhLahir, bandUmurDariUmur, type BandUmur } from '@/lib/grading'
import { BorangPenilaianKlient } from '../../_components/BorangPenilaianKlient'

export const dynamic = 'force-dynamic'

export default async function NilaiPage({
  params,
  searchParams,
}: {
  params: Promise<{ pelajarId: string }>
  searchParams: Promise<{ kitaran?: string }>
}) {
  const { pelajarId } = await params
  const { kitaran: kitaranId } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [rPelajar, rKitaran] = await Promise.all([
    supabase.from('pelajar').select('id, nama_penuh, tarikh_lahir, cawangan_daftar_id, jenis_kelas').eq('id', pelajarId).maybeSingle(),
    kitaranId
      ? supabase.from('gred_kitaran').select('id, nama, tarikh_mula, tarikh_tamat, status').eq('id', kitaranId).maybeSingle()
      : supabase.from('gred_kitaran').select('id, nama, tarikh_mula, tarikh_tamat, status').eq('status', 'Dibuka').order('tarikh_mula', { ascending: false }).limit(1).maybeSingle(),
  ])

  const pelajar = rPelajar.data
  const kitaran = rKitaran.data
  if (!pelajar || !kitaran) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '14px' }}>
          {!pelajar ? 'Pelajar tidak dijumpai.' : 'Kitaran grading tidak dijumpai.'}
        </p>
        <Link href="/penggredan" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}>← Kembali ke Penggredan</Link>
      </div>
    )
  }

  // Rekod sedia ada (kitaran ini).
  const { data: sedia } = await supabase
    .from('gred_penilaian').select('*').eq('pelajar_id', pelajarId).eq('kitaran_id', kitaran.id).maybeSingle()

  // Auto-kira kehadiran dalam julat tarikh kitaran (kecuali Cuti).
  const { data: kehadiran } = await supabase
    .from('kehadiran').select('status')
    .eq('pelajar_id', pelajarId)
    .gte('tarikh', kitaran.tarikh_mula)
    .lte('tarikh', kitaran.tarikh_tamat)
  const hadirAuto = (kehadiran ?? []).filter((k) => k.status === 'Hadir').length
  const jumlahAuto = (kehadiran ?? []).filter((k) => k.status === 'Hadir' || k.status === 'Tidak Hadir').length

  // Rating dari modul Pertandingan.
  const { data: keputusan } = await supabase
    .from('pertandingan_keputusan')
    .select('kedudukan, jumlah_peserta, mata, pingat')
    .eq('pelajar_id', pelajarId)
  const ratingTamatAuto = ratingSemasaDariKeputusan(
    (keputusan ?? []).map((k) => ({ kedudukan: k.kedudukan, jumlah_peserta: k.jumlah_peserta, mata: k.mata, pingat: k.pingat })),
  )

  // rating_mula = rating_tamat kitaran terdahulu (atau asas 1000).
  const { data: kitaranTerdahulu } = await supabase
    .from('gred_kitaran').select('id').lt('tarikh_mula', kitaran.tarikh_mula).order('tarikh_mula', { ascending: false })
  const idTerdahulu = (kitaranTerdahulu ?? []).map((k) => k.id)
  let ratingMulaAuto = RATING_ASAS
  if (idTerdahulu.length > 0) {
    const { data: penilaianLepas } = await supabase
      .from('gred_penilaian').select('rating_tamat, kitaran_id').eq('pelajar_id', pelajarId).in('kitaran_id', idTerdahulu)
    // ikut susunan idTerdahulu (terbaru dahulu)
    for (const kid of idTerdahulu) {
      const rec = (penilaianLepas ?? []).find((p) => p.kitaran_id === kid)
      if (rec?.rating_tamat != null) { ratingMulaAuto = rec.rating_tamat; break }
    }
  }

  const umur = umurDariTarikhLahir(pelajar.tarikh_lahir, new Date(kitaran.tarikh_tamat))
  const bandUmur: BandUmur = bandUmurDariUmur(umur)

  return (
    <BorangPenilaianKlient
      pelajar={{ id: pelajar.id, nama_penuh: pelajar.nama_penuh, umur, cawangan_daftar_id: pelajar.cawangan_daftar_id }}
      kitaran={kitaran}
      bandUmur={bandUmur}
      hadirAuto={hadirAuto}
      jumlahAuto={jumlahAuto}
      ratingMulaAuto={ratingMulaAuto}
      ratingTamatAuto={ratingTamatAuto}
      sedia={sedia}
    />
  )
}
