import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfilJurulatihKlient } from './_components/ProfilJurulatihKlient'

export default async function ProfilJurulatihPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const sekarang = new Date()
  const bulanArr = [0, 1, 2].map((offset) => {
    const d = new Date(sekarang.getFullYear(), sekarang.getMonth() - offset, 1)
    return {
      label: d.toLocaleString('ms-MY', { month: 'long', year: 'numeric' }),
      mula: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`,
      akhir: new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0],
    }
  })

  const bulanSemasa = bulanArr[0]
  const namaBulanSemasa = bulanSemasa.label

  const [
    { data: raw, error },
    { data: kehadiran },
    { data: bayaran },
    { data: cawangan },
  ] = await Promise.all([
    supabase.from('jurulatih').select('*').eq('id', id).single(),
    supabase.from('kehadiran_jurulatih').select('id, tarikh, status, nota').eq('jurulatih_id', id).order('tarikh', { ascending: false }).limit(50),
    supabase.from('bayaran_jurulatih').select('id, bulan_bayaran, tahun_bayaran, bilangan_sesi, kadar_per_sesi, jumlah, tarikh_bayar, status').eq('jurulatih_id', id).order('tahun_bayaran', { ascending: false }).order('bulan_bayaran', { ascending: false }),
    supabase.from('cawangan').select('id, nama'),
  ])

  if (error || !raw) notFound()

  const petaCawangan: Record<string, string> = {}
  for (const c of cawangan ?? []) petaCawangan[c.id] = c.nama

  // Stat 3 bulan terkini
  const statBulan = await Promise.all(bulanArr.map(async (b) => {
    const { data } = await supabase
      .from('kehadiran_jurulatih')
      .select('status')
      .eq('jurulatih_id', id)
      .gte('tarikh', b.mula)
      .lte('tarikh', b.akhir)
      .eq('status', 'Hadir')
    return { bulan: b.label, sesi: data?.length ?? 0 }
  }))

  const sudahBayarBulanIni = (bayaran ?? []).some(
    (b: any) => b.bulan_bayaran === sekarang.toLocaleString('ms-MY', { month: 'long' }) && b.tahun_bayaran === sekarang.getFullYear() && b.status === 'Sudah Bayar'
  )

  return (
    <ProfilJurulatihKlient
      jurulatih={{
        id: raw.id,
        nama_penuh: raw.nama_penuh,
        no_ic: raw.no_ic,
        no_telefon: raw.no_telefon,
        emel: raw.emel,
        kadar_bayaran: raw.kadar_bayaran,
        tarikh_mula: raw.tarikh_mula,
        pengalaman_ringkas: raw.pengalaman_ringkas,
        kelayakan: raw.kelayakan,
        status: raw.status,
        cawangan_nama: (raw.cawangan_ids ?? []).map((cid: string) => petaCawangan[cid] ?? '').filter(Boolean).join(', '),
      }}
      statBulan={statBulan}
      kehadiran={kehadiran ?? []}
      bayaran={bayaran ?? []}
      namaBulanSemasa={namaBulanSemasa}
      sudahBayarBulanIni={sudahBayarBulanIni}
    />
  )
}
