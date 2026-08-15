import { createClient } from '@/lib/supabase/server'
import { SilibusKlient } from './_components/SilibusKlient'

export const dynamic = 'force-dynamic'

export default async function SilibusPage() {
  const supabase = await createClient()

  const [rCawangan, rTajuk, rSub, rProgress] = await Promise.all([
    supabase.from('cawangan').select('id, nama').eq('status', 'Aktif').order('nama'),
    supabase.from('silibus_tajuk').select('id, nama, susunan, nota, status').order('susunan').order('nama'),
    supabase.from('silibus_subtajuk').select('id, tajuk_id, nama, susunan, fen, pgn_teks, pgn_path, pgn_nama, pgn_saiz, nota, pautan').order('susunan'),
    supabase.from('silibus_progress').select('id, subtajuk_id, cawangan_id, status'),
  ])

  return (
    <SilibusKlient
      cawanganAwal={rCawangan.data ?? []}
      tajukAwal={rTajuk.data ?? []}
      subtajukAwal={rSub.data ?? []}
      progressAwal={rProgress.data ?? []}
    />
  )
}
