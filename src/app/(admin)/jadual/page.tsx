import { createClient } from '@/lib/supabase/server'
import { tarikhTempatan } from '@/lib/utils'
import { JadualKlient } from './_components/JadualKlient'

export const dynamic = 'force-dynamic'

export default async function JadualPage() {
  const supabase = await createClient()

  const [{ data: cawangan }, { data: slot }, { data: jurulatih }, { data: aktiviti }] = await Promise.all([
    supabase.from('cawangan').select('id, nama').eq('status', 'Aktif').order('nama'),
    supabase
      .from('jadual_slot')
      .select('*, cawangan:cawangan_id(nama), pelajar:pelajar_id(nama_penuh), jurulatih:jurulatih_id(nama_penuh)')
      .eq('status', 'Aktif')
      .order('hari_minggu')
      .order('masa_mula'),
    supabase.from('jurulatih').select('id, nama_penuh').eq('status', 'Aktif').order('nama_penuh'),
    supabase
      .from('aktiviti')
      .select('*, cawangan:cawangan_id(nama), pelajar:pelajar_id(nama_penuh), jurulatih:jurulatih_id(nama_penuh)')
      .gte('tarikh', tarikhTempatan())
      .order('tarikh')
      .order('masa_mula')
      .limit(50),
  ])

  return (
    <JadualKlient
      cawanganAwal={cawangan ?? []}
      slotAwal={(slot ?? []) as never[]}
      jurulatihAwal={jurulatih ?? []}
      aktivitiAwal={(aktiviti ?? []) as never[]}
    />
  )
}
