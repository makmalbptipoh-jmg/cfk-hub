import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LihatResitKlient } from './_components/LihatResitKlient'

export default async function LihatResitPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: resit, error } = await supabase
    .from('resit')
    .select(
      'id, nombor_resit, jenis, bulan_bayaran, tahun_bayaran, jumlah, kaedah_bayaran, tarikh_bayar, status, sebab_batal, tarikh_batal, created_at, pelajar:pelajar_id(id, nama_penuh, cawangan:cawangan_daftar_id(nama))'
    )
    .eq('id', id)
    .single()

  if (error || !resit) notFound()

  const p = resit as any

  return (
    <LihatResitKlient
      resit={{
        id: p.id,
        nombor_resit: p.nombor_resit,
        jenis: p.jenis,
        bulan_bayaran: p.bulan_bayaran,
        tahun_bayaran: p.tahun_bayaran,
        jumlah: p.jumlah,
        kaedah_bayaran: p.kaedah_bayaran,
        tarikh_bayar: p.tarikh_bayar,
        status: p.status,
        sebab_batal: p.sebab_batal,
        tarikh_batal: p.tarikh_batal,
        pelajar_id: p.pelajar?.id ?? null,
        nama_pelajar: p.pelajar?.nama_penuh ?? '—',
        cawangan: p.pelajar?.cawangan?.nama ?? '—',
      }}
    />
  )
}
