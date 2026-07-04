import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BottomTabBar } from '@/components/layout/BottomTabBar'
import { NavigasiAtas } from '@/components/layout/NavigasiAtas'

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
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const isAdmin = profil?.is_admin ?? false

  if (isAdmin) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
        <main style={{ flex: 1, overflow: 'auto', padding: '28px 32px', minWidth: 0 }}>
          <NavigasiAtas homeHref="/dashboard" />
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
      <main style={{ paddingBottom: '86px' }}>{children}</main>
      <BottomTabBar />
    </div>
  )
}
