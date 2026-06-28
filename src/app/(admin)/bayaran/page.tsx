import { createClient } from '@/lib/supabase/server'
import { TabelResit } from './_components/TabelResit'

export default async function BayaranPage() {
  const supabase = await createClient()

  const { data: raw } = await supabase
    .from('resit')
    .select('id, nombor_resit, pelajar_id, jenis, bulan_bayaran, tahun_bayaran, jumlah, kaedah_bayaran, tarikh_bayar, status, sebab_batal, pelajar:pelajar_id(nama_penuh, cawangan_daftar_id, cawangan:cawangan_daftar_id(nama))')
    .order('created_at', { ascending: false })

  const resit = (raw ?? []).map((r: any) => ({
    id: r.id,
    nombor_resit: r.nombor_resit,
    pelajar_id: r.pelajar_id,
    nama_pelajar: r.pelajar?.nama_penuh ?? '—',
    cawangan: r.pelajar?.cawangan?.nama ?? '—',
    jenis: r.jenis,
    bulan_bayaran: r.bulan_bayaran,
    tahun_bayaran: r.tahun_bayaran,
    jumlah: r.jumlah,
    kaedah_bayaran: r.kaedah_bayaran,
    tarikh_bayar: r.tarikh_bayar,
    status: r.status,
    sebab_batal: r.sebab_batal,
  }))

  // Bulan tersedia untuk filter dropdown (unik, terkini dahulu)
  const bulanTersedia = [...new Set(resit.map((r) => `${r.bulan_bayaran} ${r.tahun_bayaran}`))]

  return <TabelResit resit={resit} bulanTersedia={bulanTersedia} />
}
