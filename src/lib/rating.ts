// Sistem rating pelajar — penanda aras kekuatan.
// 1 kehadiran (Hadir) = 1 bintang = 10 point. Level bertema catur.

export type Taraf = { nama: string; ikon: string; min: number; warna: string }

export const TARAF: Taraf[] = [
  { nama: 'Pawn', ikon: '♟', min: 0, warna: '#94A3B8' },
  { nama: 'Knight', ikon: '♞', min: 10, warna: '#65A30D' },
  { nama: 'Bishop', ikon: '♝', min: 25, warna: '#0891B2' },
  { nama: 'Rook', ikon: '♜', min: 50, warna: '#7C3AED' },
  { nama: 'Queen', ikon: '♛', min: 100, warna: '#DB2777' },
  { nama: 'King', ikon: '♚', min: 200, warna: '#D97706' },
]

export type Rating = {
  bintang: number
  point: number
  level: Taraf
  levelSeterusnya: Taraf | null
  bakiKeSeterusnya: number
  peratusKemajuan: number
}

export function kiraRating(bintang: number): Rating {
  const b = Math.max(0, Math.floor(bintang))
  let idx = 0
  for (let i = TARAF.length - 1; i >= 0; i--) {
    if (b >= TARAF[i].min) { idx = i; break }
  }
  const level = TARAF[idx]
  const levelSeterusnya = idx < TARAF.length - 1 ? TARAF[idx + 1] : null
  const bakiKeSeterusnya = levelSeterusnya ? levelSeterusnya.min - b : 0
  const peratusKemajuan = levelSeterusnya
    ? Math.round(((b - level.min) / (levelSeterusnya.min - level.min)) * 100)
    : 100
  return { bintang: b, point: b * 10, level, levelSeterusnya, bakiKeSeterusnya, peratusKemajuan }
}
