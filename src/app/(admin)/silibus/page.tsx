import { createClient } from '@/lib/supabase/server'
import { SilibusKlient } from './_components/SilibusKlient'

export const dynamic = 'force-dynamic'

export default async function SilibusPage() {
  const supabase = await createClient()

  const { data: cawangan } = await supabase
    .from('cawangan')
    .select('id, nama')
    .eq('status', 'Aktif')
    .order('nama')

  return <SilibusKlient cawanganAwal={cawangan ?? []} />
}
