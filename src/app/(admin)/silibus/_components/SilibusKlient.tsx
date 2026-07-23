'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Printer, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { HARI, hariMinggu, formatTarikh, bulanTempatan, akhirBulan, tarikhTempatan } from '@/lib/utils'
import { toast } from '@/lib/stores/toast-store'
import { ModalSilibus } from './ModalSilibus'
import type { BarisSilibus } from '@/components/pdf/LaporanSilibusPDF'

export type Cawangan = { id: string; nama: string }

export type Silibus = {
  id: string
  tarikh: string
  cawangan_id: string | null
  pelajar_id: string | null
  jenis: 'Kumpulan' | 'Personal'
  tajuk: string
  muka_surat: string | null
  nota: string | null
  cawangan: { nama: string } | null
  pelajar: { nama_penuh: string } | null
}

const SELECT_SILIBUS = '*, cawangan:cawangan_id(nama), pelajar:pelajar_id(nama_penuh)'

function labelBulan(bm: string) {
  const [y, m] = bm.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString('ms-MY', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

// 'YYYY-MM-DD' → 'DD/MM/YYYY'
const tarikhRingkas = (t: string) => t.split('-').reverse().join('/')

// Label kelas: Personal → nama pelajar (+ cawangan jika ada); Kumpulan → cawangan
const labelKelas = (r: Silibus) => {
  if (r.jenis === 'Personal' && r.pelajar?.nama_penuh) {
    return r.cawangan?.nama ? `${r.pelajar.nama_penuh} · ${r.cawangan.nama}` : r.pelajar.nama_penuh
  }
  return r.cawangan?.nama ?? '—'
}

export function SilibusKlient({ cawanganAwal }: { cawanganAwal: Cawangan[] }) {
  const [bulan, setBulan] = useState(bulanTempatan())
  const [cawanganTapis, setCawanganTapis] = useState('')
  const [senarai, setSenarai] = useState<Silibus[]>([])
  const [loading, setLoading] = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [modal, setModal] = useState<{ buka: boolean; edit: Silibus | null }>({ buka: false, edit: null })

  const muatData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const [y, m] = bulan.split('-').map(Number)
    const mulaB = `${bulan}-01`
    const akhirB = akhirBulan(y, m)

    let q = supabase
      .from('silibus')
      .select(SELECT_SILIBUS)
      .gte('tarikh', mulaB)
      .lte('tarikh', akhirB)
      .order('tarikh', { ascending: false })
    if (cawanganTapis) q = q.eq('cawangan_id', cawanganTapis)

    const { data, error } = await q
    if (error) {
      console.error(error)
      toast.error('Gagal muat rekod silibus. Cuba refresh page.')
      setLoading(false)
      return
    }
    setSenarai((data ?? []) as unknown as Silibus[])
    setLoading(false)
  }, [bulan, cawanganTapis])

  useEffect(() => {
    muatData()
  }, [muatData])

  const cawanganLabel = cawanganTapis
    ? cawanganAwal.find((c) => c.id === cawanganTapis)?.nama ?? 'Semua Cawangan'
    : 'Semua Cawangan'

  const unduhPDF = async () => {
    setPdfLoading(true)
    try {
      const { pdf } = await import('@react-pdf/renderer')
      const { LaporanSilibusPDF } = await import('@/components/pdf/LaporanSilibusPDF')
      const baris: BarisSilibus[] = senarai.map((r) => ({
        tarikh: tarikhRingkas(r.tarikh),
        hari: HARI[hariMinggu(r.tarikh)],
        cawangan: labelKelas(r),
        jenis: r.jenis,
        tajuk: r.tajuk,
        mukaSurat: r.muka_surat ?? '',
      }))
      const tarikhJana = tarikhRingkas(tarikhTempatan())
      const blob = await pdf(
        <LaporanSilibusPDF cawanganLabel={cawanganLabel} bulanLabel={labelBulan(bulan)} baris={baris} tarikhJana={tarikhJana} />
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const bersih = (str: string) => str.replace(/[\\/:*?"<>|—]/g, '-').replace(/\s+/g, '_')
      a.href = url
      a.download = `Laporan_Silibus_${bersih(cawanganLabel)}_${bulan}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF laporan silibus dimuat turun.')
    } catch (e) {
      console.error(e)
      toast.error('Gagal jana PDF. Refresh (Ctrl+Shift+R) dan cuba lagi.')
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} style={{ color: 'var(--text-muted)' }} /> Silibus Kelas
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Rekod tajuk / silibus yang diajar setiap kelas &amp; cawangan
          </p>
        </div>
        <button
          onClick={() => setModal({ buka: true, edit: null })}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'var(--accent)', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--accent-text)', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <Plus size={15} /> Tambah Rekod
        </button>
      </div>

      {/* Penapis + PDF */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Bulan
          </label>
          <input
            type="month"
            value={bulan}
            onChange={(e) => e.target.value && setBulan(e.target.value)}
            style={{ padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13.5px', color: 'var(--text)', background: 'var(--card)', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Cawangan
          </label>
          <select
            value={cawanganTapis}
            onChange={(e) => setCawanganTapis(e.target.value)}
            style={{ padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13.5px', color: 'var(--text)', background: 'var(--card)', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}
          >
            <option value="">Semua Cawangan</option>
            {cawanganAwal.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
          </select>
        </div>
        {!loading && senarai.length > 0 && (
          <button
            onClick={unduhPDF}
            disabled={pdfLoading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', background: pdfLoading ? '#94A3B8' : 'var(--primary)', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: '#fff', cursor: pdfLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
          >
            <Printer size={14} /> {pdfLoading ? 'Menjana...' : 'Muat Turun PDF'}
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Memuatkan...</div>
      ) : senarai.length === 0 ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '40px', textAlign: 'center', fontSize: '13.5px', color: 'var(--text-muted)' }}>
          Tiada rekod silibus untuk tempoh ini. Klik &quot;Tambah Rekod&quot; untuk mula merekod tajuk yang diajar.
        </div>
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                {['Tarikh', 'Hari', 'Cawangan / Pelajar', 'Jenis', 'Tajuk / Silibus', 'Muka Surat', ''].map((h, i) => (
                  <th key={i} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {senarai.map((r, i) => (
                <tr key={r.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '11px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>{formatTarikh(r.tarikh)}</td>
                  <td style={{ padding: '11px 16px', fontSize: '12.5px', color: 'var(--text-muted)' }}>{HARI[hariMinggu(r.tarikh)]}</td>
                  <td style={{ padding: '11px 16px', fontSize: '13px', color: 'var(--text)' }}>
                    {r.jenis === 'Personal' && r.pelajar?.nama_penuh ? (
                      <>
                        <span style={{ fontWeight: 600 }}>{r.pelajar.nama_penuh}</span>
                        {r.cawangan?.nama && <span style={{ color: 'var(--text-muted)' }}> · {r.cawangan.nama}</span>}
                      </>
                    ) : (
                      r.cawangan?.nama ?? '—'
                    )}
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: r.jenis === 'Kumpulan' ? '#ECFCCB' : '#DBEAFE', color: r.jenis === 'Kumpulan' ? '#3F6212' : '#1E40AF' }}>
                      {r.jenis}
                    </span>
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                    {r.tajuk}
                    {r.nota && <div style={{ fontSize: '11.5px', fontWeight: 400, color: 'var(--text-muted)', marginTop: '2px' }}>{r.nota}</div>}
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{r.muka_surat ?? '—'}</td>
                  <td style={{ padding: '11px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => setModal({ buka: true, edit: r })}
                      aria-label={`Edit ${r.tajuk}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '12px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      <Pencil size={13} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && senarai.length > 0 && (
        <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '12px' }}>
          {senarai.length} rekod untuk {labelBulan(bulan)}{cawanganTapis ? ` · ${cawanganLabel}` : ''}. Klik &quot;Edit&quot; untuk ubah atau padam rekod.
        </p>
      )}

      {modal.buka && (
        <ModalSilibus
          rekodEdit={modal.edit}
          cawangan={cawanganAwal}
          onTutup={() => setModal({ buka: false, edit: null })}
          onBerjaya={() => { setModal({ buka: false, edit: null }); muatData() }}
        />
      )}
    </div>
  )
}
