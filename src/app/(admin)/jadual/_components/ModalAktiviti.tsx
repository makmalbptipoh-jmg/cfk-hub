'use client'

import { useState } from 'react'
import { X, Trash2, Ban } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTutupEscape } from '@/lib/hooks/useTutupEscape'
import { tarikhTempatan } from '@/lib/utils'
import { toast } from '@/lib/stores/toast-store'
import { CariPelajar, type PelajarCarian } from '@/components/pelajar/CariPelajar'
import type { Aktiviti, Cawangan, JurulatihPilihan } from './JadualKlient'

const KATEGORI = ['Pertandingan', 'Kem', 'Mesyuarat', 'Kelas Personal', 'Kelas Ganti', 'Lain-lain'] as const

const ke5 = (masa: string | null) => (masa ? masa.slice(0, 5) : '')

export function ModalAktiviti({
  aktivitiEdit,
  cawangan,
  jurulatih,
  onTutup,
  onBerjaya,
}: {
  aktivitiEdit: Aktiviti | null
  cawangan: Cawangan[]
  jurulatih: JurulatihPilihan[]
  onTutup: () => void
  onBerjaya: () => void
}) {
  const [nama, setNama] = useState(aktivitiEdit?.nama ?? '')
  const [kategori, setKategori] = useState<(typeof KATEGORI)[number]>(aktivitiEdit?.kategori ?? 'Lain-lain')
  const [tarikh, setTarikh] = useState(aktivitiEdit?.tarikh ?? tarikhTempatan())
  const [masaMula, setMasaMula] = useState(ke5(aktivitiEdit?.masa_mula ?? null))
  const [masaTamat, setMasaTamat] = useState(ke5(aktivitiEdit?.masa_tamat ?? null))
  const [lokasi, setLokasi] = useState(aktivitiEdit?.lokasi ?? '')
  const [cawanganId, setCawanganId] = useState(aktivitiEdit?.cawangan_id ?? '')
  const [pelajarId, setPelajarId] = useState(aktivitiEdit?.pelajar_id ?? '')
  const [jurulatihId, setJurulatihId] = useState(aktivitiEdit?.jurulatih_id ?? '')
  const [penerangan, setPenerangan] = useState(aktivitiEdit?.penerangan ?? '')
  const [loading, setLoading] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)
  const [sahPadam, setSahPadam] = useState(false)
  useTutupEscape(onTutup)

  const simpan = async () => {
    if (!nama.trim()) { setRalat('Sila isi nama aktiviti.'); return }
    if (!tarikh) { setRalat('Sila pilih tarikh.'); return }
    if (kategori === 'Kelas Personal' && !pelajarId) { setRalat('Sila pilih pelajar untuk kelas personal.'); return }
    if (masaMula && masaTamat && masaTamat <= masaMula) { setRalat('Masa tamat mesti selepas masa mula.'); return }
    setRalat(null)
    setLoading(true)

    const supabase = createClient()
    const rekod = {
      nama: nama.trim(),
      kategori,
      tarikh,
      masa_mula: masaMula || null,
      masa_tamat: masaTamat || null,
      lokasi: lokasi.trim() || null,
      cawangan_id: cawanganId || null,
      pelajar_id: kategori === 'Kelas Personal' ? pelajarId : pelajarId || null,
      jurulatih_id: jurulatihId || null,
      penerangan: penerangan.trim() || null,
    }
    const { error } = aktivitiEdit
      ? await supabase.from('aktiviti').update(rekod).eq('id', aktivitiEdit.id)
      : await supabase.from('aktiviti').insert(rekod)
    setLoading(false)
    if (error) {
      console.error(error)
      setRalat('Gagal simpan aktiviti. Cuba lagi.')
      return
    }
    toast.success(aktivitiEdit ? 'Aktiviti dikemaskini.' : 'Aktiviti ditambah.')
    onBerjaya()
  }

  const batalkan = async () => {
    if (!aktivitiEdit) return
    setLoading(true)
    const { error } = await createClient().from('aktiviti').update({ status: 'Dibatalkan' }).eq('id', aktivitiEdit.id)
    setLoading(false)
    if (error) { setRalat('Gagal batalkan aktiviti. Cuba lagi.'); return }
    toast.success(`Aktiviti "${aktivitiEdit.nama}" dibatalkan.`)
    onBerjaya()
  }

  const padam = async () => {
    if (!aktivitiEdit) return
    if (!sahPadam) { setSahPadam(true); return }
    setLoading(true)
    const { error } = await createClient().from('aktiviti').delete().eq('id', aktivitiEdit.id)
    setLoading(false)
    if (error) { setRalat('Gagal padam aktiviti. Cuba lagi.'); return }
    toast.success('Aktiviti dipadam.')
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
      aria-label={aktivitiEdit ? 'Edit Aktiviti' : 'Tambah Aktiviti'}
    >
      <div style={{ background: 'var(--card)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)' }}>
            {aktivitiEdit ? 'Edit Aktiviti' : 'Tambah Aktiviti'}
          </h2>
          <button onClick={onTutup} aria-label="Tutup" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Nama Aktiviti</label>
            <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="cth. Kejohanan Catur MSSD" style={modalInput} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Kategori</label>
              <select value={kategori} onChange={(e) => setKategori(e.target.value as (typeof KATEGORI)[number])} style={{ ...modalInput, cursor: 'pointer' }}>
                {KATEGORI.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tarikh</label>
              <input type="date" value={tarikh} onChange={(e) => setTarikh(e.target.value)} style={modalInput} />
            </div>
          </div>

          {kategori === 'Kelas Personal' && (
            <div>
              <label style={labelStyle}>Pelajar</label>
              <CariPelajar
                onPilih={(p: PelajarCarian) => setPelajarId(p.id)}
                placeholder="Cari nama pelajar..."
                nilaiAwal={aktivitiEdit?.pelajar?.nama_penuh ?? ''}
              />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Masa Mula (pilihan)</label>
              <input type="time" value={masaMula} onChange={(e) => setMasaMula(e.target.value)} style={modalInput} />
            </div>
            <div>
              <label style={labelStyle}>Masa Tamat (pilihan)</label>
              <input type="time" value={masaTamat} onChange={(e) => setMasaTamat(e.target.value)} style={modalInput} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Cawangan (pilihan)</label>
              <select value={cawanganId} onChange={(e) => setCawanganId(e.target.value)} style={{ ...modalInput, cursor: 'pointer' }}>
                <option value="">— Tiada —</option>
                {cawangan.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Jurulatih (pilihan)</label>
              <select value={jurulatihId} onChange={(e) => setJurulatihId(e.target.value)} style={{ ...modalInput, cursor: 'pointer' }}>
                <option value="">— Tiada —</option>
                {jurulatih.map((j) => <option key={j.id} value={j.id}>{j.nama_penuh}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Lokasi (pilihan)</label>
            <input type="text" value={lokasi} onChange={(e) => setLokasi(e.target.value)} placeholder="cth. SMK Seri Kampar" style={modalInput} />
          </div>

          <div>
            <label style={labelStyle}>Penerangan (pilihan)</label>
            <textarea value={penerangan} onChange={(e) => setPenerangan(e.target.value)} rows={2} style={{ ...modalInput, resize: 'vertical' as const }} />
          </div>
        </div>

        {ralat && (
          <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#9F1239', marginTop: '14px' }}>
            {ralat}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
          {aktivitiEdit && (
            <>
              <button
                onClick={padam}
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '11px 12px', background: sahPadam ? '#E11D48' : '#FFF1F2', border: '1.5px solid #FECDD3', borderRadius: '12px', fontSize: '12px', fontWeight: 700, color: sahPadam ? '#fff' : '#9F1239', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                <Trash2 size={14} /> {sahPadam ? 'Sah Padam?' : 'Padam'}
              </button>
              {aktivitiEdit.status === 'Aktif' && (
                <button
                  onClick={batalkan}
                  disabled={loading}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '11px 12px', background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: '12px', fontSize: '12px', fontWeight: 700, color: '#92400E', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  <Ban size={14} /> Batalkan
                </button>
              )}
            </>
          )}
          <button onClick={onTutup} style={{ flex: 1, padding: '11px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '12px', fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit' }}>
            Batal
          </button>
          <button
            onClick={simpan}
            disabled={loading}
            style={{ flex: 2, padding: '11px', background: loading ? '#94A3B8' : 'var(--accent)', border: 'none', borderRadius: '12px', fontSize: '13.5px', fontWeight: 700, color: 'var(--accent-text)', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', minWidth: '140px' }}
          >
            {loading ? 'Menyimpan...' : aktivitiEdit ? 'Simpan Perubahan' : 'Tambah Aktiviti'}
          </button>
        </div>
      </div>
    </div>
  )
}
