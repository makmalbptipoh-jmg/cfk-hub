'use client'

import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTutupEscape } from '@/lib/hooks/useTutupEscape'
import { toast } from '@/lib/stores/toast-store'

const BULAN_MS = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
]

const JENIS = ['Kumpulan', 'Personal', 'Pendaftaran'] as const

type ResitEdit = {
  id: string
  nombor_resit: string
  nama_pelajar: string
  jenis: 'Kumpulan' | 'Personal' | 'Pendaftaran'
  bulan_bayaran: string
  tahun_bayaran: number
  jumlah: number
  kaedah_bayaran: string | null
  tarikh_bayar: string
}

export function ModalEditResit({
  resit,
  onTutup,
  onBerjaya,
}: {
  resit: ResitEdit
  onTutup: () => void
  onBerjaya: () => void
}) {
  const [tarikhBayar, setTarikhBayar] = useState(resit.tarikh_bayar)
  const [kaedah, setKaedah] = useState<'Tunai' | 'Transfer'>(resit.kaedah_bayaran === 'Tunai' ? 'Tunai' : 'Transfer')
  const [bulan, setBulan] = useState(resit.bulan_bayaran)
  const [tahun, setTahun] = useState(resit.tahun_bayaran)
  const [jenis, setJenis] = useState<(typeof JENIS)[number]>(resit.jenis)
  const [jumlah, setJumlah] = useState(String(resit.jumlah))
  const [loading, setLoading] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)
  useTutupEscape(onTutup)

  const tahunSemasa = new Date().getFullYear()
  const senaraiTahun = Array.from({ length: tahunSemasa - 2024 }, (_, i) => 2025 + i)

  const simpan = async () => {
    if (!tarikhBayar) { setRalat('Sila isi tarikh bayar.'); return }
    if (!jumlah || +jumlah <= 0) { setRalat('Jumlah mesti lebih dari 0.'); return }
    setLoading(true)
    setRalat(null)
    const { error } = await createClient()
      .from('resit')
      .update({
        tarikh_bayar: tarikhBayar,
        kaedah_bayaran: kaedah,
        bulan_bayaran: bulan,
        tahun_bayaran: tahun,
        jenis,
        jumlah: +jumlah,
      })
      .eq('id', resit.id)
    setLoading(false)
    if (error) { setRalat('Gagal simpan perubahan. Cuba lagi.'); return }
    toast.success(`Resit ${resit.nombor_resit} dikemaskini.`)
    onBerjaya()
  }

  const modalInput = {
    padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: '10px',
    fontSize: '13.5px', color: 'var(--text)', background: 'var(--card)', outline: 'none',
    fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' as const,
  }
  const labelStyle = { display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={(e) => { if (e.target === e.currentTarget) onTutup() }}
      role="dialog"
      aria-modal="true"
      aria-label="Edit Resit"
    >
      <div style={{ background: 'var(--card)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)' }}>Edit Resit</h2>
          <button onClick={onTutup} aria-label="Tutup" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '18px' }}>
          <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{resit.nombor_resit}</span> · {resit.nama_pelajar}
        </p>

        <div
          style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '10px 12px', marginBottom: '16px' }}
        >
          <AlertTriangle size={15} style={{ color: '#B45309', flexShrink: 0, marginTop: '1px' }} />
          <span style={{ fontSize: '11.5px', color: '#92400E', lineHeight: 1.45 }}>
            Mengedit resit menjejaskan Laporan Kewangan &amp; LHDN. No. resit &amp; pelajar kekal untuk jejak audit — jika pelajar salah, batalkan resit dan keluarkan yang baharu.
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Tarikh Bayar</label>
              <input type="date" value={tarikhBayar} onChange={(e) => setTarikhBayar(e.target.value)} style={modalInput} />
            </div>
            <div>
              <label style={labelStyle}>Kaedah</label>
              <select value={kaedah} onChange={(e) => setKaedah(e.target.value as 'Tunai' | 'Transfer')} style={{ ...modalInput, cursor: 'pointer' }}>
                <option value="Transfer">Transfer</option>
                <option value="Tunai">Tunai</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Bulan Yuran</label>
              <select value={bulan} onChange={(e) => setBulan(e.target.value)} style={{ ...modalInput, cursor: 'pointer' }}>
                {BULAN_MS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tahun Yuran</label>
              <select value={tahun} onChange={(e) => setTahun(+e.target.value)} style={{ ...modalInput, cursor: 'pointer' }}>
                {senaraiTahun.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Jenis</label>
              <select value={jenis} onChange={(e) => setJenis(e.target.value as (typeof JENIS)[number])} style={{ ...modalInput, cursor: 'pointer' }}>
                {JENIS.map((j) => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Jumlah (RM)</label>
              <input type="number" min="0" step="0.01" value={jumlah} onChange={(e) => setJumlah(e.target.value)} placeholder="0.00" style={modalInput} />
            </div>
          </div>
        </div>

        {ralat && (
          <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#9F1239', marginTop: '14px' }}>
            {ralat}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={onTutup} style={{ flex: 1, padding: '11px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '12px', fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit' }}>
            Batal
          </button>
          <button onClick={simpan} disabled={loading} style={{ flex: 2, padding: '11px', background: loading ? '#94A3B8' : 'var(--accent)', border: 'none', borderRadius: '12px', fontSize: '13.5px', fontWeight: 700, color: 'var(--accent-text)', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  )
}
