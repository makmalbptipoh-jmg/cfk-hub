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
