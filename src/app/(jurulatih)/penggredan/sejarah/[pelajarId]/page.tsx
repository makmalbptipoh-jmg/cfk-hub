import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { tarafGred } from '@/lib/grading'
import { SejarahKlient, type TitikSejarah, type NaikRekod } from '../../_components/SejarahKlient'

export const dynamic = 'force-dynamic'

export default async function SejarahPage({ params }: { params: Promise<{ pelajarId: string }> }) {
  const { pelajarId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [rPelajar, rKitaran, rPenilaian] = await Promise.all([
    supabase.from('pelajar').select('nama_penuh').eq('id', pelajarId).maybeSingle(),
    supabase.from('gred_kitaran').select('id, nama, tarikh_mula').order('tarikh_mula', { ascending: true }),
    supabase.from('gred_penilaian').select('kitaran_id, skor_akhir, gred, rating_tamat, level_mula, naik_level, status').eq('pelajar_id', pelajarId),
  ])

  const pelajar = rPelajar.data
  if (!pelajar) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '14px' }}>Pelajar tidak dijumpai.</p>
        <Link href="/penggredan" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}>← Kembali</Link>
      </div>
    )
  }

  const kitaran = rKitaran.data ?? []
  const penilaian = rPenilaian.data ?? []
  const petaP = new Map(penilaian.map((p) => [p.kitaran_id, p]))

  const labelPendek = (nama: string) => nama.split(' ')[0] // 'Q4' dari 'Q4 2026 (...)'

  const skorSiri: TitikSejarah[] = []
  const ratingSiri: TitikSejarah[] = []
  const naik: NaikRekod[] = []
  for (const k of kitaran) {
    const p = petaP.get(k.id)
    if (!p) continue
    if (p.skor_akhir != null) skorSiri.push({ label: labelPendek(k.nama), nilai: p.skor_akhir, sub: p.gred ?? '' })
    if (p.rating_tamat != null) ratingSiri.push({ label: labelPendek(k.nama), nilai: p.rating_tamat, sub: '' })
    if (p.naik_level) naik.push({ kitaran: k.nama, ke: tarafGred(Math.min(6, p.level_mula + 1)).nama })
  }

  return (
    <SejarahKlient nama={pelajar.nama_penuh} skorSiri={skorSiri} ratingSiri={ratingSiri} naik={naik} />
  )
}
