'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Home } from 'lucide-react'

const gayaBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  padding: '6px 12px',
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: '9px',
  fontSize: '12.5px',
  fontWeight: 600,
  color: 'var(--text)',
  cursor: 'pointer',
  fontFamily: 'inherit',
  textDecoration: 'none',
} as const

export function NavigasiAtas({ homeHref = '/dashboard' }: { homeHref?: string }) {
  const router = useRouter()

  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
      <button onClick={() => router.back()} aria-label="Kembali" style={gayaBtn}>
        <ArrowLeft size={13} />
        Kembali
      </button>
      <button onClick={() => router.forward()} aria-label="Seterusnya" style={gayaBtn}>
        Seterusnya
        <ArrowRight size={13} />
      </button>
      <Link href={homeHref} aria-label="Laman Utama" style={gayaBtn}>
        <Home size={13} />
        Utama
      </Link>
    </div>
  )
}
