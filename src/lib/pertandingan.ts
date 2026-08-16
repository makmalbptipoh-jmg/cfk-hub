// Logik dikongsi untuk Modul Pertandingan — markah prestasi, pingat, rating
// terkumpul & ringkasan. Digunakan oleh halaman pertandingan, Laporan Pelajar,
// profil pelajar & PDF. Formula rating = default telus & mudah ditala.

export type JenisPingat = 'Emas' | 'Perak' | 'Gangsa'

export const WARNA_PINGAT: Record<JenisPingat, { bg: string; text: string; border: string; emoji: string }> = {
  Emas: { bg: '#FEF9C3', text: '#854D0E', border: '#FDE68A', emoji: '🥇' },
  Perak: { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0', emoji: '🥈' },
  Gangsa: { bg: '#FFEDD5', text: '#9A3412', border: '#FED7AA', emoji: '🥉' },
}

// Kedudukan 1/2/3 = Emas/Perak/Gangsa. Selainnya tiada pingat.
export function pingatUntukKedudukan(kedudukan: number): JenisPingat | null {
  if (kedudukan === 1) return 'Emas'
  if (kedudukan === 2) return 'Perak'
  if (kedudukan === 3) return 'Gangsa'
  return null
}

// Skor penempatan 0–100 untuk satu pertandingan: 100 = tempat pertama,
// makin rendah kedudukan makin kecil. N = jumlah peserta.
export function kiraMarkahPrestasi(kedudukan: number, jumlahPeserta: number): number {
  if (jumlahPeserta <= 0 || kedudukan <= 0) return 0
  const k = Math.min(kedudukan, jumlahPeserta)
  return Math.round((100 * (jumlahPeserta - k + 1)) / jumlahPeserta)
}

// ---- Rating terkumpul (gaya Elo ringkas, boleh ditala) ----
// Mula pada RATING_ASAS; setiap pertandingan: rating += K*(markahPrestasi - 50).
// Kalahkan median (markah > 50) → rating naik; bawah median → turun.
// Jumlah = tidak bergantung susunan (komutatif) → stabil.
export const RATING_ASAS = 1000
export const RATING_K = 4
export const RATING_MIN = 100

export type BarisKeputusan = {
  kedudukan: number
  jumlah_peserta: number
  mata: number
  pingat: JenisPingat | null
}

export type Taraf = { nama: string; ikon: string; min: number; warna: string }

// Taraf bertema catur — selari visual dengan rating kehadiran (rating.ts).
export const TARAF_RATING: Taraf[] = [
  { nama: 'Pawn', ikon: '♟', min: 0, warna: '#94A3B8' },
  { nama: 'Knight', ikon: '♞', min: 950, warna: '#65A30D' },
  { nama: 'Bishop', ikon: '♝', min: 1050, warna: '#0891B2' },
  { nama: 'Rook', ikon: '♜', min: 1150, warna: '#7C3AED' },
  { nama: 'Queen', ikon: '♛', min: 1300, warna: '#DB2777' },
  { nama: 'King', ikon: '♚', min: 1500, warna: '#D97706' },
]

export function tarafRating(rating: number): Taraf {
  let taraf = TARAF_RATING[0]
  for (const t of TARAF_RATING) {
    if (rating >= t.min) taraf = t
  }
  return taraf
}

export type RingkasanPertandingan = {
  bilPertandingan: number
  kedudukanTerbaik: number | null
  purataKedudukan: number | null
  jumlahMata: number
  emas: number
  perak: number
  gangsa: number
  rating: number
  taraf: Taraf
}

// Agregat semua keputusan seorang pelajar → ringkasan + rating + taraf.
export function kiraRingkasanPertandingan(rows: BarisKeputusan[]): RingkasanPertandingan {
  const bil = rows.length
  let jumlahKedudukan = 0
  let kedudukanTerbaik: number | null = null
  let jumlahMata = 0
  let emas = 0, perak = 0, gangsa = 0
  let deltaRating = 0

  for (const r of rows) {
    jumlahKedudukan += r.kedudukan
    if (kedudukanTerbaik === null || r.kedudukan < kedudukanTerbaik) kedudukanTerbaik = r.kedudukan
    jumlahMata += r.mata
    if (r.pingat === 'Emas') emas++
    else if (r.pingat === 'Perak') perak++
    else if (r.pingat === 'Gangsa') gangsa++
    deltaRating += RATING_K * (kiraMarkahPrestasi(r.kedudukan, r.jumlah_peserta) - 50)
  }

  const rating = bil > 0 ? Math.max(RATING_MIN, Math.round(RATING_ASAS + deltaRating)) : RATING_ASAS

  return {
    bilPertandingan: bil,
    kedudukanTerbaik,
    purataKedudukan: bil > 0 ? Math.round((jumlahKedudukan / bil) * 10) / 10 : null,
    jumlahMata: Math.round(jumlahMata * 100) / 100,
    emas,
    perak,
    gangsa,
    rating,
    taraf: tarafRating(rating),
  }
}

// ---- Siri progres rating (untuk graf) ----
export type TitikGraf = { label: string; nilai: number; sub: string }
export type BarisSiri = { kedudukan: number; jumlah_peserta: number; tarikh: string | null }

// Rating terkumpul SELEPAS setiap pertandingan (kronologi) → titik graf progres.
export function kiraSiriRating(rows: BarisSiri[]): TitikGraf[] {
  const kron = [...rows].sort((a, b) => ((a.tarikh ?? '') < (b.tarikh ?? '') ? -1 : 1))
  let delta = 0
  return kron.map((r, i) => {
    delta += RATING_K * (kiraMarkahPrestasi(r.kedudukan, r.jumlah_peserta) - 50)
    const nilai = Math.max(RATING_MIN, Math.round(RATING_ASAS + delta))
    let label = `#${i + 1}`
    if (r.tarikh) {
      const d = new Date(r.tarikh)
      label = `${d.getDate()}/${d.getMonth() + 1}`
    }
    return { label, nilai, sub: `#${r.kedudukan}/${r.jumlah_peserta}` }
  })
}

// Papar mata catur ringkas: 7.5 → "7½", 5 → "5", 0.5 → "½".
export function formatMata(mata: number): string {
  const bulat = Math.floor(mata)
  const pecahan = mata - bulat
  let simbol = ''
  if (Math.abs(pecahan - 0.5) < 0.01) simbol = '½'
  else if (Math.abs(pecahan - 0.25) < 0.01) simbol = '¼'
  else if (Math.abs(pecahan - 0.75) < 0.01) simbol = '¾'
  if (simbol) return bulat > 0 ? `${bulat}${simbol}` : simbol
  return String(bulat)
}
