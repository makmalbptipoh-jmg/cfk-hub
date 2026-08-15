'use client'

import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTutupEscape } from '@/lib/hooks/useTutupEscape'
import { toast } from '@/lib/stores/toast-store'
import type { TajukBesar } from '@/lib/silibus'

export function ModalTajuk({
  tajukEdit,
  onTutup,
  onBerjaya,
}: {
  tajukEdit: TajukBesar | null
  onTutup: () => void
  onBerjaya: () => void
}) {
  const [nama, setNama] = useState(tajukEdit?.nama ?? '')
  const [susunan, setSusunan] = useState(String(tajukEdit?.susunan ?? 100))
  const [nota, setNota] = useState(tajukEdit?.nota ?? '')
  const [status, setStatus] = useState<'Aktif' | 'Tidak Aktif'>(tajukEdit?.status ?? 'Aktif')
  const [loading, setLoading] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)
  const [sahPadam, setSahPadam] = useState(false)
  useTutupEscape(onTutup)

  const simpan = async () => {
    if (!nama.trim()) { setRalat('Sila isi nama Tajuk Besar.'); return }
    setRalat(null)
    setLoading(true)
    const supabase = createClient()
    const rekod = {
      nama: nama.trim(),
      susunan: Number(susunan) || 100,
      nota: nota.trim() || null,
      status,
    }
    let resp
    if (tajukEdit) {
      resp = await supabase.from('silibus_tajuk').update(rekod).eq('id', tajukEdit.id)
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      resp = await supabase.from('silibus_tajuk').insert({ ...rekod, dicipta_oleh: user?.id ?? null })
    }
    const { error } = resp
    setLoading(false)
    if (error) {
      console.error(error)
      setRalat('Gagal simpan. Cuba lagi.')
      return
    }
    toast.success(tajukEdit ? 'Tajuk Besar dikemaskini.' : 'Tajuk Besar ditambah.')
    onBerjaya()
  }

  const padam = async () => {
    if (!tajukEdit) return
    if (!sahPadam) { setSahPadam(true); return }
    setLoading(true)
    const { error } = await createClient().from('silibus_tajuk').delete().eq('id', tajukEdit.id)
    setLoading(false)
    if (error) {
      console.error(error)
      setRalat('Gagal padam. Cuba lagi.')
      return
    }
    toast.success('Tajuk Besar dipadam.')
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
      aria-label={tajukEdit ? 'Edit Tajuk Besar' : 'Tambah Tajuk Besar'}
    >
      <div style={{ background: 'var(--card)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)' }}>
            {tajukEdit ? 'Edit Tajuk Besar' : 'Tambah Tajuk Besar'}
          </h2>
          <button onClick={onTutup} aria-label="Tutup" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Nama Tajuk Besar</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="cth. Short & Sweet: London System"
              style={modalInput}
              autoFocus
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Susunan</label>
              <input type="number" value={susunan} onChange={(e) => setSusunan(e.target.value)} style={modalInput} />
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => setStatus('Aktif')} style={togol(status === 'Aktif')}>Aktif</button>
                <button type="button" onClick={() => setStatus('Tidak Aktif')} style={togol(status === 'Tidak Aktif')}>Sorok</button>
              </div>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Nota / Keterangan (pilihan)</label>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={2}
              placeholder="cth. Kursus Chessable oleh Aman Hambleton"
              style={{ ...modalInput, resize: 'vertical' }}
            />
          </div>
        </div>

        {ralat && (
          <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#9F1239', marginTop: '14px' }}>
            {ralat}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          {tajukEdit && (
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
            {loading ? 'Menyimpan...' : tajukEdit ? 'Simpan Perubahan' : 'Tambah'}
          </button>
        </div>

        {tajukEdit && sahPadam && (
          <p style={{ fontSize: '11.5px', color: '#9F1239', marginTop: '10px' }}>
            Padam Tajuk Besar akan padam <strong>semua subtajuk &amp; progress</strong> di bawahnya. Tindakan ini tidak boleh diundur.
          </p>
        )}
      </div>
    </div>
  )
}
