'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
import { resetKataLaluan } from '@/app/actions/pengguna'

interface Props {
  penggunaId: string
  namaPengguna: string
  onTutup: () => void
  onBerjaya: () => void
}

export function ModalResetKataLaluan({ penggunaId, namaPengguna, onTutup, onBerjaya }: Props) {
  const [kataLaluan, setKataLaluan] = useState('')
  const [sahkan, setSahkan] = useState('')
  const [tunjuk, setTunjuk] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const hantar = async () => {
    if (kataLaluan.length < 6) { setRalat('Kata laluan sekurang-kurangnya 6 aksara.'); return }
    if (kataLaluan !== sahkan) { setRalat('Kata laluan tidak sepadan.'); return }
    setLoading(true)
    setRalat(null)
    const { ralat: err } = await resetKataLaluan(penggunaId, kataLaluan)
    if (err) { setRalat(err); setLoading(false); return }
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
        padding: '28px', width: '100%', maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
              Reset Kata Laluan
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{namaPengguna}</p>
          </div>
          <button onClick={onTutup} style={{
            background: 'none', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer', padding: '4px',
          }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{
            display: 'block', fontSize: '12px', fontWeight: 600,
            color: 'var(--text-muted)', marginBottom: '6px',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            Kata Laluan Baharu
          </label>
          <div style={{ position: 'relative' }}>
            <input
              ref={inputRef}
              type={tunjuk ? 'text' : 'password'}
              value={kataLaluan}
              onChange={(e) => setKataLaluan(e.target.value)}
              placeholder="Min. 6 aksara"
              style={{
                width: '100%', padding: '10px 40px 10px 14px',
                border: '1.5px solid var(--border)', borderRadius: '12px',
                fontSize: '13.5px', color: 'var(--text)',
                background: 'var(--card)', outline: 'none', fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              onClick={() => setTunjuk((t) => !t)}
              style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0,
              }}
            >
              {tunjuk ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block', fontSize: '12px', fontWeight: 600,
            color: 'var(--text-muted)', marginBottom: '6px',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            Sahkan Kata Laluan
          </label>
          <input
            type={tunjuk ? 'text' : 'password'}
            value={sahkan}
            onChange={(e) => setSahkan(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') hantar() }}
            placeholder="Taip semula kata laluan"
            style={{
              width: '100%', padding: '10px 14px',
              border: `1.5px solid ${sahkan && sahkan !== kataLaluan ? '#EF4444' : 'var(--border)'}`,
              borderRadius: '12px',
              fontSize: '13.5px', color: 'var(--text)',
              background: 'var(--card)', outline: 'none', fontFamily: 'inherit',
            }}
          />
        </div>

        {ralat && (
          <div style={{
            background: '#FFF1F2', border: '1px solid #FECDD3',
            borderRadius: '10px', padding: '10px 14px',
            fontSize: '13px', color: '#9F1239', marginBottom: '16px',
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
            Batal
          </button>
          <button onClick={hantar} disabled={loading} style={{
            flex: 2, padding: '11px',
            background: loading ? '#94A3B8' : 'var(--accent)',
            border: 'none', borderRadius: '12px',
            fontSize: '13.5px', fontWeight: 700,
            color: 'var(--accent-text)', cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
          }}>
            {loading ? 'Menyimpan...' : 'Reset Kata Laluan'}
          </button>
        </div>
      </div>
    </div>
  )
}
