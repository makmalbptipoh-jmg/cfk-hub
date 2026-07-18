'use client'

import { useState } from 'react'
import { Copy, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatRinggit, tarikhTempatan } from '@/lib/utils'
import { useTutupEscape } from '@/lib/hooks/useTutupEscape'
import { toast } from '@/lib/stores/toast-store'

const KAEDAH = ['Tunai', 'TNG eWallet', 'Transfer Bank'] as const

interface Props {
  jurulatihId: string
  namaJurulatih: string
  noTng: string | null
  tngQrUrl: string | null
  onTutup: () => void
  onBerjaya: () => void
}

export function ModalRekodAdvance({ jurulatihId, namaJurulatih, noTng, tngQrUrl, onTutup, onBerjaya }: Props) {
  const [jumlah, setJumlah] = useState('')
  const [tarikh, setTarikh] = useState(tarikhTempatan())
  const [kaedah, setKaedah] = useState<string>('Tunai')
  const [nota, setNota] = useState('')
  const [loading, setLoading] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)
  useTutupEscape(onTutup)

  const nilai = parseFloat(jumlah) || 0

  const salinNoTng = async () => {
    if (!noTng) return
    await navigator.clipboard.writeText(noTng)
    toast.success('No. TNG disalin')
  }

  const simpan = async () => {
    if (nilai <= 0) { setRalat('Jumlah advance mesti lebih dari RM0.'); return }
    setLoading(true)
    setRalat(null)
    const supabase = createClient()
    const { error } = await supabase.from('advance_jurulatih').insert({
      jurulatih_id: jurulatihId,
      jumlah: nilai,
      baki: nilai,
      tarikh_advance: tarikh,
      kaedah_bayaran: kaedah,
      status: 'Belum Selesai',
      nota: nota || null,
    })
    if (error) { setRalat('Gagal simpan. Cuba lagi.'); setLoading(false); return }
    // Belanja diposkan pada tarikh wang keluar; gaji bulan berkenaan nanti
    // dipos bersih sahaja supaya jumlah kos gaji tidak dikira dua kali
    const { error: errBelanja } = await supabase.from('kewangan_perbelanjaan').insert({
      tarikh,
      kategori: 'Gaji Jurulatih',
      penerangan: `Advance gaji ${namaJurulatih} — ${tarikh}`,
      jumlah: nilai,
    })
    if (errBelanja) {
      toast.error('Advance direkod, tetapi gagal masuk Kewangan — tambah manual dalam Perbelanjaan.')
    }
    onBerjaya()
  }

  const gayaInput = {
    width: '100%', padding: '9px 12px',
    border: '1.5px solid var(--border)', borderRadius: '10px',
    fontSize: '13.5px', color: 'var(--text)',
    background: 'var(--card)', outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
  }

  const gayaLabel = {
    display: 'block' as const, fontSize: '11.5px', fontWeight: 700 as const,
    color: 'var(--text-muted)', marginBottom: '5px',
    textTransform: 'uppercase' as const, letterSpacing: '0.05em',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }} onClick={(e) => { if (e.target === e.currentTarget) onTutup() }}
      role="dialog" aria-modal="true" aria-label="Rekod Advance Gaji">
      <div style={{
        background: 'var(--card)', borderRadius: '20px',
        padding: '28px', width: '100%', maxWidth: '460px',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>Rekod Advance Gaji</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{namaJurulatih}</p>
          </div>
          <button onClick={onTutup} aria-label="Tutup" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div>
            <label style={gayaLabel}>Jumlah Advance (RM)</label>
            <input type="number" min="0" step="10" value={jumlah} onChange={(e) => setJumlah(e.target.value)} placeholder="Cth: 100" style={gayaInput} />
          </div>
          <div>
            <label style={gayaLabel}>Tarikh</label>
            <input type="date" value={tarikh} onChange={(e) => setTarikh(e.target.value)} style={gayaInput} />
          </div>
        </div>

        {nilai > 0 && (
          <div style={{
            background: '#FFF7ED', border: '2px solid #FED7AA',
            borderRadius: '12px', padding: '12px 16px', marginBottom: '12px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: '13px', color: '#C2410C' }}>Akan ditolak dari gaji 30hb</span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#C2410C' }}>{formatRinggit(nilai)}</span>
          </div>
        )}

        <div style={{ marginBottom: '12px' }}>
          <label style={gayaLabel}>Kaedah Bayaran</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {KAEDAH.map((k) => {
              const dipilih = kaedah === k
              return (
                <button key={k} type="button" onClick={() => setKaedah(k)}
                  style={{
                    flex: 1, padding: '8px 4px', borderRadius: '10px',
                    border: `2px solid ${dipilih ? 'var(--accent)' : 'var(--border)'}`,
                    background: dipilih ? '#F7FEE7' : 'transparent',
                    color: dipilih ? 'var(--accent-dark)' : 'var(--text-muted)',
                    fontSize: '12.5px', fontWeight: dipilih ? 700 : 500,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {k}
                </button>
              )
            })}
          </div>
        </div>

        {kaedah === 'TNG eWallet' && (
          <div style={{
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '14px 16px', marginBottom: '12px',
          }}>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Transfer ke TNG eWallet
            </div>
            {noTng ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: tngQrUrl ? '10px' : 0 }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>{noTng}</span>
                <button type="button" onClick={salinNoTng}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '5px 10px', background: 'var(--card)',
                    border: '1.5px solid var(--border)', borderRadius: '8px',
                    fontSize: '12px', fontWeight: 600, color: 'var(--text)',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  <Copy size={12} /> Salin
                </button>
              </div>
            ) : (
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: tngQrUrl ? '10px' : 0 }}>
                Tiada no. TNG — tambah melalui Edit jurulatih.
              </p>
            )}
            {tngQrUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tngQrUrl} alt={`QR TNG ${namaJurulatih}`}
                style={{ width: '160px', height: '160px', objectFit: 'contain', borderRadius: '10px', border: '1px solid var(--border)', background: '#fff' }} />
            )}
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '8px' }}>
              Transfer guna app TNG / bank (DuitNow ke no telefon atau scan QR), kemudian simpan rekod ini.
            </p>
          </div>
        )}

        <div style={{ marginBottom: '12px' }}>
          <label style={gayaLabel}>Nota (pilihan)</label>
          <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Cth: Kecemasan keluarga" style={gayaInput} />
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
            {loading ? 'Menyimpan...' : 'Rekod Advance'}
          </button>
        </div>
      </div>
    </div>
  )
}
