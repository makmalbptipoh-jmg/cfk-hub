'use client'

import { useState, useEffect } from 'react'
import { Users, Download, FileSpreadsheet } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { akhirBulan } from '@/lib/utils'
import { toast } from '@/lib/stores/toast-store'
import type { BarisKelas } from '@/components/pdf/LaporanKelasPDF'

type Cawangan = { id: string; nama: string }

function bulanMY(input: string) {
  const [yr, mo] = input.split('-')
  const d = new Date(parseInt(yr), parseInt(mo) - 1, 1)
  return { nama: d.toLocaleString('ms-MY', { month: 'long' }), tahun: parseInt(yr), mula: `${yr}-${mo}-01`, akhir: akhirBulan(parseInt(yr), parseInt(mo)) }
}
function bulanSemasa() {
  const d = new Date(Date.now() + 8 * 60 * 60 * 1000)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

type Hasil = { cawanganNama: string; bulan: string; tahun: number; baris: BarisKelas[] }

const inputStyle = {
  width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: '12px',
  fontSize: '13.5px', color: 'var(--text)', background: 'var(--card)', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const,
}

export function LaporanKelasKlient() {
  const [cawangan, setCawangan] = useState<Cawangan[]>([])
  const [cawId, setCawId] = useState('')
  const [bulanInput, setBulanInput] = useState(bulanSemasa())
  const [hasil, setHasil] = useState<Hasil | null>(null)
  const [loading, setLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [xlsLoading, setXlsLoading] = useState(false)

  useEffect(() => {
    createClient().from('cawangan').select('id, nama').eq('status', 'Aktif').order('nama').then(({ data }) => setCawangan(data ?? []))
  }, [])

  const jana = async () => {
    if (!cawId) return
    setLoading(true)
    setHasil(null)
    const supabase = createClient()
    const b = bulanMY(bulanInput)

    const { data: students } = await supabase
      .from('pelajar')
      .select('id, nama_penuh, jenis_kelas')
      .eq('status', 'Aktif')
      .eq('cawangan_daftar_id', cawId)
      .order('nama_penuh')

    const ids = (students ?? []).map((s) => s.id)
    let kehadiran: { pelajar_id: string; status: string }[] = []
    if (ids.length > 0) {
      const { data } = await supabase.from('kehadiran').select('pelajar_id, status').gte('tarikh', b.mula).lte('tarikh', b.akhir).in('pelajar_id', ids)
      kehadiran = (data ?? []) as any
    }

    const kira: Record<string, { hadir: number; tidakHadir: number; cuti: number }> = {}
    for (const k of kehadiran) {
      const c = (kira[k.pelajar_id] ??= { hadir: 0, tidakHadir: 0, cuti: 0 })
      if (k.status === 'Hadir') c.hadir++
      else if (k.status === 'Tidak Hadir') c.tidakHadir++
      else if (k.status === 'Cuti') c.cuti++
    }

    const baris: BarisKelas[] = (students ?? []).map((s) => {
      const c = kira[s.id] ?? { hadir: 0, tidakHadir: 0, cuti: 0 }
      const total = c.hadir + c.tidakHadir + c.cuti
      return {
        nama_penuh: s.nama_penuh,
        jenis_kelas: s.jenis_kelas,
        hadir: c.hadir,
        tidakHadir: c.tidakHadir,
        cuti: c.cuti,
        peratus: total > 0 ? Math.round((c.hadir / total) * 100) : 0,
      }
    })

    setHasil({ cawanganNama: cawangan.find((c) => c.id === cawId)?.nama ?? '—', bulan: b.nama, tahun: b.tahun, baris })
    setLoading(false)
  }

  const namaFail = (ext: string) => `Laporan_Kelas_${(hasil?.cawanganNama ?? '').replace(/[\\/:*?"<>|]/g, '-')}_${hasil?.bulan}_${hasil?.tahun}.${ext}`

  const unduhPDF = async () => {
    if (!hasil) return
    setPdfLoading(true)
    try {
      const { pdf } = await import('@react-pdf/renderer')
      const { LaporanKelasPDF } = await import('@/components/pdf/LaporanKelasPDF')
      const blob = await pdf(<LaporanKelasPDF cawangan={hasil.cawanganNama} bulan={hasil.bulan} tahun={hasil.tahun} baris={hasil.baris} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = namaFail('pdf'); a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF laporan kelas dimuat turun.')
    } catch (e) {
      console.error(e)
      toast.error('Gagal jana PDF. Refresh (Ctrl+Shift+R) dan cuba lagi.')
    } finally { setPdfLoading(false) }
  }

  const unduhExcel = async () => {
    if (!hasil) return
    setXlsLoading(true)
    try {
      const ExcelJS = (await import('exceljs')).default
      const wb = new ExcelJS.Workbook()
      wb.creator = 'CFK HUB'
      const ws = wb.addWorksheet('Kehadiran Kelas')
      ws.columns = [{ width: 6 }, { width: 34 }, { width: 16 }, { width: 10 }, { width: 12 }, { width: 10 }, { width: 10 }]
      ws.mergeCells('A1:G1'); ws.getCell('A1').value = 'CHESS FOR KIDS (CFK)'; ws.getCell('A1').font = { bold: true, size: 14 }; ws.getCell('A1').alignment = { horizontal: 'center' }
      ws.mergeCells('A2:G2'); ws.getCell('A2').value = `Laporan Kehadiran Kelas — ${hasil.cawanganNama} — ${hasil.bulan} ${hasil.tahun}`; ws.getCell('A2').font = { size: 10, italic: true }; ws.getCell('A2').alignment = { horizontal: 'center' }

      const head = ws.getRow(4)
      ;['No.', 'Nama Pelajar', 'Jenis', 'Hadir', 'Tidak Hadir', 'Cuti', '%'].forEach((h, i) => {
        const cell = head.getCell(i + 1)
        cell.value = h; cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }
        cell.alignment = { horizontal: i >= 3 ? 'right' : 'left' }
      })

      let r = 5
      for (const [i, b] of hasil.baris.entries()) {
        const row = ws.getRow(r)
        row.getCell(1).value = i + 1
        row.getCell(2).value = b.nama_penuh
        row.getCell(3).value = b.jenis_kelas
        row.getCell(4).value = b.hadir
        row.getCell(5).value = b.tidakHadir
        row.getCell(6).value = b.cuti
        row.getCell(7).value = b.peratus / 100
        row.getCell(7).numFmt = '0%'
        r++
      }
      const total = ws.getRow(r)
      total.getCell(2).value = 'JUMLAH'; total.getCell(2).font = { bold: true }
      total.getCell(4).value = hasil.baris.reduce((s, b) => s + b.hadir, 0)
      total.getCell(5).value = hasil.baris.reduce((s, b) => s + b.tidakHadir, 0)
      total.getCell(6).value = hasil.baris.reduce((s, b) => s + b.cuti, 0)
      const purata = hasil.baris.length > 0 ? hasil.baris.reduce((s, b) => s + b.peratus, 0) / hasil.baris.length / 100 : 0
      total.getCell(7).value = purata; total.getCell(7).numFmt = '0%'
      for (let c = 4; c <= 7; c++) total.getCell(c).font = { bold: true }

      const buffer = await wb.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = namaFail('xlsx'); a.click()
      URL.revokeObjectURL(url)
      toast.success('Excel laporan kelas dimuat turun.')
    } catch (e) {
      console.error(e)
      toast.error('Gagal jana Excel. Cuba lagi.')
    } finally { setXlsLoading(false) }
  }

  const b = bulanMY(bulanInput)

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <Users size={16} style={{ color: 'var(--text)' }} />
        <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>Laporan Per Kelas (Cawangan)</h2>
      </div>
      <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '18px' }}>Ringkasan kehadiran semua pelajar satu cawangan untuk sebulan — muat turun PDF atau Excel.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'end' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cawangan / Kelas</label>
          <select value={cawId} onChange={(e) => setCawId(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="">— Pilih cawangan —</option>
            {cawangan.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bulan</label>
          <input type="month" value={bulanInput} onChange={(e) => setBulanInput(e.target.value)} style={inputStyle} />
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>{b.nama} {b.tahun}</p>
        </div>
      </div>

      <button
        onClick={jana}
        disabled={!cawId || loading}
        style={{ marginTop: '16px', padding: '11px 24px', background: !cawId || loading ? '#94A3B8' : 'var(--primary)', border: 'none', borderRadius: '12px', fontSize: '13.5px', fontWeight: 700, color: '#FFFFFF', cursor: !cawId || loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <Users size={15} />
        {loading ? 'Memuatkan...' : 'Jana Laporan Kelas'}
      </button>

      {hasil && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text)' }}>{hasil.cawanganNama}</strong> · {hasil.bulan} {hasil.tahun} · {hasil.baris.length} pelajar
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={unduhPDF} disabled={pdfLoading} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: pdfLoading ? '#94A3B8' : 'var(--accent)', border: 'none', borderRadius: '10px', fontSize: '12.5px', fontWeight: 700, color: 'var(--accent-text)', cursor: pdfLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                <Download size={14} /> {pdfLoading ? 'Jana...' : 'PDF'}
              </button>
              <button onClick={unduhExcel} disabled={xlsLoading} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '12.5px', fontWeight: 700, color: 'var(--text)', cursor: xlsLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                <FileSpreadsheet size={14} /> {xlsLoading ? 'Jana...' : 'Excel'}
              </button>
            </div>
          </div>

          {hasil.baris.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', border: '1px solid var(--border)', borderRadius: '12px' }}>Tiada pelajar aktif untuk cawangan ini.</div>
          ) : (
            <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                    {['Nama', 'Hadir', 'T.Hadir', 'Cuti', '%'].map((h, i) => (
                      <th key={h} style={{ padding: '9px 14px', textAlign: i === 0 ? 'left' : 'right', fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hasil.baris.map((row, i) => (
                    <tr key={i} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', background: i % 2 === 1 ? '#FAFBFC' : 'transparent' }}>
                      <td style={{ padding: '9px 14px', fontSize: '13px', color: 'var(--text)' }}>{row.nama_penuh}</td>
                      <td style={{ padding: '9px 14px', fontSize: '13px', fontWeight: 700, color: '#166534', textAlign: 'right' }}>{row.hadir}</td>
                      <td style={{ padding: '9px 14px', fontSize: '13px', color: '#9F1239', textAlign: 'right' }}>{row.tidakHadir}</td>
                      <td style={{ padding: '9px 14px', fontSize: '13px', color: '#92400E', textAlign: 'right' }}>{row.cuti}</td>
                      <td style={{ padding: '9px 14px', fontSize: '13px', fontWeight: 700, color: '#1E40AF', textAlign: 'right' }}>{row.peratus}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
