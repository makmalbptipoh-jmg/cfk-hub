import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { kiraPenilaian, tarafGred, LABEL_GRED, type InputPenilaian, type Gred } from '@/lib/grading'
import { KadPenilaianPreview } from '../../_components/KadPenilaianPreview'
import type { PropsKadGred } from '@/components/pdf/BtnKadGredPDF'

export const dynamic = 'force-dynamic'

export default async function KadPage({
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

  if (!kitaranId) {
    return <Kosong pesan="Kitaran tidak dinyatakan." />
  }

  const [rPelajar, rKitaran, rRekod] = await Promise.all([
    supabase.from('pelajar').select('id, nama_penuh, tarikh_lahir, cawangan:cawangan_daftar_id(nama)').eq('id', pelajarId).maybeSingle(),
    supabase.from('gred_kitaran').select('id, nama, tarikh_tamat').eq('id', kitaranId).maybeSingle(),
    supabase.from('gred_penilaian').select('*').eq('pelajar_id', pelajarId).eq('kitaran_id', kitaranId).maybeSingle(),
  ])

  const pelajar = rPelajar.data as { id: string; nama_penuh: string; tarikh_lahir: string | null; cawangan: { nama: string } | null } | null
  const kitaran = rKitaran.data
  const rekod = rRekod.data
  if (!pelajar || !kitaran) return <Kosong pesan="Pelajar atau kitaran tidak dijumpai." />
  if (!rekod) return <Kosong pesan="Pelajar ini belum dinilai untuk kitaran ini." pelajarId={pelajarId} />

  const input: InputPenilaian = {
    theoryRaw: rekod.theory_raw ?? 0, theoryMax: rekod.theory_max ?? 0,
    puzzleRaw: rekod.puzzle_raw ?? 0, puzzleMax: rekod.puzzle_max ?? 0,
    clubPoints: rekod.club_points, tournamentPoints: rekod.tournament_points,
    sesiHadir: rekod.sesi_hadir, sesiJumlah: rekod.sesi_jumlah,
    attHormat: rekod.att_hormat, attFokus: rekod.att_fokus, attSportsmanship: rekod.att_sportsmanship, attUsaha: rekod.att_usaha,
    ratingMula: rekod.rating_mula, ratingTamat: rekod.rating_tamat, bonusHelper: rekod.bonus_helper,
  }
  const hasil = kiraPenilaian(input)

  const komponen = [
    { label: 'Theory', nilai: hasil.skorTheory, penuh: 25 },
    { label: 'Puzzle', nilai: hasil.skorPuzzle, penuh: 20 },
    { label: 'Practical', nilai: hasil.skorPractical, penuh: 25 },
    { label: 'Kehadiran', nilai: hasil.skorKehadiran, penuh: 10 },
    { label: 'Sikap', nilai: hasil.skorSikap, penuh: 10 },
    { label: 'Improvement', nilai: hasil.skorImprovement, penuh: 10 },
  ]
  // Fokus = komponen ratio terendah.
  const fokus = [...komponen].sort((a, b) => a.nilai / a.penuh - b.nilai / b.penuh)[0]?.label ?? 'Theory'

  const umur = pelajar.tarikh_lahir
    ? (() => { const d = new Date(pelajar.tarikh_lahir!); const ref = new Date(kitaran.tarikh_tamat); let u = ref.getFullYear() - d.getFullYear(); const m = ref.getMonth() - d.getMonth(); if (m < 0 || (m === 0 && ref.getDate() < d.getDate())) u--; return u })()
    : null

  const taraf = tarafGred(rekod.level_mula)
  const tarafBaru = tarafGred(Math.min(6, rekod.level_mula + 1))
  const gred = (rekod.gred ?? hasil.gred) as Gred

  const data: PropsKadGred = {
    nama: pelajar.nama_penuh,
    umur,
    levelNama: `${taraf.ikon} ${taraf.nama}`,
    cawangan: pelajar.cawangan?.nama ?? null,
    kitaranNama: kitaran.nama,
    komponen,
    bonus: hasil.bonus,
    skorAkhir: rekod.skor_akhir ?? hasil.skorAkhir,
    gred,
    labelGred: LABEL_GRED[gred],
    naikLevel: rekod.naik_level,
    levelBaru: `${tarafBaru.ikon} ${tarafBaru.nama}`,
    ratingMula: rekod.rating_mula,
    ratingTamat: rekod.rating_tamat,
    komenCoach: rekod.nota_coach,
    fokus,
  }

  return <KadPenilaianPreview data={data} kitaranId={kitaranId} pelajarId={pelajarId} status={rekod.status} />
}

function Kosong({ pesan, pelajarId, kitaranId }: { pesan: string; pelajarId?: string; kitaranId?: string }) {
  return (
    <div style={{ padding: '32px 16px', textAlign: 'center' }}>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '14px' }}>{pesan}</p>
      {pelajarId && kitaranId && (
        <Link href={`/penggredan/nilai/${pelajarId}?kitaran=${kitaranId}`} style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', textDecoration: 'none', marginRight: '14px' }}>Nilai sekarang →</Link>
      )}
      <Link href="/penggredan" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}>← Kembali ke Penggredan</Link>
    </div>
  )
}
