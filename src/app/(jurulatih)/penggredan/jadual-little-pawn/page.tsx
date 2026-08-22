import { createClient } from '@/lib/supabase/server'
import { JadualLittlePawnKlient } from './_components/JadualLittlePawnKlient'

export const dynamic = 'force-dynamic'

export default async function JadualLittlePawnPage() {
  const supabase = await createClient()
  const { data: kitaran } = await supabase
    .from('gred_kitaran')
    .select('nama, tarikh_mula')
    .eq('status', 'Dibuka')
    .order('tarikh_mula', { ascending: false })
    .limit(1)
    .maybeSingle()

  return <JadualLittlePawnKlient kitaranNama={kitaran?.nama ?? null} tarikhMula={kitaran?.tarikh_mula ?? null} />
}
