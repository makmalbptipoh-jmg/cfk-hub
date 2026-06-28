'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/kewangan', label: 'Ringkasan', exact: true },
  { href: '/kewangan/perbelanjaan', label: 'Perbelanjaan' },
]

export function KewanganNav() {
  const pathname = usePathname()
  return (
    <div style={{ display: 'flex', gap: '4px', borderBottom: '2px solid var(--border)', marginBottom: '28px' }}>
      {tabs.map((t) => {
        const active = t.exact ? pathname === t.href : pathname.startsWith(t.href)
        return (
          <Link
            key={t.href}
            href={t.href}
            style={{
              padding: '10px 16px',
              fontSize: '13.5px',
              fontWeight: active ? 700 : 500,
              color: active ? 'var(--accent)' : 'var(--text-muted)',
              textDecoration: 'none',
              borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: '-2px',
              transition: 'color 0.15s',
            }}
          >
            {t.label}
          </Link>
        )
      })}
    </div>
  )
}
