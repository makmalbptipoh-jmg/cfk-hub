'use server'

import { createClient } from '@supabase/supabase-js'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function resetKataLaluan(penggunaId: string, kataLaluanBaharu: string) {
  if (kataLaluanBaharu.length < 6) {
    return { ralat: 'Kata laluan sekurang-kurangnya 6 aksara.' }
  }
  const supabase = adminClient()
  const { error } = await supabase.auth.admin.updateUserById(penggunaId, {
    password: kataLaluanBaharu,
  })
  if (error) return { ralat: 'Gagal kemaskini kata laluan. Cuba lagi.' }
  return { ralat: null }
}

export async function tambahAkaun(data: {
  emel: string
  kataLaluan: string
  nama: string
  isAdmin: boolean
  cawanganId?: string
}) {
  if (!data.emel || !data.kataLaluan || !data.nama) {
    return { ralat: 'Semua medan wajib diisi.' }
  }
  if (data.kataLaluan.length < 6) {
    return { ralat: 'Kata laluan sekurang-kurangnya 6 aksara.' }
  }

  const supabase = adminClient()

  const { data: user, error } = await supabase.auth.admin.createUser({
    email: data.emel,
    password: data.kataLaluan,
    email_confirm: true,
    user_metadata: { nama: data.nama },
  })

  if (error) return { ralat: error.message }

  await supabase.from('pengguna_profil').upsert({
    id: user.user.id,
    nama: data.nama,
    is_admin: data.isAdmin,
    cawangan_id: data.cawanganId ?? null,
  })

  return { ralat: null, id: user.user.id }
}

export async function kemaskiniMaklumatPengguna(data: {
  penggunaId: string
  nama: string
  isAdmin: boolean
  cawanganId?: string | null
  emel?: string
}) {
  if (!data.nama.trim()) return { ralat: 'Nama wajib diisi.' }
  const supabase = adminClient()

  // Kemaskini profil (nama, peranan, cawangan)
  const { error: e1 } = await supabase
    .from('pengguna_profil')
    .update({
      nama: data.nama.trim(),
      is_admin: data.isAdmin,
      cawangan_id: data.isAdmin ? null : (data.cawanganId || null),
    })
    .eq('id', data.penggunaId)
  if (e1) return { ralat: 'Gagal kemaskini profil. Cuba lagi.' }

  // Kemaskini e-mel (jika diubah)
  if (data.emel && data.emel.trim()) {
    const { error: e2 } = await supabase.auth.admin.updateUserById(data.penggunaId, {
      email: data.emel.trim(),
      email_confirm: true,
    })
    if (e2) return { ralat: 'Profil dikemaskini tetapi e-mel gagal: ' + e2.message }
  }

  return { ralat: null }
}

export async function kemaskiniStatusPengguna(penggunaId: string, aktif: boolean) {
  const supabase = adminClient()
  const { error } = await supabase.auth.admin.updateUserById(penggunaId, {
    ban_duration: aktif ? 'none' : '876000h',
  })
  if (error) return { ralat: 'Gagal kemaskini status.' }
  return { ralat: null }
}
