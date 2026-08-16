import { createClient } from '@/lib/supabase/server'
import { BorangPertandinganBaharu, type CawanganPilihan } from './_components/BorangPertandinganBaharu'

export const dynamic = 'force-dynamic'

export default async function PertandinganBaharuPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('cawangan')
    .select('id, nama')
    .eq('status', 'Aktif')
    .order('nama')

  return <BorangPertandinganBaharu cawangan={(data ?? []) as CawanganPilihan[]} />
}
