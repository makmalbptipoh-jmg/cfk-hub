import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profil } = await supabase
    .from('pengguna_profil')
    .select('nama, is_admin')
    .eq('id', user.id)
    .single()

  if (!profil?.is_admin) redirect('/kehadiran')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar nama={profil.nama} email={user.email ?? ''} />
      <main
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '28px 32px',
          minWidth: 0,
        }}
      >
        {children}
      </main>
    </div>
  )
}
