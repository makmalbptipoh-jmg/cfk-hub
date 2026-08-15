import { createClient } from '@/lib/supabase/server'
import { PendaftaranKlient } from './_components/PendaftaranKlient'

export default async function PendaftaranPage() {
  const supabase = await createClient()
  const { data: cawangan } = await supabase
    .from('cawangan')
    .select('id, nama')
    .eq('status', 'Aktif')
    .order('nama')

  return <PendaftaranKlient cawanganList={cawangan ?? []} />
}
