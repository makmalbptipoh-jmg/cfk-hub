'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { CalendarCheck, Megaphone, LayoutDashboard, UserCheck, LogOut, BookOpen, Trophy, MoreHorizontal, Award, Clock, ListChecks, CalendarDays, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const tabs = [
  { href: '/kehadiran', label: 'Kehadiran', icon: CalendarCheck },
  { href: '/kehadiran-saya', label: 'Sesi Saya', icon: UserCheck },
  { href: '/silibus-pelajar', label: 'Silibus', icon: BookOpen },
  { href: '/pertandingan', label: 'Tanding', icon: Trophy },
  { href: '/dashboard-jurulatih', label: 'Dashboard', icon: LayoutDashboard },
]

const lagiLinks = [
  { href: '/penggredan', label: 'Penggredan', icon: Award },
  { href: '/penggredan/sesi', label: 'Pelan Sesi Hari Ini', icon: Clock },
  { href: '/penggredan/aktiviti', label: 'Panduan Aktiviti', icon: ListChecks },
  { href: '/penggredan/jadual-little-pawn', label: 'Jadual Kelas', icon: CalendarDays },
  { href: '/makluman', label: 'Makluman', icon: Megaphone },
]

export function BottomTabBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [lagi, setLagi] = useState(false)

  const logKeluar = async () => {
    if (!confirm('Log keluar dari CFK HUB?')) return
    await createClient().auth.signOut()
    router.push('/login')
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')
  const lagiAktif = lagiLinks.some((l) => isActive(l.href))

  return (
    <>
    {lagi && (
      <>
        <div onClick={() => setLagi(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', zIndex: 100 }} />
        <div style={{ position: 'fixed', bottom: '70px', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '390px', background: 'var(--card)', borderRadius: '20px 20px 0 0', zIndex: 101, padding: '14px 12px 18px', boxShadow: '0 -6px 24px rgba(0,0,0,0.18)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px 8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>Lagi</span>
            <button onClick={() => setLagi(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={18} /></button>
          </div>
          {lagiLinks.map((l) => {
            const Icon = l.icon
            const active = isActive(l.href)
            return (
              <Link key={l.href} href={l.href} onClick={() => setLagi(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 10px', borderRadius: '12px', textDecoration: 'none', color: active ? 'var(--accent-dark)' : 'var(--text)', background: active ? 'var(--hadir-bg)' : 'transparent', fontSize: '14px', fontWeight: active ? 700 : 500 }}>
                <Icon size={19} /> {l.label}
              </Link>
            )
          })}
        </div>
      </>
    )}
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
              padding: '8px 3px',
              borderRadius: '12px',
              textDecoration: 'none',
              color: active ? 'var(--accent)' : 'var(--sidebar-muted)',
              transition: 'color 0.15s',
              minWidth: '48px',
            }}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
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
        onClick={() => setLagi((v) => !v)}
        aria-label="Lagi"
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
          padding: '8px 3px', borderRadius: '12px', border: 'none', background: 'transparent',
          color: lagiAktif || lagi ? 'var(--accent)' : 'var(--sidebar-muted)', cursor: 'pointer', fontFamily: 'inherit', minWidth: '44px',
        }}
      >
        <MoreHorizontal size={20} strokeWidth={lagiAktif ? 2.5 : 2} />
        <span style={{ fontSize: '10px', fontWeight: lagiAktif ? 700 : 500, letterSpacing: '0.02em' }}>Lagi</span>
      </button>
      <button
        onClick={logKeluar}
        aria-label="Log keluar"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          padding: '8px 3px',
          borderRadius: '12px',
          border: 'none',
          background: 'transparent',
          color: 'var(--sidebar-muted)',
          cursor: 'pointer',
          fontFamily: 'inherit',
          minWidth: '44px',
        }}
      >
        <LogOut size={20} strokeWidth={2} />
        <span style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.02em' }}>Keluar</span>
      </button>
    </nav>
    </>
  )
}
