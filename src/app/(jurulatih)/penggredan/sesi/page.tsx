import { createClient } from '@/lib/supabase/server'
import { PelanSesiKlient } from './_components/PelanSesiKlient'

export const dynamic = 'force-dynamic'

export default async function PelanSesiPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Cawangan jurulatih (untuk teks share WhatsApp) — pilihan.
  let cawanganNama: string | null = null
  if (user) {
    const { data: jl } = await supabase.from('jurulatih').select('cawangan_ids').eq('pengguna_id', user.id).maybeSingle()
    const id = jl?.cawangan_ids?.[0]
    if (id) {
      const { data: c } = await supabase.from('cawangan').select('nama').eq('id', id).maybeSingle()
      cawanganNama = c?.nama ?? null
    }
  }

  const { data: kitaran } = await supabase
    .from('gred_kitaran').select('nama, tarikh_mula').eq('status', 'Dibuka')
    .order('tarikh_mula', { ascending: false }).limit(1).maybeSingle()

  return <PelanSesiKlient tarikhMula={kitaran?.tarikh_mula ?? null} cawanganNama={cawanganNama} />
}
