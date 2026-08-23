'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type PelajarPilihan = { id: string; nama_penuh: string }

export async function ciptaPertandingan(input: {
  nama: string
  tarikh: string
  cawangan_id: string
  bil_pusingan: number | null
  pelajar: PelajarPilihan[]
}): Promise<{ ralat: string | null; id: string | null }> {
  const nama = input.nama.trim()
  if (nama.length < 3) return { ralat: 'Nama pertandingan sekurang-kurangnya 3 aksara.', id: null }
  if (!input.tarikh) return { ralat: 'Sila pilih tarikh.', id: null }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ralat: 'Sila log masuk semula.', id: null }

  // jurulatih_id jika pencipta seorang jurulatih
  const { data: jl } = await supabase
    .from('jurulatih')
    .select('id')
    .eq('pengguna_id', user.id)
    .maybeSingle()

  const { data: pt, error } = await supabase
    .from('pertandingan')
    .insert({
      nama,
      tarikh: input.tarikh,
      cawangan_id: input.cawangan_id || null,
      jurulatih_id: jl?.id ?? null,
      bil_pusingan: input.bil_pusingan,
      dicipta_oleh: user.id,
    })
    .select('id')
    .single()

  if (error || !pt) return { ralat: 'Gagal cipta pertandingan. Cuba lagi.', id: null }

  if (input.pelajar.length > 0) {
    const peserta = input.pelajar.map((p) => ({
      pertandingan_id: pt.id,
      pelajar_id: p.id,
      nama_ekspot: p.nama_penuh.trim(),
    }))
    const { error: e2 } = await supabase.from('pertandingan_peserta').insert(peserta)
    if (e2) return { ralat: 'Pertandingan dicipta tetapi gagal simpan sebahagian peserta.', id: pt.id }
  }

  revalidatePath('/pertandingan')
  return { ralat: null, id: pt.id }
}

// Tambah peserta ke pertandingan sedia ada (boleh dari cawangan lain).
// Guna UNIQUE(pertandingan_id, pelajar_id) untuk elak pendua.
export async function tambahPeserta(
  pertandinganId: string,
  pelajar: PelajarPilihan[]
): Promise<{ ralat: string | null; ditambah: number }> {
  if (pelajar.length === 0) return { ralat: 'Tiada pelajar dipilih.', ditambah: 0 }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ralat: 'Sila log masuk semula.', ditambah: 0 }

  // Buang pelajar yang sudah menjadi peserta (elak ralat/pendua).
  const { data: sedia } = await supabase
    .from('pertandingan_peserta')
    .select('pelajar_id')
    .eq('pertandingan_id', pertandinganId)
  const adaSet = new Set((sedia ?? []).map((r) => r.pelajar_id))
  const baharu = pelajar.filter((p) => !adaSet.has(p.id))
  if (baharu.length === 0) return { ralat: 'Semua pelajar dipilih sudah menjadi peserta.', ditambah: 0 }

  const baris = baharu.map((p) => ({
    pertandingan_id: pertandinganId,
    pelajar_id: p.id,
    nama_ekspot: p.nama_penuh.trim(),
  }))
  const { error } = await supabase.from('pertandingan_peserta').insert(baris)
  if (error) return { ralat: `Gagal tambah peserta: ${error.message}`, ditambah: 0 }

  revalidatePath(`/pertandingan/${pertandinganId}`)
  return { ralat: null, ditambah: baharu.length }
}

// Buang seorang peserta dari pertandingan.
export async function buangPeserta(
  pesertaId: string,
  pertandinganId: string
): Promise<{ ralat: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase.from('pertandingan_peserta').delete().eq('id', pesertaId)
  if (error) return { ralat: `Gagal buang peserta: ${error.message}` }
  revalidatePath(`/pertandingan/${pertandinganId}`)
  return { ralat: null }
}

// Padan manual satu baris keputusan (yang gagal auto-padan) kepada seorang peserta.
export async function padanKeputusanManual(
  keputusanId: string,
  pesertaId: string
): Promise<{ ralat: string | null }> {
  const supabase = await createClient()
  const { data: p } = await supabase
    .from('pertandingan_peserta')
    .select('id, pelajar_id, pertandingan_id')
    .eq('id', pesertaId)
    .single()
  if (!p) return { ralat: 'Peserta tidak dijumpai.' }

  const { error } = await supabase
    .from('pertandingan_keputusan')
    .update({ peserta_id: p.id, pelajar_id: p.pelajar_id })
    .eq('id', keputusanId)
  if (error) return { ralat: 'Gagal padan peserta.' }

  revalidatePath(`/pertandingan/${p.pertandingan_id}`)
  return { ralat: null }
}

export async function padamPertandingan(id: string): Promise<{ ralat: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase.from('pertandingan').delete().eq('id', id)
  if (error) return { ralat: 'Gagal padam. Anda mungkin tiada kebenaran.' }
  revalidatePath('/pertandingan')
  return { ralat: null }
}
