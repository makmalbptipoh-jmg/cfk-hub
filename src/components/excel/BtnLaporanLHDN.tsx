'use client'

import { useState } from 'react'
import { FileSpreadsheet } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/stores/toast-store'

const NAMA_SYARIKAT = 'CHESS FOR KIDS (CFK)'
const ALAMAT = '5B, Laluan Klebang 21, Klebang Perdana, 31200 Chemor, Perak'

const BULAN_MS = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
]

const LABEL_JENIS: Record<string, string> = {
  Kumpulan: 'Yuran Kelas Kumpulan',
  Personal: 'Yuran Kelas Personal',
  Pendaftaran: 'Yuran Pendaftaran',
}

type ResitRow = {
  nombor_resit: string
  jenis: string
  jumlah: number
  tarikh_bayar: string
  bulan_bayaran: string
  pelajar: { nama_penuh: string } | null
}

type BelanjaRow = {
  tarikh: string
  kategori: string
  penerangan: string
  jumlah: number
  cawangan: { nama: string } | null
}

const FMT_RM = '#,##0.00'
const KELABU = 'FFF1F5F9'
const GELAP = 'FF1E293B'

export function BtnLaporanLHDN() {
  const tahunSemasa = new Date().getFullYear()
  const [tahun, setTahun] = useState(tahunSemasa)
  const [loading, setLoading] = useState(false)

  const jana = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const [{ data: resitData, error: e1 }, { data: belanjaData, error: e2 }] = await Promise.all([
        supabase
          .from('resit')
          .select('nombor_resit, jenis, jumlah, tarikh_bayar, bulan_bayaran, pelajar:pelajar_id(nama_penuh)')
          .eq('status', 'Aktif')
          .gte('tarikh_bayar', `${tahun}-01-01`)
          .lte('tarikh_bayar', `${tahun}-12-31`)
          .order('tarikh_bayar')
          .limit(5000),
        supabase
          .from('kewangan_perbelanjaan')
          .select('tarikh, kategori, penerangan, jumlah, cawangan:cawangan_id(nama)')
          .gte('tarikh', `${tahun}-01-01`)
          .lte('tarikh', `${tahun}-12-31`)
          .order('tarikh')
          .limit(5000),
      ])
      if (e1 || e2) throw e1 ?? e2

      const resit = (resitData ?? []) as unknown as ResitRow[]
      const belanja = (belanjaData ?? []) as unknown as BelanjaRow[]

      if (resit.length === 0 && belanja.length === 0) {
        toast.warning(`Tiada rekod kewangan untuk tahun ${tahun}.`)
        return
      }

      const ExcelJS = (await import('exceljs')).default
      const wb = new ExcelJS.Workbook()
      wb.creator = 'CFK HUB'
      wb.created = new Date()

      binaSheetPenyata(wb, tahun, resit, belanja)
      binaSheetBulanan(wb, tahun, resit)
      binaSheetPendapatan(wb, tahun, resit)
      binaSheetPerbelanjaan(wb, tahun, belanja)

      const buffer = await wb.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Penyata_Kewangan_CFK_${tahun}_LHDN.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Laporan LHDN ${tahun} berjaya dijana.`)
    } catch (e) {
      console.error(e)
      toast.error('Gagal jana laporan Excel. Sila cuba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
      <div>
        <label
          style={{
            display: 'block', fontSize: '11px', fontWeight: 700,
            color: 'var(--text-muted)', marginBottom: '6px',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}
        >
          Laporan LHDN (Tahunan)
        </label>
        <select
          value={tahun}
          onChange={(e) => setTahun(+e.target.value)}
          style={{
            padding: '9px 12px', border: '1.5px solid var(--border)',
            borderRadius: '10px', fontSize: '13.5px', color: 'var(--text)',
            background: 'var(--card)', outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
          }}
        >
          {Array.from({ length: tahunSemasa - 2024 }, (_, i) => 2025 + i).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <button
        onClick={jana}
        disabled={loading}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '9px 14px', background: 'var(--accent)', border: 'none',
          borderRadius: '10px', fontSize: '13px', fontWeight: 700,
          color: 'var(--accent-text)', cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit', opacity: loading ? 0.6 : 1,
        }}
      >
        <FileSpreadsheet size={14} />
        {loading ? 'Menjana...' : 'Muat Turun Excel'}
      </button>
    </div>
  )
}

/* eslint-disable @typescript-eslint/no-explicit-any */

function tajukSheet(ws: any, tajuk: string, tahun: number, lebarMerge: string) {
  ws.mergeCells(`A1:${lebarMerge}1`)
  ws.mergeCells(`A2:${lebarMerge}2`)
  ws.mergeCells(`A4:${lebarMerge}4`)
  ws.mergeCells(`A5:${lebarMerge}5`)
  ws.getCell('A1').value = NAMA_SYARIKAT
  ws.getCell('A1').font = { bold: true, size: 14 }
  ws.getCell('A2').value = ALAMAT
  ws.getCell('A2').font = { size: 10, color: { argb: 'FF64748B' } }
  ws.getCell('A4').value = tajuk.toUpperCase()
  ws.getCell('A4').font = { bold: true, size: 12 }
  ws.getCell('A5').value = `Bagi Tahun Berakhir 31 Disember ${tahun} (Asas Tunai)`
  ws.getCell('A5').font = { size: 10, italic: true }
  for (const r of [1, 2, 4, 5]) ws.getCell(`A${r}`).alignment = { horizontal: 'center' }
}

function barisKepala(ws: any, rowNum: number, labels: string[]) {
  const row = ws.getRow(rowNum)
  labels.forEach((label, i) => {
    const cell = row.getCell(i + 1)
    cell.value = label
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GELAP } }
    cell.alignment = { horizontal: i === 0 ? 'left' : 'right' }
  })
}

function binaSheetPenyata(wb: any, tahun: number, resit: ResitRow[], belanja: BelanjaRow[]) {
  const ws = wb.addWorksheet('Penyata Pendapatan')
  ws.columns = [{ width: 46 }, { width: 18 }]
  tajukSheet(ws, 'Penyata Pendapatan dan Perbelanjaan', tahun, 'B')

  const pendapatanJenis: Record<string, number> = {}
  for (const r of resit) {
    pendapatanJenis[r.jenis] = (pendapatanJenis[r.jenis] ?? 0) + r.jumlah
  }
  const belanjaKategori: Record<string, number> = {}
  for (const b of belanja) {
    belanjaKategori[b.kategori] = (belanjaKategori[b.kategori] ?? 0) + b.jumlah
  }
  const jumlahPendapatan = resit.reduce((s, r) => s + r.jumlah, 0)
  const jumlahBelanja = belanja.reduce((s, b) => s + b.jumlah, 0)

  let r = 7
  const seksyen = (label: string) => {
    ws.getCell(`A${r}`).value = label
    ws.getCell(`A${r}`).font = { bold: true }
    ws.getCell(`A${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: KELABU } }
    ws.getCell(`B${r}`).value = 'RM'
    ws.getCell(`B${r}`).font = { bold: true }
    ws.getCell(`B${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: KELABU } }
    ws.getCell(`B${r}`).alignment = { horizontal: 'right' }
    r++
  }
  const baris = (label: string, nilai: number, bold = false) => {
    ws.getCell(`A${r}`).value = label
    ws.getCell(`B${r}`).value = nilai
    ws.getCell(`B${r}`).numFmt = FMT_RM
    if (bold) {
      ws.getCell(`A${r}`).font = { bold: true }
      ws.getCell(`B${r}`).font = { bold: true }
      ws.getCell(`B${r}`).border = { top: { style: 'thin' } }
    }
    r++
  }

  seksyen('PENDAPATAN')
  for (const jenis of ['Kumpulan', 'Personal', 'Pendaftaran']) {
    if (pendapatanJenis[jenis]) baris(LABEL_JENIS[jenis] ?? jenis, pendapatanJenis[jenis])
  }
  baris('JUMLAH PENDAPATAN', jumlahPendapatan, true)
  r++

  seksyen('TOLAK: PERBELANJAAN')
  for (const [kategori, nilai] of Object.entries(belanjaKategori).sort((a, b) => b[1] - a[1])) {
    baris(kategori, nilai)
  }
  baris('JUMLAH PERBELANJAAN', jumlahBelanja, true)
  r++

  const untung = jumlahPendapatan - jumlahBelanja
  ws.getCell(`A${r}`).value = untung >= 0 ? 'PENDAPATAN BERSIH (UNTUNG)' : 'PENDAPATAN BERSIH (RUGI)'
  ws.getCell(`A${r}`).font = { bold: true, size: 11 }
  ws.getCell(`B${r}`).value = untung
  ws.getCell(`B${r}`).numFmt = FMT_RM
  ws.getCell(`B${r}`).font = { bold: true, size: 11 }
  ws.getCell(`B${r}`).border = { top: { style: 'thin' }, bottom: { style: 'double' } }
  r += 2

  ws.getCell(`A${r}`).value = `Bilangan resit aktif: ${resit.length} · Bilangan rekod perbelanjaan: ${belanja.length}`
  ws.getCell(`A${r}`).font = { size: 9, color: { argb: 'FF64748B' } }
  r++
  ws.getCell(`A${r}`).value = `Dijana oleh CFK HUB pada ${new Date().toLocaleDateString('ms-MY')} · Pendapatan direkod mengikut tarikh bayar (asas tunai)`
  ws.getCell(`A${r}`).font = { size: 9, color: { argb: 'FF64748B' } }
}

function binaSheetBulanan(wb: any, tahun: number, resit: ResitRow[]) {
  const ws = wb.addWorksheet('Pendapatan Bulanan')
  ws.columns = [{ width: 16 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 16 }]
  tajukSheet(ws, 'Pecahan Pendapatan Bulanan', tahun, 'E')

  barisKepala(ws, 7, ['Bulan', 'Kumpulan (RM)', 'Personal (RM)', 'Pendaftaran (RM)', 'Jumlah (RM)'])

  const data: number[][] = BULAN_MS.map(() => [0, 0, 0])
  const idxJenis: Record<string, number> = { Kumpulan: 0, Personal: 1, Pendaftaran: 2 }
  for (const rst of resit) {
    const bulanIdx = new Date(rst.tarikh_bayar + 'T00:00:00').getMonth()
    const j = idxJenis[rst.jenis]
    if (j !== undefined) data[bulanIdx][j] += rst.jumlah
  }

  let r = 8
  const total = [0, 0, 0]
  BULAN_MS.forEach((nama, i) => {
    const [k, p, d] = data[i]
    total[0] += k; total[1] += p; total[2] += d
    ws.getCell(`A${r}`).value = nama
    const nilai = [k, p, d, k + p + d]
    nilai.forEach((v, c) => {
      const cell = ws.getRow(r).getCell(c + 2)
      cell.value = v
      cell.numFmt = FMT_RM
    })
    r++
  })

  ws.getCell(`A${r}`).value = 'JUMLAH'
  ws.getCell(`A${r}`).font = { bold: true }
  const jumlahBesar = total[0] + total[1] + total[2]
  ;[...total, jumlahBesar].forEach((v, c) => {
    const cell = ws.getRow(r).getCell(c + 2)
    cell.value = v
    cell.numFmt = FMT_RM
    cell.font = { bold: true }
    cell.border = { top: { style: 'thin' }, bottom: { style: 'double' } }
  })
}

function binaSheetPendapatan(wb: any, tahun: number, resit: ResitRow[]) {
  const ws = wb.addWorksheet('Butiran Pendapatan')
  ws.columns = [{ width: 13 }, { width: 16 }, { width: 38 }, { width: 13 }, { width: 16 }, { width: 14 }]
  tajukSheet(ws, 'Butiran Pendapatan (Resit Aktif)', tahun, 'F')

  barisKepala(ws, 7, ['Tarikh Bayar', 'No. Resit', 'Pelajar', 'Jenis', 'Bulan Yuran', 'Jumlah (RM)'])

  let r = 8
  for (const rst of resit) {
    ws.getCell(`A${r}`).value = rst.tarikh_bayar
    ws.getCell(`B${r}`).value = rst.nombor_resit
    ws.getCell(`C${r}`).value = rst.pelajar?.nama_penuh ?? '—'
    ws.getCell(`D${r}`).value = rst.jenis
    ws.getCell(`E${r}`).value = rst.bulan_bayaran
    ws.getCell(`F${r}`).value = rst.jumlah
    ws.getCell(`F${r}`).numFmt = FMT_RM
    r++
  }

  ws.getCell(`E${r}`).value = 'JUMLAH'
  ws.getCell(`E${r}`).font = { bold: true }
  ws.getCell(`F${r}`).value = resit.reduce((s, x) => s + x.jumlah, 0)
  ws.getCell(`F${r}`).numFmt = FMT_RM
  ws.getCell(`F${r}`).font = { bold: true }
  ws.getCell(`F${r}`).border = { top: { style: 'thin' }, bottom: { style: 'double' } }
}

function binaSheetPerbelanjaan(wb: any, tahun: number, belanja: BelanjaRow[]) {
  const ws = wb.addWorksheet('Butiran Perbelanjaan')
  ws.columns = [{ width: 13 }, { width: 22 }, { width: 42 }, { width: 16 }, { width: 14 }]
  tajukSheet(ws, 'Butiran Perbelanjaan', tahun, 'E')

  barisKepala(ws, 7, ['Tarikh', 'Kategori', 'Penerangan', 'Cawangan', 'Jumlah (RM)'])

  let r = 8
  for (const b of belanja) {
    ws.getCell(`A${r}`).value = b.tarikh
    ws.getCell(`B${r}`).value = b.kategori
    ws.getCell(`C${r}`).value = b.penerangan
    ws.getCell(`D${r}`).value = b.cawangan?.nama ?? 'Umum'
    ws.getCell(`E${r}`).value = b.jumlah
    ws.getCell(`E${r}`).numFmt = FMT_RM
    r++
  }

  ws.getCell(`D${r}`).value = 'JUMLAH'
  ws.getCell(`D${r}`).font = { bold: true }
  ws.getCell(`E${r}`).value = belanja.reduce((s, x) => s + x.jumlah, 0)
  ws.getCell(`E${r}`).numFmt = FMT_RM
  ws.getCell(`E${r}`).font = { bold: true }
  ws.getCell(`E${r}`).border = { top: { style: 'thin' }, bottom: { style: 'double' } }
}
