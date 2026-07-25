'use client'

import { AlertTriangle, X } from 'lucide-react'
import { useTutupEscape } from '@/lib/hooks/useTutupEscape'

// Dialog pengesahan kongsi — untuk amaran sebelum tindakan yang senyap-senyap
// boleh rosakkan data (rekod berganda, menimpa rekod sedia ada, padam).
// Guna ini, BUKAN confirm() asli, supaya rupa konsisten dan butiran boleh
// dipapar (senarai `butiran`) — pengguna perlu nampak APA yang sudah wujud
// sebelum memilih untuk teruskan.

export type JenisDialog = 'amaran' | 'bahaya'

const GAYA: Record<JenisDialog, { bg: string; border: string; teks: string; butang: string }> = {
  amaran: { bg: '#FFFBEB', border: '#FDE68A', teks: '#92400E', butang: '#D97706' },
  bahaya: { bg: '#FEF2F2', border: '#FECACA', teks: '#991B1B', butang: '#DC2626' },
}

interface Props {
  tajuk: string
  mesej: string
  /** Baris butiran yang menjelaskan apa yang SUDAH wujud (cth. senarai resit sedia ada) */
  butiran?: string[]
  /** Teks kecil di bawah butiran — akibat jika teruskan */
  akibat?: string
  jenis?: JenisDialog
  labelSah?: string
  labelBatal?: string
  memproses?: boolean
  onSah: () => void
  onBatal: () => void
}

export function DialogSah({
  tajuk,
  mesej,
  butiran = [],
  akibat,
  jenis = 'amaran',
  labelSah = 'Ya, Teruskan',
  labelBatal = 'Batal',
  memproses = false,
  onSah,
  onBatal,
}: Props) {
  useTutupEscape(onBatal)
  const g = GAYA[jenis]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget && !memproses) onBatal() }}
      role="alertdialog"
      aria-modal="true"
      aria-label={tajuk}
    >
      <div style={{
        background: 'var(--card)', borderRadius: '20px',
        padding: '24px', width: '100%', maxWidth: '440px',
        maxHeight: '85vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
              background: g.bg, border: `1px solid ${g.border}`,
            }}>
              <AlertTriangle size={17} style={{ color: g.teks }} />
            </span>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.35, paddingTop: '5px' }}>
              {tajuk}
            </h2>
          </div>
          <button onClick={onBatal} aria-label="Tutup" disabled={memproses}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: memproses ? 'not-allowed' : 'pointer', padding: '4px', flexShrink: 0 }}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.6, marginBottom: butiran.length || akibat ? '12px' : '20px' }}>
          {mesej}
        </p>

        {butiran.length > 0 && (
          <div style={{
            background: g.bg, border: `1px solid ${g.border}`,
            borderRadius: '12px', padding: '12px 14px', marginBottom: akibat ? '10px' : '20px',
          }}>
            {butiran.map((b, i) => (
              <div key={i} style={{ fontSize: '12.5px', color: g.teks, lineHeight: 1.6, fontWeight: 600 }}>
                • {b}
              </div>
            ))}
          </div>
        )}

        {akibat && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '20px' }}>
            {akibat}
          </p>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onBatal} disabled={memproses} style={{
            flex: 1, padding: '11px',
            background: 'var(--bg)', border: '1.5px solid var(--border)',
            borderRadius: '12px', fontSize: '13.5px', fontWeight: 700,
            color: 'var(--text)', cursor: memproses ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          }}>
            {labelBatal}
          </button>
          <button onClick={onSah} disabled={memproses} style={{
            flex: 1, padding: '11px',
            background: memproses ? '#94A3B8' : g.butang, border: 'none',
            borderRadius: '12px', fontSize: '13.5px', fontWeight: 700,
            color: '#fff', cursor: memproses ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          }}>
            {memproses ? 'Memproses...' : labelSah}
          </button>
        </div>
      </div>
    </div>
  )
}
