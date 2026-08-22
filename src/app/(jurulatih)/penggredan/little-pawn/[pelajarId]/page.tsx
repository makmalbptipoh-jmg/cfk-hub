import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ChecklistLittlePawnKlient } from '../../_components/ChecklistLittlePawnKlient'

export const dynamic = 'force-dynamic'

export default async function LittlePawnPage({
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
    supabase.from('pelajar').select('id, nama_penuh, tarikh_lahir, cawangan_daftar_id').eq('id', pelajarId).maybeSingle(),
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

  const { data: sedia } = await supabase
    .from('gred_little_pawn').select('*').eq('pelajar_id', pelajarId).eq('kitaran_id', kitaran.id).maybeSingle()

  const { data: kehadiran } = await supabase
    .from('kehadiran').select('status')
    .eq('pelajar_id', pelajarId)
    .gte('tarikh', kitaran.tarikh_mula)
    .lte('tarikh', kitaran.tarikh_tamat)
  const hadirAuto = (kehadiran ?? []).filter((k) => k.status === 'Hadir').length
  const jumlahAuto = (kehadiran ?? []).filter((k) => k.status === 'Hadir' || k.status === 'Tidak Hadir').length

  return (
    <ChecklistLittlePawnKlient
      pelajar={{ id: pelajar.id, nama_penuh: pelajar.nama_penuh, cawangan_daftar_id: pelajar.cawangan_daftar_id }}
      kitaran={kitaran}
      hadirAuto={hadirAuto}
      jumlahAuto={jumlahAuto}
      sedia={sedia}
    />
  )
}
