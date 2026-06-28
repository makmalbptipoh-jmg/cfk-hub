import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BottomTabBar } from '@/components/layout/BottomTabBar'

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
