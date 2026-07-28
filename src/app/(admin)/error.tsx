'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

// Sempadan ralat peringkat kumpulan (admin). Menangkap crash render mana-mana
// halaman admin supaya susun atur (sidebar) kekal & pengguna boleh cuba semula —
// tanpa melompat ke global-error.tsx yang meletupkan seluruh app.
export default function AdminError({
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
        padding: '48px 24px',
        minHeight: '60vh',
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
          marginBottom: '16px',
        }}
      >
        <AlertTriangle size={28} style={{ color: '#B45309' }} />
      </div>
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
        Maaf, halaman ini tersasar
      </h2>
      <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', maxWidth: '420px', marginBottom: '20px', lineHeight: 1.6 }}>
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
  )
}
