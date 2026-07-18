import { createClient } from '@/lib/supabase/server'
import { akhirBulan } from '@/lib/utils'
import { kiraHadirPerBulan, setResitDibayar, bulanTertunggak } from '@/lib/tunggakan'
import { TunggakanKlient } from './_components/TunggakanKlient'

export const dynamic = 'force-dynamic'

export type BarisTunggakan = {
  id: string
  nama_penuh: string
  no_telefon: string
  cawangan_nama: string
  yuran_bulanan: number
  bulanTunggak: number[] // nombor bulan 1-12
  bilBulan: number
  jumlah: number
}

export default async function TunggakanPage() {
  const supabase = await createClient()

  // Setakat bulan semasa waktu Malaysia sahaja (bulan hadapan belum tiba)
  const myt = new Date(Date.now() + 8 * 60 * 60 * 1000)
  const tahun = myt.getUTCFullYear()
  const bulanSemasa = myt.getUTCMonth() + 1
  const mulaThn = `${tahun}-01-01`
  const akhirThn = akhirBulan(tahun, bulanSemasa)

  const [{ data: pelajarAktif }, { data: cawangan }, { data: kehadiran }, { data: resit }] = await Promise.all([
    supabase.from('pelajar').select('id, nama_penuh, no_telefon, yuran_bulanan, cawangan_daftar_id, cawangan:cawangan_daftar_id(nama)').eq('status', 'Aktif').order('nama_penuh'),
    supabase.from('cawangan').select('id, nama').eq('status', 'Aktif').order('nama'),
    supabase.from('kehadiran').select('pelajar_id, tarikh').eq('status', 'Hadir').gte('tarikh', mulaThn).lte('tarikh', akhirThn),
    supabase.from('resit').select('pelajar_id, bulan_bayaran').eq('tahun_bayaran', tahun).eq('status', 'Aktif'),
  ])

  // Rule tunggakan kongsi — src/lib/tunggakan.ts
  const hadir = kiraHadirPerBulan((kehadiran ?? []) as { pelajar_id: string; tarikh: string }[])
  const dibayar = setResitDibayar((resit ?? []) as { pelajar_id: string; bulan_bayaran: string }[])

  const baris: BarisTunggakan[] = []
  for (const p of pelajarAktif ?? []) {
    const bulanTunggak = bulanTertunggak(p.id, hadir, dibayar, bulanSemasa)
    if (bulanTunggak.length > 0) {
      baris.push({
        id: p.id,
        nama_penuh: p.nama_penuh,
        no_telefon: p.no_telefon,
        cawangan_nama: (p as any).cawangan?.nama ?? '—',
        yuran_bulanan: p.yuran_bulanan,
        bulanTunggak,
        bilBulan: bulanTunggak.length,
        jumlah: bulanTunggak.length * (p.yuran_bulanan ?? 0),
      })
    }
  }
  baris.sort((a, b) => b.jumlah - a.jumlah)

  return <TunggakanKlient baris={baris} cawangan={(cawangan ?? []).map((c) => ({ id: c.id, nama: c.nama }))} tahun={tahun} />
}
