import { createClient } from '@/lib/supabase/server'
import { TabelJurulatih } from './_components/TabelJurulatih'

export default async function JurulatihPage() {
  const supabase = await createClient()

  const { data: raw } = await supabase
    .from('jurulatih')
    .select('id, nama_penuh, no_telefon, kadar_bayaran, tarikh_mula, status, cawangan_ids')
    .order('nama_penuh')

  const { data: cawangan } = await supabase
    .from('cawangan')
    .select('id, nama')

  const peta: Record<string, string> = {}
  for (const c of cawangan ?? []) peta[c.id] = c.nama

  const jurulatih = (raw ?? []).map((j: any) => ({
    id: j.id,
    nama_penuh: j.nama_penuh,
    no_telefon: j.no_telefon,
    kadar_bayaran: j.kadar_bayaran,
    tarikh_mula: j.tarikh_mula,
    status: j.status,
    cawangan_nama: (j.cawangan_ids ?? []).map((id: string) => peta[id] ?? '').filter(Boolean).join(', '),
  }))

  return <TabelJurulatih jurulatih={jurulatih} />
}
