'use client'

import { useState, useRef } from 'react'
import { X, Trash2, Upload, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTutupEscape } from '@/lib/hooks/useTutupEscape'
import { toast } from '@/lib/stores/toast-store'
import { PGN_BUCKET, PGN_ACCEPT, sahkanFailPgn, pathPgn, saizFail, type Subtajuk } from '@/lib/silibus'

export function ModalSubtajuk({
  subtajukEdit,
  tajukId,
  tajukNama,
  susunanSeterusnya,
  onTutup,
  onBerjaya,
}: {
  subtajukEdit: Subtajuk | null
  tajukId: string
  tajukNama: string
  susunanSeterusnya: number
  onTutup: () => void
  onBerjaya: () => void
}) {
  // Mod: 'satu' (tambah/edit satu) atau 'pukal' (banyak sekaligus — hanya untuk baharu).
  const [mod, setMod] = useState<'satu' | 'pukal'>('satu')

  const [nama, setNama] = useState(subtajukEdit?.nama ?? '')
  const [susunan, setSusunan] = useState(String(subtajukEdit?.susunan ?? susunanSeterusnya))
  const [fen, setFen] = useState(subtajukEdit?.fen ?? '')
  const [nota, setNota] = useState(subtajukEdit?.nota ?? '')
  const [pautan, setPautan] = useState(subtajukEdit?.pautan ?? '')
  // PGN: 'fail' (upload) atau 'teks' (tampal)
  const [modPgn, setModPgn] = useState<'fail' | 'teks'>(subtajukEdit?.pgn_teks ? 'teks' : 'fail')
  const [pgnTeks, setPgnTeks] = useState(subtajukEdit?.pgn_teks ?? '')
  const [fail, setFail] = useState<File | null>(null)
  const inputFail = useRef<HTMLInputElement>(null)

  // Mod pukal
  const [pukalTeks, setPukalTeks] = useState('')

  const [loading, setLoading] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)
  const [sahPadam, setSahPadam] = useState(false)
  useTutupEscape(onTutup)

  const simpanSatu = async () => {
    if (!nama.trim()) { setRalat('Sila isi nama subtajuk.'); return }
    if (modPgn === 'fail' && fail) {
      const rf = sahkanFailPgn(fail)
      if (rf) { setRalat(rf); return }
    }
    setRalat(null)
    setLoading(true)
    const supabase = createClient()

    // Rekod asas — medan fail PGN dikendali berasingan di bawah.
    const rekod: {
      tajuk_id: string
      nama: string
      susunan: number
      fen: string | null
      nota: string | null
      pautan: string | null
      pgn_teks: string | null
      pgn_path?: string | null
      pgn_nama?: string | null
      pgn_saiz?: number | null
    } = {
      tajuk_id: tajukId,
      nama: nama.trim(),
      susunan: Number(susunan) || 100,
      fen: fen.trim() || null,
      nota: nota.trim() || null,
      pautan: pautan.trim() || null,
      pgn_teks: modPgn === 'teks' ? (pgnTeks.trim() || null) : null,
    }
    // Bila mod teks, kosongkan medan fail (buang fail lama dari storan jika ada).
    if (modPgn === 'teks') {
      rekod.pgn_path = null
      rekod.pgn_nama = null
      rekod.pgn_saiz = null
      if (subtajukEdit?.pgn_path) await supabase.storage.from(PGN_BUCKET).remove([subtajukEdit.pgn_path])
    }

    let subtajukId = subtajukEdit?.id ?? ''
    if (subtajukEdit) {
      const { error } = await supabase.from('silibus_subtajuk').update(rekod).eq('id', subtajukEdit.id)
      if (error) { console.error(error); setLoading(false); setRalat('Gagal simpan. Cuba lagi.'); return }
    } else {
      const { data, error } = await supabase.from('silibus_subtajuk').insert(rekod).select('id').single()
      if (error || !data) { console.error(error); setLoading(false); setRalat('Gagal simpan. Cuba lagi.'); return }
      subtajukId = data.id
    }

    // Muat naik fail PGN (jika mod fail + fail baharu dipilih).
    if (modPgn === 'fail' && fail) {
      const path = pathPgn(subtajukId)
      const { error: errUpload } = await supabase.storage.from(PGN_BUCKET).upload(path, fail, { upsert: true })
      if (errUpload) {
        console.error(errUpload)
        setLoading(false)
        setRalat('Subtajuk disimpan tetapi fail PGN gagal dimuat naik. Cuba muat naik semula melalui Edit.')
        return
      }
      const { error: errUpd } = await supabase
        .from('silibus_subtajuk')
        .update({ pgn_path: path, pgn_nama: fail.name, pgn_saiz: fail.size })
        .eq('id', subtajukId)
      if (errUpd) console.error(errUpd)
    }

    setLoading(false)
    toast.success(subtajukEdit ? 'Subtajuk dikemaskini.' : 'Subtajuk ditambah.')
    onBerjaya()
  }

  const simpanPukal = async () => {
    const nama2 = pukalTeks.split('\n').map((s) => s.trim()).filter(Boolean)
    if (nama2.length === 0) { setRalat('Sila tampal sekurang-kurangnya satu nama subtajuk (satu baris satu).'); return }
    setRalat(null)
    setLoading(true)
    const baris = nama2.map((n, i) => ({
      tajuk_id: tajukId,
      nama: n,
      susunan: susunanSeterusnya + i,
    }))
    const { error } = await createClient().from('silibus_subtajuk').insert(baris)
    setLoading(false)
    if (error) { console.error(error); setRalat('Gagal simpan. Cuba lagi.'); return }
    toast.success(`${nama2.length} subtajuk ditambah.`)
    onBerjaya()
  }

  const padam = async () => {
    if (!subtajukEdit) return
    if (!sahPadam) { setSahPadam(true); return }
    setLoading(true)
    const supabase = createClient()
    if (subtajukEdit.pgn_path) await supabase.storage.from(PGN_BUCKET).remove([subtajukEdit.pgn_path])
    const { error } = await supabase.from('silibus_subtajuk').delete().eq('id', subtajukEdit.id)
    setLoading(false)
    if (error) { console.error(error); setRalat('Gagal padam. Cuba lagi.'); return }
    toast.success('Subtajuk dipadam.')
    onBerjaya()
  }

  const bilPukal = pukalTeks.split('\n').map((s) => s.trim()).filter(Boolean).length

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
  const togolKecil = (aktif: boolean) => ({
    padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
    background: aktif ? 'var(--accent)' : 'var(--bg)', color: aktif ? 'var(--accent-text)' : 'var(--text-muted)',
    border: aktif ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
  })

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={(e) => { if (e.target === e.currentTarget) onTutup() }}
      role="dialog"
      aria-modal="true"
      aria-label={subtajukEdit ? 'Edit Subtajuk' : 'Tambah Subtajuk'}
    >
      <div style={{ background: 'var(--card)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)' }}>
              {subtajukEdit ? 'Edit Subtajuk' : 'Tambah Subtajuk'}
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{tajukNama}</p>
          </div>
          <button onClick={onTutup} aria-label="Tutup" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Togol mod satu / pukal — hanya untuk subtajuk baharu */}
        {!subtajukEdit && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button type="button" onClick={() => setMod('satu')} style={togol(mod === 'satu')}>Satu Subtajuk</button>
            <button type="button" onClick={() => setMod('pukal')} style={togol(mod === 'pukal')}>Tambah Pukal</button>
          </div>
        )}

        {mod === 'pukal' && !subtajukEdit ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={labelStyle}>Senarai Subtajuk (satu baris = satu subtajuk)</label>
            <textarea
              value={pukalTeks}
              onChange={(e) => setPukalTeks(e.target.value)}
              rows={12}
              placeholder={'Bab 1: Introduction\nBab 2: 2...Bf5\nBab 3: 2...Nf6\n...'}
              style={{ ...modalInput, resize: 'vertical', lineHeight: 1.5 }}
              autoFocus
            />
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {bilPukal > 0 ? `${bilPukal} subtajuk akan ditambah.` : 'Tampal nama bab/subtajuk, satu setiap baris.'} Bahan (FEN, PGN, nota, pautan) boleh diisi kemudian melalui Edit.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Nama Subtajuk</label>
                <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="cth. Italian Game" style={modalInput} autoFocus />
              </div>
              <div>
                <label style={labelStyle}>Susunan</label>
                <input type="number" value={susunan} onChange={(e) => setSusunan(e.target.value)} style={modalInput} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>FEN (kedudukan papan — pilihan)</label>
              <input
                type="text"
                value={fen}
                onChange={(e) => setFen(e.target.value)}
                placeholder="rnbqkbnr/pppppppp/8/8/..."
                style={{ ...modalInput, fontFamily: 'monospace', fontSize: '12.5px' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>PGN (permainan — pilihan)</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" onClick={() => setModPgn('fail')} style={togolKecil(modPgn === 'fail')}>Upload Fail</button>
                  <button type="button" onClick={() => setModPgn('teks')} style={togolKecil(modPgn === 'teks')}>Tampal Teks</button>
                </div>
              </div>

              {modPgn === 'fail' ? (
                <div>
                  <input ref={inputFail} type="file" accept={PGN_ACCEPT} onChange={(e) => setFail(e.target.files?.[0] ?? null)} style={{ display: 'none' }} />
                  <button
                    type="button"
                    onClick={() => inputFail.current?.click()}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', width: '100%', background: 'var(--bg)', border: '1.5px dashed var(--border)', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    <Upload size={15} />
                    {fail ? `${fail.name} (${saizFail(fail.size)})` : subtajukEdit?.pgn_nama ? `Ganti: ${subtajukEdit.pgn_nama}` : 'Pilih fail .pgn'}
                  </button>
                  {subtajukEdit?.pgn_path && !fail && (
                    <p style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '6px' }}>
                      <FileText size={12} /> Fail semasa: {subtajukEdit.pgn_nama ?? 'fail.pgn'}
                    </p>
                  )}
                </div>
              ) : (
                <textarea
                  value={pgnTeks}
                  onChange={(e) => setPgnTeks(e.target.value)}
                  rows={4}
                  placeholder={'[Event "..."]\n1. e4 e5 2. Nf3 Nc6 ...'}
                  style={{ ...modalInput, resize: 'vertical', fontFamily: 'monospace', fontSize: '12.5px' }}
                />
              )}
            </div>

            <div>
              <label style={labelStyle}>Nota (pilihan)</label>
              <textarea value={nota} onChange={(e) => setNota(e.target.value)} rows={2} style={{ ...modalInput, resize: 'vertical' }} />
            </div>

            <div>
              <label style={labelStyle}>Pautan URL (pilihan)</label>
              <input
                type="url"
                value={pautan}
                onChange={(e) => setPautan(e.target.value)}
                placeholder="https://lichess.org/study/..."
                style={modalInput}
              />
            </div>
          </div>
        )}

        {ralat && (
          <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#9F1239', marginTop: '14px' }}>
            {ralat}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          {subtajukEdit && (
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
            onClick={mod === 'pukal' && !subtajukEdit ? simpanPukal : simpanSatu}
            disabled={loading}
            style={{ flex: 2, padding: '11px', background: loading ? '#94A3B8' : 'var(--accent)', border: 'none', borderRadius: '12px', fontSize: '13.5px', fontWeight: 700, color: 'var(--accent-text)', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
          >
            {loading ? 'Menyimpan...' : mod === 'pukal' && !subtajukEdit ? `Tambah ${bilPukal || ''} Subtajuk` : subtajukEdit ? 'Simpan Perubahan' : 'Tambah'}
          </button>
        </div>
      </div>
    </div>
  )
}
