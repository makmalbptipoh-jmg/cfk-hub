'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  Plus, Pencil, ChevronLeft, ChevronDown, ChevronRight, Search, Check, Copy, FileText,
  ExternalLink, Printer, FileSpreadsheet,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { tarikhTempatan } from '@/lib/utils'
import { toast } from '@/lib/stores/toast-store'
import {
  STATUS_PROGRES, WARNA_PROGRES, PGN_BUCKET, petaProgresPelajar, statusSubtajuk, kiraProgresCawangan,
  type TajukBesar, type Subtajuk, type ProgresPelajarBaris, type StatusProgres,
} from '@/lib/silibus'
import type { Cawangan } from './LogHarianKlient'
import type { Pelajar } from './SilibusPelajarKlient'
import { ModalTajuk } from './ModalTajuk'
import { ModalSubtajuk } from './ModalSubtajuk'

const warnaBar = (p: number) => (p < 34 ? '#EF4444' : p < 67 ? '#F59E0B' : '#10B981')
const adaKelasPersonal = (jenis: string | null) => (jenis ?? '').includes('Personal')

export function SilibusPersonalKlient({
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
  // Kurikulum Personal sahaja (jenis === 'Personal').
  const [tajuks, setTajuks] = useState<TajukBesar[]>(tajukAwal.filter((t) => t.jenis === 'Personal'))
  const [subtajuks, setSubtajuks] = useState<Subtajuk[]>(subtajukAwal)
  const [progress, setProgress] = useState<ProgresPelajarBaris[]>(progressPelajarAwal)

  const [cawanganTapis, setCawanganTapis] = useState('')
  const [carian, setCarian] = useState('')
  const [pelajarPilih, setPelajarPilih] = useState<string | null>(null)
  const [kembang, setKembang] = useState<Set<string>>(new Set())
  const [detail, setDetail] = useState<string | null>(null) // subtajuk id yang buka bahan
  const [sibuk, setSibuk] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [xlsLoading, setXlsLoading] = useState(false)

  const [modalTajuk, setModalTajuk] = useState<{ buka: boolean; edit: TajukBesar | null }>({ buka: false, edit: null })
  const [modalSub, setModalSub] = useState<{ tajuk: TajukBesar; edit: Subtajuk | null } | null>(null)

  const muatData = useCallback(async () => {
    const supabase = createClient()
    const [rT, rS, rP] = await Promise.all([
      supabase.from('silibus_tajuk').select('id, nama, susunan, nota, pautan, wajib, jenis, status').order('susunan').order('nama'),
      supabase.from('silibus_subtajuk').select('id, tajuk_id, nama, susunan, fen, pgn_teks, pgn_path, pgn_nama, pgn_saiz, nota, pautan').order('susunan'),
      supabase.from('silibus_progress_pelajar').select('id, subtajuk_id, pelajar_id, status'),
    ])
    if (rT.data) setTajuks((rT.data as TajukBesar[]).filter((t) => t.jenis === 'Personal'))
    if (rS.data) setSubtajuks(rS.data as Subtajuk[])
    if (rP.data) setProgress(rP.data as ProgresPelajarBaris[])
  }, [])

  const petaCawangan = useMemo(() => new Map(cawangan.map((c) => [c.id, c.nama])), [cawangan])
  const peta = useMemo(() => petaProgresPelajar(progress), [progress])

  const pelajarPersonal = useMemo(() => pelajar.filter((p) => adaKelasPersonal(p.jenis_kelas)), [pelajar])

  const subIkutTajuk = useMemo(() => {
    const m = new Map<string, Subtajuk[]>()
    for (const s of subtajuks) {
      if (!m.has(s.tajuk_id)) m.set(s.tajuk_id, [])
      m.get(s.tajuk_id)!.push(s)
    }
    for (const arr of m.values()) arr.sort((a, b) => a.susunan - b.susunan)
    return m
  }, [subtajuks])

  const tajukSemua = useMemo(() => [...tajuks].sort((a, b) => a.susunan - b.susunan), [tajuks])
  const tajukAktif = useMemo(() => tajukSemua.filter((t) => t.status === 'Aktif'), [tajukSemua])
  const subAktif = useMemo(() => tajukAktif.flatMap((t) => subIkutTajuk.get(t.id) ?? []), [tajukAktif, subIkutTajuk])
  const jumlahSub = subAktif.length

  const pelajarTapis = useMemo(() => {
    const q = carian.trim().toLowerCase()
    return pelajarPersonal
      .filter((p) => (!cawanganTapis || p.cawangan_daftar_id === cawanganTapis) && (!q || p.nama_penuh.toLowerCase().includes(q)))
      .map((p) => ({ p, ringkas: kiraProgresCawangan(subAktif, peta, p.id) }))
      .sort((a, b) => a.ringkas.peratus - b.ringkas.peratus || a.p.nama_penuh.localeCompare(b.p.nama_penuh))
  }, [pelajarPersonal, cawanganTapis, carian, subAktif, peta])

  const pelajarAktif = pelajarPilih ? pelajarPersonal.find((p) => p.id === pelajarPilih) ?? null : null

  const toggleKembang = (id: string) => {
    setKembang((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }

  const susunanSeterusnya = (tajukId: string) => {
    const arr = subIkutTajuk.get(tajukId) ?? []
    return arr.length ? Math.max(...arr.map((s) => s.susunan)) + 1 : 10
  }

  // ---- Tulis progress (silibus_progress_pelajar) untuk pelajar terpilih ----
  const tulisProgress = async (baris: { subtajuk_id: string; status: StatusProgres }[]) => {
    if (!pelajarPilih) return
    setSibuk(baris[0]?.subtajuk_id ?? 'sibuk')
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
    setSibuk(null)
    if (error) {
      console.error(error)
      toast.error('Gagal simpan progress. Cuba lagi.')
      muatData()
    }
  }

  // Tandakan semua subtajuk (susunan <= subtajuk ini) dalam tajuk sebagai Selesai
  const tandaHinggaSini = (tajukId: string, sub: Subtajuk) => {
    const subs = subIkutTajuk.get(tajukId) ?? []
    const baris = subs.filter((s) => s.susunan <= sub.susunan).map((s) => ({ subtajuk_id: s.id, status: 'Selesai' as StatusProgres }))
    if (baris.length) tulisProgress(baris)
  }

  const salin = async (teks: string, label: string) => {
    try {
      await navigator.clipboard.writeText(teks)
      toast.success(`${label} disalin.`)
    } catch {
      toast.error('Gagal salin. Cuba salin manual.')
    }
  }

  const bukaPgn = async (s: Subtajuk) => {
    if (!s.pgn_path) return
    setSibuk(s.id)
    const { data, error } = await createClient().storage.from(PGN_BUCKET).createSignedUrl(s.pgn_path, 3600)
    setSibuk(null)
    if (error || !data?.signedUrl) { toast.error('Gagal buka fail PGN. Cuba lagi.'); return }
    window.open(data.signedUrl, '_blank', 'noopener')
  }

  const tarikhRingkas = (t: string) => t.split('-').reverse().join('/')
  const cawanganLabel = cawanganTapis ? (petaCawangan.get(cawanganTapis) ?? 'Cawangan') : 'Semua Cawangan'
  const tajukLabel = tajukAktif.map((t) => t.nama).join(', ')
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
        const ringkas = kiraProgresCawangan(subAktif, peta, pelajarAktif.id)
        const tajuk = tajukAktif.map((t) => ({
          nama: t.nama,
          subtajuk: (subIkutTajuk.get(t.id) ?? []).map((x) => ({ nama: x.nama, status: statusSubtajuk(peta, x.id, pelajarAktif.id), nota: x.nota ?? '' })),
        }))
        blob = await pdf(<LaporanSilibusPelajarPDF mode="pelajar" tajukLabel={tajukLabel} cawanganLabel="Silibus Personal" pelajarNama={pelajarAktif.nama_penuh} ringkas={ringkas} tajuk={tajuk} tarikhJana={tarikhJana} />).toBlob()
        namaFail = `Silibus_Personal_${bersih(pelajarAktif.nama_penuh)}.pdf`
      } else {
        const senarai = pelajarTapis.map(({ p, ringkas }) => ({ nama: p.nama_penuh, cawangan: petaCawangan.get(p.cawangan_daftar_id) ?? '—', selesai: ringkas.selesai, jumlah: ringkas.jumlah, peratus: ringkas.peratus }))
        blob = await pdf(<LaporanSilibusPelajarPDF mode="senarai" tajukLabel={tajukLabel} cawanganLabel={`Personal — ${cawanganLabel}`} senarai={senarai} tarikhJana={tarikhJana} />).toBlob()
        namaFail = `Silibus_Personal_${bersih(cawanganLabel)}.pdf`
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
        const ws = wb.addWorksheet('Silibus Personal')
        ws.columns = [{ width: 40 }, { width: 46 }, { width: 12 }, { width: 14 }]
        ws.mergeCells('A1:D1'); ws.getCell('A1').value = 'CHESS FOR KIDS (CFK)'; ws.getCell('A1').font = { bold: true, size: 14 }; ws.getCell('A1').alignment = { horizontal: 'center' }
        ws.mergeCells('A2:D2'); ws.getCell('A2').value = `Silibus Personal — ${pelajarAktif.nama_penuh}`; ws.getCell('A2').font = { size: 10, italic: true }; ws.getCell('A2').alignment = { horizontal: 'center' }
        const head = ws.getRow(4);['Tajuk Besar', 'Subtajuk', 'MS', 'Status'].forEach((h, i) => { head.getCell(i + 1).value = h; styleHead(head.getCell(i + 1), i === 3 ? 'center' : 'left') })
        let r = 5
        for (const t of tajukAktif) {
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
        namaFail = `Silibus_Personal_${bersih(pelajarAktif.nama_penuh)}.xlsx`
      } else {
        const ws = wb.addWorksheet('Silibus Personal')
        ws.columns = [{ width: 6 }, { width: 40 }, { width: 22 }, { width: 12 }, { width: 10 }]
        ws.mergeCells('A1:E1'); ws.getCell('A1').value = 'CHESS FOR KIDS (CFK)'; ws.getCell('A1').font = { bold: true, size: 14 }; ws.getCell('A1').alignment = { horizontal: 'center' }
        ws.mergeCells('A2:E2'); ws.getCell('A2').value = `Silibus Personal — ${cawanganLabel}`; ws.getCell('A2').font = { size: 10, italic: true }; ws.getCell('A2').alignment = { horizontal: 'center' }
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
        namaFail = `Silibus_Personal_${bersih(cawanganLabel)}.xlsx`
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

  // ---- Gaya kongsi ----
  const chip = (warna: { bg: string; text: string; border: string }, teks: string) => (
    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '6px', background: warna.bg, color: warna.text, border: `1px solid ${warna.border}` }}>{teks}</span>
  )
  const btnKecil = { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 10px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '9px', fontSize: '12px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, whiteSpace: 'nowrap' } as const
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
  const btnTambahTajuk = (
    <button onClick={() => setModalTajuk({ buka: true, edit: null })} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'var(--accent)', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--accent-text)', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
      <Plus size={15} /> Tambah Tajuk Besar
    </button>
  )

  // ---- Render satu Tajuk Besar (accordion). pelajarId null = mod urus template. ----
  const renderTajuk = (t: TajukBesar, pelajarId: string | null) => {
    const subs = subIkutTajuk.get(t.id) ?? []
    const buka = kembang.has(t.id) || (pelajarId != null && tajukAktif.length === 1)
    const ringkas = pelajarId ? kiraProgresCawangan(subs, peta, pelajarId) : null
    return (
      <div key={t.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', opacity: t.status === 'Tidak Aktif' ? 0.6 : 1 }}>
        {/* Header Tajuk Besar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', background: '#F8FAFC', borderBottom: buka ? '1px solid var(--border)' : 'none', flexWrap: 'wrap' }}>
          <button onClick={() => toggleKembang(t.id)} aria-label={buka ? 'Kuncup' : 'Kembang'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex', flexShrink: 0 }}>
            {buka ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
          <div style={{ flex: 1, minWidth: '200px', cursor: 'pointer' }} onClick={() => toggleKembang(t.id)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text)' }}>{t.nama}</span>
              {t.status === 'Tidak Aktif' && chip({ bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' }, 'Tersorok')}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {subs.length} subtajuk
              {ringkas && ` · ${ringkas.selesai}/${ringkas.jumlah} selesai (${ringkas.peratus}%)`}
              {t.nota && ` · ${t.nota}`}
            </div>
            {ringkas && ringkas.jumlah > 0 && (
              <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '99px', marginTop: '7px', maxWidth: '320px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${ringkas.peratus}%`, background: '#10B981', borderRadius: '99px' }} />
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: 'auto', flexWrap: 'wrap' }}>
            {t.pautan && (
              <a href={t.pautan} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} aria-label={`Buka pautan ${t.nama}`} style={{ ...btnKecil, textDecoration: 'none', color: '#2563EB' }}>
                <ExternalLink size={13} /> Pautan
              </a>
            )}
            <button onClick={() => setModalSub({ tajuk: t, edit: null })} style={btnKecil}>
              <Plus size={13} /> Subtajuk
            </button>
            <button onClick={() => setModalTajuk({ buka: true, edit: t })} aria-label={`Edit ${t.nama}`} style={btnKecil}>
              <Pencil size={13} /> Edit
            </button>
          </div>
        </div>

        {/* Senarai subtajuk */}
        {buka && (
          subs.length === 0 ? (
            <div style={{ padding: '18px 16px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
              Belum ada subtajuk. Klik &quot;Subtajuk&quot; untuk tambah (guna &quot;Tambah Pukal&quot; jika banyak bab sekaligus).
            </div>
          ) : (
            <div>
              {subs.map((s, i) => {
                const st = pelajarId ? statusSubtajuk(peta, s.id, pelajarId) : null
                const bukaDetail = detail === s.id
                const adaBahan = s.fen || s.pgn_path || s.pgn_teks || s.nota || s.pautan
                return (
                  <div key={s.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '180px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>{s.nama}</span>
                          {s.fen && chip({ bg: '#EEF2FF', text: '#4338CA', border: '#C7D2FE' }, 'FEN')}
                          {(s.pgn_path || s.pgn_teks) && chip({ bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' }, 'PGN')}
                          {s.pautan && chip({ bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE' }, 'Pautan')}
                          {s.nota && chip({ bg: '#FEFCE8', text: '#854D0E', border: '#FEF08A' }, s.nota)}
                        </div>
                      </div>

                      {/* Kawalan progress — hanya bila pelajar dipilih */}
                      {pelajarId && (
                        <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                          {STATUS_PROGRES.map((stx) => {
                            const aktif = st === stx
                            const w = WARNA_PROGRES[stx]
                            return (
                              <button
                                key={stx}
                                onClick={() => tulisProgress([{ subtajuk_id: s.id, status: stx }])}
                                disabled={sibuk === s.id}
                                style={{ padding: '5px 11px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap', background: aktif ? w.bg : 'transparent', color: aktif ? w.text : 'var(--text-muted)', border: `1.5px solid ${aktif ? w.border : 'var(--border)'}` }}
                              >
                                {stx}
                              </button>
                            )
                          })}
                        </div>
                      )}

                      {adaBahan ? (
                        <button onClick={() => setDetail(bukaDetail ? null : s.id)} style={{ ...btnKecil, padding: '6px 9px' }}>
                          {bukaDetail ? <ChevronDown size={13} /> : <ChevronRight size={13} />} Bahan
                        </button>
                      ) : (
                        <span style={{ width: '1px' }} />
                      )}
                      {pelajarId ? (
                        <button onClick={() => tandaHinggaSini(t.id, s)} disabled={sibuk === s.id} title="Tandakan semua bab hingga sini sebagai Selesai" style={btnKecil}>
                          <Check size={13} /> Hingga sini
                        </button>
                      ) : (
                        <button onClick={() => setModalSub({ tajuk: t, edit: s })} aria-label={`Edit ${s.nama}`} style={btnKecil}>
                          <Pencil size={13} /> Edit
                        </button>
                      )}
                    </div>

                    {/* Detail bahan */}
                    {bukaDetail && adaBahan && (
                      <div style={{ padding: '4px 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#FCFCFD' }}>
                        {s.fen && (
                          <div>
                            <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>FEN</div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <code style={{ flex: 1, fontSize: '12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 10px', overflowX: 'auto', whiteSpace: 'nowrap' }}>{s.fen}</code>
                              <button onClick={() => salin(s.fen!, 'FEN')} style={{ ...btnKecil, padding: '7px 9px' }}><Copy size={13} /> Salin</button>
                            </div>
                          </div>
                        )}
                        {(s.pgn_path || s.pgn_teks) && (
                          <div>
                            <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>PGN</div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              {s.pgn_path && (
                                <button onClick={() => bukaPgn(s)} disabled={sibuk === s.id} style={btnKecil}>
                                  <FileText size={13} /> {sibuk === s.id ? 'Membuka...' : `Buka Fail${s.pgn_nama ? ` (${s.pgn_nama})` : ''}`}
                                </button>
                              )}
                              {s.pgn_teks && (
                                <button onClick={() => salin(s.pgn_teks!, 'PGN')} style={btnKecil}><Copy size={13} /> Salin PGN</button>
                              )}
                            </div>
                            {s.pgn_teks && (
                              <pre style={{ marginTop: '8px', fontSize: '12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', overflowX: 'auto', whiteSpace: 'pre-wrap', maxHeight: '160px' }}>{s.pgn_teks}</pre>
                            )}
                          </div>
                        )}
                        {s.nota && (
                          <div>
                            <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Nota</div>
                            <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{s.nota}</div>
                          </div>
                        )}
                        {s.pautan && (
                          <div>
                            <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Pautan</div>
                            <a href={s.pautan} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#2563EB', textDecoration: 'none', fontWeight: 600, wordBreak: 'break-all' }}>
                              <ExternalLink size={13} /> {s.pautan}
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>
    )
  }

  const modals = (
    <>
      {modalTajuk.buka && (
        <ModalTajuk
          tajukEdit={modalTajuk.edit}
          jenisBaru="Personal"
          onTutup={() => setModalTajuk({ buka: false, edit: null })}
          onBerjaya={() => { setModalTajuk({ buka: false, edit: null }); muatData() }}
        />
      )}
      {modalSub && (
        <ModalSubtajuk
          subtajukEdit={modalSub.edit}
          tajukId={modalSub.tajuk.id}
          tajukNama={modalSub.tajuk.nama}
          susunanSeterusnya={susunanSeterusnya(modalSub.tajuk.id)}
          onTutup={() => setModalSub(null)}
          onBerjaya={() => { const t = modalSub.tajuk; setModalSub(null); setKembang((p) => new Set(p).add(t.id)); muatData() }}
        />
      )}
    </>
  )

  // ========================================================
  // DETAIL — seorang pelajar Personal
  // ========================================================
  if (pelajarAktif) {
    const ringkas = kiraProgresCawangan(subAktif, peta, pelajarAktif.id)
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <button onClick={() => { setPelajarPilih(null); setDetail(null) }} style={btnKecil}>
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

        {tajukAktif.length === 0 ? (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '40px', textAlign: 'center', fontSize: '13.5px', color: 'var(--text-muted)' }}>
            Belum ada template kurikulum Personal yang aktif. Kembali ke senarai untuk tambah Tajuk Besar.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tajukAktif.map((t) => renderTajuk(t, pelajarAktif.id))}
          </div>
        )}
        {modals}
      </div>
    )
  }

  // ========================================================
  // OVERVIEW — senarai pelajar Personal + urus template
  // ========================================================
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
            <input value={carian} onChange={(e) => setCarian(e.target.value)} placeholder="Nama pelajar Personal..." style={{ padding: '9px 12px 9px 34px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13.5px', color: 'var(--text)', background: 'var(--card)', outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }} />
          </div>
        </div>
      </div>

      {/* Progress pelajar Personal */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', flex: 1, minWidth: '240px' }}>
          {pelajarTapis.length} pelajar Personal · template: {jumlahSub} subtajuk{tajukAktif.length > 0 && ` (${tajukAktif.map((t) => t.nama).join(', ')})`}. Disusun <strong>paling tertinggal dahulu</strong> — klik nama untuk rekod progress.
        </p>
        {pelajarTapis.length > 0 && <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{btnPDF}{btnExcel}</div>}
      </div>

      {pelajarTapis.length === 0 ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '40px', textAlign: 'center', fontSize: '13.5px', color: 'var(--text-muted)' }}>
          Tiada pelajar Personal sepadan. Pelajar dengan jenis kelas mengandungi &quot;Personal&quot; akan muncul di sini.
        </div>
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
          {pelajarTapis.map(({ p, ringkas }, i) => (
            <div
              key={p.id}
              role="button"
              tabIndex={0}
              onClick={() => { setPelajarPilih(p.id); setDetail(null); setKembang(new Set(tajukAktif.map((t) => t.id))) }}
              onKeyDown={(e) => { if (e.key === 'Enter') { setPelajarPilih(p.id); setDetail(null); setKembang(new Set(tajukAktif.map((t) => t.id))) } }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderTop: i > 0 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}
            >
              <div style={{ flex: 1, minWidth: '140px' }}>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>{p.nama_penuh}</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '1px' }}>{petaCawangan.get(p.cawangan_daftar_id) ?? '—'} · {p.jenis_kelas}</div>
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

      {/* Urus template kurikulum Personal */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginTop: '26px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>Template Kurikulum Personal</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Bina Tajuk Besar &rarr; Subtajuk yang dikongsi semua pelajar Personal. Pilih pelajar di atas untuk tanda progress individu.
          </p>
        </div>
        {btnTambahTajuk}
      </div>

      {tajukSemua.length === 0 ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '40px', textAlign: 'center', fontSize: '13.5px', color: 'var(--text-muted)' }}>
          Belum ada template. Klik &quot;Tambah Tajuk Besar&quot; untuk mula bina silibus khas pelajar Personal, kemudian tambah subtajuk (bab) di dalamnya.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tajukSemua.map((t) => renderTajuk(t, null))}
        </div>
      )}

      {modals}
    </div>
  )
}
