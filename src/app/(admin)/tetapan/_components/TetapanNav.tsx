'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/tetapan/pengguna', label: 'Pengguna' },
  { href: '/tetapan/cawangan', label: 'Cawangan' },
]

export function TetapanNav() {
  const pathname = usePathname()

  return (
    <div style={{ marginBottom: '28px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: '16px' }}>
        Tetapan
      </h1>
      <nav style={{ display: 'flex', gap: '4px', borderBottom: '2px solid var(--border)', paddingBottom: '0' }}>
        {tabs.map((t) => {
          const aktif = pathname.startsWith(t.href)
          return (
            <Link key={t.href} href={t.href}
              style={{
                padding: '9px 18px',
                borderRadius: '0',
                textDecoration: 'none',
                fontSize: '13.5px',
                fontWeight: aktif ? 700 : 500,
                color: aktif ? 'var(--text)' : 'var(--text-muted)',
                borderBottom: aktif ? '2px solid var(--primary)' : '2px solid transparent',
                marginBottom: '-2px',
                display: 'inline-block',
              }}
            >
              {t.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
