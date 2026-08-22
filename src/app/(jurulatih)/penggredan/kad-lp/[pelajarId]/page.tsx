import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ITEM_CHECKLIST, KUNCI_ITEM, aktivitiUntukItem } from '@/lib/gradingLittlePawn'
import { KadLittlePawnPreview } from '../../_components/KadLittlePawnPreview'
import type { PropsKadLP } from '@/components/pdf/BtnKadLittlePawn'
import type { Database } from '@/types/database'

type Row = Database['public']['Tables']['gred_little_pawn']['Row']

export const dynamic = 'force-dynamic'

export default async function KadLittlePawnPage({
  params,
  searchParams,
}: {
  params: Promise<{ pelajarId: string }>
  searchParams: Promise<{ kitaran?: string }>
}) {
  const { pelajarId } = await params
  const { kitaran: kitaranId } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (!kitaranId) return <Kosong pesan="Kitaran tidak dinyatakan." />

  const [rPelajar, rKitaran, rRekod] = await Promise.all([
    supabase.from('pelajar').select('id, nama_penuh, cawangan:cawangan_daftar_id(nama)').eq('id', pelajarId).maybeSingle(),
    supabase.from('gred_kitaran').select('id, nama').eq('id', kitaranId).maybeSingle(),
    supabase.from('gred_little_pawn').select('*').eq('pelajar_id', pelajarId).eq('kitaran_id', kitaranId).maybeSingle(),
  ])

  const pelajar = rPelajar.data as { id: string; nama_penuh: string; cawangan: { nama: string } | null } | null
  const kitaran = rKitaran.data
  const rekod = rRekod.data as Row | null
  if (!pelajar || !kitaran) return <Kosong pesan="Pelajar atau kitaran tidak dijumpai." />
  if (!rekod) return <Kosong pesan="Pelajar ini belum ada checklist Little Pawn untuk kitaran ini." pelajarId={pelajarId} kitaranId={kitaranId} />

  const nilai = KUNCI_ITEM.map((k) => (rekod[k as keyof Row] as number) ?? 0)
  const items = ITEM_CHECKLIST.map((it, i) => ({ label: it.label, kumpulan: it.kumpulan, nilai: nilai[i] }))
  const bintang = rekod.graduasi ? 3 : rekod.peringkat

  // Fokus = 2 item pertama yang belum "Dah Boleh" (nilai < 2) + nama aktiviti sepadan.
  const fokus = ITEM_CHECKLIST
    .filter((_, i) => nilai[i] < 2)
    .slice(0, 2)
    .map((it) => ({ label: it.label, aktiviti: aktivitiUntukItem(it.key)[0]?.nama ?? '' }))

  const data: PropsKadLP = {
    nama: pelajar.nama_penuh,
    cawangan: pelajar.cawangan?.nama ?? null,
    kitaranNama: kitaran.nama,
    bintang,
    items,
    notaCoach: rekod.nota_coach,
    fokus,
    graduasi: rekod.graduasi,
  }

  return <KadLittlePawnPreview data={data} kitaranId={kitaranId} pelajarId={pelajarId} status={rekod.status} />
}

function Kosong({ pesan, pelajarId, kitaranId }: { pesan: string; pelajarId?: string; kitaranId?: string }) {
  return (
    <div style={{ padding: '32px 16px', textAlign: 'center' }}>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '14px' }}>{pesan}</p>
      {pelajarId && kitaranId && (
        <Link href={`/penggredan/little-pawn/${pelajarId}?kitaran=${kitaranId}`} style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', textDecoration: 'none', marginRight: '14px' }}>Isi checklist →</Link>
      )}
      <Link href="/penggredan" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}>← Kembali ke Penggredan</Link>
    </div>
  )
}
