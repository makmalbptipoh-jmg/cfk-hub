'use client'

import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTutupEscape } from '@/lib/hooks/useTutupEscape'
import { tarikhTempatan } from '@/lib/utils'
import { toast } from '@/lib/stores/toast-store'
import type { Cawangan, Silibus } from './SilibusKlient'

export function ModalSilibus({
  rekodEdit,
  cawangan,
  onTutup,
  onBerjaya,
}: {
  rekodEdit: Silibus | null
  cawangan: Cawangan[]
  onTutup: () => void
  onBerjaya: () => void
}) {
  const [tarikh, setTarikh] = useState(rekodEdit?.tarikh ?? tarikhTempatan())
  const [cawanganId, setCawanganId] = useState(rekodEdit?.cawangan_id ?? '')
  const [jenis, setJenis] = useState<'Kumpulan' | 'Personal'>(rekodEdit?.jenis ?? 'Kumpulan')
  const [tajuk, setTajuk] = useState(rekodEdit?.tajuk ?? '')
  const [mukaSurat, setMukaSurat] = useState(rekodEdit?.muka_surat ?? '')
  const [nota, setNota] = useState(rekodEdit?.nota ?? '')
  const [loading, setLoading] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)
  const [sahPadam, setSahPadam] = useState(false)
  useTutupEscape(onTutup)

  const simpan = async () => {
    if (!tarikh) { setRalat('Sila pilih tarikh.'); return }
    if (!tajuk.trim()) { setRalat('Sila isi tajuk / silibus yang diajar.'); return }
    setRalat(null)
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const rekod = {
      tarikh,
      cawangan_id: cawanganId || null,
      jenis,
      tajuk: tajuk.trim(),
      muka_surat: mukaSurat.trim() || null,
      nota: nota.trim() || null,
    }
    const { error } = rekodEdit
      ? await supabase.from('silibus').update(rekod).eq('id', rekodEdit.id)
      : await supabase.from('silibus').insert({ ...rekod, direkod_oleh: user?.id ?? null })
    setLoading(false)
    if (error) {
      console.error(error)
      setRalat('Gagal simpan rekod. Cuba lagi.')
      return
    }
    toast.success(rekodEdit ? 'Rekod silibus dikemaskini.' : 'Rekod silibus ditambah.')
    onBerjaya()
  }

  const padam = async () => {
    if (!rekodEdit) return
    if (!sahPadam) { setSahPadam(true); return }
    setLoading(true)
    const { error } = await createClient().from('silibus').delete().eq('id', rekodEdit.id)
    setLoading(false)
    if (error) {
      console.error(error)
      setRalat('Gagal padam rekod. Cuba lagi.')
      return
    }
    toast.success('Rekod silibus dipadam.')
    onBerjaya()
  }

  const modalInput = {
    padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: '10px',
    fontSize: '13.5px', color: 'var(--text)', background: 'var(--card)', outline: 'none',
    fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' as const,
  }
  const labelStyle = { display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }
  const togol = (aktif: boolean) => ({
    flex: 1, padding: '9px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
    background: aktif ? 'var(--accent)' : 'var(--bg)', color: aktif ? 'var(--accent-text)' : 'var(--text-muted)',
    border: aktif ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
  })

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={(e) => { if (e.target === e.currentTarget) onTutup() }}
      role="dialog"
      aria-modal="true"
      aria-label={rekodEdit ? 'Edit Rekod Silibus' : 'Tambah Rekod Silibus'}
    >
      <div style={{ background: 'var(--card)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)' }}>
            {rekodEdit ? 'Edit Rekod Silibus' : 'Tambah Rekod Silibus'}
          </h2>
          <button onClick={onTutup} aria-label="Tutup" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Tarikh</label>
              <input type="date" value={tarikh} onChange={(e) => setTarikh(e.target.value)} style={modalInput} />
            </div>
            <div>
              <label style={labelStyle}>Cawangan (pilihan)</label>
              <select value={cawanganId} onChange={(e) => setCawanganId(e.target.value)} style={{ ...modalInput, cursor: 'pointer' }}>
                <option value="">— Tiada / lain —</option>
                {cawangan.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Jenis Kelas</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => setJenis('Kumpulan')} style={togol(jenis === 'Kumpulan')}>Kumpulan</button>
              <button type="button" onClick={() => setJenis('Personal')} style={togol(jenis === 'Personal')}>Personal</button>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Tajuk / Silibus Diajar</label>
            <input
              type="text"
              value={tajuk}
              onChange={(e) => setTajuk(e.target.value)}
              placeholder="cth. Gambit Raja, Pergerakan Kuda..."
              style={modalInput}
            />
          </div>

          <div>
            <label style={labelStyle}>Page / Muka Surat (pilihan)</label>
            <input
              type="text"
              value={mukaSurat}
              onChange={(e) => setMukaSurat(e.target.value)}
              placeholder="cth. ms 12-15 / Modul 2"
              style={modalInput}
            />
          </div>

          <div>
            <label style={labelStyle}>Nota (pilihan)</label>
            <input type="text" value={nota} onChange={(e) => setNota(e.target.value)} style={modalInput} />
          </div>
        </div>

        {ralat && (
          <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#9F1239', marginTop: '14px' }}>
            {ralat}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          {rekodEdit && (
            <button
              onClick={padam}
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '11px 14px', background: sahPadam ? '#E11D48' : '#FFF1F2', border: '1.5px solid #FECDD3', borderRadius: '12px', fontSize: '12.5px', fontWeight: 700, color: sahPadam ? '#fff' : '#9F1239', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <Trash2 size={14} /> {sahPadam ? 'Sah Padam?' : 'Padam'}
            </button>
          )}
          <button onClick={onTutup} style={{ flex: 1, padding: '11px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '12px', fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit' }}>
            Batal
          </button>
          <button
            onClick={simpan}
            disabled={loading}
            style={{ flex: 2, padding: '11px', background: loading ? '#94A3B8' : 'var(--accent)', border: 'none', borderRadius: '12px', fontSize: '13.5px', fontWeight: 700, color: 'var(--accent-text)', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
          >
            {loading ? 'Menyimpan...' : rekodEdit ? 'Simpan Perubahan' : 'Tambah Rekod'}
          </button>
        </div>
      </div>
    </div>
  )
}
