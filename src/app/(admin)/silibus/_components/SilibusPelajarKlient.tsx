'use client'

import { useCallback, useMemo, useState } from 'react'
import { ChevronLeft, ChevronDown, ChevronRight, Search, Check, Printer, FileSpreadsheet } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { tarikhTempatan } from '@/lib/utils'
import { toast } from '@/lib/stores/toast-store'
import {
  STATUS_PROGRES, WARNA_PROGRES, petaProgresPelajar, statusSubtajuk, kiraProgresCawangan,
  type TajukBesar, type Subtajuk, type ProgresPelajarBaris, type StatusProgres,
} from '@/lib/silibus'
import type { Cawangan } from './LogHarianKlient'

export type Pelajar = {
  id: string
  nama_penuh: string
  cawangan_daftar_id: string
  jenis_kelas: string
}

const warnaBar = (p: number) => (p < 34 ? '#EF4444' : p < 67 ? '#F59E0B' : '#10B981')

export function SilibusPelajarKlient({
  cawangan,
  pelajar,
  tajukAwal,
  subtajukAwal,
  progressPelajarAwal,
}: {
  cawangan: Cawangan[]
  pelajar: Pelajar[]
  tajukAwal: TajukBesar[]
  subtajukAwal: Subtajuk[]
  progressPelajarAwal: ProgresPelajarBaris[]
}) {
  const [progress, setProgress] = useState<ProgresPelajarBaris[]>(progressPelajarAwal)
  const [cawanganTapis, setCawanganTapis] = useState('')
  const [carian, setCarian] = useState('')
  const [pelajarPilih, setPelajarPilih] = useState<string | null>(null)
  const [kembang, setKembang] = useState<Set<string>>(new Set())
  const [sibuk, setSibuk] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [xlsLoading, setXlsLoading] = useState(false)

  const muatData = useCallback(async () => {
    const { data } = await createClient()
      .from('silibus_progress_pelajar')
      .select('id, subtajuk_id, pelajar_id, status')
    if (data) setProgress(data as ProgresPelajarBaris[])
  }, [])

  const petaCawangan = useMemo(() => new Map(cawangan.map((c) => [c.id, c.nama])), [cawangan])
  const peta = useMemo(() => petaProgresPelajar(progress), [progress])

  // Tajuk wajib + subtajuknya (yang dijejak untuk setiap pelajar)
  const tajukWajib = useMemo(
    () => tajukAwal.filter((t) => t.wajib && t.status === 'Aktif').sort((a, b) => a.susunan - b.susunan),
    [tajukAwal]
  )
  const subIkutTajuk = useMemo(() => {
    const m = new Map<string, Subtajuk[]>()
    for (const s of subtajukAwal) {
      if (!m.has(s.tajuk_id)) m.set(s.tajuk_id, [])
      m.get(s.tajuk_id)!.push(s)
    }
    for (const arr of m.values()) arr.sort((a, b) => a.susunan - b.susunan)
    return m
  }, [subtajukAwal])
  const subWajib = useMemo(
    () => tajukWajib.flatMap((t) => subIkutTajuk.get(t.id) ?? []),
    [tajukWajib, subIkutTajuk]
  )
  const jumlahWajib = subWajib.length

  const pelajarTapis = useMemo(() => {
    const q = carian.trim().toLowerCase()
    return pelajar
      .filter((p) => (!cawanganTapis || p.cawangan_daftar_id === cawanganTapis) && (!q || p.nama_penuh.toLowerCase().includes(q)))
      .map((p) => ({ p, ringkas: kiraProgresCawangan(subWajib, peta, p.id) }))
      .sort((a, b) => a.ringkas.peratus - b.ringkas.peratus || a.p.nama_penuh.localeCompare(b.p.nama_penuh))
  }, [pelajar, cawanganTapis, carian, subWajib, peta])

  const pelajarAktif = pelajarPilih ? pelajar.find((p) => p.id === pelajarPilih) ?? null : null

  const toggleKembang = (id: string) => {
    setKembang((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }

  const tulisProgress = async (baris: { subtajuk_id: string; status: StatusProgres }[]) => {
    if (!pelajarPilih) return
    setSibuk(true)
    // Optimistik
    setProgress((prev) => {
      const kunci = new Set(baris.map((b) => b.subtajuk_id))
      const lain = prev.filter((p) => !(p.pelajar_id === pelajarPilih && kunci.has(p.subtajuk_id)))
      return [...lain, ...baris.map((b) => ({ id: 'temp-' + b.subtajuk_id, subtajuk_id: b.subtajuk_id, pelajar_id: pelajarPilih, status: b.status }))]
    })
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const hariIni = tarikhTempatan()
    const rekod = baris.map((b) => ({
      subtajuk_id: b.subtajuk_id,
      pelajar_id: pelajarPilih,
      status: b.status,
      tarikh_selesai: b.status === 'Selesai' ? hariIni : null,
      dikemaskini_oleh: user?.id ?? null,
      dikemaskini_pada: new Date().toISOString(),
    }))
    const { error } = await supabase.from('silibus_progress_pelajar').upsert(rekod, { onConflict: 'subtajuk_id,pelajar_id' })
    setSibuk(false)
    if (error) {
      console.error(error)
      toast.error('Gagal simpan progress. Cuba lagi.')
      muatData()
    }
  }

  // Tandakan semua subtajuk dalam tajuk (susunan <= subtajuk ini) sebagai Selesai
  const tandaHinggaSini = (tajukId: string, sub: Subtajuk) => {
    const subs = subIkutTajuk.get(tajukId) ?? []
    const baris = subs.filter((s) => s.susunan <= sub.susunan).map((s) => ({ subtajuk_id: s.id, status: 'Selesai' as StatusProgres }))
    if (baris.length) tulisProgress(baris)
  }

  const tarikhRingkas = (t: string) => t.split('-').reverse().join('/')
  const cawanganLabel = cawanganTapis ? (petaCawangan.get(cawanganTapis) ?? 'Cawangan') : 'Semua Cawangan'
  const tajukLabel = tajukWajib.map((t) => t.nama).join(', ')
  const bersih = (str: string) => str.replace(/[\\/:*?"<>|—]/g, '-').replace(/\s+/g, '_')

  const unduhPDF = async () => {
    setPdfLoading(true)
    try {
      const { pdf } = await import('@react-pdf/renderer')
      const { LaporanSilibusPelajarPDF } = await import('@/components/pdf/LaporanSilibusPelajarPDF')
      const tarikhJana = tarikhRingkas(tarikhTempatan())
      let blob: Blob
      let namaFail: string
      if (pelajarAktif) {
        const ringkas = kiraProgresCawangan(subWajib, peta, pelajarAktif.id)
        const tajuk = tajukWajib.map((t) => ({
          nama: t.nama,
          subtajuk: (subIkutTajuk.get(t.id) ?? []).map((x) => ({ nama: x.nama, status: statusSubtajuk(peta, x.id, pelajarAktif.id), nota: x.nota ?? '' })),
        }))
        blob = await pdf(<LaporanSilibusPelajarPDF mode="pelajar" tajukLabel={tajukLabel} cawanganLabel={cawanganLabel} pelajarNama={pelajarAktif.nama_penuh} ringkas={ringkas} tajuk={tajuk} tarikhJana={tarikhJana} />).toBlob()
        namaFail = `Silibus_${bersih(pelajarAktif.nama_penuh)}.pdf`
      } else {
        const senarai = pelajarTapis.map(({ p, ringkas }) => ({ nama: p.nama_penuh, cawangan: petaCawangan.get(p.cawangan_daftar_id) ?? '—', selesai: ringkas.selesai, jumlah: ringkas.jumlah, peratus: ringkas.peratus }))
        blob = await pdf(<LaporanSilibusPelajarPDF mode="senarai" tajukLabel={tajukLabel} cawanganLabel={cawanganLabel} senarai={senarai} tarikhJana={tarikhJana} />).toBlob()
        namaFail = `Silibus_Pelajar_${bersih(cawanganLabel)}.pdf`
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = namaFail; a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF dimuat turun.')
    } catch (e) {
      console.error(e)
      toast.error('Gagal jana PDF. Cuba lagi.')
    } finally {
      setPdfLoading(false)
    }
  }

  const unduhExcel = async () => {
    setXlsLoading(true)
    try {
      const ExcelJS = (await import('exceljs')).default
      const WARNA_XLS: Record<StatusProgres, { fill: string; font: string }> = {
        Selesai: { fill: 'FFDCFCE7', font: 'FF166534' },
        Sedang: { fill: 'FFFEF9C3', font: 'FF854D0E' },
        Belum: { fill: 'FFF1F5F9', font: 'FF94A3B8' },
      }
      const wb = new ExcelJS.Workbook()
      wb.creator = 'CFK HUB'
      wb.created = new Date()
      const styleHead = (cell: import('exceljs').Cell, align: 'left' | 'center' | 'right' = 'left') => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }
        cell.alignment = { horizontal: align }
      }
      let namaFail: string

      if (pelajarAktif) {
        const ws = wb.addWorksheet('Silibus Pelajar')
        ws.columns = [{ width: 40 }, { width: 46 }, { width: 12 }, { width: 14 }]
        ws.mergeCells('A1:D1'); ws.getCell('A1').value = 'CHESS FOR KIDS (CFK)'; ws.getCell('A1').font = { bold: true, size: 14 }; ws.getCell('A1').alignment = { horizontal: 'center' }
        ws.mergeCells('A2:D2'); ws.getCell('A2').value = `Silibus Pelajar — ${pelajarAktif.nama_penuh}`; ws.getCell('A2').font = { size: 10, italic: true }; ws.getCell('A2').alignment = { horizontal: 'center' }
        const head = ws.getRow(4);['Tajuk Besar', 'Subtajuk', 'MS', 'Status'].forEach((h, i) => { head.getCell(i + 1).value = h; styleHead(head.getCell(i + 1), i === 3 ? 'center' : 'left') })
        let r = 5
        for (const t of tajukWajib) {
          for (const sub of subIkutTajuk.get(t.id) ?? []) {
            const st = statusSubtajuk(peta, sub.id, pelajarAktif.id)
            const row = ws.getRow(r)
            row.getCell(1).value = t.nama
            row.getCell(2).value = sub.nama
            row.getCell(3).value = sub.nota ?? ''
            const c = row.getCell(4)
            c.value = st; c.alignment = { horizontal: 'center' }; c.font = { color: { argb: WARNA_XLS[st].font }, bold: st !== 'Belum' }
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: WARNA_XLS[st].fill } }
            r++
          }
        }
        namaFail = `Silibus_${bersih(pelajarAktif.nama_penuh)}.xlsx`
      } else {
        const ws = wb.addWorksheet('Silibus Pelajar')
        ws.columns = [{ width: 6 }, { width: 40 }, { width: 22 }, { width: 12 }, { width: 10 }]
        ws.mergeCells('A1:E1'); ws.getCell('A1').value = 'CHESS FOR KIDS (CFK)'; ws.getCell('A1').font = { bold: true, size: 14 }; ws.getCell('A1').alignment = { horizontal: 'center' }
        ws.mergeCells('A2:E2'); ws.getCell('A2').value = `Silibus Pelajar — ${cawanganLabel}`; ws.getCell('A2').font = { size: 10, italic: true }; ws.getCell('A2').alignment = { horizontal: 'center' }
        const head = ws.getRow(4);['No.', 'Pelajar', 'Cawangan', 'Selesai', '%'].forEach((h, i) => { head.getCell(i + 1).value = h; styleHead(head.getCell(i + 1), i === 0 || i >= 3 ? 'center' : 'left') })
        let r = 5
        for (const [i, { p, ringkas }] of pelajarTapis.entries()) {
          const row = ws.getRow(r)
          row.getCell(1).value = i + 1
          row.getCell(2).value = p.nama_penuh
          row.getCell(3).value = petaCawangan.get(p.cawangan_daftar_id) ?? '—'
          row.getCell(4).value = `${ringkas.selesai}/${ringkas.jumlah}`; row.getCell(4).alignment = { horizontal: 'center' }
          row.getCell(5).value = ringkas.peratus / 100; row.getCell(5).numFmt = '0%'; row.getCell(5).alignment = { horizontal: 'center' }
          r++
        }
        namaFail = `Silibus_Pelajar_${bersih(cawanganLabel)}.xlsx`
      }

      const buffer = await wb.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = namaFail; a.click()
      URL.revokeObjectURL(url)
      toast.success('Excel dimuat turun.')
    } catch (e) {
      console.error(e)
      toast.error('Gagal jana Excel. Cuba lagi.')
    } finally {
      setXlsLoading(false)
    }
  }

  const btnPDF = (
    <button onClick={unduhPDF} disabled={pdfLoading} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', background: pdfLoading ? '#94A3B8' : 'var(--primary)', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: '#fff', cursor: pdfLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
      <Printer size={14} /> {pdfLoading ? 'Menjana...' : 'PDF'}
    </button>
  )
  const btnExcel = (
    <button onClick={unduhExcel} disabled={xlsLoading} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', background: xlsLoading ? '#94A3B8' : '#16A34A', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: '#fff', cursor: xlsLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
      <FileSpreadsheet size={14} /> {xlsLoading ? 'Menjana...' : 'Excel'}
    </button>
  )

  const btnKecil = { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 10px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '9px', fontSize: '12px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, whiteSpace: 'nowrap' } as const
  const chip = (bg: string, text: string, border: string, teks: string) => (
    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '6px', background: bg, color: text, border: `1px solid ${border}` }}>{teks}</span>
  )

  // ---- Tiada tajuk wajib ----
  if (tajukWajib.length === 0) {
    return (
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '40px', textAlign: 'center', fontSize: '13.5px', color: 'var(--text-muted)' }}>
        Belum ada Tajuk Besar ditanda <strong>Wajib</strong>. Pergi tab <strong>Silibus Induk</strong> → Edit sesuatu Tajuk Besar → set <strong>Wajib: Ya</strong>. Tajuk wajib akan dijejak untuk setiap pelajar di sini.
      </div>
    )
  }

  // ---- Detail seorang pelajar ----
  if (pelajarAktif) {
    const ringkas = kiraProgresCawangan(subWajib, peta, pelajarAktif.id)
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <button onClick={() => setPelajarPilih(null)} style={btnKecil}>
            <ChevronLeft size={14} /> Kembali ke senarai
          </button>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{btnPDF}{btnExcel}</div>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>{pelajarAktif.nama_penuh}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {petaCawangan.get(pelajarAktif.cawangan_daftar_id) ?? '—'} · {pelajarAktif.jenis_kelas}
              </div>
            </div>
            <div style={{ textAlign: 'right', minWidth: '160px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{ringkas.selesai}/{ringkas.jumlah} selesai ({ringkas.peratus}%)</div>
              <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '99px', marginTop: '6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${ringkas.peratus}%`, background: warnaBar(ringkas.peratus), borderRadius: '99px' }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tajukWajib.map((t) => {
            const subs = subIkutTajuk.get(t.id) ?? []
            const buka = kembang.has(t.id) || tajukWajib.length === 1
            const r = kiraProgresCawangan(subs, peta, pelajarAktif.id)
            return (
              <div key={t.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', background: '#F8FAFC', borderBottom: buka ? '1px solid var(--border)' : 'none', cursor: tajukWajib.length > 1 ? 'pointer' : 'default' }} onClick={() => tajukWajib.length > 1 && toggleKembang(t.id)}>
                  {tajukWajib.length > 1 && (buka ? <ChevronDown size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> : <ChevronRight size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />)}
                  <div style={{ flex: 1, minWidth: '160px' }}>
                    <span style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text)' }}>{t.nama}</span>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{r.selesai}/{r.jumlah} selesai ({r.peratus}%)</div>
                  </div>
                </div>

                {buka && (
                  <div>
                    {subs.map((s, i) => {
                      const st = statusSubtajuk(peta, s.id, pelajarAktif.id)
                      return (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 16px', borderTop: i > 0 ? '1px solid var(--border)' : 'none', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: '160px', display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>{s.nama}</span>
                            {s.nota && chip('#FEFCE8', '#854D0E', '#FEF08A', s.nota)}
                          </div>
                          <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                            {STATUS_PROGRES.map((stx) => {
                              const aktif = st === stx
                              const w = WARNA_PROGRES[stx]
                              return (
                                <button
                                  key={stx}
                                  onClick={() => tulisProgress([{ subtajuk_id: s.id, status: stx }])}
                                  disabled={sibuk}
                                  style={{ padding: '5px 11px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap', background: aktif ? w.bg : 'transparent', color: aktif ? w.text : 'var(--text-muted)', border: `1.5px solid ${aktif ? w.border : 'var(--border)'}` }}
                                >
                                  {stx}
                                </button>
                              )
                            })}
                          </div>
                          <button onClick={() => tandaHinggaSini(t.id, s)} disabled={sibuk} title="Tandakan semua bab hingga sini sebagai Selesai" style={btnKecil}>
                            <Check size={13} /> Hingga sini
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ---- Overview senarai pelajar ----
  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '18px', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cawangan</label>
          <select value={cawanganTapis} onChange={(e) => setCawanganTapis(e.target.value)} style={{ padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13.5px', color: 'var(--text)', background: 'var(--card)', outline: 'none', fontFamily: 'inherit', cursor: 'pointer', minWidth: '200px' }}>
            <option value="">Semua Cawangan</option>
            {cawangan.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cari Pelajar</label>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={carian} onChange={(e) => setCarian(e.target.value)} placeholder="Nama pelajar..." style={{ padding: '9px 12px 9px 34px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13.5px', color: 'var(--text)', background: 'var(--card)', outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', flex: 1, minWidth: '240px' }}>
          {pelajarTapis.length} pelajar · silibus wajib: {jumlahWajib} subtajuk ({tajukWajib.map((t) => t.nama).join(', ')}). Disusun <strong>paling tertinggal dahulu</strong> — klik nama untuk rekod progress.
        </p>
        {pelajarTapis.length > 0 && <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{btnPDF}{btnExcel}</div>}
      </div>

      {pelajarTapis.length === 0 ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '40px', textAlign: 'center', fontSize: '13.5px', color: 'var(--text-muted)' }}>
          Tiada pelajar sepadan.
        </div>
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
          {pelajarTapis.map(({ p, ringkas }, i) => (
            <div
              key={p.id}
              role="button"
              tabIndex={0}
              onClick={() => { setPelajarPilih(p.id); setKembang(new Set(tajukWajib.map((t) => t.id))) }}
              onKeyDown={(e) => { if (e.key === 'Enter') { setPelajarPilih(p.id); setKembang(new Set(tajukWajib.map((t) => t.id))) } }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderTop: i > 0 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}
            >
              <div style={{ flex: 1, minWidth: '140px' }}>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>{p.nama_penuh}</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '1px' }}>{petaCawangan.get(p.cawangan_daftar_id) ?? '—'}</div>
              </div>
              <div style={{ width: '160px', maxWidth: '40vw' }}>
                <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${ringkas.peratus}%`, background: warnaBar(ringkas.peratus), borderRadius: '99px' }} />
                </div>
              </div>
              <div style={{ width: '90px', textAlign: 'right', fontSize: '12.5px', fontWeight: 700, color: ringkas.peratus === 0 ? 'var(--text-muted)' : 'var(--text)', flexShrink: 0 }}>
                {ringkas.peratus === 0 ? 'Belum mula' : `${ringkas.selesai}/${ringkas.jumlah}`}
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
