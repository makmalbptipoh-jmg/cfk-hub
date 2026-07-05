import { createClient } from '@/lib/supabase/server'
import { MaklumanKlient } from './_components/MaklumanKlient'

export const dynamic = 'force-dynamic'

export default async function MaklumanPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Ambil pelajar aktif dengan telefon & cawangan
  const { data: pelajar } = await supabase
    .from('pelajar')
    .select('id, nama_penuh, no_telefon, cawangan:cawangan_daftar_id(nama)')
    .eq('status', 'Aktif')
    .order('nama_penuh')

  // Pelajar yang perlu bayar bulan ini (≥4 hadir + tiada resit aktif)
  const sekarang = new Date()
  const bulan = sekarang.toLocaleString('ms-MY', { month: 'long' })
  const tahun = sekarang.getFullYear()
  const mulaB = `${tahun}-${String(sekarang.getMonth() + 1).padStart(2, '0')}-01`
  const akhirB = new Date(tahun, sekarang.getMonth() + 1, 0).toISOString().split('T')[0]

  const { data: kehadiran } = await supabase
    .from('kehadiran')
    .select('pelajar_id')
    .eq('status', 'Hadir')
    .gte('tarikh', mulaB)
    .lte('tarikh', akhirB)

  const { data: resit } = await supabase
    .from('resit')
    .select('pelajar_id')
    .eq('bulan_bayaran', bulan)
    .eq('tahun_bayaran', tahun)
    .eq('status', 'Aktif')

  const kiraHadir: Record<string, number> = {}
  for (const k of kehadiran ?? []) kiraHadir[k.pelajar_id] = (kiraHadir[k.pelajar_id] ?? 0) + 1
  const sudahBayar = new Set((resit ?? []).map((r: any) => r.pelajar_id))

  const pelajarMapped = (pelajar ?? []).map((p: any) => ({
    id: p.id,
    nama_penuh: p.nama_penuh,
    no_telefon: p.no_telefon ?? '',
    cawangan: (p.cawangan as any)?.nama ?? '—',
    bilHadir: kiraHadir[p.id] ?? 0,
    perluBayar: (kiraHadir[p.id] ?? 0) >= 4 && !sudahBayar.has(p.id),
  }))

  return (
    <MaklumanKlient
      pelajar={pelajarMapped}
      bulanSemasa={`${bulan} ${tahun}`}
      penghantarId={user?.id ?? ''}
    />
  )
}
