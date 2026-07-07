import { createClient } from '@/lib/supabase/server'
import { akhirBulan } from '@/lib/utils'
import { TabelPelajar } from './_components/TabelPelajar'

const NAMA_BULAN = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
]

export default async function PelajarPage() {
  const supabase = await createClient()

  // Bulan semasa waktu Malaysia (UTC+8)
  const myt = new Date(Date.now() + 8 * 60 * 60 * 1000)
  const tahun = myt.getUTCFullYear()
  const bulanNum = myt.getUTCMonth() + 1
  const namaBulan = NAMA_BULAN[bulanNum - 1]
  const mulaB = `${tahun}-${String(bulanNum).padStart(2, '0')}-01`
  const akhirB = akhirBulan(tahun, bulanNum)

  const [{ data: pelajarRaw }, { data: cawangan }, { data: kehadiranBulan }, { data: resitBulan }] = await Promise.all([
    supabase
      .from('pelajar')
      .select('id, nama_penuh, nama_ibu_bapa, no_telefon, jenis_kelas, yuran_bulanan, status, cawangan_daftar_id, cawangan:cawangan_daftar_id(nama)')
      .order('nama_penuh'),
    supabase
      .from('cawangan')
      .select('id, nama')
      .eq('status', 'Aktif')
      .order('nama'),
    supabase.from('kehadiran').select('pelajar_id, status').eq('status', 'Hadir').gte('tarikh', mulaB).lte('tarikh', akhirB),
    supabase.from('resit').select('pelajar_id').eq('bulan_bayaran', namaBulan).eq('tahun_bayaran', tahun).eq('status', 'Aktif'),
  ])

  // Set pelajar belum bayar bulan ini (≥4 hadir, tiada resit aktif) — sama peraturan dashboard
  const idDgnResit = new Set((resitBulan ?? []).map((r: any) => r.pelajar_id))
  const kiraHadir: Record<string, number> = {}
  for (const k of kehadiranBulan ?? []) kiraHadir[k.pelajar_id] = (kiraHadir[k.pelajar_id] ?? 0) + 1
  const belumBayarIds = Object.keys(kiraHadir).filter((id) => kiraHadir[id] >= 4 && !idDgnResit.has(id))

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

  return (
    <TabelPelajar
      pelajar={pelajar}
      cawangan={cawangan ?? []}
      belumBayarIds={belumBayarIds}
      labelBulan={`${namaBulan} ${tahun}`}
    />
  )
}
