import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { HistoriMaklumanKlient } from './_components/HistoriMaklumanKlient'

export const dynamic = 'force-dynamic'

export default async function HistoriMaklumanPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profil } = await supabase
    .from('pengguna_profil')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  return <HistoriMaklumanKlient isAdmin={profil?.is_admin ?? false} />
}
