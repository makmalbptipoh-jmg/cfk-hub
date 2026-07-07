import { createClient } from '@/lib/supabase/server'
import { createClient as adminCreateClient } from '@supabase/supabase-js'
import { PenggunaKlient } from './_components/PenggunaKlient'

export default async function PenggunaTetapanPage() {
  const supabase = await createClient()

  const { data: profil } = await supabase
    .from('pengguna_profil')
    .select('id, nama, is_admin, cawangan_id, cawangan:cawangan_id(nama)')
    .order('nama')

  const { data: cawangan } = await supabase
    .from('cawangan')
    .select('id, nama')
    .eq('status', 'Aktif')
    .order('nama')

  // Fetch auth users status via admin client to know who is banned
  const supabaseAdmin = adminCreateClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: authData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 })
  const petaStatus: Record<string, 'Aktif' | 'Diblok'> = {}
  const petaEmel: Record<string, string> = {}
  for (const u of authData?.users ?? []) {
    petaStatus[u.id] = u.banned_until ? 'Diblok' : 'Aktif'
    petaEmel[u.id] = u.email ?? ''
  }

  const pengguna = (profil ?? []).map((p: any) => ({
    id: p.id,
    nama: p.nama,
    emel: petaEmel[p.id] ?? null,
    is_admin: p.is_admin,
    cawangan_id: p.cawangan_id ?? null,
    cawangan_nama: p.cawangan?.nama ?? null,
    status: petaStatus[p.id] ?? 'Aktif',
  }))

  return (
    <PenggunaKlient
      pengguna={pengguna}
      cawangan={cawangan ?? []}
    />
  )
}
