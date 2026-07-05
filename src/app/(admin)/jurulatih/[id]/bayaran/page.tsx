import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { akhirBulan } from '@/lib/utils'
import { BayaranJurulatihKlient } from './_components/BayaranJurulatihKlient'

export default async function BayaranJurulatihPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const sekarang = new Date()
  const bulanSemasa = sekarang.toLocaleString('ms-MY', { month: 'long' })
  const tahunSemasa = sekarang.getFullYear()
  const mulaB = `${tahunSemasa}-${String(sekarang.getMonth() + 1).padStart(2, '0')}-01`
  const akhirB = akhirBulan(tahunSemasa, sekarang.getMonth() + 1)

  const [
    { data: jurulatih, error },
    { data: bayaran },
    { data: kehadiranBulanIni },
  ] = await Promise.all([
    supabase.from('jurulatih').select('id, nama_penuh, no_ic, kadar_bayaran').eq('id', id).single(),
    supabase.from('bayaran_jurulatih').select('id, bulan_bayaran, tahun_bayaran, bilangan_sesi, kadar_per_sesi, jumlah, tarikh_bayar, status, nota').eq('jurulatih_id', id).order('tahun_bayaran', { ascending: false }).order('bulan_bayaran', { ascending: false }),
    supabase.from('kehadiran_jurulatih').select('status').eq('jurulatih_id', id).gte('tarikh', mulaB).lte('tarikh', akhirB).eq('status', 'Hadir'),
  ])

  if (error || !jurulatih) notFound()

  const bilSesiHadirBulanIni = kehadiranBulanIni?.length ?? 0
  const sudahRekodBulanIni = (bayaran ?? []).some(
    (b: any) => b.bulan_bayaran === bulanSemasa && b.tahun_bayaran === tahunSemasa
  )

  return (
    <BayaranJurulatihKlient
      jurulatih={{
        id: jurulatih.id,
        nama_penuh: jurulatih.nama_penuh,
        no_ic: jurulatih.no_ic,
        kadar_bayaran: jurulatih.kadar_bayaran ?? 0,
      }}
      bayaran={bayaran ?? []}
      bulanSemasa={bulanSemasa}
      tahunSemasa={tahunSemasa}
      bilSesiHadirBulanIni={bilSesiHadirBulanIni}
      sudahRekodBulanIni={sudahRekodBulanIni}
    />
  )
}
