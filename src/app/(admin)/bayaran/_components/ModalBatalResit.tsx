'use client'

import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  resit: { id: string; nombor_resit: string; nama_pelajar: string; jumlah: number }
  onTutup: () => void
  onBerjaya: () => void
}

export function ModalBatalResit({ resit, onTutup, onBerjaya }: Props) {
  const [sebab, setSebab] = useState('')
  const [loading, setLoading] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)

  const hantar = async () => {
    if (!sebab.trim()) { setRalat('Sila nyatakan sebab pembatalan.'); return }
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('resit').update({
      status: 'Dibatalkan',
      sebab_batal: sebab,
      tarikh_batal: new Date().toISOString().split('T')[0],
      dibatal_oleh: user?.id ?? null,
    }).eq('id', resit.id)
    if (error) { setRalat('Gagal membatalkan resit. Cuba lagi.'); setLoading(false); return }
    onBerjaya()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }} onClick={(e) => { if (e.target === e.currentTarget) onTutup() }}>
      <div style={{
        background: 'var(--card)', borderRadius: '20px',
        padding: '28px', width: '100%', maxWidth: '440px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)' }}>Batalkan Resit</h2>
          <button onClick={onTutup} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Info Resit */}
        <div style={{
          background: '#F8FAFC', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '14px 16px', marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No. Resit</span>
            <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'monospace', color: 'var(--text)' }}>{resit.nombor_resit}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pelajar</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{resit.nama_pelajar}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Jumlah</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>RM {resit.jumlah.toFixed(2)}</span>
          </div>
        </div>

        {/* Amaran */}
        <div style={{
          background: '#FFF7ED', border: '1px solid #FED7AA',
          borderRadius: '12px', padding: '12px 14px', marginBottom: '16px',
          display: 'flex', gap: '10px',
        }}>
          <AlertTriangle size={16} style={{ color: '#C2410C', flexShrink: 0, marginTop: '1px' }} />
          <p style={{ fontSize: '12.5px', color: '#92400E', lineHeight: 1.5 }}>
            Resit ini akan ditandakan <strong>Dibatalkan</strong>. Rekod akan kekal dalam sistem dan PDF akan memaparkan tanda air "DIBATALKAN".
          </p>
        </div>

        {/* Sebab */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block', fontSize: '12px', fontWeight: 600,
            color: 'var(--text-muted)', marginBottom: '6px',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            Sebab Pembatalan *
          </label>
          <textarea
            value={sebab}
            onChange={(e) => setSebab(e.target.value)}
            placeholder="Nyatakan sebab pembatalan resit ini..."
            rows={3}
            style={{
              width: '100%', padding: '10px 14px',
              border: '1.5px solid var(--border)', borderRadius: '12px',
              fontSize: '13.5px', color: 'var(--text)',
              background: 'var(--card)', outline: 'none',
              fontFamily: 'inherit', resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {ralat && (
          <div style={{
            background: '#FFF1F2', border: '1px solid #FECDD3',
            borderRadius: '10px', padding: '10px 14px',
            fontSize: '13px', color: '#9F1239', marginBottom: '14px',
          }}>
            {ralat}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onTutup} style={{
            flex: 1, padding: '11px',
            background: 'var(--bg)', border: '1.5px solid var(--border)',
            borderRadius: '12px', fontSize: '13.5px', fontWeight: 600,
            color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Kembali
          </button>
          <button onClick={hantar} disabled={loading} style={{
            flex: 2, padding: '11px',
            background: loading ? '#94A3B8' : '#EF4444',
            border: 'none', borderRadius: '12px',
            fontSize: '13.5px', fontWeight: 700,
            color: '#FFFFFF', cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
          }}>
            {loading ? 'Membatalkan...' : 'Batalkan Resit'}
          </button>
        </div>
      </div>
    </div>
  )
}
