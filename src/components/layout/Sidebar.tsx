'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  GraduationCap,
  Receipt,
  BarChart3,
  Wallet,
  Archive,
  Megaphone,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navUtama = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pelajar', label: 'Pelajar', icon: Users },
  { href: '/kehadiran', label: 'Kehadiran', icon: CalendarCheck },
  { href: '/jurulatih', label: 'Jurulatih', icon: GraduationCap },
  { href: '/bayaran', label: 'Bayaran & Resit', icon: Receipt },
  { href: '/laporan', label: 'Laporan', icon: BarChart3 },
  { href: '/kewangan', label: 'Kewangan', icon: Wallet },
  { href: '/aset', label: 'Aset', icon: Archive },
  { href: '/makluman', label: 'Makluman', icon: Megaphone },
]

const navSistem = [
  { href: '/tetapan/pengguna', label: 'Tetapan', icon: Settings },
]

interface SidebarProps {
  nama: string
  email: string
}

export function Sidebar({ nama, email }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside
      style={{
        width: '220px',
        minWidth: '220px',
        background: 'var(--sidebar-bg)',
        borderRadius: '0 24px 24px 0',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '28px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '28px', lineHeight: 1, color: '#FFC94D' }}>{'♟︎'}</span>
          <div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.3px',
              }}
            >
              CFK HUB
            </div>
            <div style={{ fontSize: '10px', color: 'var(--sidebar-muted)', marginTop: '1px' }}>
              Panel Admin
            </div>
          </div>
        </div>
      </div>

      {/* Nav Utama */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        <div
          style={{
            fontSize: '10px',
            fontWeight: 600,
            color: 'var(--sidebar-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '8px 20px 4px',
          }}
        >
          Menu
        </div>
        {navUtama.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                margin: '2px 8px',
                borderRadius: '12px',
                textDecoration: 'none',
                background: active ? 'var(--sidebar-active-bg)' : 'transparent',
                color: active ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
                fontWeight: active ? 600 : 400,
                fontSize: '13px',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 2} />
              <span>{item.label}</span>
              {active && (
                <ChevronRight size={12} style={{ marginLeft: 'auto', opacity: 0.7 }} />
              )}
            </Link>
          )
        })}

        {/* Sistem */}
        <div
          style={{
            fontSize: '10px',
            fontWeight: 600,
            color: 'var(--sidebar-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '16px 20px 4px',
          }}
        >
          Sistem
        </div>
        {navSistem.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                margin: '2px 8px',
                borderRadius: '12px',
                textDecoration: 'none',
                background: active ? 'var(--sidebar-active-bg)' : 'transparent',
                color: active ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
                fontWeight: active ? 600 : 400,
                fontSize: '13px',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 2} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer — Pengguna + Log Keluar */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '16px 12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '10px',
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--accent-text)',
              flexShrink: 0,
            }}
          >
            {nama.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#FFFFFF',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {nama}
            </div>
            <div
              style={{
                fontSize: '10px',
                color: 'var(--sidebar-muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              Admin
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 10px',
            borderRadius: '10px',
            background: 'transparent',
            border: 'none',
            color: 'var(--sidebar-muted)',
            fontSize: '12px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.12)'
            e.currentTarget.style.color = '#FCA5A5'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--sidebar-muted)'
          }}
        >
          <LogOut size={14} />
          Log Keluar
        </button>
      </div>
    </aside>
  )
}
