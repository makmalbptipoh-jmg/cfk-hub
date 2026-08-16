import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PertandinganDetailKlient, type PesertaData, type KeputusanData } from './_components/PertandinganDetailKlient'

export const dynamic = 'force-dynamic'

export default async function PertandinganDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: pt } = await supabase
    .from('pertandingan')
    .select('id, nama, tarikh, status, bil_pusingan, catatan, cawangan:cawangan_id(nama)')
    .eq('id', id)
    .single()
  if (!pt) notFound()

  const [{ data: pesertaRaw }, { data: keputusanRaw }] = await Promise.all([
    supabase
      .from('pertandingan_peserta')
      .select('id, pelajar_id, nama_ekspot, pelajar:pelajar_id(nama_penuh, tarikh_lahir)')
      .eq('pertandingan_id', id)
      .order('nama_ekspot'),
    supabase
      .from('pertandingan_keputusan')
      .select('id, nama_ranking, kedudukan, sno, mata, buchholz, sonneborn, jumlah_peserta, pingat, pelajar_id, peserta_id')
      .eq('pertandingan_id', id)
      .order('kedudukan'),
  ])

  type PesertaBaris = { id: string; pelajar_id: string; nama_ekspot: string; pelajar: { nama_penuh: string; tarikh_lahir: string | null } | null }
  const peserta: PesertaData[] = ((pesertaRaw ?? []) as unknown as PesertaBaris[]).map((p) => ({
    id: p.id,
    pelajar_id: p.pelajar_id,
    nama_ekspot: p.nama_ekspot,
    nama_penuh: p.pelajar?.nama_penuh ?? p.nama_ekspot,
    tarikh_lahir: p.pelajar?.tarikh_lahir ?? null,
  }))

  const cawanganNama = (pt as unknown as { cawangan: { nama: string } | null }).cawangan?.nama ?? null

  return (
    <PertandinganDetailKlient
      id={pt.id}
      nama={pt.nama}
      tarikh={pt.tarikh}
      status={pt.status}
      bilPusingan={pt.bil_pusingan}
      cawanganNama={cawanganNama}
      peserta={peserta}
      keputusan={(keputusanRaw ?? []) as KeputusanData[]}
    />
  )
}
