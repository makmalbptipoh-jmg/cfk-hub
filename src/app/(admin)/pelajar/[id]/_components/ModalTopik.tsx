'use client'

import { useState } from 'react'
import { X, Trash2, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTutupEscape } from '@/lib/hooks/useTutupEscape'
import { tarikhTempatan } from '@/lib/utils'
import { toast } from '@/lib/stores/toast-store'
import {
  TAHAP,
  WARNA_TAHAP,
  type BukuRujukan,
  type KategoriTopik,
  type Tahap,
  type TopikPelajar,
} from '@/lib/progresPelajar'

const modalInput = {
  padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: '10px',
  fontSize: '13.5px', color: 'var(--text)', background: 'var(--card)', outline: 'none',
  fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' as const,
}
const labelStyle = {
  display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)',
  marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.05em',
}

export function ModalTopik({
  pelajarId,
  rekodEdit,
  awalan,
  kategori,
  buku,
  onTutup,
  onBerjaya,
}: {
  pelajarId: string
  rekodEdit: TopikPelajar | null
  // Nilai pra-isi bila topik dijana dari rekod Silibus
  awalan?: { tajuk?: string; muka_surat?: string | null; tarikh?: string; butiran?: string | null }
  kategori: KategoriTopik[]
  buku: BukuRujukan[]
  onTutup: () => void
  onBerjaya: () => void
}) {
  const [kategoriId, setKategoriId] = useState(rekodEdit?.kategori_id ?? '')
  const [tajuk, setTajuk] = useState(rekodEdit?.tajuk ?? awalan?.tajuk ?? '')
  const [tahap, setTahap] = useState<Tahap>(rekodEdit?.tahap ?? 'Baru Diajar')
  const [tarikh, setTarikh] = useState(rekodEdit?.tarikh ?? awalan?.tarikh ?? tarikhTempatan())
  const [bukuId, setBukuId] = useState(rekodEdit?.buku_id ?? '')
  const [mukaSurat, setMukaSurat] = useState(rekodEdit?.muka_surat ?? awalan?.muka_surat ?? '')
  const [butiran, setButiran] = useState(rekodEdit?.butiran ?? awalan?.butiran ?? '')
  const [loading, setLoading] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)
  const [sahPadam, setSahPadam] = useState(false)
  const [kategoriBaharu, setKategoriBaharu] = useState<string | null>(null)
  const [senaraiKategori, setSenaraiKategori] = useState(kategori)
  useTutupEscape(onTutup)

  // Tambah kategori terus dari modal supaya tidak perlu keluar ke Tetapan.
  const simpanKategoriBaharu = async () => {
    const nama = (kategoriBaharu ?? '').trim()
    if (!nama) { setKategoriBaharu(null); return }
    setLoading(true)
    const susunanAkhir = senaraiKategori.reduce((m, k) => Math.max(m, k.susunan), 0) + 10
    const { data, error } = await createClient()
      .from('topik_kategori')
      .insert({ nama, susunan: susunanAkhir, status: 'Aktif' })
      .select('id, nama, susunan, status')
      .single()
    setLoading(false)
    if (error || !data) {
      toast.error(error?.code === '23505' ? 'Kategori itu sudah wujud.' : 'Gagal tambah kategori.')
      return
    }
    setSenaraiKategori((s) => [...s, data as KategoriTopik])
    setKategoriId(data.id)
    setKategoriBaharu(null)
    toast.success(`Kategori "${nama}" ditambah.`)
  }

  const simpan = async () => {
    if (!tajuk.trim()) { setRalat('Sila isi tajuk yang diajar.'); return }
    if (!tarikh) { setRalat('Sila pilih tarikh.'); return }
    setRalat(null)
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const rekod = {
      pelajar_id: pelajarId,
      kategori_id: kategoriId || null,
      tajuk: tajuk.trim(),
      butiran: butiran.trim() || null,
      tahap,
      tarikh,
      // Tarikh kuasai direkod sekali sahaja — kekalkan yang asal jika tahap
      // masih 'Sudah Kuasai', kosongkan jika tahap diturunkan semula.
      tarikh_kuasai: tahap === 'Sudah Kuasai' ? (rekodEdit?.tarikh_kuasai ?? tarikhTempatan()) : null,
      buku_id: bukuId || null,
      muka_surat: mukaSurat.trim() || null,
      dikemaskini_pada: new Date().toISOString(),
    }
    const { error } = rekodEdit
      ? await supabase.from('pelajar_topik').update(rekod).eq('id', rekodEdit.id)
      : await supabase.from('pelajar_topik').insert({ ...rekod, direkod_oleh: user?.id ?? null })
    setLoading(false)
    if (error) {
      console.error(error)
      setRalat('Gagal simpan topik. Cuba lagi.')
      return
    }
    toast.success(rekodEdit ? 'Topik dikemaskini.' : 'Topik ditambah.')
    onBerjaya()
  }

  const padam = async () => {
    if (!rekodEdit) return
    if (!sahPadam) { setSahPadam(true); return }
    setLoading(true)
    const { error } = await createClient().from('pelajar_topik').delete().eq('id', rekodEdit.id)
    setLoading(false)
    if (error) { console.error(error); setRalat('Gagal padam topik. Cuba lagi.'); return }
    toast.success('Topik dipadam.')
    onBerjaya()
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={(e) => { if (e.target === e.currentTarget) onTutup() }}
      role="dialog"
      aria-modal="true"
      aria-label={rekodEdit ? 'Edit Topik' : 'Tambah Topik'}
    >
      <div style={{ background: 'var(--card)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)' }}>
            {rekodEdit ? 'Edit Topik' : 'Tambah Topik Yang Diajar'}
          </h2>
          <button onClick={onTutup} aria-label="Tutup" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Kategori</label>
            {kategoriBaharu === null ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <select value={kategoriId} onChange={(e) => setKategoriId(e.target.value)} style={{ ...modalInput, cursor: 'pointer' }}>
                  <option value="">— Pilih kategori —</option>
                  {senaraiKategori
                    .filter((k) => k.status === 'Aktif' || k.id === kategoriId)
                    .map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => setKategoriBaharu('')}
                  title="Tambah kategori baharu"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '9px 12px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '12.5px', fontWeight: 700, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                >
                  <Plus size={14} /> Baharu
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={kategoriBaharu}
                  onChange={(e) => setKategoriBaharu(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); simpanKategoriBaharu() } }}
                  placeholder="Nama kategori baharu"
                  autoFocus
                  style={modalInput}
                />
                <button type="button" onClick={simpanKategoriBaharu} disabled={loading}
                  style={{ padding: '9px 14px', background: 'var(--accent)', border: 'none', borderRadius: '10px', fontSize: '12.5px', fontWeight: 700, color: 'var(--accent-text)', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Simpan
                </button>
                <button type="button" onClick={() => setKategoriBaharu(null)}
                  style={{ padding: '9px 12px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Batal
                </button>
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Tajuk Yang Diajar</label>
            <input
              type="text"
              value={tajuk}
              onChange={(e) => setTajuk(e.target.value)}
              placeholder="cth. Italian Game, Back Rank Mate, Pin & Fork"
              style={modalInput}
            />
          </div>

          <div>
            <label style={labelStyle}>Tahap Penguasaan</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {TAHAP.map((t) => {
                const aktif = tahap === t
                const w = WARNA_TAHAP[t]
                return (
                  <button key={t} type="button" onClick={() => setTahap(t)}
                    style={{
                      flex: 1, padding: '9px 6px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 700,
                      fontFamily: 'inherit', cursor: 'pointer',
                      background: aktif ? w.bg : 'var(--bg)',
                      color: aktif ? w.text : 'var(--text-muted)',
                      border: `1.5px solid ${aktif ? w.border : 'var(--border)'}`,
                    }}>
                    {t}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Tarikh Diajar</label>
              <input type="date" value={tarikh} onChange={(e) => setTarikh(e.target.value)} style={modalInput} />
            </div>
            <div>
              <label style={labelStyle}>Muka Surat (pilihan)</label>
              <input type="text" value={mukaSurat} onChange={(e) => setMukaSurat(e.target.value)} placeholder="cth. ms 12-15" style={modalInput} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Buku / Modul (pilihan)</label>
            <select value={bukuId} onChange={(e) => setBukuId(e.target.value)} style={{ ...modalInput, cursor: 'pointer' }}>
              <option value="">— Tiada buku —</option>
              {buku.map((b) => <option key={b.id} value={b.id}>{b.nama}</option>)}
            </select>
            {buku.length === 0 && (
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '6px' }}>
                Belum ada buku. Muat naik buku anda di menu &quot;Bahan &amp; Buku&quot;.
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Butiran / Nota (pilihan)</label>
            <textarea
              value={butiran}
              onChange={(e) => setButiran(e.target.value)}
              rows={4}
              placeholder="cth. faham konsep control center, tapi masih lemah bila lawan main gambit. PR: 10 puzzle fork."
              style={{ ...modalInput, resize: 'vertical', lineHeight: 1.5 }}
            />
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
            {loading ? 'Menyimpan...' : rekodEdit ? 'Simpan Perubahan' : 'Tambah Topik'}
          </button>
        </div>
      </div>
    </div>
  )
}
