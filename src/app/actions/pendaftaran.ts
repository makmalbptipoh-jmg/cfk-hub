'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { kirYuranBulanan } from '@/lib/utils'

export type InputDaftarSheet = {
  nama: string
  namaIbuBapa: string
  telefon: string
  alamat: string
  cawanganId: string
}

// Daftar pelajar baharu dari respons Google Form ke jadual `pelajar`.
// Guna server client biasa (sesi cookie admin) supaya RLS `tambah_admin`
// lulus — BUKAN service role.
export async function daftarPelajarSheet(
  senarai: InputDaftarSheet[]
): Promise<{ ralat: string | null; bilangan: number }> {
  if (!senarai.length) return { ralat: 'Tiada rekod dipilih.', bilangan: 0 }

  const belumCawangan = senarai.some((s) => !s.cawanganId)
  if (belumCawangan) {
    return { ralat: 'Setiap pelajar mesti ada cawangan dipilih.', bilangan: 0 }
  }

  const insertData = senarai.map((s) => ({
    nama_penuh: s.nama.trim().toUpperCase(),
    nama_ibu_bapa: s.namaIbuBapa.trim() || 'Tidak diketahui',
    no_telefon: s.telefon.trim() || '—',
    alamat: s.alamat.trim() || null,
    cawangan_daftar_id: s.cawanganId,
    jenis_kelas: 'Kumpulan' as const,
    yuran_bulanan: kirYuranBulanan('Kumpulan'),
    sumber_daftar: 'GoogleForms' as const,
  }))

  const supabase = await createClient()
  const { error } = await supabase.from('pelajar').insert(insertData)

  if (error) {
    return { ralat: 'Gagal daftar pelajar. Sila cuba lagi.', bilangan: 0 }
  }

  revalidatePath('/pelajar')
  return { ralat: null, bilangan: insertData.length }
}
