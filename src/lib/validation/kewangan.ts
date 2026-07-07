import { z } from 'zod'

// Skema validasi dikongsi untuk borang kewangan (data wang sensitif).
const jumlah = z.coerce
  .number({ message: 'Jumlah tidak sah.' })
  .positive('Jumlah mesti lebih dari 0.')
  .finite('Jumlah tidak sah.')
  .max(1_000_000, 'Jumlah terlalu besar.')

const tarikh = z.string().min(1, 'Sila isi tarikh.')

export const perbelanjaanSchema = z.object({
  tarikh,
  kategori: z.string().min(1, 'Sila pilih kategori.'),
  penerangan: z.string().trim().min(1, 'Sila isi penerangan perbelanjaan.'),
  jumlah,
})

export const pendapatanSchema = z.object({
  tarikh,
  kategori: z.string().min(1, 'Sila pilih kategori.'),
  sumber: z.string().trim().min(1, 'Sila isi sumber / nama penyumbang.'),
  jumlah,
  kaedah: z.enum(['Tunai', 'Transfer'], { message: 'Kaedah tidak sah.' }),
})

// Pulangkan mesej ralat pertama, atau null jika sah.
export function ralatPertama(hasil: { success: boolean; error?: { issues: { message: string }[] } }): string | null {
  if (hasil.success) return null
  return hasil.error?.issues[0]?.message ?? 'Data tidak sah.'
}
