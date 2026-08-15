'use client'

import { useCallback, useMemo, useState } from 'react'
import { Plus, Pencil, ChevronDown, ChevronRight, Copy, FileText, ExternalLink, Printer, FileSpreadsheet } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { tarikhTempatan } from '@/lib/utils'
import { toast } from '@/lib/stores/toast-store'
import {
  STATUS_PROGRES, WARNA_PROGRES, PGN_BUCKET, petaProgres, statusSubtajuk, kiraProgresCawangan,
  type TajukBesar, type Subtajuk, type ProgresBaris, type StatusProgres,
} from '@/lib/silibus'
import type { Cawangan } from './LogHarianKlient'
import { ModalTajuk } from './ModalTajuk'
import { ModalSubtajuk } from './ModalSubtajuk'

export function SilibusIndukKlient({
  cawangan,
  tajukAwal,
  subtajukAwal,
  progressAwal,
}: {
  cawangan: Cawangan[]
  tajukAwal: TajukBesar[]
  subtajukAwal: Subtajuk[]
  progressAwal: ProgresBaris[]
}) {
  const [tajuks, setTajuks] = useState<TajukBesar[]>(tajukAwal)
  const [subtajuks, setSubtajuks] = useState<Subtajuk[]>(subtajukAwal)
  const [progress, setProgress] = useState<ProgresBaris[]>(progressAwal)
  const [cawanganPilih, setCawanganPilih] = useState('') // '' = Semua Cawangan (ringkasan)
  const [kembang, setKembang] = useState<Set<string>>(new Set(tajukAwal.slice(0, 1).map((t) => t.id)))
  const [detail, setDetail] = useState<string | null>(null)
  const [sibuk, setSibuk] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [xlsLoading, setXlsLoading] = useState(false)

  const [modalTajuk, setModalTajuk] = useState<{ buka: boolean; edit: TajukBesar | null }>({ buka: false, edit: null })
  const [modalSub, setModalSub] = useState<{ tajuk: TajukBesar; edit: Subtajuk | null } | null>(null)

  const muatData = useCallback(async () => {
    const supabase = createClient()
    const [rT, rS, rP] = await Promise.all([
      supabase.from('silibus_tajuk').select('id, nama, susunan, nota, pautan, status').order('susunan').order('nama'),
      supabase.from('silibus_subtajuk').select('id, tajuk_id, nama, susunan, fen, pgn_teks, pgn_path, pgn_nama, pgn_saiz, nota, pautan').order('susunan'),
      supabase.from('silibus_progress').select('id, subtajuk_id, cawangan_id, status'),
    ])
    if (rT.data) setTajuks(rT.data as TajukBesar[])
    if (rS.data) setSubtajuks(rS.data as Subtajuk[])
    if (rP.data) setProgress(rP.data as ProgresBaris[])
  }, [])

  const peta = useMemo(() => petaProgres(progress), [progress])
  const subIkutTajuk = useMemo(() => {
    const m = new Map<string, Subtajuk[]>()
    for (const s of subtajuks) {
      if (!m.has(s.tajuk_id)) m.set(s.tajuk_id, [])
      m.get(s.tajuk_id)!.push(s)
    }
    for (const arr of m.values()) arr.sort((a, b) => a.susunan - b.susunan)
    return m
  }, [subtajuks])

  const toggleKembang = (id: string) => {
    setKembang((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }

  const ubahStatus = async (subtajukId: string, status: StatusProgres) => {
    if (!cawanganPilih) return
    setSibuk(subtajukId)
    // Kemas kini optimistik
    setProgress((prev) => {
      const lain = prev.filter((p) => !(p.subtajuk_id === subtajukId && p.cawangan_id === cawanganPilih))
      return [...lain, { id: 'temp', subtajuk_id: subtajukId, cawangan_id: cawanganPilih, status }]
    })
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('silibus_progress').upsert(
      {
        subtajuk_id: subtajukId,
        cawangan_id: cawanganPilih,
        status,
        tarikh_selesai: status === 'Selesai' ? tarikhTempatan() : null,
        dikemaskini_oleh: user?.id ?? null,
        dikemaskini_pada: new Date().toISOString(),
      },
      { onConflict: 'subtajuk_id,cawangan_id' }
    )
    setSibuk(null)
    if (error) {
      console.error(error)
      toast.error('Gagal simpan progress. Cuba lagi.')
      muatData()
    }
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

  const susunanSeterusnya = (tajukId: string) => {
    const arr = subIkutTajuk.get(tajukId) ?? []
    return arr.length ? Math.max(...arr.map((s) => s.susunan)) + 1 : 10
  }

  const tarikhRingkas = (t: string) => t.split('-').reverse().join('/')

  const unduhPDF = async () => {
    setPdfLoading(true)
    try {
      const { pdf } = await import('@react-pdf/renderer')
      const { LaporanSilibusIndukPDF } = await import('@/components/pdf/LaporanSilibusIndukPDF')
      const kolCaw = cawanganPilih ? cawangan.filter((c) => c.id === cawanganPilih) : cawangan
      const dataTajuk = tajuks
        .map((t) => ({
          nama: t.nama,
          nota: t.nota ?? '',
          subtajuk: (subIkutTajuk.get(t.id) ?? []).map((s) => ({
            nama: s.nama,
            statuses: kolCaw.map((c) => statusSubtajuk(peta, s.id, c.id)),
          })),
        }))
        .filter((t) => t.subtajuk.length > 0)
      const cawanganLabel = cawanganPilih ? (kolCaw[0]?.nama ?? 'Cawangan') : 'Semua Cawangan'
      const blob = await pdf(
        <LaporanSilibusIndukPDF
          mode={cawanganPilih ? 'satu' : 'semua'}
          cawanganLabel={cawanganLabel}
          cawanganNama={kolCaw.map((c) => c.nama)}
          tajuk={dataTajuk}
          tarikhJana={tarikhRingkas(tarikhTempatan())}
        />
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const bersih = (str: string) => str.replace(/[\\/:*?"<>|—]/g, '-').replace(/\s+/g, '_')
      a.href = url
      a.download = `Silibus_Kurikulum_${bersih(cawanganLabel)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF silibus dimuat turun.')
    } catch (e) {
      console.error(e)
      toast.error('Gagal jana PDF. Refresh (Ctrl+Shift+R) dan cuba lagi.')
    } finally {
      setPdfLoading(false)
    }
  }

  const unduhExcel = async () => {
    setXlsLoading(true)
    try {
      const ExcelJS = (await import('exceljs')).default
      const kolCaw = cawanganPilih ? cawangan.filter((c) => c.id === cawanganPilih) : cawangan
      const cawanganLabel = cawanganPilih ? (kolCaw[0]?.nama ?? 'Cawangan') : 'Semua Cawangan'
      const WARNA_XLS: Record<StatusProgres, { fill: string; font: string }> = {
        Selesai: { fill: 'FFDCFCE7', font: 'FF166534' },
        Sedang: { fill: 'FFFEF9C3', font: 'FF854D0E' },
        Belum: { fill: 'FFF1F5F9', font: 'FF94A3B8' },
      }

      const wb = new ExcelJS.Workbook()
      wb.creator = 'CFK HUB'
      wb.created = new Date()
      const ws = wb.addWorksheet('Silibus Kurikulum')
      const ncol = 2 + kolCaw.length
      ws.columns = [{ width: 42 }, { width: 42 }, ...kolCaw.map(() => ({ width: 14 }))]

      ws.mergeCells(1, 1, 1, ncol)
      ws.getCell('A1').value = 'CHESS FOR KIDS (CFK)'
      ws.getCell('A1').font = { bold: true, size: 14 }
      ws.getCell('A1').alignment = { horizontal: 'center' }
      ws.mergeCells(2, 1, 2, ncol)
      ws.getCell('A2').value = `Silibus Kurikulum & Progress — ${cawanganLabel}`
      ws.getCell('A2').font = { size: 10, italic: true }
      ws.getCell('A2').alignment = { horizontal: 'center' }

      const head = ws.getRow(4)
      const headers = ['Tajuk Besar', 'Subtajuk', ...kolCaw.map((c) => c.nama)]
      headers.forEach((h, i) => {
        const cell = head.getCell(i + 1)
        cell.value = h
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }
        cell.alignment = { horizontal: i < 2 ? 'left' : 'center' }
      })

      let r = 5
      for (const t of tajuks) {
        const subs = subIkutTajuk.get(t.id) ?? []
        if (subs.length === 0) continue
        for (const sub of subs) {
          const row = ws.getRow(r)
          row.getCell(1).value = t.nama
          row.getCell(2).value = sub.nama
          kolCaw.forEach((c, ci) => {
            const st = statusSubtajuk(peta, sub.id, c.id)
            const cell = row.getCell(3 + ci)
            cell.value = st
            cell.alignment = { horizontal: 'center' }
            cell.font = { color: { argb: WARNA_XLS[st].font }, bold: st !== 'Belum' }
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: WARNA_XLS[st].fill } }
          })
          r++
        }
      }
      if (r === 5) {
        ws.getCell('A5').value = 'Tiada Tajuk Besar dengan subtajuk untuk dilaporkan.'
        ws.getCell('A5').font = { italic: true, color: { argb: 'FF94A3B8' } }
        r++
      }
      r += 1
      ws.getCell(`A${r}`).value = `Dijana oleh CFK HUB pada ${new Date().toLocaleDateString('ms-MY')}`
      ws.getCell(`A${r}`).font = { size: 9, color: { argb: 'FF64748B' } }

      const buffer = await wb.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const bersih = (str: string) => str.replace(/[\\/:*?"<>|—]/g, '-').replace(/\s+/g, '_')
      a.href = url
      a.download = `Silibus_Kurikulum_${bersih(cawanganLabel)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Excel silibus dimuat turun.')
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

  return (
    <div>
      {/* Kawalan */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '18px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Progress Cawangan
          </label>
          <select
            value={cawanganPilih}
            onChange={(e) => setCawanganPilih(e.target.value)}
            style={{ padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13.5px', color: 'var(--text)', background: 'var(--card)', outline: 'none', fontFamily: 'inherit', cursor: 'pointer', minWidth: '240px' }}
          >
            <option value="">Semua Cawangan (ringkasan)</option>
            {cawangan.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {tajuks.length > 0 && (
            <>
              <button
                onClick={unduhPDF}
                disabled={pdfLoading}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', background: pdfLoading ? '#94A3B8' : 'var(--primary)', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: '#fff', cursor: pdfLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
              >
                <Printer size={14} /> {pdfLoading ? 'Menjana...' : 'PDF'}
              </button>
              <button
                onClick={unduhExcel}
                disabled={xlsLoading}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', background: xlsLoading ? '#94A3B8' : '#16A34A', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: '#fff', cursor: xlsLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
              >
                <FileSpreadsheet size={14} /> {xlsLoading ? 'Menjana...' : 'Excel'}
              </button>
            </>
          )}
          <button
            onClick={() => setModalTajuk({ buka: true, edit: null })}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'var(--accent)', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--accent-text)', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <Plus size={15} /> Tambah Tajuk Besar
          </button>
        </div>
      </div>

      {tajuks.length === 0 ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '40px', textAlign: 'center', fontSize: '13.5px', color: 'var(--text-muted)' }}>
          Belum ada Tajuk Besar. Klik &quot;Tambah Tajuk Besar&quot; untuk mula bina silibus induk (cth &quot;Short &amp; Sweet: London System&quot;), kemudian tambah subtajuk (bab) di dalamnya.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tajuks.map((t) => {
            const subs = subIkutTajuk.get(t.id) ?? []
            const buka = kembang.has(t.id)
            const ringkas = cawanganPilih ? kiraProgresCawangan(subs, peta, cawanganPilih) : null
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
                        const status = cawanganPilih ? statusSubtajuk(peta, s.id, cawanganPilih) : null
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
                                  {s.nota && chip({ bg: '#FEFCE8', text: '#854D0E', border: '#FEF08A' }, 'Nota')}
                                </div>
                              </div>

                              {/* Kawalan progress */}
                              {cawanganPilih ? (
                                <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                                  {STATUS_PROGRES.map((st) => {
                                    const aktif = status === st
                                    const w = WARNA_PROGRES[st]
                                    return (
                                      <button
                                        key={st}
                                        onClick={() => ubahStatus(s.id, st)}
                                        disabled={sibuk === s.id}
                                        style={{
                                          padding: '5px 11px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                                          background: aktif ? w.bg : 'transparent', color: aktif ? w.text : 'var(--text-muted)',
                                          border: `1.5px solid ${aktif ? w.border : 'var(--border)'}`,
                                          flexShrink: 0, whiteSpace: 'nowrap',
                                        }}
                                      >
                                        {st}
                                      </button>
                                    )
                                  })}
                                </div>
                              ) : (
                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                                  {cawangan.map((c) => {
                                    const st = statusSubtajuk(peta, s.id, c.id)
                                    const w = WARNA_PROGRES[st]
                                    return (
                                      <span key={c.id} title={`${c.nama}: ${st}`} style={{ width: '11px', height: '11px', borderRadius: '50%', background: st === 'Belum' ? '#E2E8F0' : w.text, display: 'inline-block' }} />
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
                              <button onClick={() => setModalSub({ tajuk: t, edit: s })} aria-label={`Edit ${s.nama}`} style={btnKecil}>
                                <Pencil size={13} /> Edit
                              </button>
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
          })}
        </div>
      )}

      {!cawanganPilih && tajuks.length > 0 && (
        <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '14px' }}>
          Mod ringkasan: setiap bulatan = satu cawangan (kelabu = Belum, kuning = Sedang, hijau = Selesai). Pilih cawangan di atas untuk tanda progress.
        </p>
      )}

      {modalTajuk.buka && (
        <ModalTajuk
          tajukEdit={modalTajuk.edit}
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
    </div>
  )
}
