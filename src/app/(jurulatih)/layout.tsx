import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BottomTabBar } from '@/components/layout/BottomTabBar'
import { NavigasiAtas } from '@/components/layout/NavigasiAtas'
import { Sidebar } from '@/components/layout/Sidebar'
import { AutoLogout } from '@/components/layout/AutoLogout'

export default async function JurulatihLayout({
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

  const isAdmin = profil?.is_admin ?? false

  if (isAdmin) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
        <AutoLogout />
        <Sidebar nama={profil?.nama ?? ''} email={user.email ?? ''} />
        <main style={{ flex: 1, overflow: 'auto', padding: '28px 32px', minWidth: 0 }}>
          <NavigasiAtas homeHref="/dashboard" isAdmin />
          {children}
        </main>
      </div>
    )
  }

  return (
    <div
      style={{
        maxWidth: '390px',
        margin: '0 auto',
        minHeight: '100vh',
        background: 'var(--bg)',
        position: 'relative',
      }}
    >
      <AutoLogout />
      <main style={{ paddingBottom: '86px' }}>
        <div style={{ padding: '12px 16px 0' }}>
          <NavigasiAtas homeHref="/kehadiran" />
        </div>
        {children}
      </main>
      <BottomTabBar />
    </div>
  )
}
