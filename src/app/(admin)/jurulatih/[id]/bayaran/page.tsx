import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { akhirBulan } from '@/lib/utils'
import { tapisSesiDibatalkan, SELECT_SESI_GAJI, SELECT_SLOT_GAJI, type SlotUntukGaji } from '@/lib/gajiSesi'
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
    { data: advanceTertunggak },
    { data: slotGaji },
    { data: batalBulan },
  ] = await Promise.all([
    supabase.from('jurulatih').select('id, nama_penuh, no_ic, kadar_bayaran, no_tng, tng_qr_path').eq('id', id).single(),
    supabase.from('bayaran_jurulatih').select('id, bulan_bayaran, tahun_bayaran, bilangan_sesi, kadar_per_sesi, jumlah, potongan_advance, kaedah_bayaran, tarikh_bayar, status, nota').eq('jurulatih_id', id).order('tahun_bayaran', { ascending: false }).order('bulan_bayaran', { ascending: false }),
    supabase.from('kehadiran_jurulatih').select(SELECT_SESI_GAJI).eq('jurulatih_id', id).gte('tarikh', mulaB).lte('tarikh', akhirB).eq('status', 'Hadir'),
    // FIFO: advance paling lama diselesaikan dahulu
    supabase.from('advance_jurulatih').select('id, baki, tarikh_advance').eq('jurulatih_id', id).eq('status', 'Belum Selesai').order('tarikh_advance', { ascending: true }),
    supabase.from('jadual_slot').select(SELECT_SLOT_GAJI),
    supabase.from('jadual_slot_batal').select('slot_id, tarikh').gte('tarikh', mulaB).lte('tarikh', akhirB),
  ])

  if (error || !jurulatih) notFound()

  // QR TNG: signed URL (bucket peribadi) — sah 1 jam
  let tngQrUrl: string | null = null
  if (jurulatih.tng_qr_path) {
    const { data: signed } = await supabase.storage
      .from('gambar-jurulatih')
      .createSignedUrl(jurulatih.tng_qr_path, 3600)
    tngQrUrl = signed?.signedUrl ?? null
  }

  // Sesi pada kelas DIBATALKAN tidak dikira dalam gaji
  const { sah: sesiSah } = tapisSesiDibatalkan(
    kehadiranBulanIni ?? [],
    (slotGaji ?? []) as SlotUntukGaji[],
    batalBulan ?? []
  )
  const bilSesiHadirBulanIni = sesiSah.length
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
        no_tng: jurulatih.no_tng,
        tng_qr_url: tngQrUrl,
      }}
      bayaran={bayaran ?? []}
      advanceTertunggak={advanceTertunggak ?? []}
      bulanSemasa={bulanSemasa}
      tahunSemasa={tahunSemasa}
      bilSesiHadirBulanIni={bilSesiHadirBulanIni}
      sudahRekodBulanIni={sudahRekodBulanIni}
    />
  )
}
