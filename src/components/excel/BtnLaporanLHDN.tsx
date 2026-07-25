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
  kaedah_bayaran: string | null
  pelajar: { nama_penuh: string } | null
}

type BelanjaRow = {
  tarikh: string
  kategori: string
  penerangan: string
  jumlah: number
  cawangan: { nama: string } | null
}

type PendapatanLainRow = {
  tarikh: string
  sumber: string
  kategori: string
  jumlah: number
  kaedah: string | null
  cawangan: { nama: string } | null
}

const FMT_RM = '#,##0.00'
const KELABU = 'FFF1F5F9'
const GELAP = 'FF1E293B'

// Bundarkan ke sen. Yuran pro-rata (cth. RM80÷3 = RM26.67) menghasilkan
// pecahan; tanpa ini jumlah terkumpul boleh hanyut beberapa sen kerana
// ketidaktepatan nombor titik terapung — LHDN mahu angka yang bertaut tepat.
const sen = (n: number) => Math.round(n * 100) / 100

export function BtnLaporanLHDN() {
  const tahunSemasa = new Date().getFullYear()
  const [tahun, setTahun] = useState(tahunSemasa)
  const [loading, setLoading] = useState(false)

  const jana = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const [{ data: resitData, error: e1 }, { data: belanjaData, error: e2 }, { data: pendapatanLainData, error: e3 }] = await Promise.all([
        supabase
          .from('resit')
          .select('nombor_resit, jenis, jumlah, tarikh_bayar, bulan_bayaran, kaedah_bayaran, pelajar:pelajar_id(nama_penuh)')
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
        supabase
          .from('pendapatan_lain')
          .select('tarikh, sumber, kategori, jumlah, kaedah, cawangan:cawangan_id(nama)')
          .gte('tarikh', `${tahun}-01-01`)
          .lte('tarikh', `${tahun}-12-31`)
          .order('tarikh')
          .limit(5000),
      ])
      if (e1 || e2 || e3) throw e1 ?? e2 ?? e3

      const resit = (resitData ?? []) as unknown as ResitRow[]
      const belanja = (belanjaData ?? []) as unknown as BelanjaRow[]
      const pendapatanLain = (pendapatanLainData ?? []) as unknown as PendapatanLainRow[]

      if (resit.length === 0 && belanja.length === 0 && pendapatanLain.length === 0) {
        toast.warning(`Tiada rekod kewangan untuk tahun ${tahun}.`)
        return
      }

      const ExcelJS = (await import('exceljs')).default
      const wb = new ExcelJS.Workbook()
      wb.creator = 'CFK HUB'
      wb.created = new Date()

      binaSheetPenyata(wb, tahun, resit, belanja, pendapatanLain)
      binaSheetBulanan(wb, tahun, resit, pendapatanLain)
      binaSheetPendapatan(wb, tahun, resit)
      if (pendapatanLain.length > 0) binaSheetPendapatanLain(wb, tahun, pendapatanLain)
      binaSheetPerbelanjaan(wb, tahun, belanja)
      binaSheetRekonsiliasi(wb, tahun, resit, belanja, pendapatanLain)

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

function binaSheetPenyata(wb: any, tahun: number, resit: ResitRow[], belanja: BelanjaRow[], pendapatanLain: PendapatanLainRow[]) {
  const ws = wb.addWorksheet('Penyata Pendapatan')
  ws.columns = [{ width: 46 }, { width: 18 }]
  tajukSheet(ws, 'Penyata Pendapatan dan Perbelanjaan', tahun, 'B')

  const pendapatanJenis: Record<string, number> = {}
  for (const r of resit) {
    pendapatanJenis[r.jenis] = sen((pendapatanJenis[r.jenis] ?? 0) + r.jumlah)
  }
  const pendapatanLainKategori: Record<string, number> = {}
  for (const p of pendapatanLain) {
    pendapatanLainKategori[p.kategori] = sen((pendapatanLainKategori[p.kategori] ?? 0) + p.jumlah)
  }
  const belanjaKategori: Record<string, number> = {}
  for (const b of belanja) {
    belanjaKategori[b.kategori] = sen((belanjaKategori[b.kategori] ?? 0) + b.jumlah)
  }
  const jumlahPendapatan = sen(
    resit.reduce((s, r) => s + r.jumlah, 0) +
    pendapatanLain.reduce((s, p) => s + p.jumlah, 0)
  )
  const jumlahBelanja = sen(belanja.reduce((s, b) => s + b.jumlah, 0))

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
  for (const [kategori, nilai] of Object.entries(pendapatanLainKategori).sort((a, b) => b[1] - a[1])) {
    baris(kategori, nilai)
  }
  baris('JUMLAH PENDAPATAN', jumlahPendapatan, true)
  r++

  seksyen('TOLAK: PERBELANJAAN')
  for (const [kategori, nilai] of Object.entries(belanjaKategori).sort((a, b) => b[1] - a[1])) {
    baris(kategori, nilai)
  }
  baris('JUMLAH PERBELANJAAN', jumlahBelanja, true)
  r++

  const untung = sen(jumlahPendapatan - jumlahBelanja)
  ws.getCell(`A${r}`).value = untung >= 0 ? 'PENDAPATAN BERSIH (UNTUNG)' : 'PENDAPATAN BERSIH (RUGI)'
  ws.getCell(`A${r}`).font = { bold: true, size: 11 }
  ws.getCell(`B${r}`).value = untung
  ws.getCell(`B${r}`).numFmt = FMT_RM
  ws.getCell(`B${r}`).font = { bold: true, size: 11 }
  ws.getCell(`B${r}`).border = { top: { style: 'thin' }, bottom: { style: 'double' } }
  r += 2

  ws.getCell(`A${r}`).value = `Bilangan resit aktif: ${resit.length} · Pendapatan lain: ${pendapatanLain.length} · Rekod perbelanjaan: ${belanja.length}`
  ws.getCell(`A${r}`).font = { size: 9, color: { argb: 'FF64748B' } }
  r++
  ws.getCell(`A${r}`).value = `Dijana oleh CFK HUB pada ${new Date().toLocaleDateString('ms-MY')} · Pendapatan direkod mengikut tarikh bayar (asas tunai)`
  ws.getCell(`A${r}`).font = { size: 9, color: { argb: 'FF64748B' } }
}

function binaSheetBulanan(wb: any, tahun: number, resit: ResitRow[], pendapatanLain: PendapatanLainRow[]) {
  const ws = wb.addWorksheet('Pendapatan Bulanan')
  ws.columns = [{ width: 16 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 18 }, { width: 16 }]
  tajukSheet(ws, 'Pecahan Pendapatan Bulanan', tahun, 'F')

  // Pendapatan lain DIMASUKKAN supaya JUMLAH sheet ini bertaut tepat dengan
  // JUMLAH PENDAPATAN dalam sheet Penyata Pendapatan.
  barisKepala(ws, 7, ['Bulan', 'Kumpulan (RM)', 'Personal (RM)', 'Pendaftaran (RM)', 'Pendapatan Lain (RM)', 'Jumlah (RM)'])

  const data: number[][] = BULAN_MS.map(() => [0, 0, 0, 0])
  const idxJenis: Record<string, number> = { Kumpulan: 0, Personal: 1, Pendaftaran: 2 }
  for (const rst of resit) {
    const bulanIdx = new Date(rst.tarikh_bayar + 'T00:00:00').getMonth()
    const j = idxJenis[rst.jenis]
    if (j !== undefined) data[bulanIdx][j] = sen(data[bulanIdx][j] + rst.jumlah)
  }
  for (const p of pendapatanLain) {
    const bulanIdx = new Date(p.tarikh + 'T00:00:00').getMonth()
    data[bulanIdx][3] = sen(data[bulanIdx][3] + p.jumlah)
  }

  let r = 8
  const total = [0, 0, 0, 0]
  BULAN_MS.forEach((nama, i) => {
    const [k, p, d, l] = data[i]
    total[0] = sen(total[0] + k); total[1] = sen(total[1] + p)
    total[2] = sen(total[2] + d); total[3] = sen(total[3] + l)
    ws.getCell(`A${r}`).value = nama
    const nilai = [k, p, d, l, sen(k + p + d + l)]
    nilai.forEach((v, c) => {
      const cell = ws.getRow(r).getCell(c + 2)
      cell.value = v
      cell.numFmt = FMT_RM
    })
    r++
  })

  ws.getCell(`A${r}`).value = 'JUMLAH'
  ws.getCell(`A${r}`).font = { bold: true }
  const jumlahBesar = sen(total[0] + total[1] + total[2] + total[3])
  ;[...total, jumlahBesar].forEach((v, c) => {
    const cell = ws.getRow(r).getCell(c + 2)
    cell.value = v
    cell.numFmt = FMT_RM
    cell.font = { bold: true }
    cell.border = { top: { style: 'thin' }, bottom: { style: 'double' } }
  })
  r += 2
  ws.getCell(`A${r}`).value =
    'JUMLAH di atas mesti sama dengan JUMLAH PENDAPATAN dalam sheet "Penyata Pendapatan".'
  ws.getCell(`A${r}`).font = { size: 9, color: { argb: 'FF64748B' } }
}

function binaSheetPendapatan(wb: any, tahun: number, resit: ResitRow[]) {
  const ws = wb.addWorksheet('Butiran Pendapatan')
  ws.columns = [{ width: 13 }, { width: 16 }, { width: 38 }, { width: 13 }, { width: 16 }, { width: 16 }, { width: 14 }]
  tajukSheet(ws, 'Butiran Pendapatan (Resit Aktif)', tahun, 'G')

  barisKepala(ws, 7, ['Tarikh Bayar', 'No. Resit', 'Pelajar', 'Jenis', 'Bulan Yuran', 'Kaedah', 'Jumlah (RM)'])

  let r = 8
  for (const rst of resit) {
    ws.getCell(`A${r}`).value = rst.tarikh_bayar
    ws.getCell(`B${r}`).value = rst.nombor_resit
    ws.getCell(`C${r}`).value = rst.pelajar?.nama_penuh ?? '—'
    ws.getCell(`D${r}`).value = rst.jenis
    ws.getCell(`E${r}`).value = rst.bulan_bayaran
    // Kaedah kosong ditanda jelas — JANGAN diam-diam anggap Transfer
    ws.getCell(`F${r}`).value = rst.kaedah_bayaran ?? 'Tidak Dinyatakan'
    if (!rst.kaedah_bayaran) ws.getCell(`F${r}`).font = { color: { argb: 'FF92400E' }, italic: true }
    ws.getCell(`G${r}`).value = rst.jumlah
    ws.getCell(`G${r}`).numFmt = FMT_RM
    r++
  }

  ws.getCell(`F${r}`).value = 'JUMLAH'
  ws.getCell(`F${r}`).font = { bold: true }
  ws.getCell(`G${r}`).value = sen(resit.reduce((s, x) => s + x.jumlah, 0))
  ws.getCell(`G${r}`).numFmt = FMT_RM
  ws.getCell(`G${r}`).font = { bold: true }
  ws.getCell(`G${r}`).border = { top: { style: 'thin' }, bottom: { style: 'double' } }
}

function binaSheetRekonsiliasi(wb: any, tahun: number, resit: ResitRow[], belanja: BelanjaRow[], pendapatanLain: PendapatanLainRow[]) {
  const ws = wb.addWorksheet('Rekonsiliasi Bank')
  ws.columns = [
    { width: 14 }, // A Bulan
    { width: 18 }, // B Masuk Bank (Transfer)
    { width: 15 }, // C Tunai
    { width: 20 }, // D Tidak Dinyatakan
    { width: 15 }, // E Belanja
    { width: 19 }, // F Pergerakan Dijangka
    { width: 24 }, // G Baki Penyata Bank (isi manual)
    { width: 15 }, // H Beza
  ]
  tajukSheet(ws, 'Rekonsiliasi Bank Bulanan', tahun, 'H')

  const KUNING = 'FFFEF3C7'

  // Agregat bulanan. Kaedah bayaran KOSONG diasingkan — jangan campur ke mana-mana
  // lajur, kerana kita tidak tahu wang itu masuk bank atau diterima tunai.
  const masukBank = Array(12).fill(0)
  const tunai = Array(12).fill(0)
  const takPasti = Array(12).fill(0)
  const keluar = Array(12).fill(0)
  const letak = (arrBank: number[], m: number, kaedah: string | null, nilai: number) => {
    if (!kaedah) takPasti[m] = sen(takPasti[m] + nilai)
    else if (kaedah === 'Tunai') tunai[m] = sen(tunai[m] + nilai)
    else arrBank[m] = sen(arrBank[m] + nilai)
  }
  for (const rst of resit) {
    letak(masukBank, new Date(rst.tarikh_bayar + 'T00:00:00').getMonth(), rst.kaedah_bayaran, rst.jumlah)
  }
  for (const p of pendapatanLain) {
    letak(masukBank, new Date(p.tarikh + 'T00:00:00').getMonth(), p.kaedah, p.jumlah)
  }
  for (const b of belanja) {
    const m = new Date(b.tarikh + 'T00:00:00').getMonth()
    keluar[m] = sen(keluar[m] + b.jumlah)
  }
  const jumTakPasti = sen(takPasti.reduce((s: number, n: number) => s + n, 0))

  // Arahan
  ws.mergeCells('A7:H7')
  ws.getCell('A7').value =
    'ARAHAN: Isi sel KUNING dari penyata bank (baki akhir setiap bulan). Kolum BEZA dikira automatik — ' +
    'beza besar bermakna ada transaksi belum direkod, bayaran tunai, atau perbezaan masa (timing).'
  ws.getCell('A7').font = { size: 9, italic: true, color: { argb: 'FF92400E' } }
  ws.getCell('A7').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: KUNING } }
  ws.getCell('A7').alignment = { wrapText: true }
  ws.getRow(7).height = 30

  // Amaran khusus bila ada rekod tanpa kaedah bayaran
  let barisAwal = 8
  if (jumTakPasti > 0) {
    ws.mergeCells('A8:H8')
    ws.getCell('A8').value =
      `AMARAN: RM${jumTakPasti.toFixed(2)} pendapatan TIDAK DINYATAKAN kaedah bayarannya (lajur D). ` +
      'Jumlah ini TIDAK dimasukkan dalam "Pergerakan Dijangka" kerana tidak diketahui sama ada masuk bank atau tunai. ' +
      'Kemas kini kaedah bayaran pada rekod tersebut untuk rekonsiliasi yang tepat.'
    ws.getCell('A8').font = { size: 9, bold: true, color: { argb: 'FF991B1B' } }
    ws.getCell('A8').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } }
    ws.getCell('A8').alignment = { wrapText: true }
    ws.getRow(8).height = 30
    barisAwal = 9
  }

  // Baki awal tahun (isi manual)
  ws.getCell(`A${barisAwal}`).value = `Baki Bank pada 1 Januari ${tahun} (isi dari penyata):`
  ws.getCell(`A${barisAwal}`).font = { bold: true, size: 10 }
  ws.mergeCells(`A${barisAwal}:F${barisAwal}`)
  const selBakiAwal = `G${barisAwal}`
  ws.getCell(selBakiAwal).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: KUNING } }
  ws.getCell(selBakiAwal).numFmt = FMT_RM
  ws.getCell(selBakiAwal).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }

  const barisKepalaNum = barisAwal + 1
  barisKepala(ws, barisKepalaNum, [
    'Bulan',
    'Masuk Bank (RM)',
    'Tunai (RM)',
    'Tidak Dinyatakan (RM)',
    'Belanja (RM)',
    'Pergerakan (RM)',
    'Baki Penyata Bank (RM)',
    'Beza (RM)',
  ])

  let r = barisKepalaNum + 1
  const barisPertama = r
  BULAN_MS.forEach((nama, i) => {
    ws.getCell(`A${r}`).value = nama
    ws.getCell(`B${r}`).value = masukBank[i]
    ws.getCell(`C${r}`).value = tunai[i]
    ws.getCell(`D${r}`).value = takPasti[i]
    if (takPasti[i] > 0) ws.getCell(`D${r}`).font = { color: { argb: 'FF991B1B' }, bold: true }
    ws.getCell(`E${r}`).value = keluar[i]
    // Pergerakan dijangka dalam bank = masuk bank (disahkan) − belanja.
    // Lajur D SENGAJA dikecualikan — statusnya tidak diketahui.
    ws.getCell(`F${r}`).value = { formula: `B${r}-E${r}` }
    // Baki penyata bank — isi manual (kuning)
    ws.getCell(`G${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: KUNING } }
    ws.getCell(`G${r}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
    // Beza = baki bulan ini − baki sebelum − pergerakan dijangka
    const bakiSebelum = r === barisPertama ? selBakiAwal : `G${r - 1}`
    ws.getCell(`H${r}`).value = { formula: `IF(G${r}="","",G${r}-${bakiSebelum}-F${r})` }
    for (const col of ['B', 'C', 'D', 'E', 'F', 'G', 'H']) ws.getCell(`${col}${r}`).numFmt = FMT_RM
    r++
  })

  // Jumlah tahunan
  ws.getCell(`A${r}`).value = 'JUMLAH'
  ws.getCell(`A${r}`).font = { bold: true }
  const jumlah = [
    sen(masukBank.reduce((s: number, n: number) => s + n, 0)),
    sen(tunai.reduce((s: number, n: number) => s + n, 0)),
    jumTakPasti,
    sen(keluar.reduce((s: number, n: number) => s + n, 0)),
  ]
  ;[...jumlah, sen(jumlah[0] - jumlah[3])].forEach((v, c) => {
    const cell = ws.getRow(r).getCell(c + 2)
    cell.value = v
    cell.numFmt = FMT_RM
    cell.font = { bold: true }
    cell.border = { top: { style: 'thin' }, bottom: { style: 'double' } }
  })
  r += 2

  const nota = [
    'Nota: "Masuk Bank" = resit + pendapatan lain berkaedah Transfer/TNG. "Tunai" tidak melalui bank.',
    '"Tidak Dinyatakan" = rekod tanpa kaedah bayaran. Ia DIKECUALIKAN dari Pergerakan Dijangka kerana tidak diketahui masuk bank atau tidak — bukan diandaikan.',
    'Perbelanjaan dianggap dibayar dari bank — jika ada belanja tunai, laraskan pemahaman beza dengan sewajarnya.',
    `Semakan silang: B + C + D bagi tahun ini = ${sen(jumlah[0] + jumlah[1] + jumlah[2]).toFixed(2)} = JUMLAH PENDAPATAN dalam sheet Penyata Pendapatan.`,
  ]
  for (const n of nota) {
    ws.getCell(`A${r}`).value = n
    ws.getCell(`A${r}`).font = { size: 9, color: { argb: 'FF64748B' } }
    r++
  }
}

function binaSheetPendapatanLain(wb: any, tahun: number, pendapatanLain: PendapatanLainRow[]) {
  const ws = wb.addWorksheet('Butiran Pendapatan Lain')
  ws.columns = [{ width: 13 }, { width: 20 }, { width: 30 }, { width: 13 }, { width: 16 }, { width: 14 }]
  tajukSheet(ws, 'Butiran Pendapatan Lain / Sumbangan', tahun, 'F')

  barisKepala(ws, 7, ['Tarikh', 'Kategori', 'Sumber', 'Kaedah', 'Cawangan', 'Jumlah (RM)'])

  let r = 8
  for (const p of pendapatanLain) {
    ws.getCell(`A${r}`).value = p.tarikh
    ws.getCell(`B${r}`).value = p.kategori
    ws.getCell(`C${r}`).value = p.sumber
    ws.getCell(`D${r}`).value = p.kaedah ?? 'Transfer'
    ws.getCell(`E${r}`).value = p.cawangan?.nama ?? 'Umum'
    ws.getCell(`F${r}`).value = p.jumlah
    ws.getCell(`F${r}`).numFmt = FMT_RM
    r++
  }

  ws.getCell(`E${r}`).value = 'JUMLAH'
  ws.getCell(`E${r}`).font = { bold: true }
  ws.getCell(`F${r}`).value = sen(pendapatanLain.reduce((s, x) => s + x.jumlah, 0))
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
  ws.getCell(`E${r}`).value = sen(belanja.reduce((s, x) => s + x.jumlah, 0))
  ws.getCell(`E${r}`).numFmt = FMT_RM
  ws.getCell(`E${r}`).font = { bold: true }
  ws.getCell(`E${r}`).border = { top: { style: 'thin' }, bottom: { style: 'double' } }
}
