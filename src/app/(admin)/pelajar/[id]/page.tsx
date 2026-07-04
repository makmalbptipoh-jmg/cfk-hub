import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfilPelajarKlient } from './_components/ProfilPelajarKlient'

export default async function ProfilPelajarPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const bulanIni = new Date()
  const tahunBulan = `${bulanIni.getFullYear()}-${String(bulanIni.getMonth() + 1).padStart(2, '0')}`
  const bulanLabel = bulanIni.toLocaleString('ms-MY', { month: 'long' })
  const bulanBayaran = `${bulanLabel} ${bulanIni.getFullYear()}`

  const [
    { data: pelajarRaw, error },
    { data: kehadiran },
    { data: kehadiranBulanIni },
    { data: resit },
    { data: resitBulanIni },
  ] = await Promise.all([
    supabase
      .from('pelajar')
      .select('*, cawangan:cawangan_daftar_id(nama)')
      .eq('id', id)
      .single(),
    supabase
      .from('kehadiran')
      .select('id, tarikh, status, nota')
      .eq('pelajar_id', id)
      .order('tarikh', { ascending: false })
      .limit(50),
    supabase
      .from('kehadiran')
      .select('status')
      .eq('pelajar_id', id)
      .gte('tarikh', `${tahunBulan}-01`)
      .lt('tarikh', `${tahunBulan}-32`),
    supabase
      .from('resit')
      .select('id, nombor_resit, bulan_bayaran, jenis, jumlah, kaedah_bayaran, tarikh_bayar, status')
      .eq('pelajar_id', id)
      .order('tarikh_bayar', { ascending: false }),
    supabase
      .from('resit')
      .select('id')
      .eq('pelajar_id', id)
      .eq('bulan_bayaran', bulanBayaran)
      .eq('status', 'Aktif'),
  ])

  if (error || !pelajarRaw) notFound()

  const p = pelajarRaw as any
  const stat = {
    hadir: (kehadiranBulanIni ?? []).filter((k: any) => k.status === 'Hadir').length,
    tidak_hadir: (kehadiranBulanIni ?? []).filter((k: any) => k.status === 'Tidak Hadir').length,
    cuti: (kehadiranBulanIni ?? []).filter((k: any) => k.status === 'Cuti').length,
  }

  return (
    <ProfilPelajarKlient
      pelajar={{
        id: p.id,
        nama_penuh: p.nama_penuh,
        tarikh_lahir: p.tarikh_lahir,
        nama_ibu_bapa: p.nama_ibu_bapa,
        no_telefon: p.no_telefon,
        emel_ibu_bapa: p.emel_ibu_bapa,
        alamat: p.alamat,
        jenis_kelas: p.jenis_kelas,
        yuran_bulanan: p.yuran_bulanan,
        status: p.status,
        tarikh_daftar: p.tarikh_daftar,
        cawangan_nama: p.cawangan?.nama ?? '—',
      }}
      stat={stat}
      sudahBayarBulanIni={(resitBulanIni ?? []).length > 0}
      kehadiran={kehadiran ?? []}
      resit={resit ?? []}
    />
  )
}
