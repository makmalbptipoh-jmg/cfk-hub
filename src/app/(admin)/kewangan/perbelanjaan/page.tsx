'use client'

import { useState, useEffect, useCallback } from 'react'
import { Paperclip, Plus, Trash2, Upload, Wallet, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { akhirBulan, formatRinggit, formatTarikh } from '@/lib/utils'
import { useTutupEscape } from '@/lib/hooks/useTutupEscape'
import { toast } from '@/lib/stores/toast-store'

const KATEGORI = [
  'Sewa',
  'Utiliti',
  'Peralatan Catur',
  'Pengangkutan',
  'Bahan Promosi',
  'Makanan & Minuman',
  'Lain-lain',
]

type Perbelanjaan = {
  id: string
  tarikh: string
  kategori: string
  penerangan: string
  jumlah: number
  cawangan_id: string | null
  bukti_path: string | null
  cawangan: { id: string; nama: string } | null
}

// Bucket peribadi Supabase Storage untuk fail bukti (resit) perbelanjaan
const BUKTI_BUCKET = 'bukti-perbelanjaan'
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

export default function PerbelanjaanPage() {
  const bulanDefault = new Date().toISOString().slice(0, 7)
  const [bulan, setBulan] = useState(bulanDefault)
  const [filterKategori, setFilterKategori] = useState('')
  const [filterCawangan, setFilterCawangan] = useState('')
  const [senarai, setSenarai] = useState<Perbelanjaan[]>([])
  const [cawangan, setCawangan] = useState<{ id: string; nama: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [jumlahTotal, setJumlahTotal] = useState(0)

  const muatData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const [y, m] = bulan.split('-')
    const mula = `${y}-${m}-01`
    const akhir = akhirBulan(+y, +m)

    let q = supabase
      .from('kewangan_perbelanjaan')
      .select('id, tarikh, kategori, penerangan, jumlah, cawangan_id, bukti_path, cawangan:cawangan_id(id, nama)')
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

    const hasil = (data ?? []) as unknown as Perbelanjaan[]
    setSenarai(hasil)
    setCawangan(caw ?? [])
    setJumlahTotal(hasil.reduce((s, p) => s + p.jumlah, 0))
    setLoading(false)
  }, [bulan, filterKategori, filterCawangan])

  useEffect(() => {
    muatData()
  }, [muatData])

  const padam = async (p: Perbelanjaan) => {
    if (!confirm('Padam rekod perbelanjaan ini?')) return
    const supabase = createClient()
    if (p.bukti_path) await supabase.storage.from(BUKTI_BUCKET).remove([p.bukti_path])
    await supabase.from('kewangan_perbelanjaan').delete().eq('id', p.id)
    muatData()
  }

  const [uploadingId, setUploadingId] = useState<string | null>(null)

  const lihatBukti = async (p: Perbelanjaan) => {
    if (!p.bukti_path) return
    const { data, error } = await createClient()
      .storage.from(BUKTI_BUCKET)
      .createSignedUrl(p.bukti_path, 3600)
    if (error || !data?.signedUrl) { toast.error('Gagal buka bukti. Cuba lagi.'); return }
    window.open(data.signedUrl, '_blank', 'noopener')
  }

  const uploadBukti = async (p: Perbelanjaan, file: File) => {
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
    // Jika ganti fail dengan sambungan berbeza (cth. .jpg → .pdf), padam fail lama
    if (p.bukti_path && p.bukti_path !== path) {
      await supabase.storage.from(BUKTI_BUCKET).remove([p.bukti_path])
    }
    const { error: errUpdate } = await supabase
      .from('kewangan_perbelanjaan')
      .update({ bukti_path: path })
      .eq('id', p.id)
    setUploadingId(null)
    if (errUpdate) { toast.error('Bukti dimuat naik tetapi gagal disimpan pada rekod. Cuba lagi.'); return }
    toast.success('Bukti perbelanjaan dimuat naik.')
    muatData()
  }

  return (
    <div>
      {/* Filter bar */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          marginBottom: '20px',
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Bulan
          </label>
          <input
            type="month"
            value={bulan}
            onChange={(e) => setBulan(e.target.value)}
            style={gayaInput}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Kategori
          </label>
          <select value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)} style={gayaInput}>
            <option value="">Semua Kategori</option>
            {KATEGORI.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Cawangan
          </label>
          <select value={filterCawangan} onChange={(e) => setFilterCawangan(e.target.value)} style={gayaInput}>
            <option value="">Semua</option>
            <option value="__umum__">Umum (tiada cawangan)</option>
            {cawangan.map((c) => (
              <option key={c.id} value={c.id}>{c.nama}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setModal(true)}
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 16px',
            background: 'var(--accent)',
            border: 'none',
            borderRadius: '12px',
            fontSize: '13.5px',
            fontWeight: 700,
            color: 'var(--accent-text)',
            cursor: 'pointer',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}
        >
          <Plus size={14} /> Tambah Perbelanjaan
        </button>
      </div>

      {/* Jumlah total */}
      {!loading && (
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '12px 18px',
            marginBottom: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{senarai.length} rekod</span>
          <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)' }}>
            Jumlah: {formatRinggit(jumlahTotal)}
          </span>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Memuatkan...</div>
      ) : senarai.length === 0 ? (
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '48px',
            textAlign: 'center',
          }}
        >
          <Wallet size={32} style={{ color: 'var(--border)', margin: '0 auto 12px', display: 'block' }} />
          <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            Tiada rekod perbelanjaan
          </p>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
            Klik "Tambah Perbelanjaan" untuk mula rekod.
          </p>
        </div>
      ) : (
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                {['Tarikh', 'Kategori', 'Penerangan', 'Cawangan', 'Jumlah', 'Bukti', ''].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '9px 14px',
                      textAlign: 'left',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
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
                    <span
                      style={{
                        fontSize: '11.5px',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontWeight: 600,
                        background: '#F1F5F9',
                        color: '#475569',
                      }}
                    >
                      {p.kategori}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: '13px', color: 'var(--text)' }}>{p.penerangan}</td>
                  <td style={{ padding: '10px 14px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    {p.cawangan?.nama ?? 'Umum'}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
                    {formatRinggit(p.jumlah)}
                  </td>
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                    {p.bukti_path ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => lihatBukti(p)}
                          title="Lihat bukti"
                          aria-label={`Lihat bukti perbelanjaan ${p.penerangan}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            background: '#F0FDF4',
                            border: '1px solid #BBF7D0',
                            borderRadius: '20px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            color: '#15803D',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                          }}
                        >
                          <Paperclip size={12} /> Lihat
                        </button>
                        <label
                          title="Ganti bukti"
                          aria-label={`Ganti bukti perbelanjaan ${p.penerangan}`}
                          style={{ display: 'inline-flex', alignItems: 'center', cursor: uploadingId === p.id ? 'wait' : 'pointer', color: 'var(--text-muted)', opacity: 0.7 }}
                        >
                          <Upload size={12} />
                          <input
                            type="file"
                            accept={BUKTI_ACCEPT}
                            disabled={uploadingId !== null}
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              e.target.value = ''
                              if (file) uploadBukti(p, file)
                            }}
                          />
                        </label>
                      </span>
                    ) : (
                      <label
                        title="Muat naik bukti (imej/PDF)"
                        aria-label={`Muat naik bukti perbelanjaan ${p.penerangan}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 10px',
                          background: 'var(--bg)',
                          border: '1px dashed var(--border)',
                          borderRadius: '20px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          color: 'var(--text-muted)',
                          cursor: uploadingId === p.id ? 'wait' : 'pointer',
                        }}
                      >
                        <Upload size={12} />
                        {uploadingId === p.id ? 'Memuat naik...' : 'Upload'}
                        <input
                          type="file"
                          accept={BUKTI_ACCEPT}
                          disabled={uploadingId !== null}
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            e.target.value = ''
                            if (file) uploadBukti(p, file)
                          }}
                        />
                      </label>
                    )}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <button
                      onClick={() => padam(p)}
                      title="Padam"
                      aria-label={`Padam perbelanjaan ${p.penerangan}`}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#EF4444',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        opacity: 0.6,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <ModalTambahPerbelanjaan
          cawangan={cawangan}
          onTutup={() => setModal(false)}
          onBerjaya={(tarikhBaru) => {
            setModal(false)
            const bulanBaru = tarikhBaru.slice(0, 7)
            const labelBulan = new Date(tarikhBaru + 'T00:00:00').toLocaleString('ms-MY', { month: 'long', year: 'numeric' })
            toast.success(`Perbelanjaan disimpan (${labelBulan}).`)
            // Tukar penapis ke bulan rekod supaya rekod baharu terus kelihatan
            if (bulanBaru !== bulan) setBulan(bulanBaru)
            else muatData()
          }}
        />
      )}
    </div>
  )
}

function ModalTambahPerbelanjaan({
  cawangan,
  onTutup,
  onBerjaya,
}: {
  cawangan: { id: string; nama: string }[]
  onTutup: () => void
  onBerjaya: (tarikh: string) => void
}) {
  const [tarikh, setTarikh] = useState(new Date().toISOString().split('T')[0])
  const [kategori, setKategori] = useState(KATEGORI[0])
  const [penerangan, setPenerangan] = useState('')
  const [jumlah, setJumlah] = useState('')
  const [cawanganId, setCawanganId] = useState('')
  const [failBukti, setFailBukti] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)
  useTutupEscape(onTutup)

  const simpan = async () => {
    if (!penerangan.trim()) { setRalat('Sila isi penerangan perbelanjaan.'); return }
    if (!jumlah || +jumlah <= 0) { setRalat('Jumlah mesti lebih dari 0.'); return }
    if (failBukti) {
      const ralatFail = sahkanFailBukti(failBukti)
      if (ralatFail) { setRalat(ralatFail); return }
    }
    setLoading(true)
    setRalat(null)
    const supabase = createClient()
    const { data: rekod, error } = await supabase
      .from('kewangan_perbelanjaan')
      .insert({
        tarikh,
        kategori,
        penerangan: penerangan.trim(),
        jumlah: +jumlah,
        cawangan_id: cawanganId || null,
      })
      .select('id')
      .single()
    if (error || !rekod) { setRalat('Gagal simpan. Cuba lagi.'); setLoading(false); return }

    // Muat naik bukti selepas rekod berjaya — jika gagal, rekod kekal dan
    // bukti boleh dimuat naik semula dari jadual
    if (failBukti) {
      const path = pathBukti(rekod.id, tarikh, failBukti.name)
      const { error: errUpload } = await supabase.storage
        .from(BUKTI_BUCKET)
        .upload(path, failBukti, { upsert: true })
      if (errUpload) {
        toast.error('Rekod disimpan tetapi bukti gagal dimuat naik. Guna butang Upload dalam jadual.')
      } else {
        await supabase.from('kewangan_perbelanjaan').update({ bukti_path: path }).eq('id', rekod.id)
      }
    }
    onBerjaya(tarikh)
  }

  const modalInput = {
    ...gayaInput,
    width: '100%',
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onTutup() }}
      role="dialog"
      aria-modal="true"
      aria-label="Tambah Perbelanjaan"
    >
      <div
        style={{
          background: 'var(--card)',
          borderRadius: '20px',
          padding: '28px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)' }}>Tambah Perbelanjaan</h2>
          <button onClick={onTutup} aria-label="Tutup" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                Tarikh
              </label>
              <input type="date" value={tarikh} onChange={(e) => setTarikh(e.target.value)} style={modalInput} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                Kategori
              </label>
              <select value={kategori} onChange={(e) => setKategori(e.target.value)} style={modalInput}>
                {KATEGORI.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
              Penerangan
            </label>
            <input
              value={penerangan}
              onChange={(e) => setPenerangan(e.target.value)}
              placeholder="Cth: Bayaran sewa dewan Buntong"
              style={modalInput}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                Jumlah (RM)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
                placeholder="0.00"
                style={modalInput}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                Cawangan (pilihan)
              </label>
              <select value={cawanganId} onChange={(e) => setCawanganId(e.target.value)} style={modalInput}>
                <option value="">Umum</option>
                {cawangan.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
              Bukti / Resit (pilihan)
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 12px',
                border: '1.5px dashed var(--border)',
                borderRadius: '10px',
                fontSize: '13px',
                color: failBukti ? 'var(--text)' : 'var(--text-muted)',
                cursor: 'pointer',
                background: 'var(--bg)',
              }}
            >
              <Upload size={14} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {failBukti ? failBukti.name : 'Pilih fail imej atau PDF (max 5MB)'}
              </span>
              {failBukti && (
                <button
                  onClick={(e) => { e.preventDefault(); setFailBukti(null) }}
                  aria-label="Buang fail bukti"
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', marginLeft: 'auto', display: 'flex', flexShrink: 0 }}
                >
                  <X size={14} />
                </button>
              )}
              <input
                type="file"
                accept={BUKTI_ACCEPT}
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (file) setFailBukti(file)
                }}
              />
            </label>
          </div>
        </div>

        {ralat && (
          <div
            style={{
              background: '#FFF1F2',
              border: '1px solid #FECDD3',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '13px',
              color: '#9F1239',
              marginTop: '14px',
            }}
          >
            {ralat}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={onTutup}
            style={{
              flex: 1,
              padding: '11px',
              background: 'var(--bg)',
              border: '1.5px solid var(--border)',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: 600,
              color: 'var(--text)',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Batal
          </button>
          <button
            onClick={simpan}
            disabled={loading}
            style={{
              flex: 2,
              padding: '11px',
              background: loading ? '#94A3B8' : 'var(--accent)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: 700,
              color: 'var(--accent-text)',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Menyimpan...' : 'Simpan Perbelanjaan'}
          </button>
        </div>
      </div>
    </div>
  )
}
