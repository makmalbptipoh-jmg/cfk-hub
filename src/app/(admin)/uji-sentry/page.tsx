'use client'

import { useState } from 'react'
import * as Sentry from '@sentry/nextjs'
import { toast } from '@/lib/stores/toast-store'

// PAGE UJIAN SEMENTARA — buang selepas sahkan Sentry berfungsi.
export default function UjiSentryPage() {
  const [dihantar, setDihantar] = useState(false)

  const hantarRalat = () => {
    Sentry.captureException(new Error('Ujian Sentry — CFK HUB (' + new Date().toISOString() + ')'))
    setDihantar(true)
    toast.success('Ralat ujian dihantar ke Sentry. Semak papan pemuka Sentry → Issues.')
  }

  const cetusCrash = () => {
    throw new Error('Ujian crash Sentry — CFK HUB')
  }

  return (
    <div style={{ maxWidth: '520px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>Uji Sentry</h1>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
        Page sementara untuk sahkan pemantauan ralat. Klik butang, kemudian semak Sentry → <strong>Issues</strong>.
        Beritahu Claude untuk buang page ini selepas disahkan.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '340px' }}>
        <button
          onClick={hantarRalat}
          style={{ padding: '12px', background: 'var(--accent)', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: 'var(--accent-text)', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          1. Hantar Ralat Ujian ke Sentry
        </button>
        <button
          onClick={cetusCrash}
          style={{ padding: '12px', background: '#FFF1F2', border: '1.5px solid #FECDD3', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: '#9F1239', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          2. Cetuskan Crash Sebenar (uji skrin ralat)
        </button>
      </div>

      {dihantar && (
        <div style={{ marginTop: '16px', padding: '12px 16px', background: 'var(--hadir-bg)', border: '1px solid #BBF7D0', borderRadius: '12px', fontSize: '13px', color: 'var(--hadir-text)', fontWeight: 600 }}>
          ✓ Dihantar. Buka Sentry → Issues dalam ~1 minit. Kalau tak nampak, maksudnya DSN belum aktif (semak env + redeploy).
        </div>
      )}
    </div>
  )
}
