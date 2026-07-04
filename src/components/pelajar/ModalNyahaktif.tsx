'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useTutupEscape } from '@/lib/hooks/useTutupEscape'

interface ModalNyahaktifProps {
  pelajarId: string
  namaPelajar: string
  statusSemasa: string
  onTutup: () => void
}

export function ModalNyahaktif({ pelajarId, namaPelajar, statusSemasa, onTutup }: ModalNyahaktifProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)
  useTutupEscape(onTutup)

  const isAktif = statusSemasa === 'Aktif'
  const statusBaharu = isAktif ? 'Tidak Aktif' : 'Aktif'

  const handleSahkan = async () => {
    setLoading(true)
    setRalat(null)
    const supabase = createClient()
    const { error } = await supabase
      .from('pelajar')
      .update({ status: statusBaharu })
      .eq('id', pelajarId)

    if (error) {
      setRalat('Gagal kemaskini. Sila cuba lagi.')
      setLoading(false)
      return
    }

    router.push('/pelajar')
    router.refresh()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onTutup() }}
      role="dialog"
      aria-modal="true"
      aria-label={isAktif ? 'Nyahaktifkan Pelajar' : 'Aktifkan Semula Pelajar'}
    >
      <div style={{
        background: 'var(--card)',
        borderRadius: '20px',
        width: '100%', maxWidth: '400px',
        padding: '32px 28px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '14px',
          background: isAktif ? '#FFF1F2' : '#F0FDF4',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '20px',
        }}>
          <AlertTriangle size={22} style={{ color: isAktif ? '#EF4444' : '#22C55E' }} />
        </div>

        <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
          {isAktif ? 'Nyahaktifkan Pelajar' : 'Aktifkan Semula Pelajar'}
        </h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
          <strong style={{ color: 'var(--text)' }}>{namaPelajar}</strong>
          {isAktif
            ? ' tidak akan muncul dalam senarai semasa. Rekod kehadiran dan bayaran kekal dalam sistem.'
            : ' akan diaktifkan semula dan muncul dalam senarai pelajar aktif.'}
        </p>

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
          <button
            onClick={onTutup}
            style={{
              flex: 1, padding: '11px',
              background: 'var(--bg)', border: '1.5px solid var(--border)',
              borderRadius: '12px', fontSize: '13.5px', fontWeight: 600,
              color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Batal
          </button>
          <button
            onClick={handleSahkan}
            disabled={loading}
            style={{
              flex: 1, padding: '11px',
              background: loading ? '#94A3B8' : (isAktif ? 'var(--danger)' : 'var(--success)'),
              border: 'none', borderRadius: '12px',
              fontSize: '13.5px', fontWeight: 700,
              color: '#FFFFFF', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Memproses...' : (isAktif ? 'Nyahaktifkan' : 'Aktifkan Semula')}
          </button>
        </div>
      </div>
    </div>
  )
}
