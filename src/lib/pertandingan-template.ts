// Jana template pendaftaran pemain untuk di-import ke Swiss-Manager.
// exceljs di-import secara dinamik (ikut corak src/components/excel/*).
//
// NOTA: susunan/header lajur = default munasabah untuk import Swiss-Manager.
// Akan diselaraskan bila user beri contoh template sebenar mereka —
// cukup ubah LAJUR_TEMPLATE di bawah, tiada perubahan lain diperlukan.

export type PesertaTemplate = {
  nama_ekspot: string
  tarikh_lahir: string | null
  cawangan_nama: string | null
}

export const LAJUR_TEMPLATE: {
  header: string
  lebar: number
  nilai: (p: PesertaTemplate) => string | number
}[] = [
  { header: 'Name', lebar: 28, nilai: (p) => p.nama_ekspot.toUpperCase() },
  { header: 'Sex', lebar: 6, nilai: () => '' },
  { header: 'Fed', lebar: 8, nilai: () => 'MAS' },
  { header: 'Rtg', lebar: 8, nilai: () => '' },
  { header: 'Birthday', lebar: 14, nilai: (p) => p.tarikh_lahir ?? '' },
  { header: 'Club', lebar: 22, nilai: (p) => p.cawangan_nama ?? '' },
]

// Bina Blob .xlsx sedia untuk muat turun.
export async function binaBlobPendaftaran(peserta: PesertaTemplate[]): Promise<Blob> {
  const ExcelJS = (await import('exceljs')).default
  const wb = new ExcelJS.Workbook()
  wb.creator = 'CFK HUB'
  const ws = wb.addWorksheet('Pemain')

  ws.columns = LAJUR_TEMPLATE.map((l, i) => ({ header: l.header, key: `c${i}`, width: l.lebar }))
  const head = ws.getRow(1)
  head.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  head.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }
  })

  for (const p of peserta) {
    const obj: Record<string, string | number> = {}
    LAJUR_TEMPLATE.forEach((l, i) => { obj[`c${i}`] = l.nilai(p) })
    ws.addRow(obj)
  }

  const buffer = await wb.xlsx.writeBuffer()
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

// Nama fail selamat (buang aksara tak sah).
export function namaFailTemplate(namaPertandingan: string, tarikh: string): string {
  const bersih = namaPertandingan.replace(/[\\/:*?"<>|]/g, '-').trim()
  return `Daftar_${bersih}_${tarikh}.xlsx`
}
