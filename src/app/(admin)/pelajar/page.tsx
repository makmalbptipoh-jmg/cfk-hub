import { createClient } from '@/lib/supabase/server'
import { akhirBulan } from '@/lib/utils'
import { TabelPelajar } from './_components/TabelPelajar'

const NAMA_BULAN = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
]

export default async function PelajarPage() {
  const supabase = await createClient()

  // Setakat bulan semasa waktu Malaysia (UTC+8), meliputi sepanjang tahun
  const myt = new Date(Date.now() + 8 * 60 * 60 * 1000)
  const tahun = myt.getUTCFullYear()
  const bulanSemasa = myt.getUTCMonth() + 1
  const mulaThn = `${tahun}-01-01`
  const akhirThn = akhirBulan(tahun, bulanSemasa)

  const [{ data: pelajarRaw }, { data: cawangan }, { data: kehadiran }, { data: resit }] = await Promise.all([
    supabase
      .from('pelajar')
      .select('id, nama_penuh, nama_ibu_bapa, no_telefon, jenis_kelas, yuran_bulanan, status, cawangan_daftar_id, cawangan:cawangan_daftar_id(nama)')
      .order('nama_penuh'),
    supabase
      .from('cawangan')
      .select('id, nama')
      .eq('status', 'Aktif')
      .order('nama'),
    supabase.from('kehadiran').select('pelajar_id, tarikh').eq('status', 'Hadir').gte('tarikh', mulaThn).lte('tarikh', akhirThn),
    supabase.from('resit').select('pelajar_id, bulan_bayaran').eq('tahun_bayaran', tahun).eq('status', 'Aktif'),
  ])

  // Aging: bilangan bulan tertunggak per pelajar sepanjang tahun
  // (bulan dengan ≥4 hadir TETAPI tiada resit aktif) — sama logik Laporan Tunggakan.
  const hadir: Record<string, Record<number, number>> = {}
  for (const k of kehadiran ?? []) {
    const m = +(k.tarikh as string).slice(5, 7)
    ;(hadir[k.pelajar_id] ??= {})[m] = ((hadir[k.pelajar_id] ??= {})[m] ?? 0) + 1
  }
  const dibayar = new Set((resit ?? []).map((r: any) => `${r.pelajar_id}|${r.bulan_bayaran}`))
  const tunggakanCount: Record<string, number> = {}
  for (const pid of Object.keys(hadir)) {
    let n = 0
    for (let m = 1; m <= bulanSemasa; m++) {
      if ((hadir[pid][m] ?? 0) >= 4 && !dibayar.has(`${pid}|${NAMA_BULAN[m - 1]}`)) n++
    }
    if (n > 0) tunggakanCount[pid] = n
  }

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
      tunggakanCount={tunggakanCount}
      tahun={tahun}
    />
  )
}
