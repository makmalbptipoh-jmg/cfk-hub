/**
 * Logik pelengkapan bayaran online (server-only, service-role).
 * Dikongsi oleh route callback ToyyibPay DAN server action "semak status".
 *
 * Menggunakan service-role key kerana callback ToyyibPay tiada sesi login
 * (memintas RLS). Reka bentuk selamat-pendua: "tuntut" permintaan secara
 * atomik sebelum cipta resit supaya callback + semakan manual yang berlaku
 * serentak tidak menjana dua resit.
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { tarikhTempatan } from '@/lib/utils'
import { statusBil, rujukanTransaksi } from '@/lib/toyyibpay'

function adminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export type HasilLengkap = {
  ok: boolean
  nombor_resit?: string
  status: 'Menunggu' | 'Selesai' | 'Gagal'
  nota?: string
}

/**
 * Sahkan bil dengan ToyyibPay dan (jika dibayar) jana resit secara idempoten.
 * Selamat dipanggil berkali-kali untuk bill_code yang sama.
 */
export async function selesaikanPermintaanBayaran(billCode: string): Promise<HasilLengkap> {
  const admin = adminClient()

  const { data: pb } = await admin
    .from('permintaan_bayaran')
    .select('*')
    .eq('bill_code', billCode)
    .maybeSingle()

  if (!pb) return { ok: false, status: 'Menunggu', nota: 'Permintaan tidak dijumpai.' }
  if (pb.status === 'Selesai' && pb.resit_id) {
    return { ok: true, status: 'Selesai', nota: 'Sudah diproses.' }
  }

  // Pengesahan muktamad — jangan percaya callback membuta.
  const status = await statusBil(billCode)

  if (status === 'Gagal') {
    await admin.from('permintaan_bayaran').update({ status: 'Gagal' }).eq('id', pb.id).eq('status', 'Menunggu')
    return { ok: false, status: 'Gagal', nota: 'Pembayaran gagal / dibatalkan.' }
  }
  if (status !== 'Selesai') {
    return { ok: false, status: 'Menunggu', nota: 'Belum dibayar.' }
  }

  // Tuntut permintaan secara atomik (Menunggu → Selesai).
  const { data: claimed } = await admin
    .from('permintaan_bayaran')
    .update({ status: 'Selesai', dibayar_pada: new Date().toISOString() })
    .eq('id', pb.id)
    .eq('status', 'Menunggu')
    .select('id')
    .maybeSingle()

  if (!claimed) {
    // Proses lain sudah menuntut — anggap berjaya (idempoten).
    return { ok: true, status: 'Selesai', nota: 'Sudah diproses (serentak).' }
  }

  const ref = await rujukanTransaksi(billCode)

  const { data: resit, error } = await admin
    .from('resit')
    .insert({
      pelajar_id: pb.pelajar_id,
      jenis: pb.jenis,
      bulan_bayaran: pb.bulan_bayaran,
      tahun_bayaran: pb.tahun_bayaran,
      jumlah: pb.jumlah,
      bil_kelas: pb.bil_kelas,
      kaedah_bayaran: 'Online',
      tarikh_bayar: tarikhTempatan(),
      direkod_oleh: pb.dibuat_oleh,
    })
    .select('id, nombor_resit')
    .single()

  if (error || !resit) {
    // Gagal cipta resit — batalkan tuntutan supaya boleh cuba lagi.
    await admin
      .from('permintaan_bayaran')
      .update({ status: 'Menunggu', dibayar_pada: null })
      .eq('id', pb.id)
    return { ok: false, status: 'Menunggu', nota: 'Bayaran diterima tetapi gagal cipta resit — cuba semak semula.' }
  }

  await admin
    .from('permintaan_bayaran')
    .update({ resit_id: resit.id, payment_ref: ref })
    .eq('id', pb.id)

  await admin.from('log_aktiviti').insert({
    aksi: 'Cipta',
    jadual: 'resit',
    rekod_id: resit.id,
    pengguna_nama: 'Bayaran Online (ToyyibPay)',
    data: {
      nombor_resit: resit.nombor_resit,
      pelajar: pb.nama_pelajar,
      bulan: `${pb.bulan_bayaran} ${pb.tahun_bayaran}`,
      jumlah: pb.jumlah,
      bill_code: billCode,
    },
  })

  return { ok: true, status: 'Selesai', nombor_resit: resit.nombor_resit }
}
