import { createClient } from '@/lib/supabase/server'
import { SenaraiAsetKlient } from './_components/SenaraiAsetKlient'

export const dynamic = 'force-dynamic'

export default async function AsetPage() {
  const supabase = await createClient()

  const [{ data: aset }, { data: cawangan }] = await Promise.all([
    supabase
      .from('aset')
      .select('id, nama, kategori, kuantiti, harga_seunit, nilai_asal, tarikh_beli, cawangan_id, status, sebab_lupus, tarikh_lupus, cawangan:cawangan_id(nama)')
      .order('created_at', { ascending: false }),
    supabase.from('cawangan').select('id, nama').eq('status', 'Aktif').order('nama'),
  ])

  return (
    <SenaraiAsetKlient
      aset={(aset ?? []) as any}
      cawangan={cawangan ?? []}
    />
  )
}
