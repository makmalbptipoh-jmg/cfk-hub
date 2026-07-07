'use client'

import { useState, useEffect, useCallback } from 'react'
import { Edit2, FileText, Plus, Trash2, X, ClipboardList } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { akhirBulan, formatRinggit, formatTarikh, tarikhTempatan, bulanTempatan } from '@/lib/utils'
import { useTutupEscape } from '@/lib/hooks/useTutupEscape'
import { toast } from '@/lib/stores/toast-store'
import { dokumenSchema } from '@/lib/validation/dokumen'
import { ralatPertama } from '@/lib/validation/kewangan'

const KATEGORI = ['Jualan Peralatan', 'Khidmat Kursus', 'Lain-lain']
const PERINGKAT = ['Sebut Harga', 'Invois', 'Resit'] as const
type Peringkat = (typeof PERINGKAT)[number]
const KAEDAH = ['Transfer', 'Tunai'] as const

const PERINGKAT_WARNA: Record<Peringkat, { bg: string; teks: string }> = {
  'Sebut Harga': { bg: '#FFFBEB', teks: '#92400E' },
  Invois: { bg: '#EFF6FF', teks: '#1E40AF' },
  Resit: { bg: '#F0FDF4', teks: '#15803D' },
}

type Item = { id?: string; perihalan: string; kuantiti: number; harga_seunit: number; urutan?: number }
type Dokumen = {
  id: string
  no_dokumen: string
  tarikh: string
  peringkat: Peringkat
  kategori: string
  pembeli_nama: string
  pembeli_alamat: string | null
  pembeli_telefon: string | null
  pembeli_emel: string | null
  pembeli_pic: string | null
  kaedah_bayaran: string | null
  maklumat_bayaran: string | null
  tarikh_bayar: string | null
  sah_sehingga: string | null
  cawangan_id: string | null
  nota: string | null
  cawangan: { id: string; nama: string } | null
  item: Item[]
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

function jumlahDok(d: { item: Item[] }) {
  return d.item.reduce((t, it) => t + it.kuantiti * it.harga_seunit, 0)
}

export default function DokumenJualanPage() {
  const [bulan, setBulan] = useState(bulanTempatan())
  const [filterPeringkat, setFilterPeringkat] = useState('')
  const [senarai, setSenarai] = useState<Dokumen[]>([])
  const [cawangan, setCawangan] = useState<{ id: string; nama: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [rekodEdit, setRekodEdit] = useState<Dokumen | null>(null)
  const [janaId, setJanaId] = useState<string | null>(null)

  const muatData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const [y, m] = bulan.split('-')
    const mula = `${y}-${m}-01`
    const akhir = akhirBulan(+y, +m)

    let q = supabase
      .from('dokumen_jualan')
      .select('id, no_dokumen, tarikh, peringkat, kategori, pembeli_nama, pembeli_alamat, pembeli_telefon, pembeli_emel, pembeli_pic, kaedah_bayaran, maklumat_bayaran, tarikh_bayar, sah_sehingga, cawangan_id, nota, cawangan:cawangan_id(id, nama), item:dokumen_item(id, perihalan, kuantiti, harga_seunit, urutan)')
      .gte('tarikh', mula)
      .lte('tarikh', akhir)

    if (filterPeringkat) q = q.eq('peringkat', filterPeringkat as Peringkat)
    q = q.order('tarikh', { ascending: false })

    const [{ data }, { data: caw }] = await Promise.all([
      q,
      supabase.from('cawangan').select('id, nama').eq('status', 'Aktif').order('nama'),
    ])

    const hasil = ((data ?? []) as unknown as Dokumen[]).map((d) => ({
      ...d,
      item: [...(d.item ?? [])].sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0)),
    }))
    setSenarai(hasil)
    setCawangan(caw ?? [])
    setLoading(false)
  }, [bulan, filterPeringkat])

  useEffect(() => {
    muatData()
  }, [muatData])

  const padam = async (d: Dokumen) => {
    if (!confirm(`Padam dokumen ${d.no_dokumen} (${d.pembeli_nama})? Rekod pendapatan berkaitan juga akan dibuang.`)) return
    const supabase = createClient()
    // FK ON DELETE CASCADE membuang item + rekod pendapatan berkaitan
    const { error } = await supabase.from('dokumen_jualan').delete().eq('id', d.id)
    if (error) { toast.error('Gagal padam. Cuba lagi.'); return }
    toast.success('Dokumen dipadam.')
    muatData()
  }

  const janaPDF = async (d: Dokumen, jenis: Peringkat) => {
    setJanaId(`${d.id}-${jenis}`)
    try {
      const { pdf } = await import('@react-pdf/renderer')
      const { DokumenJualanPDF } = await import('@/components/pdf/DokumenJualanPDF')
      const blob = await pdf(
        <DokumenJualanPDF
          jenis={jenis}
          no_dokumen={d.no_dokumen}
          tarikh={d.tarikh}
          pembeli_nama={d.pembeli_nama}
          pembeli_alamat={d.pembeli_alamat}
          pembeli_telefon={d.pembeli_telefon}
          pembeli_emel={d.pembeli_emel}
          pembeli_pic={d.pembeli_pic}
          items={d.item.map((it) => ({ perihalan: it.perihalan, kuantiti: it.kuantiti, harga_seunit: it.harga_seunit }))}
          kaedah_bayaran={d.kaedah_bayaran}
          maklumat_bayaran={d.maklumat_bayaran}
          tarikh_bayar={d.tarikh_bayar}
          sah_sehingga={d.sah_sehingga}
          nota={d.nota}
        />
      ).toBlob()
      const prefix = jenis === 'Sebut Harga' ? 'SH' : jenis === 'Invois' ? 'INV' : 'RS'
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `${prefix}${d.no_dokumen}.pdf`; a.click()
      URL.revokeObjectURL(url)
      toast.success(`${jenis} dimuat turun.`)
    } catch (e) {
      console.error(e)
      toast.error('Gagal jana PDF. Refresh (Ctrl+Shift+R) dan cuba lagi.')
    } finally {
      setJanaId(null)
    }
  }

  const jumlahBulan = senarai.reduce((t, d) => t + jumlahDok(d), 0)

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '20px' }}>
        <div>
          <label style={labelFilter}>Bulan</label>
          <input type="month" value={bulan} onChange={(e) => setBulan(e.target.value)} style={gayaInput} />
        </div>
        <div>
          <label style={labelFilter}>Peringkat</label>
          <select value={filterPeringkat} onChange={(e) => setFilterPeringkat(e.target.value)} style={gayaInput}>
            <option value="">Semua</option>
            {PERINGKAT.map((p) => <option key={p} value={p}>{p}</option>)}
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
          <Plus size={14} /> Dokumen Baharu
        </button>
      </div>

      {!loading && senarai.length > 0 && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 18px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{senarai.length} dokumen</span>
          <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)' }}>Nilai: {formatRinggit(jumlahBulan)}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Memuatkan...</div>
      ) : senarai.length === 0 ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '48px', textAlign: 'center' }}>
          <ClipboardList size={32} style={{ color: 'var(--border)', margin: '0 auto 12px', display: 'block' }} />
          <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>Tiada dokumen jualan</p>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
            Klik &quot;Dokumen Baharu&quot; untuk buat Sebut Harga, Invois atau Resit jualan peralatan / perkhidmatan.
          </p>
        </div>
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                {['No.', 'Tarikh', 'Pembeli', 'Peringkat', 'Jumlah', 'Dokumen', ''].map((h) => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {senarai.map((d, i) => (
                <tr key={d.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{d.no_dokumen}</td>
                  <td style={{ padding: '10px 14px', fontSize: '12.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatTarikh(d.tarikh)}</td>
                  <td style={{ padding: '10px 14px', fontSize: '13px', color: 'var(--text)' }}>
                    {d.pembeli_nama}
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{d.kategori}</div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: '11.5px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600, background: PERINGKAT_WARNA[d.peringkat].bg, color: PERINGKAT_WARNA[d.peringkat].teks }}>{d.peringkat}</span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: '14px', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap' }}>{formatRinggit(jumlahDok(d))}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {(['Sebut Harga', 'Invois', 'Resit'] as Peringkat[]).map((jenis) => {
                        const prefix = jenis === 'Sebut Harga' ? 'SH' : jenis === 'Invois' ? 'INV' : 'RS'
                        const busy = janaId === `${d.id}-${jenis}`
                        return (
                          <button
                            key={jenis}
                            onClick={() => janaPDF(d, jenis)}
                            disabled={busy}
                            title={`Muat turun ${jenis}`}
                            aria-label={`${jenis} untuk ${d.pembeli_nama}`}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: '#F1F5F9', border: '1px solid var(--border)', borderRadius: '8px', cursor: busy ? 'wait' : 'pointer', color: 'var(--text)', fontSize: '11px', fontWeight: 700, fontFamily: 'inherit' }}
                          >
                            <FileText size={12} /> {prefix}
                          </button>
                        )
                      })}
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => setRekodEdit(d)} title="Edit" aria-label={`Edit ${d.no_dokumen}`} style={{ padding: '5px 8px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', cursor: 'pointer', color: '#1E40AF', display: 'flex', alignItems: 'center' }}><Edit2 size={13} /></button>
                      <button onClick={() => padam(d)} title="Padam" aria-label={`Padam ${d.no_dokumen}`} style={{ padding: '5px 8px', background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '8px', color: '#9F1239', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(modal || rekodEdit) && (
        <ModalDokumen
          rekodEdit={rekodEdit}
          cawangan={cawangan}
          onTutup={() => { setModal(false); setRekodEdit(null) }}
          onBerjaya={(tarikhBaru, edit) => {
            setModal(false)
            setRekodEdit(null)
            const bulanBaru = tarikhBaru.slice(0, 7)
            toast.success(edit ? 'Dokumen dikemaskini.' : 'Dokumen disimpan.')
            if (bulanBaru !== bulan) setBulan(bulanBaru)
            else muatData()
          }}
        />
      )}
    </div>
  )
}

const labelFilter = { display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }

function ModalDokumen({
  rekodEdit, cawangan, onTutup, onBerjaya,
}: {
  rekodEdit: Dokumen | null
  cawangan: { id: string; nama: string }[]
  onTutup: () => void
  onBerjaya: (tarikh: string, edit: boolean) => void
}) {
  const edit = !!rekodEdit
  const [tarikh, setTarikh] = useState(rekodEdit?.tarikh ?? tarikhTempatan())
  const [peringkat, setPeringkat] = useState<Peringkat>(rekodEdit?.peringkat ?? 'Sebut Harga')
  const [kategori, setKategori] = useState(rekodEdit?.kategori ?? KATEGORI[0])
  const [pembeliNama, setPembeliNama] = useState(rekodEdit?.pembeli_nama ?? '')
  const [pembeliAlamat, setPembeliAlamat] = useState(rekodEdit?.pembeli_alamat ?? '')
  const [pembeliTelefon, setPembeliTelefon] = useState(rekodEdit?.pembeli_telefon ?? '')
  const [pembeliEmel, setPembeliEmel] = useState(rekodEdit?.pembeli_emel ?? '')
  const [pembeliPic, setPembeliPic] = useState(rekodEdit?.pembeli_pic ?? '')
  const [kaedah, setKaedah] = useState<(typeof KAEDAH)[number]>((rekodEdit?.kaedah_bayaran as (typeof KAEDAH)[number]) ?? 'Transfer')
  const [maklumatBayaran, setMaklumatBayaran] = useState(rekodEdit?.maklumat_bayaran ?? '')
  const [tarikhBayar, setTarikhBayar] = useState(rekodEdit?.tarikh_bayar ?? '')
  const [sahSehingga, setSahSehingga] = useState(rekodEdit?.sah_sehingga ?? '')
  const [cawanganId, setCawanganId] = useState(rekodEdit?.cawangan_id ?? '')
  const [nota, setNota] = useState(rekodEdit?.nota ?? '')
  const [baris, setBaris] = useState<{ perihalan: string; kuantiti: string; harga_seunit: string }[]>(
    rekodEdit?.item.length
      ? rekodEdit.item.map((it) => ({ perihalan: it.perihalan, kuantiti: String(it.kuantiti), harga_seunit: String(it.harga_seunit) }))
      : [{ perihalan: '', kuantiti: '1', harga_seunit: '' }]
  )
  const [loading, setLoading] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)
  useTutupEscape(onTutup)

  const total = baris.reduce((t, b) => t + (parseFloat(b.kuantiti) || 0) * (parseFloat(b.harga_seunit) || 0), 0)

  const setB = (i: number, k: 'perihalan' | 'kuantiti' | 'harga_seunit', v: string) =>
    setBaris((prev) => prev.map((b, idx) => (idx === i ? { ...b, [k]: v } : b)))
  const tambahBaris = () => setBaris((prev) => [...prev, { perihalan: '', kuantiti: '1', harga_seunit: '' }])
  const buangBaris = (i: number) => setBaris((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev))

  const simpan = async () => {
    const items = baris
      .filter((b) => b.perihalan.trim() !== '')
      .map((b) => ({ perihalan: b.perihalan.trim(), kuantiti: +b.kuantiti, harga_seunit: +b.harga_seunit }))

    const ralatV = ralatPertama(dokumenSchema.safeParse({
      tarikh, peringkat, kategori, pembeli_nama: pembeliNama, kaedah_bayaran: kaedah, items,
    }))
    if (ralatV) { setRalat(ralatV); return }
    if (peringkat === 'Resit' && !tarikhBayar) { setRalat('Sila isi tarikh bayaran untuk resit.'); return }

    setLoading(true)
    setRalat(null)
    const supabase = createClient()

    const medan = {
      tarikh,
      peringkat,
      kategori,
      pembeli_nama: pembeliNama.trim(),
      pembeli_alamat: pembeliAlamat.trim() || null,
      pembeli_telefon: pembeliTelefon.trim() || null,
      pembeli_emel: pembeliEmel.trim() || null,
      pembeli_pic: pembeliPic.trim() || null,
      kaedah_bayaran: kaedah,
      maklumat_bayaran: maklumatBayaran.trim() || null,
      tarikh_bayar: peringkat === 'Resit' ? (tarikhBayar || null) : null,
      sah_sehingga: peringkat === 'Sebut Harga' ? (sahSehingga || null) : null,
      cawangan_id: cawanganId || null,
      nota: nota.trim() || null,
    }

    let dokId: string
    let noDokumen: string
    if (edit && rekodEdit) {
      const { error } = await supabase.from('dokumen_jualan').update(medan).eq('id', rekodEdit.id)
      if (error) { setRalat('Gagal simpan. Cuba lagi.'); setLoading(false); return }
      dokId = rekodEdit.id
      noDokumen = rekodEdit.no_dokumen
    } else {
      const { data, error } = await supabase.from('dokumen_jualan').insert(medan).select('id, no_dokumen').single()
      if (error || !data) { setRalat('Gagal simpan. Cuba lagi.'); setLoading(false); return }
      dokId = data.id
      noDokumen = data.no_dokumen
    }

    // Ganti item: buang lama, masuk baharu
    await supabase.from('dokumen_item').delete().eq('dokumen_id', dokId)
    const { error: errItem } = await supabase.from('dokumen_item').insert(
      items.map((it, idx) => ({ dokumen_id: dokId, urutan: idx, perihalan: it.perihalan, kuantiti: it.kuantiti, harga_seunit: it.harga_seunit }))
    )
    if (errItem) { setRalat('Dokumen disimpan tetapi item gagal disimpan. Cuba edit semula.'); setLoading(false); return }

    // Auto pendapatan bila peringkat Resit
    const jumlah = items.reduce((t, it) => t + it.kuantiti * it.harga_seunit, 0)
    if (peringkat === 'Resit' && jumlah > 0) {
      const rowPendapatan = {
        tarikh: tarikhBayar || tarikh,
        sumber: pembeliNama.trim(),
        kategori,
        jumlah,
        kaedah,
        cawangan_id: cawanganId || null,
        nota: `Auto dari Dokumen Jualan RS${noDokumen}`,
        dokumen_id: dokId,
      }
      const { data: sedia } = await supabase.from('pendapatan_lain').select('id').eq('dokumen_id', dokId).maybeSingle()
      if (sedia) await supabase.from('pendapatan_lain').update(rowPendapatan).eq('id', sedia.id)
      else await supabase.from('pendapatan_lain').insert(rowPendapatan)
    } else {
      await supabase.from('pendapatan_lain').delete().eq('dokumen_id', dokId)
    }

    onBerjaya(tarikh, edit)
  }

  const modalInput = { ...gayaInput, width: '100%' }
  const labelStyle = { display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={(e) => { if (e.target === e.currentTarget) onTutup() }}
      role="dialog" aria-modal="true" aria-label={edit ? 'Edit Dokumen Jualan' : 'Dokumen Jualan Baharu'}
    >
      <div style={{ background: 'var(--card)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '620px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)' }}>{edit ? 'Edit Dokumen Jualan' : 'Dokumen Jualan Baharu'}</h2>
          <button onClick={onTutup} aria-label="Tutup" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Peringkat + Kategori + Tarikh */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Peringkat</label>
              <select value={peringkat} onChange={(e) => setPeringkat(e.target.value as Peringkat)} style={modalInput}>
                {PERINGKAT.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Kategori</label>
              <select value={kategori} onChange={(e) => setKategori(e.target.value)} style={modalInput}>
                {KATEGORI.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tarikh</label>
              <input type="date" value={tarikh} onChange={(e) => setTarikh(e.target.value)} style={modalInput} />
            </div>
          </div>

          {/* Pembeli */}
          <div>
            <label style={labelStyle}>Nama Pembeli / Sekolah</label>
            <input value={pembeliNama} onChange={(e) => setPembeliNama(e.target.value)} placeholder="Cth: SK Klebang Perdana" style={modalInput} />
          </div>
          <div>
            <label style={labelStyle}>Alamat</label>
            <textarea value={pembeliAlamat} onChange={(e) => setPembeliAlamat(e.target.value)} rows={2} placeholder="Alamat penuh untuk surat rasmi" style={{ ...modalInput, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Untuk Perhatian</label>
              <input value={pembeliPic} onChange={(e) => setPembeliPic(e.target.value)} placeholder="Cth: Cikgu Ali" style={modalInput} />
            </div>
            <div>
              <label style={labelStyle}>Telefon</label>
              <input type="tel" value={pembeliTelefon} onChange={(e) => setPembeliTelefon(e.target.value)} style={modalInput} />
            </div>
            <div>
              <label style={labelStyle}>E-mel</label>
              <input type="email" value={pembeliEmel} onChange={(e) => setPembeliEmel(e.target.value)} style={modalInput} />
            </div>
          </div>

          {/* Item */}
          <div>
            <label style={labelStyle}>Senarai Item</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {baris.map((b, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 100px 28px', gap: '8px', alignItems: 'center' }}>
                  <input value={b.perihalan} onChange={(e) => setB(i, 'perihalan', e.target.value)} placeholder="Item / perkhidmatan" style={modalInput} />
                  <input type="number" min="0" step="1" value={b.kuantiti} onChange={(e) => setB(i, 'kuantiti', e.target.value)} placeholder="Kuantiti" style={{ ...modalInput, textAlign: 'right' }} />
                  <input type="number" min="0" step="0.01" value={b.harga_seunit} onChange={(e) => setB(i, 'harga_seunit', e.target.value)} placeholder="Harga" style={{ ...modalInput, textAlign: 'right' }} />
                  <button onClick={() => buangBaris(i)} disabled={baris.length === 1} aria-label="Buang baris" style={{ background: 'none', border: 'none', color: baris.length === 1 ? 'var(--border)' : 'var(--text-muted)', cursor: baris.length === 1 ? 'default' : 'pointer', padding: '4px', display: 'flex', justifyContent: 'center' }}><X size={16} /></button>
                </div>
              ))}
            </div>
            <button onClick={tambahBaris} style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: 'var(--bg)', border: '1px dashed var(--border)', borderRadius: '10px', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit' }}>
              <Plus size={13} /> Tambah Item
            </button>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', fontSize: '14px', fontWeight: 800, color: 'var(--text)' }}>
              Jumlah: {formatRinggit(total)}
            </div>
          </div>

          {/* Bayaran */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Kaedah Bayaran</label>
              <select value={kaedah} onChange={(e) => setKaedah(e.target.value as (typeof KAEDAH)[number])} style={modalInput}>
                {KAEDAH.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Cawangan (pilihan)</label>
              <select value={cawanganId} onChange={(e) => setCawanganId(e.target.value)} style={modalInput}>
                <option value="">Umum</option>
                {cawangan.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
              </select>
            </div>
          </div>

          {kaedah === 'Transfer' && (
            <div>
              <label style={labelStyle}>Butiran Akaun Bank (untuk invois)</label>
              <textarea value={maklumatBayaran} onChange={(e) => setMaklumatBayaran(e.target.value)} rows={2} placeholder="Cth: Maybank 1234 5678 9012 — Chess For Kids" style={{ ...modalInput, resize: 'vertical' }} />
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Taip akaun mana yang nak dipaparkan pada invois. Boleh biar kosong.</p>
            </div>
          )}

          {peringkat === 'Sebut Harga' && (
            <div>
              <label style={labelStyle}>Sah Sehingga (pilihan)</label>
              <input type="date" value={sahSehingga} onChange={(e) => setSahSehingga(e.target.value)} style={modalInput} />
            </div>
          )}
          {peringkat === 'Resit' && (
            <div>
              <label style={labelStyle}>Tarikh Bayaran Diterima</label>
              <input type="date" value={tarikhBayar} onChange={(e) => setTarikhBayar(e.target.value)} style={modalInput} />
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Bila jadi Resit, jumlah ini auto-direkod dalam Pendapatan.</p>
            </div>
          )}

          <div>
            <label style={labelStyle}>Catatan (pilihan)</label>
            <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Cth: Termasuk penghantaran" style={modalInput} />
          </div>
        </div>

        {ralat && (
          <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#9F1239', marginTop: '14px' }}>{ralat}</div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={onTutup} style={{ flex: 1, padding: '11px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '12px', fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit' }}>Batal</button>
          <button onClick={simpan} disabled={loading} style={{ flex: 2, padding: '11px', background: loading ? '#94A3B8' : 'var(--accent)', border: 'none', borderRadius: '12px', fontSize: '13.5px', fontWeight: 700, color: 'var(--accent-text)', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {loading ? 'Menyimpan...' : edit ? 'Simpan Perubahan' : 'Simpan Dokumen'}
          </button>
        </div>
      </div>
    </div>
  )
}
