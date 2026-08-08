'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

// Sempadan ralat peringkat AKAR — menangkap crash render pada halaman yang
// TIADA error.tsx lebih dekat (cth. /login, /bayaran-selesai, halaman awam).
// Memberi mesej mesra + "Cuba Lagi" tanpa melompat ke global-error.tsx (yang
// meletupkan seluruh <html>). Kumpulan (admin) kekal guna (admin)/error.tsx.
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        minHeight: '100vh',
        padding: '48px 24px',
        background: 'var(--bg)',
      }}
    >
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          width: '100%',
          maxWidth: '420px',
          padding: '40px 32px',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: '#FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <AlertTriangle size={28} style={{ color: '#B45309' }} />
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
          Maaf, sesuatu tidak kena
        </h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
          Berlaku ralat semasa memaparkan halaman. Ralat telah dilaporkan secara automatik.
          Cuba lagi, atau muat semula halaman.
        </p>
        <button
          onClick={() => reset()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            padding: '10px 20px',
            background: 'var(--accent)',
            color: 'var(--accent-text)',
            border: 'none',
            borderRadius: '10px',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <RotateCcw size={15} /> Cuba Lagi
        </button>
        {error.digest && (
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '16px', fontFamily: 'monospace' }}>
            Kod ralat: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
