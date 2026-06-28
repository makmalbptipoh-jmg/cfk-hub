import { createClient } from '@/lib/supabase/server'
import { TabelPelajar } from './_components/TabelPelajar'

export default async function PelajarPage() {
  const supabase = await createClient()

  const [{ data: pelajarRaw }, { data: cawangan }] = await Promise.all([
    supabase
      .from('pelajar')
      .select('id, nama_penuh, nama_ibu_bapa, no_telefon, jenis_kelas, yuran_bulanan, status, cawangan_daftar_id, cawangan:cawangan_daftar_id(nama)')
      .order('nama_penuh'),
    supabase
      .from('cawangan')
      .select('id, nama')
      .eq('status', 'Aktif')
      .order('nama'),
  ])

  const pelajar = (pelajarRaw ?? []).map((p: any) => ({
    id: p.id,
    nama_penuh: p.nama_penuh,
    nama_ibu_bapa: p.nama_ibu_bapa,
    no_telefon: p.no_telefon,
    jenis_kelas: p.jenis_kelas,
    yuran_bulanan: p.yuran_bulanan,
    status: p.status,
    cawangan_daftar_id: p.cawangan_daftar_id,
    cawangan_nama: p.cawangan?.nama,
  }))

  return <TabelPelajar pelajar={pelajar} cawangan={cawangan ?? []} />
}
