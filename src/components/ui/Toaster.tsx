'use client'

import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useToastStore, type ToastJenis } from '@/lib/stores/toast-store'

const GAYA: Record<ToastJenis, { bg: string; border: string; text: string; Ikon: typeof CheckCircle2 }> = {
  success: { bg: 'var(--hadir-bg)', border: '#BBF7D0', text: 'var(--hadir-text)', Ikon: CheckCircle2 },
  error: { bg: '#FFF1F2', border: '#FECACA', text: '#9F1239', Ikon: XCircle },
  warning: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', Ikon: AlertTriangle },
  info: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', Ikon: Info },
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const buang = useToastStore((s) => s.buang)

  if (toasts.length === 0) return null

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        left: '20px',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        alignItems: 'flex-end',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => {
        const { bg, border, text, Ikon } = GAYA[t.jenis]
        return (
          <div
            key={t.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              maxWidth: '360px',
              width: '100%',
              background: bg,
              border: `1px solid ${border}`,
              color: text,
              borderRadius: '12px',
              padding: '12px 14px',
              fontSize: '13.5px',
              fontWeight: 600,
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              pointerEvents: 'auto',
              animation: 'toast-masuk 0.2s ease',
            }}
          >
            <Ikon size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span style={{ flex: 1 }}>{t.mesej}</span>
            <button
              onClick={() => buang(t.id)}
              aria-label="Tutup notifikasi"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: text, opacity: 0.6, padding: '2px', flexShrink: 0,
                display: 'flex',
              }}
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
      <style>{`
        @keyframes toast-masuk {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
