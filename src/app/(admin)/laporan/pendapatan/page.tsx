'use client'

import { useState, useEffect, useCallback } from 'react'
import { Wallet, Download, FileSpreadsheet, Users, GraduationCap, ClipboardList } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatRinggit, bulanTempatan, NAMA_BULAN } from '@/lib/utils'
import { toast } from '@/lib/stores/toast-store'
import type { BarisPendapatan, BarisPelajar } from '@/components/pdf/LaporanPendapatanPDF'

type Cawangan = { id: string; nama: string }

// Baris resit yang dipulangkan — Supabase tidak menjana jenis relasi bersarang.
type ResitRow = {
  pelajar_id: string | null
  jenis: string
  jumlah: number
  pelajar: { nama_penuh: string; cawangan_daftar_id: string | null } | null
}

// Susunan jenis untuk label gabungan (cth. "Kumpulan, Pendaftaran")
const URUTAN_JENIS = ['Kumpulan', 'Personal', 'Pendaftaran']

const TIADA_CAWANGAN = 'Tiada Cawangan'

const inputStyle: React.CSSProperties = {
  padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: '10px',
  fontSize: '13.5px', color: 'var(--text)', background: 'var(--card)', outline: 'none',
  fontFamily: 'inherit', cursor: 'pointer',
}

export default function LaporanPendapatanPage() {
  const [bulanInput, setBulanInput] = useState(bulanTempatan()) // 'YYYY-MM'
  const [cawId, setCawId] = useState('')
  const [cawangan, setCawangan] = useState<Cawangan[]>([])
  const [loading, setLoading] = useState(true)
  const [baris, setBaris] = useState<BarisPendapatan[]>([])
  const [pelajarList, setPelajarList] = useState<BarisPelajar[]>([])
  const [bilResit, setBilResit] = useState(0)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [xlsLoading, setXlsLoading] = useState(false)

  useEffect(() => {
    createClient().from('cawangan').select('id, nama').eq('status', 'Aktif').order('nama').then(({ data }) => setCawangan(data ?? []))
  }, [])

  const [yr, mo] = bulanInput.split('-').map(Number)
  const namaBulan = NAMA_BULAN[mo - 1]
  const tempoh = `${namaBulan} ${yr}`
  const cawanganLabel = cawId ? (cawangan.find((c) => c.id === cawId)?.nama ?? 'Cawangan') : 'Semua Cawangan'

  const muatData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    // Pendapatan diikat pada BULAN YURAN (bulan_bayaran/tahun_bayaran) supaya
    // konsisten dengan widget "Pendapatan" di dashboard & Laporan Kewangan.
    const { data, error } = await supabase
      .from('resit')
      .select('pelajar_id, jenis, jumlah, pelajar:pelajar_id(nama_penuh, cawangan_daftar_id)')
      .eq('bulan_bayaran', NAMA_BULAN[mo - 1])
      .eq('tahun_bayaran', yr)
      .eq('status', 'Aktif')
      .limit(5000)

    if (error) {
      console.error(error)
      toast.error('Gagal ambil data pendapatan. Cuba lagi.')
      setLoading(false)
      return
    }

    const resit = (data ?? []) as unknown as ResitRow[]
    const namaCaw = new Map(cawangan.map((c) => [c.id, c.nama]))

    // Agregat cawangan → { kumpulan, personal, pendaftaran }
    const peta = new Map<string, { kumpulan: number; personal: number; pendaftaran: number }>()
    // Agregat pelajar (gabung semua resit seorang pelajar dalam tempoh) →
    // seorang boleh bayar Kumpulan + Pendaftaran serentak.
    const petaPelajar = new Map<string, { nama: string; cawangan: string; jenis: Set<string>; jumlah: number }>()
    let dikira = 0
    for (const r of resit) {
      const cid = r.pelajar?.cawangan_daftar_id ?? null
      // Tapis ikut cawangan dipilih (baris tanpa cawangan disembunyikan bila tapis)
      if (cawId && cid !== cawId) continue
      const label = cid ? (namaCaw.get(cid) ?? 'Cawangan Lain') : TIADA_CAWANGAN

      // — cawangan —
      const rec = peta.get(label) ?? { kumpulan: 0, personal: 0, pendaftaran: 0 }
      if (r.jenis === 'Kumpulan') rec.kumpulan += r.jumlah ?? 0
      else if (r.jenis === 'Personal') rec.personal += r.jumlah ?? 0
      else if (r.jenis === 'Pendaftaran') rec.pendaftaran += r.jumlah ?? 0
      else rec.kumpulan += r.jumlah ?? 0 // jenis lain jarang — masuk Kumpulan supaya jumlah tepat
      peta.set(label, rec)

      // — pelajar —
      const kunci = r.pelajar_id ?? `x-${r.pelajar?.nama_penuh ?? label}`
      const pel = petaPelajar.get(kunci) ?? { nama: r.pelajar?.nama_penuh ?? '—', cawangan: label, jenis: new Set<string>(), jumlah: 0 }
      pel.jenis.add(r.jenis)
      pel.jumlah += r.jumlah ?? 0
      petaPelajar.set(kunci, pel)

      dikira++
    }

    const senarai: BarisPendapatan[] = [...peta.entries()]
      .map(([label, v]) => ({
        cawangan: label,
        kumpulan: v.kumpulan,
        personal: v.personal,
        pendaftaran: v.pendaftaran,
        jumlah: v.kumpulan + v.personal + v.pendaftaran,
      }))
      // Susun: cawangan biasa ikut nama, "Tiada Cawangan" di hujung
      .sort((a, b) => {
        if (a.cawangan === TIADA_CAWANGAN) return 1
        if (b.cawangan === TIADA_CAWANGAN) return -1
        return a.cawangan.localeCompare(b.cawangan)
      })

    const senaraiPelajar: BarisPelajar[] = [...petaPelajar.values()]
      .map((p) => ({
        nama: p.nama,
        cawangan: p.cawangan,
        jenis: URUTAN_JENIS.filter((j) => p.jenis.has(j)).concat([...p.jenis].filter((j) => !URUTAN_JENIS.includes(j))).join(', '),
        jumlah: p.jumlah,
      }))
      // Susun ikut cawangan, kemudian jumlah tertinggi dahulu
      .sort((a, b) => {
        if (a.cawangan !== b.cawangan) {
          if (a.cawangan === TIADA_CAWANGAN) return 1
          if (b.cawangan === TIADA_CAWANGAN) return -1
          return a.cawangan.localeCompare(b.cawangan)
        }
        return b.jumlah - a.jumlah
      })

    setBaris(senarai)
    setPelajarList(senaraiPelajar)
    setBilResit(dikira)
    setLoading(false)
  }, [mo, yr, cawId, cawangan])

  useEffect(() => {
    muatData()
  }, [muatData])

  const total = baris.reduce(
    (t, b) => ({
      kumpulan: t.kumpulan + b.kumpulan,
      personal: t.personal + b.personal,
      pendaftaran: t.pendaftaran + b.pendaftaran,
      jumlah: t.jumlah + b.jumlah,
    }),
    { kumpulan: 0, personal: 0, pendaftaran: 0, jumlah: 0 }
  )

  const namaFail = (ext: string) => {
    const bersih = (s: string) => s.replace(/[\\/:*?"<>|—]/g, '-').replace(/\s+/g, '_')
    return `Laporan_Pendapatan_${bersih(cawanganLabel)}_${bersih(tempoh)}.${ext}`
  }

  const unduhPDF = async () => {
    if (baris.length === 0) return
    setPdfLoading(true)
    try {
      const { pdf } = await import('@react-pdf/renderer')
      const { LaporanPendapatanPDF } = await import('@/components/pdf/LaporanPendapatanPDF')
      const blob = await pdf(
        <LaporanPendapatanPDF
          tempoh={tempoh}
          cawanganLabel={cawanganLabel}
          baris={baris}
          pelajar={pelajarList}
          total={total}
          bilResit={bilResit}
        />
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = namaFail('pdf'); a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF laporan pendapatan dimuat turun.')
    } catch (e) {
      console.error(e)
      toast.error('Gagal jana PDF. Refresh (Ctrl+Shift+R) dan cuba lagi.')
    } finally { setPdfLoading(false) }
  }

  const unduhExcel = async () => {
    if (baris.length === 0) return
    setXlsLoading(true)
    try {
      const ExcelJS = (await import('exceljs')).default
      const FMT_RM = '#,##0.00'
      const wb = new ExcelJS.Workbook()
      wb.creator = 'CFK HUB'
      wb.created = new Date()
      const ws = wb.addWorksheet('Pendapatan Cawangan')
      ws.columns = [{ width: 26 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 16 }]

      ws.mergeCells('A1:E1')
      ws.getCell('A1').value = 'CHESS FOR KIDS (CFK)'
      ws.getCell('A1').font = { bold: true, size: 14 }
      ws.getCell('A1').alignment = { horizontal: 'center' }
      ws.mergeCells('A2:E2')
      ws.getCell('A2').value = `Laporan Pendapatan — ${tempoh} — ${cawanganLabel}`
      ws.getCell('A2').font = { size: 10, italic: true }
      ws.getCell('A2').alignment = { horizontal: 'center' }

      const head = ws.getRow(4)
      ;['Cawangan', 'Kumpulan (RM)', 'Personal (RM)', 'Pendaftaran (RM)', 'Jumlah (RM)'].forEach((h, i) => {
        const cell = head.getCell(i + 1)
        cell.value = h
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }
        cell.alignment = { horizontal: i === 0 ? 'left' : 'right' }
      })

      let r = 5
      for (const b of baris) {
        const row = ws.getRow(r)
        row.getCell(1).value = b.cawangan
        row.getCell(2).value = b.kumpulan
        row.getCell(3).value = b.personal
        row.getCell(4).value = b.pendaftaran
        row.getCell(5).value = b.jumlah
        for (let c = 2; c <= 5; c++) row.getCell(c).numFmt = FMT_RM
        r++
      }

      const totalRow = ws.getRow(r)
      totalRow.getCell(1).value = 'JUMLAH'
      totalRow.getCell(2).value = total.kumpulan
      totalRow.getCell(3).value = total.personal
      totalRow.getCell(4).value = total.pendaftaran
      totalRow.getCell(5).value = total.jumlah
      for (let c = 1; c <= 5; c++) {
        totalRow.getCell(c).font = { bold: true }
        if (c >= 2) {
          totalRow.getCell(c).numFmt = FMT_RM
          totalRow.getCell(c).border = { top: { style: 'thin' }, bottom: { style: 'double' } }
        }
      }
      r += 2
      ws.getCell(`A${r}`).value = `${bilResit} resit aktif · Pendapatan ikut bulan yuran · Dijana ${new Date().toLocaleDateString('ms-MY')}`
      ws.getCell(`A${r}`).font = { size: 9, color: { argb: 'FF64748B' } }

      // Sheet 2: senarai pelajar yang bayar
      const ws2 = wb.addWorksheet('Senarai Pelajar')
      ws2.columns = [{ width: 6 }, { width: 34 }, { width: 22 }, { width: 24 }, { width: 16 }]
      ws2.mergeCells('A1:E1')
      ws2.getCell('A1').value = `Pelajar Yang Bayar — ${tempoh} — ${cawanganLabel}`
      ws2.getCell('A1').font = { bold: true, size: 12 }
      const head2 = ws2.getRow(3)
      ;['No.', 'Pelajar', 'Cawangan', 'Jenis', 'Jumlah (RM)'].forEach((h, i) => {
        const cell = head2.getCell(i + 1)
        cell.value = h
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }
        cell.alignment = { horizontal: i === 0 || i === 4 ? 'right' : 'left' }
      })
      let r2 = 4
      for (const [i, p] of pelajarList.entries()) {
        const row = ws2.getRow(r2)
        row.getCell(1).value = i + 1
        row.getCell(2).value = p.nama
        row.getCell(3).value = p.cawangan
        row.getCell(4).value = p.jenis
        row.getCell(5).value = p.jumlah
        row.getCell(5).numFmt = FMT_RM
        r2++
      }
      const totalP = ws2.getRow(r2)
      totalP.getCell(4).value = 'JUMLAH'
      totalP.getCell(4).font = { bold: true }
      totalP.getCell(5).value = pelajarList.reduce((sm, p) => sm + p.jumlah, 0)
      totalP.getCell(5).numFmt = FMT_RM
      totalP.getCell(5).font = { bold: true }
      totalP.getCell(5).border = { top: { style: 'thin' }, bottom: { style: 'double' } }

      const buffer = await wb.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = namaFail('xlsx'); a.click()
      URL.revokeObjectURL(url)
      toast.success('Excel laporan pendapatan dimuat turun.')
    } catch (e) {
      console.error(e)
      toast.error('Gagal jana Excel. Cuba lagi.')
    } finally { setXlsLoading(false) }
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>
            Laporan Pendapatan
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Pendapatan yuran setiap cawangan &amp; kelas personal — {tempoh}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bulan</label>
            <input type="month" value={bulanInput} onChange={(e) => setBulanInput(e.target.value)} style={{ ...inputStyle, cursor: 'text' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cawangan</label>
            <select value={cawId} onChange={(e) => setCawId(e.target.value)} style={inputStyle}>
              <option value="">Semua Cawangan</option>
              {cawangan.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Memuatkan...</div>
      ) : (
        <>
          {/* Stat Cards — 4 kad supaya Jumlah = Kumpulan + Personal + Pendaftaran */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '8px' }}>
            <KadStat label="Jumlah Pendapatan" jumlah={total.jumlah} warna="#166534" bg="#F0FDF4" border="#86EFAC" Icon={Wallet} />
            <KadStat label="Kelas Kumpulan" jumlah={total.kumpulan} warna="#3F6212" bg="#F7FEE7" border="#D9F99D" Icon={Users} />
            <KadStat label="Kelas Personal" jumlah={total.personal} warna="#1E40AF" bg="#EFF6FF" border="#BFDBFE" Icon={GraduationCap} />
            <KadStat label="Pendaftaran" jumlah={total.pendaftaran} warna="#92400E" bg="#FFFBEB" border="#FDE68A" Icon={ClipboardList} />
          </div>
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '18px' }}>
            Jumlah = Kumpulan + Personal + Pendaftaran.
          </p>

          {/* Butang Muat Turun */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {baris.length} cawangan · {bilResit} resit aktif
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={unduhPDF} disabled={pdfLoading || baris.length === 0}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: pdfLoading || baris.length === 0 ? '#94A3B8' : 'var(--accent)', border: 'none', borderRadius: '10px', fontSize: '12.5px', fontWeight: 700, color: 'var(--accent-text)', cursor: pdfLoading || baris.length === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                <Download size={14} /> {pdfLoading ? 'Jana...' : 'PDF'}
              </button>
              <button onClick={unduhExcel} disabled={xlsLoading || baris.length === 0}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '12.5px', fontWeight: 700, color: baris.length === 0 ? 'var(--text-muted)' : 'var(--text)', cursor: xlsLoading || baris.length === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                <FileSpreadsheet size={14} /> {xlsLoading ? 'Jana...' : 'Excel'}
              </button>
            </div>
          </div>

          {/* Jadual */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
            {baris.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', fontSize: '13.5px', color: 'var(--text-muted)' }}>
                Tiada pendapatan direkod untuk {tempoh}.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                      {['Cawangan', 'Kumpulan', 'Personal', 'Pendaftaran', 'Jumlah'].map((h, i) => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: i === 0 ? 'left' : 'right', fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {baris.map((b, i) => (
                      <tr key={b.cawangan} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', background: i % 2 === 1 ? '#FAFBFC' : 'transparent' }}>
                        <td style={{ padding: '10px 14px', fontSize: '13.5px', fontWeight: 600, color: b.cawangan === TIADA_CAWANGAN ? 'var(--text-muted)' : 'var(--text)', whiteSpace: 'nowrap' }}>{b.cawangan}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: '13px', color: 'var(--text)' }}>{formatRinggit(b.kumpulan)}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: '13px', color: '#1E40AF', fontWeight: 600 }}>{formatRinggit(b.personal)}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: '13px', color: 'var(--text-muted)' }}>{formatRinggit(b.pendaftaran)}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>{formatRinggit(b.jumlah)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid var(--border)', background: '#F1F5F9' }}>
                      <td style={{ padding: '11px 14px', fontSize: '13px', fontWeight: 800, color: 'var(--text)' }}>JUMLAH</td>
                      <td style={{ padding: '11px 14px', textAlign: 'right', fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{formatRinggit(total.kumpulan)}</td>
                      <td style={{ padding: '11px 14px', textAlign: 'right', fontSize: '13px', fontWeight: 700, color: '#1E40AF' }}>{formatRinggit(total.personal)}</td>
                      <td style={{ padding: '11px 14px', textAlign: 'right', fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{formatRinggit(total.pendaftaran)}</td>
                      <td style={{ padding: '11px 14px', textAlign: 'right', fontSize: '14px', fontWeight: 800, color: '#166534' }}>{formatRinggit(total.jumlah)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          <p style={{ marginTop: '10px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
            Pendapatan dikira mengikut <strong>bulan yuran</strong> (sama seperti widget Pendapatan di dashboard). Cawangan ditentukan mengikut cawangan pendaftaran pelajar. Baris &quot;{TIADA_CAWANGAN}&quot; = resit pelajar tanpa cawangan berdaftar.
          </p>

          {/* Senarai Pelajar Yang Bayar */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', marginTop: '22px' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <ClipboardList size={15} style={{ color: 'var(--text-muted)' }} />
                Senarai Pelajar Yang Bayar — {cawanganLabel}
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{pelajarList.length} pelajar</span>
            </div>
            {pelajarList.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                Tiada pelajar bayar untuk tempoh ini.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                      {['Pelajar', 'Cawangan', 'Jenis', 'Jumlah'].map((h, i) => (
                        <th key={h} style={{ padding: '9px 14px', textAlign: i === 3 ? 'right' : 'left', fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pelajarList.map((p, i) => (
                      <tr key={`${p.nama}-${i}`} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', background: i % 2 === 1 ? '#FAFBFC' : 'transparent' }}>
                        <td style={{ padding: '9px 14px', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{p.nama}</td>
                        <td style={{ padding: '9px 14px', fontSize: '12.5px', color: p.cawangan === TIADA_CAWANGAN ? 'var(--text-muted)' : 'var(--text)' }}>{p.cawangan}</td>
                        <td style={{ padding: '9px 14px', fontSize: '12px', color: 'var(--text-muted)' }}>{p.jenis}</td>
                        <td style={{ padding: '9px 14px', textAlign: 'right', fontSize: '13.5px', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap' }}>{formatRinggit(p.jumlah)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid var(--border)', background: '#F1F5F9' }}>
                      <td colSpan={3} style={{ padding: '11px 14px', fontSize: '13px', fontWeight: 800, color: 'var(--text)' }}>JUMLAH</td>
                      <td style={{ padding: '11px 14px', textAlign: 'right', fontSize: '14px', fontWeight: 800, color: '#166534', whiteSpace: 'nowrap' }}>
                        {formatRinggit(pelajarList.reduce((sm, p) => sm + p.jumlah, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function KadStat({ label, jumlah, warna, bg, border, Icon }: {
  label: string; jumlah: number; warna: string; bg: string; border: string; Icon: React.ElementType
}) {
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '16px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: warna, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
        <Icon size={15} style={{ color: warna, opacity: 0.6 }} />
      </div>
      <div style={{ fontSize: '24px', fontWeight: 800, color: warna, letterSpacing: '-0.5px' }}>{formatRinggit(jumlah)}</div>
    </div>
  )
}
