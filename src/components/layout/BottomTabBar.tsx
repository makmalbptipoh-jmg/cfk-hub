'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { CalendarCheck, Users, Megaphone, LayoutDashboard, UserCheck, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const tabs = [
  { href: '/kehadiran', label: 'Kehadiran', icon: CalendarCheck },
  { href: '/kehadiran-saya', label: 'Sesi Saya', icon: UserCheck },
  { href: '/pelajar', label: 'Pelajar', icon: Users },
  { href: '/makluman', label: 'Makluman', icon: Megaphone },
  { href: '/dashboard-jurulatih', label: 'Dashboard', icon: LayoutDashboard },
]

export function BottomTabBar() {
  const pathname = usePathname()
  const router = useRouter()

  const logKeluar = async () => {
    if (!confirm('Log keluar dari CFK HUB?')) return
    await createClient().auth.signOut()
    router.push('/login')
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '390px',
        background: 'var(--sidebar-bg)',
        borderRadius: '20px 20px 0 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        height: '70px',
        zIndex: 100,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
        padding: '0 8px',
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon
        const active = isActive(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 6px',
              borderRadius: '12px',
              textDecoration: 'none',
              color: active ? 'var(--accent)' : 'var(--sidebar-muted)',
              transition: 'color 0.15s',
              minWidth: '58px',
            }}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 2} />
            <span
              style={{
                fontSize: '10px',
                fontWeight: active ? 700 : 500,
                letterSpacing: '0.02em',
              }}
            >
              {tab.label}
            </span>
          </Link>
        )
      })}
      <button
        onClick={logKeluar}
        aria-label="Log keluar"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          padding: '8px 6px',
          borderRadius: '12px',
          border: 'none',
          background: 'transparent',
          color: 'var(--sidebar-muted)',
          cursor: 'pointer',
          fontFamily: 'inherit',
          minWidth: '54px',
        }}
      >
        <LogOut size={22} strokeWidth={2} />
        <span style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.02em' }}>Keluar</span>
      </button>
    </nav>
  )
}
