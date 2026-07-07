import { z } from 'zod'

// Skema validasi untuk Dokumen Jualan (Sebut Harga / Invois / Resit).

export const dokumenItemSchema = z.object({
  perihalan: z.string().trim().min(1, 'Sila isi nama item / perkhidmatan.'),
  kuantiti: z.coerce
    .number({ message: 'Kuantiti tidak sah.' })
    .positive('Kuantiti mesti lebih dari 0.')
    .max(100_000, 'Kuantiti terlalu besar.'),
  harga_seunit: z.coerce
    .number({ message: 'Harga tidak sah.' })
    .min(0, 'Harga tidak sah.')
    .max(1_000_000, 'Harga terlalu besar.'),
})

export const dokumenSchema = z.object({
  tarikh: z.string().min(1, 'Sila isi tarikh.'),
  peringkat: z.enum(['Sebut Harga', 'Invois', 'Resit'], { message: 'Peringkat tidak sah.' }),
  kategori: z.string().min(1, 'Sila pilih kategori.'),
  pembeli_nama: z.string().trim().min(1, 'Sila isi nama pembeli / sekolah.'),
  kaedah_bayaran: z.enum(['Tunai', 'Transfer'], { message: 'Kaedah bayaran tidak sah.' }),
  items: z.array(dokumenItemSchema).min(1, 'Sila tambah sekurang-kurangnya satu item.'),
})
