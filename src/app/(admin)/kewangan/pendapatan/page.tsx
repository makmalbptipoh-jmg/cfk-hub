'use client'

import { useState, useEffect, useCallback } from 'react'
import { Edit2, Paperclip, Plus, Trash2, Upload, TrendingUp, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { akhirBulan, formatRinggit, formatTarikh, tarikhTempatan, bulanTempatan } from '@/lib/utils'
import { useTutupEscape } from '@/lib/hooks/useTutupEscape'
import { toast } from '@/lib/stores/toast-store'

const KATEGORI = [
  'Sumbangan',
  'Penajaan',
  'Yuran Program Luar',
  'Sewa & Faedah',
  'Lain-lain',
]

const KAEDAH = ['Transfer', 'Tunai'] as const

type Pendapatan = {
  id: string
  tarikh: string
  sumber: string
  kategori: string
  jumlah: number
  kaedah: string
  cawangan_id: string | null
  nota: string | null
  bukti_path: string | null
  cawangan: { id: string; nama: string } | null
}

const BUKTI_BUCKET = 'bukti-pendapatan'
const BUKTI_ACCEPT = '.jpg,.jpeg,.png,.webp,.pdf'
const BUKTI_MAX_SAIZ = 5 * 1024 * 1024 // 5MB

function pathBukti(rekodId: string, tarikh: string, namaFail: string) {
  const ext = namaFail.split('.').pop()?.toLowerCase() ?? 'jpg'
  return `${tarikh.slice(0, 4)}/${rekodId}.${ext}`
}

function sahkanFailBukti(file: File): string | null {
  if (file.size > BUKTI_MAX_SAIZ) return 'Fail terlalu besar. Had maksimum 5MB.'
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!['jpg', 'jpeg', 'png', 'webp', 'pdf'].includes(ext)) return 'Hanya fail imej (JPG/PNG/WebP) atau PDF dibenarkan.'
  return null
}

const gayaInput = {
  padding: '9px 12px',
  border: '1.5px solid var(--border)',
  borderRadius: '10px',
  fontSize: '13.5px',
  color: 'var(--text)',
  background: 'var(--card)',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box' as const,
}

export default function PendapatanLainPage() {
  const [bulan, setBulan] = useState(bulanTempatan())
  const [filterKategori, setFilterKategori] = useState('')
  const [filterCawangan, setFilterCawangan] = useState('')
  const [senarai, setSenarai] = useState<Pendapatan[]>([])
  const [cawangan, setCawangan] = useState<{ id: string; nama: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [rekodEdit, setRekodEdit] = useState<Pendapatan | null>(null)
  const [jumlahTotal, setJumlahTotal] = useState(0)
  const [uploadingId, setUploadingId] = useState<string | null>(null)

  const muatData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const [y, m] = bulan.split('-')
    const mula = `${y}-${m}-01`
    const akhir = akhirBulan(+y, +m)

    let q = supabase
      .from('pendapatan_lain')
      .select('id, tarikh, sumber, kategori, jumlah, kaedah, cawangan_id, nota, bukti_path, cawangan:cawangan_id(id, nama)')
      .gte('tarikh', mula)
      .lte('tarikh', akhir)

    if (filterKategori) q = q.eq('kategori', filterKategori)
    if (filterCawangan === '__umum__') q = q.is('cawangan_id', null)
    else if (filterCawangan) q = q.eq('cawangan_id', filterCawangan)

    q = q.order('tarikh', { ascending: false })

    const [{ data }, { data: caw }] = await Promise.all([
      q,
      supabase.from('cawangan').select('id, nama').eq('status', 'Aktif').order('nama'),
    ])

    const hasil = (data ?? []) as unknown as Pendapatan[]
    setSenarai(hasil)
    setCawangan(caw ?? [])
    setJumlahTotal(hasil.reduce((s, p) => s + p.jumlah, 0))
    setLoading(false)
  }, [bulan, filterKategori, filterCawangan])

  useEffect(() => {
    muatData()
  }, [muatData])

  const padam = async (p: Pendapatan) => {
    if (!confirm('Padam rekod pendapatan ini?')) return
    const supabase = createClient()
    if (p.bukti_path) await supabase.storage.from(BUKTI_BUCKET).remove([p.bukti_path])
    await supabase.from('pendapatan_lain').delete().eq('id', p.id)
    muatData()
  }

  const lihatBukti = async (p: Pendapatan) => {
    if (!p.bukti_path) return
    const { data, error } = await createClient()
      .storage.from(BUKTI_BUCKET)
      .createSignedUrl(p.bukti_path, 3600)
    if (error || !data?.signedUrl) { toast.error('Gagal buka bukti. Cuba lagi.'); return }
    window.open(data.signedUrl, '_blank', 'noopener')
  }

  const uploadBukti = async (p: Pendapatan, file: File) => {
    const ralatFail = sahkanFailBukti(file)
    if (ralatFail) { toast.error(ralatFail); return }
    setUploadingId(p.id)
    const supabase = createClient()
    const path = pathBukti(p.id, p.tarikh, file.name)
    const { error: errUpload } = await supabase.storage
      .from(BUKTI_BUCKET)
      .upload(path, file, { upsert: true })
    if (errUpload) {
      toast.error('Gagal muat naik bukti. Cuba lagi.')
      setUploadingId(null)
      return
    }
    if (p.bukti_path && p.bukti_path !== path) {
      await supabase.storage.from(BUKTI_BUCKET).remove([p.bukti_path])
    }
    const { error: errUpdate } = await supabase
      .from('pendapatan_lain')
      .update({ bukti_path: path })
      .eq('id', p.id)
    setUploadingId(null)
    if (errUpdate) { toast.error('Bukti dimuat naik tetapi gagal disimpan pada rekod. Cuba lagi.'); return }
    toast.success('Bukti pendapatan dimuat naik.')
    muatData()
  }

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Bulan
          </label>
          <input type="month" value={bulan} onChange={(e) => setBulan(e.target.value)} style={gayaInput} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Kategori
          </label>
          <select value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)} style={gayaInput}>
            <option value="">Semua Kategori</option>
            {KATEGORI.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Cawangan
          </label>
          <select value={filterCawangan} onChange={(e) => setFilterCawangan(e.target.value)} style={gayaInput}>
            <option value="">Semua</option>
            <option value="__umum__">Umum (tiada cawangan)</option>
            {cawangan.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
          </select>
        </div>

        <button
          onClick={() => setModal(true)}
          style={{
            marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px',
            padding: '10px 16px', background: 'var(--accent)', border: 'none', borderRadius: '12px',
            fontSize: '13.5px', fontWeight: 700, color: 'var(--accent-text)', cursor: 'pointer',
            fontFamily: 'inherit', whiteSpace: 'nowrap',
          }}
        >
          <Plus size={14} /> Rekod Pendapatan
        </button>
      </div>

      {/* Jumlah total */}
      {!loading && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 18px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{senarai.length} rekod</span>
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#166534' }}>
            Jumlah: {formatRinggit(jumlahTotal)}
          </span>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Memuatkan...</div>
      ) : senarai.length === 0 ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '48px', textAlign: 'center' }}>
          <TrendingUp size={32} style={{ color: 'var(--border)', margin: '0 auto 12px', display: 'block' }} />
          <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            Tiada rekod pendapatan lain
          </p>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
            Klik &quot;Rekod Pendapatan&quot; untuk rekod sumbangan, penajaan atau pendapatan luar.
          </p>
        </div>
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                {['Tarikh', 'Kategori', 'Sumber', 'Kaedah', 'Cawangan', 'Jumlah', 'Bukti', ''].map((h) => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {senarai.map((p, i) => (
                <tr
                  key={p.id}
                  style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFBFC' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <td style={{ padding: '10px 14px', fontSize: '12.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {formatTarikh(p.tarikh)}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: '11.5px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600, background: '#F0FDF4', color: '#15803D' }}>
                      {p.kategori}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: '13px', color: 'var(--text)' }}>
                    {p.sumber}
                    {p.nota && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{p.nota}</div>}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--text-muted)' }}>{p.kaedah}</td>
                  <td style={{ padding: '10px 14px', fontSize: '12.5px', color: 'var(--text-muted)' }}>{p.cawangan?.nama ?? 'Umum'}</td>
                  <td style={{ padding: '10px 14px', fontSize: '14px', fontWeight: 700, color: '#166534', whiteSpace: 'nowrap' }}>
                    {formatRinggit(p.jumlah)}
                  </td>
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                    {p.bukti_path ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => lihatBukti(p)}
                          title="Lihat bukti"
                          aria-label={`Lihat bukti pendapatan ${p.sumber}`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '20px', fontSize: '11.5px', fontWeight: 600, color: '#15803D', cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                          <Paperclip size={12} /> Lihat
                        </button>
                        <label
                          title="Ganti bukti"
                          aria-label={`Ganti bukti pendapatan ${p.sumber}`}
                          style={{ display: 'inline-flex', alignItems: 'center', cursor: uploadingId === p.id ? 'wait' : 'pointer', color: 'var(--text-muted)', opacity: 0.7 }}
                        >
                          <Upload size={12} />
                          <input type="file" accept={BUKTI_ACCEPT} disabled={uploadingId !== null} style={{ display: 'none' }}
                            onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ''; if (file) uploadBukti(p, file) }} />
                        </label>
                      </span>
                    ) : (
                      <label
                        title="Muat naik bukti (imej/PDF)"
                        aria-label={`Muat naik bukti pendapatan ${p.sumber}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: 'var(--bg)', border: '1px dashed var(--border)', borderRadius: '20px', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)', cursor: uploadingId === p.id ? 'wait' : 'pointer' }}
                      >
                        <Upload size={12} />
                        {uploadingId === p.id ? 'Memuat naik...' : 'Upload'}
                        <input type="file" accept={BUKTI_ACCEPT} disabled={uploadingId !== null} style={{ display: 'none' }}
                          onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ''; if (file) uploadBukti(p, file) }} />
                      </label>
                    )}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <button
                        onClick={() => setRekodEdit(p)}
                        title="Edit"
                        aria-label={`Edit pendapatan ${p.sumber}`}
                        style={{ padding: '5px 8px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', cursor: 'pointer', color: '#1E40AF', display: 'flex', alignItems: 'center' }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => padam(p)}
                        title="Padam"
                        aria-label={`Padam pendapatan ${p.sumber}`}
                        style={{ padding: '5px 8px', background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '8px', color: '#9F1239', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(modal || rekodEdit) && (
        <ModalTambahPendapatan
          rekodEdit={rekodEdit}
          cawangan={cawangan}
          onTutup={() => { setModal(false); setRekodEdit(null) }}
          onBerjaya={(tarikhBaru) => {
            const edit = !!rekodEdit
            setModal(false)
            setRekodEdit(null)
            const bulanBaru = tarikhBaru.slice(0, 7)
            const labelBulan = new Date(tarikhBaru + 'T00:00:00').toLocaleString('ms-MY', { month: 'long', year: 'numeric' })
            toast.success(edit ? 'Pendapatan dikemaskini.' : `Pendapatan disimpan (${labelBulan}).`)
            if (bulanBaru !== bulan) setBulan(bulanBaru)
            else muatData()
          }}
        />
      )}
    </div>
  )
}

function ModalTambahPendapatan({
  rekodEdit,
  cawangan,
  onTutup,
  onBerjaya,
}: {
  rekodEdit?: Pendapatan | null
  cawangan: { id: string; nama: string }[]
  onTutup: () => void
  onBerjaya: (tarikh: string) => void
}) {
  const edit = !!rekodEdit
  const [tarikh, setTarikh] = useState(rekodEdit?.tarikh ?? tarikhTempatan())
  const [kategori, setKategori] = useState(rekodEdit?.kategori ?? KATEGORI[0])
  const [sumber, setSumber] = useState(rekodEdit?.sumber ?? '')
  const [jumlah, setJumlah] = useState(rekodEdit ? String(rekodEdit.jumlah) : '')
  const [kaedah, setKaedah] = useState<(typeof KAEDAH)[number]>((rekodEdit?.kaedah as (typeof KAEDAH)[number]) ?? 'Transfer')
  const [cawanganId, setCawanganId] = useState(rekodEdit?.cawangan_id ?? '')
  const [nota, setNota] = useState(rekodEdit?.nota ?? '')
  const [failBukti, setFailBukti] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)
  useTutupEscape(onTutup)

  const simpan = async () => {
    if (!sumber.trim()) { setRalat('Sila isi sumber / nama penyumbang.'); return }
    if (!jumlah || +jumlah <= 0) { setRalat('Jumlah mesti lebih dari 0.'); return }
    if (failBukti) {
      const ralatFail = sahkanFailBukti(failBukti)
      if (ralatFail) { setRalat(ralatFail); return }
    }
    setLoading(true)
    setRalat(null)
    const supabase = createClient()
    const medan = {
      tarikh,
      kategori,
      sumber: sumber.trim(),
      jumlah: +jumlah,
      kaedah,
      cawangan_id: cawanganId || null,
      nota: nota.trim() || null,
    }

    let rekodId: string
    if (edit && rekodEdit) {
      const { error } = await supabase.from('pendapatan_lain').update(medan).eq('id', rekodEdit.id)
      if (error) { setRalat('Gagal simpan. Cuba lagi.'); setLoading(false); return }
      rekodId = rekodEdit.id
    } else {
      const { data: rekod, error } = await supabase
        .from('pendapatan_lain')
        .insert(medan)
        .select('id')
        .single()
      if (error || !rekod) { setRalat('Gagal simpan. Cuba lagi.'); setLoading(false); return }
      rekodId = rekod.id
    }

    if (failBukti) {
      const path = pathBukti(rekodId, tarikh, failBukti.name)
      const { error: errUpload } = await supabase.storage
        .from(BUKTI_BUCKET)
        .upload(path, failBukti, { upsert: true })
      if (errUpload) {
        toast.error('Rekod disimpan tetapi bukti gagal dimuat naik. Guna butang Upload dalam jadual.')
      } else {
        await supabase.from('pendapatan_lain').update({ bukti_path: path }).eq('id', rekodId)
      }
    }
    onBerjaya(tarikh)
  }

  const modalInput = { ...gayaInput, width: '100%' }
  const labelStyle = { display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={(e) => { if (e.target === e.currentTarget) onTutup() }}
      role="dialog"
      aria-modal="true"
      aria-label={edit ? 'Edit Pendapatan Lain' : 'Rekod Pendapatan Lain'}
    >
      <div style={{ background: 'var(--card)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)' }}>{edit ? 'Edit Pendapatan Lain' : 'Rekod Pendapatan Lain'}</h2>
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
              <label style={labelStyle}>Kategori</label>
              <select value={kategori} onChange={(e) => setKategori(e.target.value)} style={modalInput}>
                {KATEGORI.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Sumber / Penyumbang</label>
            <input value={sumber} onChange={(e) => setSumber(e.target.value)} placeholder="Cth: Syarikat ABC Sdn Bhd" style={modalInput} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Jumlah (RM)</label>
              <input type="number" min="0" step="0.01" value={jumlah} onChange={(e) => setJumlah(e.target.value)} placeholder="0.00" style={modalInput} />
            </div>
            <div>
              <label style={labelStyle}>Kaedah Terima</label>
              <select value={kaedah} onChange={(e) => setKaedah(e.target.value as (typeof KAEDAH)[number])} style={modalInput}>
                {KAEDAH.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Cawangan (pilihan)</label>
            <select value={cawanganId} onChange={(e) => setCawanganId(e.target.value)} style={modalInput}>
              <option value="">Umum</option>
              {cawangan.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Nota (pilihan)</label>
            <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Cth: Tajaan pertandingan catur negeri" style={modalInput} />
          </div>

          <div>
            <label style={labelStyle}>Bukti / Resit (pilihan)</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', border: '1.5px dashed var(--border)', borderRadius: '10px', fontSize: '13px', color: failBukti ? 'var(--text)' : 'var(--text-muted)', cursor: 'pointer', background: 'var(--bg)' }}>
              <Upload size={14} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {failBukti ? failBukti.name : 'Pilih fail imej atau PDF (max 5MB)'}
              </span>
              {failBukti && (
                <button onClick={(e) => { e.preventDefault(); setFailBukti(null) }} aria-label="Buang fail bukti"
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', marginLeft: 'auto', display: 'flex', flexShrink: 0 }}>
                  <X size={14} />
                </button>
              )}
              <input type="file" accept={BUKTI_ACCEPT} style={{ display: 'none' }}
                onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ''; if (file) setFailBukti(file) }} />
            </label>
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
            {loading ? 'Menyimpan...' : edit ? 'Simpan Perubahan' : 'Simpan Pendapatan'}
          </button>
        </div>
      </div>
    </div>
  )
}
