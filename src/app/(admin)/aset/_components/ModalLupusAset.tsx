'use client'

import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatRinggit } from '@/lib/utils'

interface Props {
  aset: {
    id: string
    nama: string
    nilai_asal: number | null
  }
  onTutup: () => void
  onBerjaya: () => void
}

export function ModalLupusAset({ aset, onTutup, onBerjaya }: Props) {
  const [sebab, setSebab] = useState('')
  const [loading, setLoading] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)

  const lupus = async () => {
    if (!sebab.trim()) { setRalat('Sila isi sebab pelupusan.'); return }
    setLoading(true)
    setRalat(null)
    const { error } = await createClient()
      .from('aset')
      .update({
        status: 'Lupus',
        sebab_lupus: sebab.trim(),
        tarikh_lupus: new Date().toISOString().split('T')[0],
      })
      .eq('id', aset.id)
    if (error) { setRalat('Gagal lupus aset. Cuba lagi.'); setLoading(false); return }
    onBerjaya()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onTutup() }}
    >
      <div
        style={{
          background: 'var(--card)',
          borderRadius: '20px',
          padding: '28px',
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>
              Lupus Aset
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{aset.nama}</p>
          </div>
          <button
            onClick={onTutup}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Info aset */}
        <div
          style={{
            background: '#FFF7ED',
            border: '1px solid #FED7AA',
            borderRadius: '12px',
            padding: '14px 16px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}
        >
          <AlertTriangle size={16} style={{ color: '#C2410C', flexShrink: 0, marginTop: '1px' }} />
          <div>
            <p style={{ fontSize: '12.5px', fontWeight: 700, color: '#92400E', marginBottom: '4px' }}>
              Tindakan Ini Tidak Boleh Diundur
            </p>
            <p style={{ fontSize: '12px', color: '#92400E', lineHeight: 1.5 }}>
              Aset <strong>{aset.nama}</strong>
              {aset.nilai_asal ? ` (nilai: ${formatRinggit(aset.nilai_asal)})` : ''} akan
              ditandakan sebagai Dilupuskan. Rekod kekal dalam sistem.
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '11.5px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Sebab Pelupusan <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <textarea
            value={sebab}
            onChange={(e) => setSebab(e.target.value)}
            placeholder="Cth: Rosak tidak boleh dibaiki, dijual, hilang..."
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1.5px solid var(--border)',
              borderRadius: '10px',
              fontSize: '13.5px',
              color: 'var(--text)',
              background: 'var(--card)',
              outline: 'none',
              fontFamily: 'inherit',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {ralat && (
          <div
            style={{
              background: '#FFF1F2',
              border: '1px solid #FECDD3',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '13px',
              color: '#9F1239',
              marginBottom: '14px',
            }}
          >
            {ralat}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onTutup}
            style={{
              flex: 1,
              padding: '11px',
              background: 'var(--bg)',
              border: '1.5px solid var(--border)',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: 600,
              color: 'var(--text)',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Kembali
          </button>
          <button
            onClick={lupus}
            disabled={loading}
            style={{
              flex: 2,
              padding: '11px',
              background: loading ? '#94A3B8' : '#EF4444',
              border: 'none',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: 700,
              color: '#FFFFFF',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Memproses...' : 'Lupus Aset'}
          </button>
        </div>
      </div>
    </div>
  )
}
