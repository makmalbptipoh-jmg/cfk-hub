'use server'

import { createClient } from '@/lib/supabase/server'
import { akhirBulan } from '@/lib/utils'

export type Notifikasi = {
  id: string
  jenis: string
  tajuk: string
  mesej: string
  pautan: string | null
  dibaca: boolean
  created_at: string
}

const NAMA_BULAN = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
]

async function sahAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabase
    .from('pengguna_profil')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  return data?.is_admin === true
}

// Jana amaran operasi semasa (pelajar belum bayar) lalu pulangkan senarai
// notifikasi terkini + bilangan belum dibaca. Nyahduplikat ikut `kunci`
// (satu notifikasi per pelajar per bulan); auto-selesai bila sudah dibayar.
export async function janaDanMuatNotifikasi(): Promise<{ senarai: Notifikasi[]; belumDibaca: number }> {
  const supabase = await createClient()
  if (!(await sahAdmin(supabase))) return { senarai: [], belumDibaca: 0 }

  // Bulan semasa waktu Malaysia (UTC+8)
  const myt = new Date(Date.now() + 8 * 60 * 60 * 1000)
  const tahun = myt.getUTCFullYear()
  const bulanNombor = myt.getUTCMonth() + 1
  const bulanKunci = `${tahun}-${String(bulanNombor).padStart(2, '0')}`
  const namaBulan = NAMA_BULAN[bulanNombor - 1]
  const mulaB = `${bulanKunci}-01`
  const akhirB = akhirBulan(tahun, bulanNombor)

  const [{ data: pelajarAktif }, { data: kehadiranBulan }, { data: resitBulan }] = await Promise.all([
    supabase.from('pelajar').select('id, nama_penuh').eq('status', 'Aktif'),
    supabase.from('kehadiran').select('pelajar_id, status').eq('status', 'Hadir').gte('tarikh', mulaB).lte('tarikh', akhirB),
    supabase.from('resit').select('pelajar_id').eq('bulan_bayaran', namaBulan).eq('tahun_bayaran', tahun).eq('status', 'Aktif'),
  ])

  const idDgnResit = new Set((resitBulan ?? []).map((r) => r.pelajar_id))
  const kiraHadir: Record<string, number> = {}
  for (const k of kehadiranBulan ?? []) {
    kiraHadir[k.pelajar_id] = (kiraHadir[k.pelajar_id] ?? 0) + 1
  }

  const belumBayar = (pelajarAktif ?? []).filter(
    (p) => (kiraHadir[p.id] ?? 0) >= 4 && !idDgnResit.has(p.id)
  )
  const idBelumBayar = new Set(belumBayar.map((p) => p.id))

  // Sisip notifikasi baharu (abai jika kunci sudah wujud)
  if (belumBayar.length > 0) {
    const baris = belumBayar.map((p) => ({
      jenis: 'belum_bayar',
      tajuk: 'Pelajar belum bayar',
      mesej: `${p.nama_penuh} sudah ${kiraHadir[p.id]} kali hadir bulan ${namaBulan} tetapi belum ada resit.`,
      pautan: `/pelajar/${p.id}`,
      kunci: `belum_bayar:${p.id}:${bulanKunci}`,
      rujukan_id: p.id,
    }))
    await supabase.from('notifikasi').upsert(baris, { onConflict: 'kunci', ignoreDuplicates: true })
  }

  // Auto-selesai: tandai dibaca notifikasi belum_bayar bulan ini yang pelajarnya
  // kini sudah membayar (tiada lagi dalam senarai belum bayar).
  const { data: belumBayarSemasa } = await supabase
    .from('notifikasi')
    .select('id, rujukan_id')
    .eq('jenis', 'belum_bayar')
    .eq('dibaca', false)
    .like('kunci', `%:${bulanKunci}`)

  const idSelesai = (belumBayarSemasa ?? [])
    .filter((n) => n.rujukan_id && !idBelumBayar.has(n.rujukan_id))
    .map((n) => n.id)
  if (idSelesai.length > 0) {
    await supabase
      .from('notifikasi')
      .update({ dibaca: true, dibaca_pada: new Date().toISOString() })
      .in('id', idSelesai)
  }

  const [{ data: senarai }, { count }] = await Promise.all([
    supabase
      .from('notifikasi')
      .select('id, jenis, tajuk, mesej, pautan, dibaca, created_at')
      .order('created_at', { ascending: false })
      .limit(30),
    supabase.from('notifikasi').select('id', { count: 'exact', head: true }).eq('dibaca', false),
  ])

  return { senarai: (senarai ?? []) as Notifikasi[], belumDibaca: count ?? 0 }
}

export async function tandaDibaca(id: string): Promise<void> {
  const supabase = await createClient()
  if (!(await sahAdmin(supabase))) return
  await supabase
    .from('notifikasi')
    .update({ dibaca: true, dibaca_pada: new Date().toISOString() })
    .eq('id', id)
}

export async function tandaSemuaDibaca(): Promise<void> {
  const supabase = await createClient()
  if (!(await sahAdmin(supabase))) return
  await supabase
    .from('notifikasi')
    .update({ dibaca: true, dibaca_pada: new Date().toISOString() })
    .eq('dibaca', false)
}
