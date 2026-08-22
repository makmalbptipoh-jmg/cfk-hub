// Logik dikongsi untuk Modul Penggredan — Level 1-6 (markah berpemberat,
// gred A-E, syarat naik level). Digunakan oleh borang penilaian (live
// preview), kad laporan, Excel & PDF. Formula = telus & mudah ditala.
//
// NOTA reconcile: nama Pawn/Knight/…/King di sini = TAHAP SILIBUS (kurikulum),
// BUKAN sama dgn "Bintang Kehadiran" (rating.ts) atau "Rating Pertandingan"
// (pertandingan.ts). Tiga paksi berbeza — jangan gabung. Papar selalu dgn
// awalan "Tahap Silibus: …" supaya tak keliru.

import { kiraRingkasanPertandingan, RATING_ASAS, type BarisKeputusan } from './pertandingan'

export type Gred = 'A' | 'B' | 'C' | 'D' | 'E'
export type BandUmur = 'junior' | 'inter' | 'senior'

// ---- Tahap Silibus (Levels) — const, bukan jadual DB ----
// rating_min/max = maklumat sahaja; kenaikan level ikut GATE promosi, bukan rating.
export type TarafGred = { id: number; nama: string; ikon: string; ratingMin: number; ratingMax: number }
export const TARAF_GRED: TarafGred[] = [
  { id: 0, nama: 'Little Pawn', ikon: '♙', ratingMin: 0, ratingMax: 0 },
  { id: 1, nama: 'Pawn', ikon: '♟', ratingMin: 0, ratingMax: 799 },
  { id: 2, nama: 'Knight', ikon: '♞', ratingMin: 800, ratingMax: 999 },
  { id: 3, nama: 'Bishop', ikon: '♝', ratingMin: 1000, ratingMax: 1199 },
  { id: 4, nama: 'Rook', ikon: '♜', ratingMin: 1200, ratingMax: 1399 },
  { id: 5, nama: 'Queen', ikon: '♛', ratingMin: 1400, ratingMax: 1599 },
  { id: 6, nama: 'King', ikon: '♚', ratingMin: 1600, ratingMax: 9999 },
]

export function tarafGred(levelId: number): TarafGred {
  return TARAF_GRED.find((t) => t.id === levelId) ?? TARAF_GRED[0]
}

// Warna gred: A hijau, B biru, C kuning, D & E oren (skrin — guna hex terus
// supaya konsisten dgn PDF; padan famili tema slate/lime app).
export const WARNA_GRED: Record<Gred, { bg: string; text: string; solid: string }> = {
  A: { bg: '#F0FDF4', text: '#166534', solid: '#84CC16' },
  B: { bg: '#EFF6FF', text: '#1E40AF', solid: '#2563EB' },
  C: { bg: '#FFFBEB', text: '#92400E', solid: '#F5C400' },
  D: { bg: '#FFF7ED', text: '#9A3412', solid: '#EA580C' },
  E: { bg: '#FFF7ED', text: '#9A3412', solid: '#EA580C' },
}

// ---- Band umur (junior 6-8 / inter 9-12 / senior 13-18) ----
export function umurDariTarikhLahir(tarikhLahir: string | null, rujukan?: Date): number | null {
  if (!tarikhLahir) return null
  const lahir = new Date(tarikhLahir)
  if (Number.isNaN(lahir.getTime())) return null
  const kini = rujukan ?? new Date()
  let umur = kini.getFullYear() - lahir.getFullYear()
  const m = kini.getMonth() - lahir.getMonth()
  if (m < 0 || (m === 0 && kini.getDate() < lahir.getDate())) umur--
  return umur
}

export function bandUmurDariUmur(umur: number | null): BandUmur {
  if (umur === null) return 'inter'
  if (umur <= 8) return 'junior'
  if (umur <= 12) return 'inter'
  return 'senior'
}

export function bandUmurDariTarikhLahir(tarikhLahir: string | null, rujukan?: Date): BandUmur {
  return bandUmurDariUmur(umurDariTarikhLahir(tarikhLahir, rujukan))
}

// ---- Komponen skor (pemberat: 25/20/25/10/10/10 + bonus 5, maks 105) ----
function bahagiSelamat(atas: number, bawah: number): number {
  if (!bawah || bawah <= 0) return 0
  return atas / bawah
}

export function skorTheory(raw: number, max: number): number {
  return bahagiSelamat(raw, max) * 25
}
export function skorPuzzle(raw: number, max: number): number {
  return bahagiSelamat(raw, max) * 20
}
export function skorPractical(clubPoints: number, tournamentPoints: number): number {
  return Math.min(25, (clubPoints || 0) + (tournamentPoints || 0))
}
export function skorKehadiran(hadir: number, jumlah: number): number {
  return bahagiSelamat(hadir, jumlah) * 10
}
export function skorSikap(hormat: number, fokus: number, sportsmanship: number, usaha: number): number {
  const jumlah = (hormat || 0) + (fokus || 0) + (sportsmanship || 0) + (usaha || 0)
  return (jumlah / 20) * 10
}

// Improvement ikut delta rating (rating_end - rating_start).
export function skorImprovement(ratingMula: number | null, ratingTamat: number | null): number {
  if (ratingMula === null || ratingTamat === null) return 2 // tiada data → anggap delta 0
  const delta = ratingTamat - ratingMula
  if (delta >= 100) return 10
  if (delta >= 60) return 8
  if (delta >= 30) return 6
  if (delta >= 1) return 4
  if (delta === 0) return 2
  return 0
}

// Practical points dari sumber mentah (jika mahu kira dari peratus/kedudukan).
export function markahClubDariWinRate(peratusMenang: number | null): number {
  if (peratusMenang === null) return 0 // tak main
  if (peratusMenang >= 70) return 15
  if (peratusMenang >= 55) return 12
  if (peratusMenang >= 40) return 9
  if (peratusMenang >= 25) return 6
  return 3
}
export function markahTournamentDariKedudukan(
  jenis: 'Juara' | 'Top3' | 'Top10' | 'Sertai' | 'Tiada',
): number {
  switch (jenis) {
    case 'Juara': return 10
    case 'Top3': return 8
    case 'Top10': return 6
    case 'Sertai': return 4
    default: return 0
  }
}

// ---- Gred & naik level ----
export function gredDariSkor(skor: number): Gred {
  if (skor >= 85) return 'A'
  if (skor >= 70) return 'B'
  if (skor >= 55) return 'C'
  if (skor >= 40) return 'D'
  return 'E'
}

export const LABEL_GRED: Record<Gred, string> = {
  A: 'Cemerlang',
  B: 'Baik',
  C: 'Sederhana',
  D: 'Perlu Bimbingan',
  E: 'Perlu Bimbingan',
}

// Naik level HANYA jika ketiga-tiga: skor>=70, theory>=60%, practical>=60%.
// Pulang { boleh, sebab } — sebab untuk amaran merah S2.
export function bolehNaikLevel(
  skorAkhir: number,
  theoryRaw: number,
  theoryMax: number,
  skorPractical: number,
): { boleh: boolean; sebab: string | null } {
  const theoryPeratus = bahagiSelamat(theoryRaw, theoryMax)
  const practicalPeratus = skorPractical / 25
  const gagal: string[] = []
  if (skorAkhir < 70) gagal.push('jumlah bawah 70')
  if (theoryPeratus < 0.6) gagal.push('Theory bawah 60%')
  if (practicalPeratus < 0.6) gagal.push('Practical bawah 60%')
  if (gagal.length === 0) return { boleh: true, sebab: null }
  return { boleh: false, sebab: `Tak layak naik level — ${gagal.join(', ')}` }
}

// ---- Orkestra: kira semua komponen sekali gus ----
export type InputPenilaian = {
  theoryRaw: number
  theoryMax: number
  puzzleRaw: number
  puzzleMax: number
  clubPoints: number
  tournamentPoints: number
  sesiHadir: number
  sesiJumlah: number
  attHormat: number
  attFokus: number
  attSportsmanship: number
  attUsaha: number
  ratingMula: number | null
  ratingTamat: number | null
  bonusHelper: number
}

export type HasilPenilaian = {
  skorTheory: number
  skorPuzzle: number
  skorPractical: number
  skorKehadiran: number
  skorSikap: number
  skorImprovement: number
  bonus: number
  skorAkhir: number
  gred: Gred
  naikLevel: boolean
  sebabTakNaik: string | null
}

// Bulatkan 1 titik perpuluhan (papar & simpan konsisten dgn Excel).
function bulat1(n: number): number {
  return Math.round(n * 10) / 10
}

export function kiraPenilaian(input: InputPenilaian): HasilPenilaian {
  const sTheory = skorTheory(input.theoryRaw, input.theoryMax)
  const sPuzzle = skorPuzzle(input.puzzleRaw, input.puzzleMax)
  const sPractical = skorPractical(input.clubPoints, input.tournamentPoints)
  const sKehadiran = skorKehadiran(input.sesiHadir, input.sesiJumlah)
  const sSikap = skorSikap(input.attHormat, input.attFokus, input.attSportsmanship, input.attUsaha)
  const sImprovement = skorImprovement(input.ratingMula, input.ratingTamat)
  const bonus = Math.max(0, Math.min(5, input.bonusHelper || 0))

  const skorAkhir = bulat1(sTheory + sPuzzle + sPractical + sKehadiran + sSikap + sImprovement + bonus)
  const gred = gredDariSkor(skorAkhir)
  const promosi = bolehNaikLevel(skorAkhir, input.theoryRaw, input.theoryMax, sPractical)

  return {
    skorTheory: bulat1(sTheory),
    skorPuzzle: bulat1(sPuzzle),
    skorPractical: bulat1(sPractical),
    skorKehadiran: bulat1(sKehadiran),
    skorSikap: bulat1(sSikap),
    skorImprovement: sImprovement,
    bonus,
    skorAkhir,
    gred,
    naikLevel: promosi.boleh,
    sebabTakNaik: promosi.sebab,
  }
}

// ---- Rating Improvement dari modul Pertandingan (guna semula) ----
// rating_tamat = rating semasa pelajar dari pertandingan_keputusan.
// rating_mula = rating_tamat kitaran lepas (atau RATING_ASAS untuk kitaran pertama).
export function ratingSemasaDariKeputusan(rows: BarisKeputusan[]): number {
  return kiraRingkasanPertandingan(rows).rating
}
export { RATING_ASAS }

// ---- Level semasa pelajar (untuk paparan & routing borang) ----
// Tiada lajur `level` pada `pelajar` (jadual locked) — derive dari rekod:
//   1) rekod penilaian terbaru → level_mula + (naik_level ? 1 : 0), cap 6
//   2) tiada penilaian tapi Little Pawn graduated → Level 1
//   3) ada Little Pawn belum graduate → Level 0
//   4) tiada rekod → umur < 6 ? Level 0 : Level 1
export function levelSemasaPelajar(opts: {
  penilaianTerbaruDahulu: { level_mula: number; naik_level: boolean }[]
  adaLittlePawnGraduated: boolean
  adaLittlePawnBelumGraduate: boolean
  umur: number | null
}): number {
  const { penilaianTerbaruDahulu, adaLittlePawnGraduated, adaLittlePawnBelumGraduate, umur } = opts
  if (penilaianTerbaruDahulu.length > 0) {
    const t = penilaianTerbaruDahulu[0]
    return Math.min(6, Math.max(1, t.level_mula + (t.naik_level ? 1 : 0)))
  }
  if (adaLittlePawnGraduated) return 1
  if (adaLittlePawnBelumGraduate) return 0
  return umur !== null && umur < 6 ? 0 : 1
}

// ---- Nama fail (buang simbol, space → underscore) ----
export function namaFail(...bahagian: string[]): string {
  return bahagian
    .map((b) => (b || '').trim().replace(/\s+/g, '_').replace(/[^A-Za-z0-9_]/g, ''))
    .filter(Boolean)
    .join('_')
}
