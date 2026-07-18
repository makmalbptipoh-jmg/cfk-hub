'use client'

import { useState } from 'react'
import { X, AlertTriangle, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTutupEscape } from '@/lib/hooks/useTutupEscape'
import { HARI, formatMasa } from '@/lib/utils'
import { toast } from '@/lib/stores/toast-store'
import { CariPelajar, type PelajarCarian } from '@/components/pelajar/CariPelajar'
import type { Slot, Cawangan, JurulatihPilihan } from './JadualKlient'

// 'HH:MM:SS' dari DB → 'HH:MM' untuk input type=time & perbandingan
const ke5 = (masa: string) => masa.slice(0, 5)

export function ModalSlot({
  slotEdit,
  semuaSlot,
  cawangan,
  jurulatih,
  onTutup,
  onBerjaya,
}: {
  slotEdit: Slot | null
  semuaSlot: Slot[]
  cawangan: Cawangan[]
  jurulatih: JurulatihPilihan[]
  onTutup: () => void
  onBerjaya: () => void
}) {
  const [jenis, setJenis] = useState<'Kumpulan' | 'Personal'>(slotEdit?.jenis ?? 'Kumpulan')
  const [hari, setHari] = useState(slotEdit?.hari_minggu ?? 0)
  const [masaMula, setMasaMula] = useState(slotEdit ? ke5(slotEdit.masa_mula) : '')
  const [masaTamat, setMasaTamat] = useState(slotEdit ? ke5(slotEdit.masa_tamat) : '')
  const [cawanganId, setCawanganId] = useState(slotEdit?.cawangan_id ?? '')
  const [pelajarId, setPelajarId] = useState(slotEdit?.pelajar_id ?? '')
  const [jurulatihIds, setJurulatihIds] = useState<string[]>(slotEdit?.jurulatih_ids ?? [])
  const [lokasi, setLokasi] = useState(slotEdit?.lokasi ?? '')
  const [nota, setNota] = useState(slotEdit?.nota ?? '')
  const [loading, setLoading] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)
  const [amaranTindih, setAmaranTindih] = useState<string | null>(null)
  const [sahPadam, setSahPadam] = useState(false)
  useTutupEscape(onTutup)

  const togolJurulatih = (id: string) =>
    setJurulatihIds((sedia) => (sedia.includes(id) ? sedia.filter((x) => x !== id) : [...sedia, id]))

  // Semak pertindihan lembut: hari sama + masa bertindih + (jurulatih ATAU cawangan sama)
  const cariTindih = () => {
    return semuaSlot.filter((s) => {
      if (slotEdit && s.id === slotEdit.id) return false
      if (s.hari_minggu !== hari) return false
      const bertindih = masaMula < ke5(s.masa_tamat) && masaTamat > ke5(s.masa_mula)
      if (!bertindih) return false
      const samaJurulatih = jurulatihIds.some((id) => s.jurulatih_ids.includes(id))
      const samaCawangan = cawanganId && s.cawangan_id === cawanganId
      return Boolean(samaJurulatih || samaCawangan)
    })
  }

  const simpan = async (abaikanTindih = false) => {
    if (!masaMula || !masaTamat) { setRalat('Sila isi masa mula dan masa tamat.'); return }
    if (masaTamat <= masaMula) { setRalat('Masa tamat mesti selepas masa mula.'); return }
    if (jenis === 'Kumpulan' && !cawanganId) { setRalat('Sila pilih cawangan untuk kelas kumpulan.'); return }
    if (jenis === 'Personal' && !pelajarId) { setRalat('Sila pilih pelajar untuk kelas personal.'); return }
    setRalat(null)

    if (!abaikanTindih) {
      const tindih = cariTindih()
      if (tindih.length > 0) {
        const s = tindih[0]
        const namaS = s.jenis === 'Kumpulan' ? s.cawangan?.nama : s.pelajar?.nama_penuh
        const namaJ = s.jurulatih_ids.map((id) => jurulatih.find((j) => j.id === id)?.nama_penuh).filter(Boolean).join(', ')
        setAmaranTindih(`Bertindih dengan: ${namaS ?? 'slot lain'} (${HARI[s.hari_minggu]} ${formatMasa(s.masa_mula)}–${formatMasa(s.masa_tamat)})${namaJ ? ` · jurulatih ${namaJ}` : ''}. Klik "Simpan Juga" jika memang disengajakan.`)
        return
      }
    }

    setLoading(true)
    const supabase = createClient()
    const rekod = {
      jenis,
      hari_minggu: hari,
      masa_mula: masaMula,
      masa_tamat: masaTamat,
      cawangan_id: cawanganId || null,
      pelajar_id: jenis === 'Personal' ? pelajarId : null,
      jurulatih_ids: jurulatihIds,
      lokasi: lokasi.trim() || null,
      nota: nota.trim() || null,
    }
    const { error } = slotEdit
      ? await supabase.from('jadual_slot').update(rekod).eq('id', slotEdit.id)
      : await supabase.from('jadual_slot').insert(rekod)
    setLoading(false)
    if (error) {
      console.error(error)
      setRalat('Gagal simpan slot. Cuba lagi.')
      return
    }
    toast.success(slotEdit ? 'Slot jadual dikemaskini.' : 'Slot jadual ditambah.')
    onBerjaya()
  }

  const padam = async () => {
    if (!slotEdit) return
    if (!sahPadam) { setSahPadam(true); return }
    setLoading(true)
    const { error } = await createClient().from('jadual_slot').delete().eq('id', slotEdit.id)
    setLoading(false)
    if (error) {
      setRalat('Gagal padam slot. Cuba lagi.')
      return
    }
    toast.success('Slot jadual dipadam.')
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
      aria-label={slotEdit ? 'Edit Slot Jadual' : 'Tambah Slot Jadual'}
    >
      <div style={{ background: 'var(--card)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)' }}>
            {slotEdit ? 'Edit Slot Jadual' : 'Tambah Slot Jadual'}
          </h2>
          <button onClick={onTutup} aria-label="Tutup" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Jenis Kelas</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setJenis('Kumpulan')} style={togol(jenis === 'Kumpulan')}>Kumpulan</button>
              <button onClick={() => setJenis('Personal')} style={togol(jenis === 'Personal')}>Personal</button>
            </div>
          </div>

          {jenis === 'Personal' && (
            <div>
              <label style={labelStyle}>Pelajar</label>
              <CariPelajar
                onPilih={(p: PelajarCarian) => setPelajarId(p.id)}
                placeholder="Cari nama pelajar personal..."
                nilaiAwal={slotEdit?.pelajar?.nama_penuh ?? ''}
              />
            </div>
          )}

          <div>
            <label style={labelStyle}>Cawangan {jenis === 'Personal' ? '(pilihan)' : ''}</label>
            <select value={cawanganId} onChange={(e) => setCawanganId(e.target.value)} style={{ ...modalInput, cursor: 'pointer' }}>
              <option value="">{jenis === 'Personal' ? '— Tiada / lokasi lain —' : '— Pilih cawangan —'}</option>
              {cawangan.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Hari</label>
              <select value={hari} onChange={(e) => setHari(+e.target.value)} style={{ ...modalInput, cursor: 'pointer' }}>
                {HARI.map((h, i) => <option key={i} value={i}>{h}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Masa Mula</label>
              <input type="time" value={masaMula} onChange={(e) => setMasaMula(e.target.value)} style={modalInput} />
            </div>
            <div>
              <label style={labelStyle}>Masa Tamat</label>
              <input type="time" value={masaTamat} onChange={(e) => setMasaTamat(e.target.value)} style={modalInput} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Jurulatih (pilihan — boleh pilih lebih dari satu)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {jurulatih.map((j) => {
                const dipilih = jurulatihIds.includes(j.id)
                return (
                  <button
                    key={j.id}
                    type="button"
                    onClick={() => togolJurulatih(j.id)}
                    style={{
                      padding: '7px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                      background: dipilih ? 'var(--accent)' : 'var(--bg)',
                      color: dipilih ? 'var(--accent-text)' : 'var(--text-muted)',
                      border: dipilih ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
                    }}
                  >
                    {dipilih ? '✓ ' : ''}{j.nama_penuh}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Lokasi (pilihan)</label>
              <input type="text" value={lokasi} onChange={(e) => setLokasi(e.target.value)} placeholder="cth. rumah pelajar" style={modalInput} />
            </div>
            <div>
              <label style={labelStyle}>Nota (pilihan)</label>
              <input type="text" value={nota} onChange={(e) => setNota(e.target.value)} style={modalInput} />
            </div>
          </div>
        </div>

        {amaranTindih && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '10px 12px', marginTop: '14px' }}>
            <AlertTriangle size={15} style={{ color: '#B45309', flexShrink: 0, marginTop: '1px' }} />
            <span style={{ fontSize: '11.5px', color: '#92400E', lineHeight: 1.45 }}>{amaranTindih}</span>
          </div>
        )}

        {ralat && (
          <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#9F1239', marginTop: '14px' }}>
            {ralat}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          {slotEdit && (
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
            onClick={() => simpan(Boolean(amaranTindih))}
            disabled={loading}
            style={{ flex: 2, padding: '11px', background: loading ? '#94A3B8' : amaranTindih ? '#F59E0B' : 'var(--accent)', border: 'none', borderRadius: '12px', fontSize: '13.5px', fontWeight: 700, color: amaranTindih ? '#fff' : 'var(--accent-text)', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
          >
            {loading ? 'Menyimpan...' : amaranTindih ? 'Simpan Juga' : slotEdit ? 'Simpan Perubahan' : 'Tambah Slot'}
          </button>
        </div>
      </div>
    </div>
  )
}
