'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatRinggit } from '@/lib/utils'
import { useTutupEscape } from '@/lib/hooks/useTutupEscape'

interface Props {
  jurulatihId: string
  namaJurulatih: string
  bulan: string
  tahun: number
  bilSesiHadir: number
  kadarPerSesi: number
  onTutup: () => void
  onBerjaya: () => void
}

export function ModalRekodBayaran({ jurulatihId, namaJurulatih, bulan, tahun, bilSesiHadir, kadarPerSesi, onTutup, onBerjaya }: Props) {
  const [bilSesi, setBilSesi] = useState(bilSesiHadir)
  const [kadar, setKadar] = useState(kadarPerSesi)
  const [tarikhBayar, setTarikhBayar] = useState(new Date().toISOString().split('T')[0])
  const [nota, setNota] = useState('')
  const [loading, setLoading] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)
  useTutupEscape(onTutup)

  const jumlah = bilSesi * kadar

  const simpan = async () => {
    if (bilSesi <= 0) { setRalat('Bilangan sesi mesti lebih dari 0.'); return }
    setLoading(true)
    setRalat(null)
    const { error } = await createClient().from('bayaran_jurulatih').insert({
      jurulatih_id: jurulatihId,
      bulan_bayaran: bulan,
      tahun_bayaran: tahun,
      bilangan_sesi: bilSesi,
      kadar_per_sesi: kadar,
      jumlah,
      tarikh_bayar: tarikhBayar,
      status: 'Sudah Bayar',
      nota: nota || null,
    })
    if (error) { setRalat('Gagal simpan. Cuba lagi.'); setLoading(false); return }
    onBerjaya()
  }

  const gayaInput = {
    width: '100%', padding: '9px 12px',
    border: '1.5px solid var(--border)', borderRadius: '10px',
    fontSize: '13.5px', color: 'var(--text)',
    background: 'var(--card)', outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }} onClick={(e) => { if (e.target === e.currentTarget) onTutup() }}
      role="dialog" aria-modal="true" aria-label="Rekod Bayaran Jurulatih">
      <div style={{
        background: 'var(--card)', borderRadius: '20px',
        padding: '28px', width: '100%', maxWidth: '460px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>Rekod Bayaran Jurulatih</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{namaJurulatih} · {bulan} {tahun}</p>
          </div>
          <button onClick={onTutup} aria-label="Tutup" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Pengiraan */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
              Bil. Sesi Hadir
            </label>
            <input type="number" min="0" value={bilSesi} onChange={(e) => setBilSesi(+e.target.value)} style={gayaInput} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
              Kadar / Sesi (RM)
            </label>
            <input type="number" min="0" step="5" value={kadar} onChange={(e) => setKadar(+e.target.value)} style={gayaInput} />
          </div>
        </div>

        {/* Jumlah */}
        <div style={{
          background: '#F7FEE7', border: '2px solid var(--accent)',
          borderRadius: '12px', padding: '14px 18px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '14px',
        }}>
          <div style={{ fontSize: '13px', color: 'var(--accent-dark)' }}>
            {bilSesi} sesi × {formatRinggit(kadar)}
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-dark)' }}>
            {formatRinggit(jumlah)}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
              Tarikh Bayar
            </label>
            <input type="date" value={tarikhBayar} onChange={(e) => setTarikhBayar(e.target.value)} style={gayaInput} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
              Nota (pilihan)
            </label>
            <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Cth: Tunai" style={gayaInput} />
          </div>
        </div>

        {ralat && (
          <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#9F1239', marginBottom: '14px' }}>
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
          <button onClick={simpan} disabled={loading} style={{
            flex: 2, padding: '11px',
            background: loading ? '#94A3B8' : 'var(--accent)',
            border: 'none', borderRadius: '12px',
            fontSize: '13.5px', fontWeight: 700,
            color: 'var(--accent-text)', cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
          }}>
            {loading ? 'Menyimpan...' : 'Rekod Bayaran'}
          </button>
        </div>
      </div>
    </div>
  )
}
