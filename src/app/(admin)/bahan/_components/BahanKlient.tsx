'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Library, Plus, Upload, FileText, Trash2, Pencil, X, Paperclip } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/stores/toast-store'
import { useTutupEscape } from '@/lib/hooks/useTutupEscape'
import { formatTarikh } from '@/lib/utils'
import {
  BAHAN_ACCEPT,
  BAHAN_BUCKET,
  pathBahan,
  sahkanFailBahan,
  saizFail,
} from '@/lib/progresPelajar'

type Buku = {
  id: string
  nama: string
  pengarang: string | null
  fail_path: string | null
  fail_nama: string | null
  fail_saiz: number | null
  nota: string | null
  created_at: string
}

const gayaInput = {
  padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: '10px',
  fontSize: '13.5px', color: 'var(--text)', background: 'var(--card)', outline: 'none',
  fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' as const,
}
const labelStyle = {
  display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)',
  marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.05em',
}

export function BahanKlient() {
  const [senarai, setSenarai] = useState<Buku[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ buka: boolean; edit: Buku | null }>({ buka: false, edit: null })
  const [sahPadam, setSahPadam] = useState<string | null>(null)
  const [sibuk, setSibuk] = useState<string | null>(null)

  const muatData = useCallback(async () => {
    setLoading(true)
    const { data, error } = await createClient()
      .from('buku_rujukan')
      .select('id, nama, pengarang, fail_path, fail_nama, fail_saiz, nota, created_at')
      .eq('status', 'Aktif')
      .order('nama')
    if (error) {
      console.error(error)
      toast.error('Gagal muat senarai buku. Cuba refresh page.')
    }
    setSenarai((data ?? []) as Buku[])
    setLoading(false)
  }, [])

  useEffect(() => { muatData() }, [muatData])

  const bukaFail = async (b: Buku) => {
    if (!b.fail_path) return
    setSibuk(b.id)
    const { data, error } = await createClient()
      .storage.from(BAHAN_BUCKET)
      .createSignedUrl(b.fail_path, 3600)
    setSibuk(null)
    if (error || !data?.signedUrl) { toast.error('Gagal buka fail. Cuba lagi.'); return }
    window.open(data.signedUrl, '_blank', 'noopener')
  }

  const padam = async (b: Buku) => {
    if (sahPadam !== b.id) { setSahPadam(b.id); return }
    setSibuk(b.id)
    const supabase = createClient()
    if (b.fail_path) await supabase.storage.from(BAHAN_BUCKET).remove([b.fail_path])
    const { error } = await supabase.from('buku_rujukan').delete().eq('id', b.id)
    setSibuk(null)
    setSahPadam(null)
    if (error) { toast.error('Gagal padam buku. Cuba lagi.'); return }
    toast.success('Buku dipadam. Topik yang merujuk buku ini kekal, cuma tiada buku.')
    muatData()
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Library size={20} style={{ color: 'var(--text-muted)' }} /> Bahan &amp; Buku
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Buku / modul yang digunakan mengajar. Boleh muat naik fail PDF atau imej, dan rujuk buku + muka surat dalam progress pelajar.
          </p>
        </div>
        <button
          onClick={() => setModal({ buka: true, edit: null })}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'var(--accent)', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--accent-text)', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <Plus size={15} /> Tambah Buku
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Memuatkan...</div>
      ) : senarai.length === 0 ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '48px', textAlign: 'center' }}>
          <Library size={32} style={{ color: 'var(--border)', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
            Tiada buku lagi. Klik &quot;Tambah Buku&quot; untuk muat naik buku yang anda guna mengajar.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {senarai.map((b) => (
            <div key={b.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px 18px', display: 'flex', gap: '14px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: b.fail_path ? '#EFF6FF' : 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={20} style={{ color: b.fail_path ? '#1E40AF' : 'var(--text-muted)' }} />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text)' }}>{b.nama}</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
                  {b.pengarang ? `${b.pengarang} · ` : ''}
                  {b.fail_path ? `${b.fail_nama ?? 'fail'} · ${saizFail(b.fail_saiz)}` : 'Tiada fail dimuat naik'}
                  {' · '}Ditambah {formatTarikh(b.created_at.slice(0, 10))}
                </div>
                {b.nota && <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '6px' }}>{b.nota}</div>}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {b.fail_path && (
                  <button
                    onClick={() => bukaFail(b)}
                    disabled={sibuk === b.id}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '8px 12px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '12px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    <Paperclip size={13} /> Buka Fail
                  </button>
                )}
                <button
                  onClick={() => setModal({ buka: true, edit: b })}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '8px 12px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '12px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  <Pencil size={13} /> Edit
                </button>
                <button
                  onClick={() => padam(b)}
                  disabled={sibuk === b.id}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '8px 12px', background: sahPadam === b.id ? '#E11D48' : '#FFF1F2', border: '1.5px solid #FECDD3', borderRadius: '10px', fontSize: '12px', fontWeight: 700, color: sahPadam === b.id ? '#fff' : '#9F1239', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  <Trash2 size={13} /> {sahPadam === b.id ? 'Sah Padam?' : 'Padam'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.buka && (
        <ModalBuku
          rekodEdit={modal.edit}
          onTutup={() => setModal({ buka: false, edit: null })}
          onBerjaya={() => { setModal({ buka: false, edit: null }); muatData() }}
        />
      )}
    </div>
  )
}

function ModalBuku({
  rekodEdit,
  onTutup,
  onBerjaya,
}: {
  rekodEdit: Buku | null
  onTutup: () => void
  onBerjaya: () => void
}) {
  const [nama, setNama] = useState(rekodEdit?.nama ?? '')
  const [pengarang, setPengarang] = useState(rekodEdit?.pengarang ?? '')
  const [nota, setNota] = useState(rekodEdit?.nota ?? '')
  const [fail, setFail] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)
  const inputFail = useRef<HTMLInputElement>(null)
  useTutupEscape(onTutup)

  const pilihFail = (f: File | null) => {
    if (!f) { setFail(null); return }
    const r = sahkanFailBahan(f)
    if (r) { setRalat(r); setFail(null); if (inputFail.current) inputFail.current.value = ''; return }
    setRalat(null)
    setFail(f)
  }

  const simpan = async () => {
    if (!nama.trim()) { setRalat('Sila isi nama buku.'); return }
    setRalat(null)
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const asas = {
      nama: nama.trim(),
      pengarang: pengarang.trim() || null,
      nota: nota.trim() || null,
    }

    // Cipta/kemaskini rekod dahulu — id diperlukan untuk path fail.
    let bukuId = rekodEdit?.id ?? ''
    if (rekodEdit) {
      const { error } = await supabase.from('buku_rujukan').update(asas).eq('id', rekodEdit.id)
      if (error) { console.error(error); setRalat('Gagal simpan buku. Cuba lagi.'); setLoading(false); return }
    } else {
      const { data, error } = await supabase
        .from('buku_rujukan')
        .insert({ ...asas, dimuat_naik_oleh: user?.id ?? null })
        .select('id')
        .single()
      if (error || !data) { console.error(error); setRalat('Gagal simpan buku. Cuba lagi.'); setLoading(false); return }
      bukuId = data.id
    }

    if (fail) {
      const path = pathBahan(bukuId, fail.name)
      const { error: errUpload } = await supabase.storage
        .from(BAHAN_BUCKET)
        .upload(path, fail, { upsert: true })
      if (errUpload) {
        console.error(errUpload)
        setLoading(false)
        setRalat('Butiran buku disimpan tetapi fail gagal dimuat naik. Cuba muat naik semula melalui Edit.')
        return
      }
      // Ganti fail dengan sambungan berbeza (cth .pdf → .jpg) — buang fail lama
      if (rekodEdit?.fail_path && rekodEdit.fail_path !== path) {
        await supabase.storage.from(BAHAN_BUCKET).remove([rekodEdit.fail_path])
      }
      const { error: errUpdate } = await supabase
        .from('buku_rujukan')
        .update({ fail_path: path, fail_nama: fail.name, fail_saiz: fail.size })
        .eq('id', bukuId)
      if (errUpdate) {
        console.error(errUpdate)
        setLoading(false)
        setRalat('Fail dimuat naik tetapi gagal dipautkan pada rekod. Cuba lagi.')
        return
      }
    }

    setLoading(false)
    toast.success(rekodEdit ? 'Buku dikemaskini.' : 'Buku ditambah.')
    onBerjaya()
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={(e) => { if (e.target === e.currentTarget) onTutup() }}
      role="dialog"
      aria-modal="true"
      aria-label={rekodEdit ? 'Edit Buku' : 'Tambah Buku'}
    >
      <div style={{ background: 'var(--card)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)' }}>{rekodEdit ? 'Edit Buku' : 'Tambah Buku'}</h2>
          <button onClick={onTutup} aria-label="Tutup" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Nama Buku / Modul</label>
            <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="cth. Chess Steps Manual 2" style={gayaInput} />
          </div>
          <div>
            <label style={labelStyle}>Pengarang (pilihan)</label>
            <input type="text" value={pengarang} onChange={(e) => setPengarang(e.target.value)} style={gayaInput} />
          </div>
          <div>
            <label style={labelStyle}>Fail Buku (pilihan · PDF atau imej, maks 25MB)</label>
            <input
              ref={inputFail}
              type="file"
              accept={BAHAN_ACCEPT}
              onChange={(e) => pilihFail(e.target.files?.[0] ?? null)}
              style={{ ...gayaInput, padding: '8px', cursor: 'pointer' }}
            />
            {rekodEdit?.fail_nama && !fail && (
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Paperclip size={12} /> Fail semasa: {rekodEdit.fail_nama} ({saizFail(rekodEdit.fail_saiz)}). Pilih fail baharu untuk ganti.
              </div>
            )}
            {fail && (
              <div style={{ fontSize: '11.5px', color: 'var(--success)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Upload size={12} /> {fail.name} ({saizFail(fail.size)}) sedia dimuat naik.
              </div>
            )}
          </div>
          <div>
            <label style={labelStyle}>Nota (pilihan)</label>
            <input type="text" value={nota} onChange={(e) => setNota(e.target.value)} placeholder="cth. untuk pelajar tahap pertengahan" style={gayaInput} />
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
          <button
            onClick={simpan}
            disabled={loading}
            style={{ flex: 2, padding: '11px', background: loading ? '#94A3B8' : 'var(--accent)', border: 'none', borderRadius: '12px', fontSize: '13.5px', fontWeight: 700, color: 'var(--accent-text)', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
          >
            {loading ? 'Menyimpan...' : rekodEdit ? 'Simpan Perubahan' : 'Tambah Buku'}
          </button>
        </div>
      </div>
    </div>
  )
}
