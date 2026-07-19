'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { ciptaBil, urlBayar, statusBil } from '@/lib/toyyibpay'
import { selesaikanPermintaanBayaran } from '@/lib/bayaran-online-server'

/** URL asas app sebenar (ikut hos deploy — betul di Vercel & localhost). */
async function appUrl() {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto =
    h.get('x-forwarded-proto') ??
    (process.env.NODE_ENV === 'development' ? 'http' : 'https')
  return `${proto}://${host}`
}

async function sahAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, isAdmin: false }
  const { data: profil } = await supabase
    .from('pengguna_profil')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle()
  return { supabase, user, isAdmin: !!profil?.is_admin }
}

type CiptaInput = {
  pelajarId: string
  namaPelajar: string
  noTelefon?: string | null
  jenis: 'Kumpulan' | 'Personal' | 'Pendaftaran'
  bulan: string // nama bulan BM, cth "Julai"
  tahun: number
  jumlah: number // RM
  bilKelas?: number | null
}

/**
 * Jana bil ToyyibPay + rekod permintaan bayaran. Pulangkan URL bayar
 * untuk dihantar kepada ibu bapa.
 */
export async function ciptaPermintaanBayaran(input: CiptaInput) {
  const { supabase, user, isAdmin } = await sahAdmin()
  if (!user || !isAdmin) return { ralat: 'Akses ditolak. Hanya admin boleh jana bayaran.' }

  if (!input.pelajarId || !(input.jumlah > 0)) {
    return { ralat: 'Maklumat tak lengkap. Pilih pelajar dan pastikan jumlah > 0.' }
  }

  const base = await appUrl()
  const telefon = (input.noTelefon ?? '').replace(/\D/g, '').replace(/^0/, '60')

  const { billCode, ralat } = await ciptaBil({
    namaBil: `Yuran CFK ${input.bulan}`,
    penerangan: `${input.jenis} ${input.bulan} ${input.tahun} ${input.namaPelajar}`,
    jumlahSen: Math.round(input.jumlah * 100),
    rujukanLuar: input.pelajarId.slice(0, 8),
    namaPembayar: input.namaPelajar,
    telefonPembayar: telefon || undefined,
    urlCallback: `${base}/api/bayaran/toyyibpay/callback`,
    urlReturn: `${base}/bayaran-selesai`,
  })

  if (ralat || !billCode) return { ralat: ralat ?? 'Gagal jana bil ToyyibPay.' }

  const { error } = await supabase.from('permintaan_bayaran').insert({
    bill_code: billCode,
    pelajar_id: input.pelajarId,
    nama_pelajar: input.namaPelajar,
    no_telefon: input.noTelefon ?? null,
    jenis: input.jenis,
    bulan_bayaran: input.bulan,
    tahun_bayaran: input.tahun,
    bil_kelas: input.jenis === 'Personal' && input.bilKelas && input.bilKelas > 0 ? input.bilKelas : null,
    jumlah: input.jumlah,
    dibuat_oleh: user.id,
  })

  if (error) return { ralat: 'Bil dijana tetapi gagal simpan rekod. Cuba lagi.' }

  return { url: urlBayar(billCode), billCode }
}

/**
 * Admin semak status bil secara manual (jika callback tercicir).
 * Jika sudah dibayar → jana resit.
 */
export async function semakStatusPermintaan(billCode: string) {
  const { isAdmin } = await sahAdmin()
  if (!isAdmin) return { ralat: 'Akses ditolak.' }
  if (!billCode) return { ralat: 'Bill code tiada.' }

  const hasil = await selesaikanPermintaanBayaran(billCode)
  return { status: hasil.status, nombor_resit: hasil.nombor_resit, nota: hasil.nota }
}

/** Semak ringkas status tanpa menjana resit (untuk paparan sahaja). */
export async function statusRingkas(billCode: string) {
  const { isAdmin } = await sahAdmin()
  if (!isAdmin) return { status: 'unknown' as const }
  return { status: await statusBil(billCode) }
}
