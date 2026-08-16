import { createClient } from '@/lib/supabase/server'
import { PertandinganListKlient, type PertandinganRingkas } from './_components/PertandinganListKlient'

export const dynamic = 'force-dynamic'

type BarisPertandingan = {
  id: string
  nama: string
  tarikh: string
  status: 'Draf' | 'Selesai'
  cawangan: { nama: string } | null
  pertandingan_peserta: { count: number }[]
  pertandingan_keputusan: { count: number }[]
}

export default async function PertandinganPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('pertandingan')
    .select('id, nama, tarikh, status, cawangan:cawangan_id(nama), pertandingan_peserta(count), pertandingan_keputusan(count)')
    .order('tarikh', { ascending: false })
    .limit(200)

  const senarai: PertandinganRingkas[] = ((data ?? []) as unknown as BarisPertandingan[]).map((p) => ({
    id: p.id,
    nama: p.nama,
    tarikh: p.tarikh,
    status: p.status,
    cawangan: p.cawangan?.nama ?? null,
    bilPeserta: p.pertandingan_peserta?.[0]?.count ?? 0,
    bilKeputusan: p.pertandingan_keputusan?.[0]?.count ?? 0,
  }))

  return <PertandinganListKlient senarai={senarai} />
}
