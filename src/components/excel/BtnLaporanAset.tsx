'use client'

import { useState } from 'react'
import { FileSpreadsheet } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/stores/toast-store'

const NAMA_SYARIKAT = 'CHESS FOR KIDS (CFK)'
const ALAMAT = '5B, Laluan Klebang 21, Klebang Perdana, 31200 Chemor, Perak'
const FMT_RM = '#,##0.00'

type AsetRow = {
  nama: string
  kategori: string | null
  kuantiti: number
  harga_seunit: number | null
  nilai_asal: number | null
  tarikh_beli: string | null
  status: string
  sebab_lupus: string | null
  nota: string | null
  cawangan: { nama: string } | null
}

export function BtnLaporanAset() {
  const [loading, setLoading] = useState(false)

  const jana = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('aset')
        .select('nama, kategori, kuantiti, harga_seunit, nilai_asal, tarikh_beli, status, sebab_lupus, nota, cawangan:cawangan_id(nama)')
        .order('status')
        .order('kategori')
        .order('nama')
        .limit(5000)
      if (error) throw error

      const aset = (data ?? []) as unknown as AsetRow[]
      if (aset.length === 0) {
        toast.warning('Tiada aset untuk dilaporkan.')
        return
      }

      const ExcelJS = (await import('exceljs')).default
      const wb = new ExcelJS.Workbook()
      wb.creator = 'CFK HUB'
      const ws = wb.addWorksheet('Laporan Aset')
      ws.columns = [
        { width: 34 }, { width: 20 }, { width: 8 }, { width: 14 },
        { width: 14 }, { width: 14 }, { width: 13 }, { width: 12 }, { width: 30 },
      ]

      // Kepala syarikat
      for (const [r, teks, gaya] of [
        [1, NAMA_SYARIKAT, { bold: true, size: 14 }],
        [2, ALAMAT, { size: 10, color: { argb: 'FF64748B' } }],
        [4, 'LAPORAN ASET', { bold: true, size: 12 }],
        [5, `Setakat ${new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}`, { size: 10, italic: true }],
      ] as const) {
        ws.mergeCells(`A${r}:I${r}`)
        const cell = ws.getCell(`A${r}`)
        cell.value = teks
        cell.font = gaya as never
        cell.alignment = { horizontal: 'center' }
      }

      // Kepala jadual
      const kepala = ['Nama Aset', 'Kategori', 'Unit', 'Harga/Unit (RM)', 'Jumlah Nilai (RM)', 'Cawangan', 'Tarikh Beli', 'Status', 'Nota / Sebab Lupus']
      const rowKepala = ws.getRow(7)
      kepala.forEach((label, i) => {
        const cell = rowKepala.getCell(i + 1)
        cell.value = label
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }
      })

      let r = 8
      for (const a of aset) {
        ws.getCell(`A${r}`).value = a.nama
        ws.getCell(`B${r}`).value = a.kategori ?? '—'
        ws.getCell(`C${r}`).value = a.kuantiti ?? 1
        if (a.harga_seunit != null) {
          ws.getCell(`D${r}`).value = a.harga_seunit
          ws.getCell(`D${r}`).numFmt = FMT_RM
        }
        if (a.nilai_asal != null) {
          ws.getCell(`E${r}`).value = a.nilai_asal
          ws.getCell(`E${r}`).numFmt = FMT_RM
        }
        ws.getCell(`F${r}`).value = a.cawangan?.nama ?? 'Umum'
        ws.getCell(`G${r}`).value = a.tarikh_beli ?? '—'
        ws.getCell(`H${r}`).value = a.status === 'Lupus' ? 'Dilupuskan' : 'Aktif'
        ws.getCell(`I${r}`).value = a.status === 'Lupus' ? (a.sebab_lupus ?? '') : (a.nota ?? '')
        r++
      }

      // Ringkasan
      const aktif = aset.filter((a) => a.status === 'Aktif')
      const nilaiAktif = aktif.reduce((s, a) => s + (a.nilai_asal ?? 0), 0)
      const unitAktif = aktif.reduce((s, a) => s + (a.kuantiti ?? 1), 0)
      ws.getCell(`A${r}`).value = `JUMLAH ASET AKTIF (${aktif.length} rekod)`
      ws.getCell(`A${r}`).font = { bold: true }
      ws.getCell(`C${r}`).value = unitAktif
      ws.getCell(`C${r}`).font = { bold: true }
      ws.getCell(`E${r}`).value = nilaiAktif
      ws.getCell(`E${r}`).numFmt = FMT_RM
      ws.getCell(`E${r}`).font = { bold: true }
      ws.getCell(`E${r}`).border = { top: { style: 'thin' }, bottom: { style: 'double' } }
      r += 2
      ws.getCell(`A${r}`).value = `Dijana oleh CFK HUB pada ${new Date().toLocaleDateString('ms-MY')}`
      ws.getCell(`A${r}`).font = { size: 9, color: { argb: 'FF64748B' } }

      const buffer = await wb.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Laporan_Aset_CFK_${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Laporan aset Excel dimuat turun — semak folder Downloads.')
    } catch (e) {
      console.error(e)
      toast.error('Gagal jana laporan aset. Sila cuba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={jana}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '10px 16px', background: 'var(--bg)',
        border: '1.5px solid var(--border)', borderRadius: '12px',
        fontSize: '13.5px', fontWeight: 600, color: 'var(--text)',
        cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
        opacity: loading ? 0.6 : 1,
      }}
    >
      <FileSpreadsheet size={14} />
      {loading ? 'Menjana...' : 'Laporan Excel'}
    </button>
  )
}
