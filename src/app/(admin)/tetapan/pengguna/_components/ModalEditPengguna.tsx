'use client'

import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { kemaskiniMaklumatPengguna } from '@/app/actions/pengguna'
import { useTutupEscape } from '@/lib/hooks/useTutupEscape'

type Cawangan = { id: string; nama: string }

type Pengguna = {
  id: string
  nama: string
  emel: string | null
  is_admin: boolean
  cawangan_id?: string | null
}

interface Props {
  pengguna: Pengguna
  cawangan: Cawangan[]
  onTutup: () => void
  onBerjaya: () => void
}

const gayaInput = {
  width: '100%', padding: '10px 14px',
  border: '1.5px solid var(--border)', borderRadius: '12px',
  fontSize: '13.5px', color: 'var(--text)',
  background: 'var(--card)', outline: 'none', fontFamily: 'inherit',
  boxSizing: 'border-box' as const,
}

const labelInput = {
  display: 'block' as const,
  fontSize: '12px', fontWeight: 600 as const,
  color: 'var(--text-muted)', marginBottom: '6px',
  textTransform: 'uppercase' as const, letterSpacing: '0.05em',
}

export function ModalEditPengguna({ pengguna, cawangan, onTutup, onBerjaya }: Props) {
  const [form, setForm] = useState({
    nama: pengguna.nama,
    emel: pengguna.emel ?? '',
    isAdmin: pengguna.is_admin,
    cawanganId: pengguna.cawangan_id ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  useTutupEscape(onTutup)

  useEffect(() => { inputRef.current?.focus() }, [])

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }))

  const hantar = async () => {
    if (!form.nama.trim()) { setRalat('Nama wajib diisi.'); return }
    setLoading(true)
    setRalat(null)
    const { ralat: err } = await kemaskiniMaklumatPengguna({
      penggunaId: pengguna.id,
      nama: form.nama,
      isAdmin: form.isAdmin,
      cawanganId: form.cawanganId || null,
      emel: form.emel.trim() && form.emel.trim() !== (pengguna.emel ?? '') ? form.emel.trim() : undefined,
    })
    if (err) { setRalat(err); setLoading(false); return }
    onBerjaya()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={(e) => { if (e.target === e.currentTarget) onTutup() }}
      role="dialog" aria-modal="true" aria-label="Edit Maklumat Pengguna">
      <div style={{ background: 'var(--card)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)' }}>Edit Maklumat Pengguna</h2>
          <button onClick={onTutup} aria-label="Tutup" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelInput}>Nama *</label>
            <input ref={inputRef} value={form.nama} onChange={(e) => set('nama', e.target.value)} placeholder="Nama penuh" style={gayaInput} />
          </div>
          <div>
            <label style={labelInput}>E-mel</label>
            <input type="email" value={form.emel} onChange={(e) => set('emel', e.target.value)} placeholder="email@contoh.com" style={gayaInput} />
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Menukar e-mel akan menukar e-mel log masuk pengguna.</p>
          </div>
          <div>
            <label style={labelInput}>Peranan</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[{ val: false, label: 'Jurulatih' }, { val: true, label: 'Admin' }].map(({ val, label }) => {
                const aktif = form.isAdmin === val
                return (
                  <button key={label} type="button" onClick={() => set('isAdmin', val)}
                    style={{ flex: 1, padding: '9px', border: `2px solid ${aktif ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '12px', background: aktif ? '#F7FEE7' : 'transparent', color: aktif ? 'var(--accent-dark)' : 'var(--text-muted)', fontSize: '13.5px', fontWeight: aktif ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
          {!form.isAdmin && (
            <div>
              <label style={labelInput}>Cawangan</label>
              <select value={form.cawanganId} onChange={(e) => set('cawanganId', e.target.value)} style={{ ...gayaInput, cursor: 'pointer' }}>
                <option value="">— Pilih cawangan —</option>
                {cawangan.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
              </select>
            </div>
          )}
        </div>

        {ralat && (
          <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#9F1239', marginTop: '16px' }}>
            {ralat}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={onTutup} style={{ flex: 1, padding: '11px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '12px', fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit' }}>
            Batal
          </button>
          <button onClick={hantar} disabled={loading} style={{ flex: 2, padding: '11px', background: loading ? '#94A3B8' : 'var(--accent)', border: 'none', borderRadius: '12px', fontSize: '13.5px', fontWeight: 700, color: 'var(--accent-text)', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  )
}
