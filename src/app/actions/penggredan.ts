'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { kiraPenilaian, type InputPenilaian, type BandUmur } from '@/lib/grading'
import { kiraLittlePawn, KUNCI_ITEM } from '@/lib/gradingLittlePawn'

// Jepit nilai ke julat sah CHECK constraint DB (elak 23514 semasa upsert).
const jepit = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.round(v || 0)))
const takNegatif = (v: number | null) => (v == null ? null : Math.max(0, v))

export type InputSimpanPenilaian = {
  pelajar_id: string
  kitaran_id: string
  cawangan_id: string | null
  level_mula: number
  band_umur: BandUmur | null
  theory_raw: number | null
  theory_max: number | null
  puzzle_raw: number | null
  puzzle_max: number | null
  club_points: number
  tournament_points: number
  sesi_hadir: number
  sesi_jumlah: number
  att_hormat: number
  att_fokus: number
  att_sportsmanship: number
  att_usaha: number
  rating_mula: number | null
  rating_tamat: number | null
  bonus_helper: number
  annotate_game: string | null
  nota_coach: string | null
  status: 'Draf' | 'Selesai'
}

// Upsert penilaian Level 1-6. Skor/gred/naik_level dikira di server (sumber
// kebenaran tunggal) guna kiraPenilaian — elak drift antara borang & DB.
export async function simpanPenilaian(input: InputSimpanPenilaian): Promise<{ ralat: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ralat: 'Sila log masuk semula.' }

  // Kunci edit jika kitaran Ditutup.
  const { data: kitaran } = await supabase
    .from('gred_kitaran').select('status').eq('id', input.kitaran_id).maybeSingle()
  if (kitaran?.status === 'Ditutup') return { ralat: 'Kitaran ini sudah Ditutup — gred dikunci.' }

  const kiraInput: InputPenilaian = {
    theoryRaw: input.theory_raw ?? 0,
    theoryMax: input.theory_max ?? 0,
    puzzleRaw: input.puzzle_raw ?? 0,
    puzzleMax: input.puzzle_max ?? 0,
    clubPoints: input.club_points,
    tournamentPoints: input.tournament_points,
    sesiHadir: input.sesi_hadir,
    sesiJumlah: input.sesi_jumlah,
    attHormat: input.att_hormat,
    attFokus: input.att_fokus,
    attSportsmanship: input.att_sportsmanship,
    attUsaha: input.att_usaha,
    ratingMula: input.rating_mula,
    ratingTamat: input.rating_tamat,
    bonusHelper: input.bonus_helper,
  }
  const hasil = kiraPenilaian(kiraInput)

  const { error } = await supabase.from('gred_penilaian').upsert({
    pelajar_id: input.pelajar_id,
    kitaran_id: input.kitaran_id,
    cawangan_id: input.cawangan_id,
    level_mula: jepit(input.level_mula, 1, 6),
    band_umur: input.band_umur,
    theory_raw: takNegatif(input.theory_raw),
    theory_max: takNegatif(input.theory_max),
    puzzle_raw: takNegatif(input.puzzle_raw),
    puzzle_max: takNegatif(input.puzzle_max),
    club_points: jepit(input.club_points, 0, 15),
    tournament_points: jepit(input.tournament_points, 0, 10),
    sesi_hadir: Math.max(0, Math.round(input.sesi_hadir || 0)),
    sesi_jumlah: Math.max(0, Math.round(input.sesi_jumlah || 0)),
    att_hormat: jepit(input.att_hormat, 0, 5),
    att_fokus: jepit(input.att_fokus, 0, 5),
    att_sportsmanship: jepit(input.att_sportsmanship, 0, 5),
    att_usaha: jepit(input.att_usaha, 0, 5),
    rating_mula: input.rating_mula,
    rating_tamat: input.rating_tamat,
    bonus_helper: jepit(input.bonus_helper, 0, 5),
    annotate_game: input.annotate_game,
    nota_coach: input.nota_coach,
    skor_akhir: hasil.skorAkhir,
    gred: hasil.gred,
    naik_level: hasil.naikLevel,
    status: input.status,
    dinilai_oleh: user.id,
    dinilai_pada: input.status === 'Selesai' ? new Date().toISOString().slice(0, 10) : null,
    dikemaskini_pada: new Date().toISOString(),
  }, { onConflict: 'pelajar_id,kitaran_id' })

  if (error) return { ralat: `Gagal simpan: ${error.message}${error.code ? ` [${error.code}]` : ''}` }

  revalidatePath('/penggredan')
  return { ralat: null }
}

// Batch upsert Level 1-6 — banyak pelajar sekali (S4). Skor dikira server.
export async function simpanBatch(rows: InputSimpanPenilaian[]): Promise<{ ralat: string | null; bil: number }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ralat: 'Sila log masuk semula.', bil: 0 }
  if (rows.length === 0) return { ralat: null, bil: 0 }

  const kitaranId = rows[0].kitaran_id
  const { data: kitaran } = await supabase.from('gred_kitaran').select('status').eq('id', kitaranId).maybeSingle()
  if (kitaran?.status === 'Ditutup') return { ralat: 'Kitaran ini sudah Ditutup — gred dikunci.', bil: 0 }

  const tarikhIni = new Date().toISOString().slice(0, 10)
  const stampTs = new Date().toISOString()
  const baris = rows.map((input) => {
    const hasil = kiraPenilaian({
      theoryRaw: input.theory_raw ?? 0, theoryMax: input.theory_max ?? 0,
      puzzleRaw: input.puzzle_raw ?? 0, puzzleMax: input.puzzle_max ?? 0,
      clubPoints: input.club_points, tournamentPoints: input.tournament_points,
      sesiHadir: input.sesi_hadir, sesiJumlah: input.sesi_jumlah,
      attHormat: input.att_hormat, attFokus: input.att_fokus, attSportsmanship: input.att_sportsmanship, attUsaha: input.att_usaha,
      ratingMula: input.rating_mula, ratingTamat: input.rating_tamat, bonusHelper: input.bonus_helper,
    })
    return {
      pelajar_id: input.pelajar_id, kitaran_id: input.kitaran_id, cawangan_id: input.cawangan_id,
      level_mula: jepit(input.level_mula, 1, 6), band_umur: input.band_umur,
      theory_raw: takNegatif(input.theory_raw), theory_max: takNegatif(input.theory_max), puzzle_raw: takNegatif(input.puzzle_raw), puzzle_max: takNegatif(input.puzzle_max),
      club_points: jepit(input.club_points, 0, 15), tournament_points: jepit(input.tournament_points, 0, 10),
      sesi_hadir: Math.max(0, Math.round(input.sesi_hadir || 0)), sesi_jumlah: Math.max(0, Math.round(input.sesi_jumlah || 0)),
      att_hormat: jepit(input.att_hormat, 0, 5), att_fokus: jepit(input.att_fokus, 0, 5), att_sportsmanship: jepit(input.att_sportsmanship, 0, 5), att_usaha: jepit(input.att_usaha, 0, 5),
      rating_mula: input.rating_mula, rating_tamat: input.rating_tamat, bonus_helper: jepit(input.bonus_helper, 0, 5),
      annotate_game: input.annotate_game, nota_coach: input.nota_coach,
      skor_akhir: hasil.skorAkhir, gred: hasil.gred, naik_level: hasil.naikLevel,
      status: input.status, dinilai_oleh: user.id,
      dinilai_pada: input.status === 'Selesai' ? tarikhIni : null, dikemaskini_pada: stampTs,
    }
  })

  const { error } = await supabase.from('gred_penilaian').upsert(baris, { onConflict: 'pelajar_id,kitaran_id' })
  if (error) return { ralat: `Gagal simpan batch: ${error.message}${error.code ? ` [${error.code}]` : ''}`, bil: 0 }

  revalidatePath('/penggredan')
  return { ralat: null, bil: baris.length }
}

export type InputSimpanLittlePawn = {
  pelajar_id: string
  kitaran_id: string
  cawangan_id: string | null
  items: number[] // 12
  sesi_hadir: number
  sesi_jumlah: number
  skor_sikap: number
  minigame_selesai: boolean
  nota_coach: string | null
  status: 'Draf' | 'Selesai'
}

// Upsert checklist Level 0. Skor/peringkat/graduasi dikira di server.
export async function simpanLittlePawn(input: InputSimpanLittlePawn): Promise<{ ralat: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ralat: 'Sila log masuk semula.' }

  const { data: kitaran } = await supabase
    .from('gred_kitaran').select('status').eq('id', input.kitaran_id).maybeSingle()
  if (kitaran?.status === 'Ditutup') return { ralat: 'Kitaran ini sudah Ditutup — dikunci.' }

  const hasil = kiraLittlePawn({
    items: input.items,
    sesiHadir: input.sesi_hadir,
    sesiJumlah: input.sesi_jumlah,
    skorSikapMentah: input.skor_sikap,
    minigameSelesai: input.minigame_selesai,
  })

  const barisItem: Record<string, number> = {}
  KUNCI_ITEM.forEach((k, i) => { barisItem[k] = jepit(input.items[i] ?? 0, 0, 2) })

  const { error } = await supabase.from('gred_little_pawn').upsert({
    pelajar_id: input.pelajar_id,
    kitaran_id: input.kitaran_id,
    cawangan_id: input.cawangan_id,
    ...barisItem,
    sesi_hadir: Math.max(0, Math.round(input.sesi_hadir || 0)),
    sesi_jumlah: Math.max(0, Math.round(input.sesi_jumlah || 0)),
    skor_sikap: jepit(input.skor_sikap, 0, 5),
    minigame_selesai: input.minigame_selesai,
    peringkat: hasil.peringkat === 'graduated' ? 3 : hasil.peringkat,
    graduasi: hasil.graduasi,
    skor_akhir: hasil.skorAkhir,
    nota_coach: input.nota_coach,
    status: input.status,
    dinilai_oleh: user.id,
    dinilai_pada: input.status === 'Selesai' ? new Date().toISOString().slice(0, 10) : null,
    dikemaskini_pada: new Date().toISOString(),
  }, { onConflict: 'pelajar_id,kitaran_id' })

  if (error) return { ralat: `Gagal simpan checklist: ${error.message}${error.code ? ` [${error.code}]` : ''}` }

  revalidatePath('/penggredan')
  return { ralat: null }
}
