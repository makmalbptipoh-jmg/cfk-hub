// Logik + data rujukan untuk Level 0 Little Pawn (umur 4-5).
// Checklist 12 item (0/1/2), skor dalaman coach, peringkat/graduasi, serta
// aktiviti/sesi/jadual 12-minggu sebagai const (bukan jadual DB — tak diedit).
//
// PENTING: Level 0 TIADA gred huruf & TIADA peratus untuk parent. skor_akhir
// hanya rekod dalaman coach — kuatkuasa di peringkat komponen laporan (S7).

export type NilaiItem = 0 | 1 | 2 // Belum / Sedang / Dah Boleh
export const LABEL_NILAI: Record<NilaiItem, string> = {
  0: 'Belum',
  1: 'Sedang',
  2: 'Dah Boleh',
}

// Warna butang 3-status (S6): Belum kelabu / Sedang kuning / Dah Boleh hijau.
export const WARNA_NILAI: Record<NilaiItem, string> = {
  0: '#94A3B8',
  1: '#F5C400',
  2: '#84CC16',
}

export type KumpulanItem = 'Kenal' | 'Gerak' | 'Main'
export type ItemChecklist = { key: string; label: string; kumpulan: KumpulanItem }

// 12 item — dikumpul Kenal (i01-i04) / Gerak (i05-i09) / Main (i10-i12).
export const ITEM_CHECKLIST: ItemChecklist[] = [
  { key: 'i01', label: 'Kenal nama enam pieces', kumpulan: 'Kenal' },
  { key: 'i02', label: 'Kenal petak light dan dark', kumpulan: 'Kenal' },
  { key: 'i03', label: 'Susun board sendiri', kumpulan: 'Kenal' },
  { key: 'i04', label: 'Fokus 10 minit', kumpulan: 'Kenal' },
  { key: 'i05', label: 'Gerak Pawn (termasuk double move)', kumpulan: 'Gerak' },
  { key: 'i06', label: 'Gerak Rook dan Bishop', kumpulan: 'Gerak' },
  { key: 'i07', label: 'Gerak Knight (bentuk L)', kumpulan: 'Gerak' },
  { key: 'i08', label: 'Gerak Queen dan King', kumpulan: 'Gerak' },
  { key: 'i09', label: 'Faham cara makan piece', kumpulan: 'Gerak' },
  { key: 'i10', label: 'Kenal check dan cara escape', kumpulan: 'Main' },
  { key: 'i11', label: 'Habis satu game penuh', kumpulan: 'Main' },
  { key: 'i12', label: 'Salam lawan, terima kalah', kumpulan: 'Main' },
]

export const KUNCI_ITEM = ITEM_CHECKLIST.map((i) => i.key) // ['i01'..'i12']

// ---- Skor (dalaman) ----
export function skorChecklist(nilai: number[]): number {
  const jumlah = nilai.reduce((a, b) => a + (b || 0), 0)
  return (jumlah / 24) * 50
}
export function skorKehadiranLP(hadir: number, jumlah: number): number {
  if (!jumlah || jumlah <= 0) return 0
  return (hadir / jumlah) * 20
}
export function skorSikapLP(behaviour1to5: number): number {
  return ((behaviour1to5 || 0) / 5) * 20
}
export function skorMinigame(selesai: boolean): number {
  return selesai ? 10 : 0
}

export type PeringkatLP = 1 | 2 | 3 | 'graduated'

// Peringkat: semua 12 = graduated; i01-i09 semua 2 = stage 3;
// i01-i04 semua 2 = stage 2; selain = stage 1. (Nilai ikut urutan KUNCI_ITEM.)
export function peringkatDariItems(nilai: number[]): PeringkatLP {
  const semua = (start: number, end: number) => nilai.slice(start, end).every((v) => v === 2)
  if (semua(0, 12)) return 'graduated'
  if (semua(0, 9)) return 3
  if (semua(0, 4)) return 2
  return 1
}

export type HasilLittlePawn = {
  skorChecklist: number
  skorKehadiran: number
  skorSikap: number
  skorMinigame: number
  skorAkhir: number
  peringkat: PeringkatLP
  graduasi: boolean
}

function bulat1(n: number): number {
  return Math.round(n * 10) / 10
}

export type InputLittlePawn = {
  items: number[] // 12 nilai
  sesiHadir: number
  sesiJumlah: number
  skorSikapMentah: number // behaviour 1-5
  minigameSelesai: boolean
}

export function kiraLittlePawn(input: InputLittlePawn): HasilLittlePawn {
  const sChecklist = skorChecklist(input.items)
  const sKehadiran = skorKehadiranLP(input.sesiHadir, input.sesiJumlah)
  const sSikap = skorSikapLP(input.skorSikapMentah)
  const sMinigame = skorMinigame(input.minigameSelesai)
  const peringkat = peringkatDariItems(input.items)
  return {
    skorChecklist: bulat1(sChecklist),
    skorKehadiran: bulat1(sKehadiran),
    skorSikap: bulat1(sSikap),
    skorMinigame: sMinigame,
    skorAkhir: bulat1(sChecklist + sKehadiran + sSikap + sMinigame),
    peringkat,
    graduasi: peringkat === 'graduated',
  }
}

// Bilangan item 'Dah Boleh' (untuk progress bar S6 "8/12 Dah Boleh").
export function bilDahBoleh(nilai: number[]): number {
  return nilai.filter((v) => v === 2).length
}

// ---- Aktiviti (seed §5) — const, satu sumber ----
export type Aktiviti = {
  id: string
  nama: string
  durasiMin: number
  itemDicover: string[]
  bahan: string
  langkah: string[]
  coachTip: string
}

export const AKTIVITI_LITTLE_PAWN: Aktiviti[] = [
  {
    id: 'A1', nama: 'Parade Piece', durasiMin: 15, itemDicover: ['i01'],
    bahan: 'Satu set chess pieces',
    langkah: [
      'Susun enam jenis piece atas meja',
      'Coach angkat satu piece, semua budak sebut namanya',
      'Terbalik: coach sebut nama, budak lari ambil piece',
      'Pusingan akhir: budak tutup mata, teka piece ikut bentuk',
    ],
    coachTip: 'Tandakan i01 bila budak betul 6/6 tanpa bantuan',
  },
  {
    id: 'A2', nama: 'Petak Gelap Petak Cerah', durasiMin: 15, itemDicover: ['i02'],
    bahan: 'Board, 8 Pawn setiap budak',
    langkah: [
      'Setiap budak pegang 8 Pawn',
      'Coach jerit gelap atau cerah',
      'Budak letak satu Pawn atas petak warna tu',
      'Salah letak buang satu Pawn, main sampai tinggal seorang',
    ],
    coachTip: 'Budak selalu keliru petak corner, ulang bahagian tu',
  },
  {
    id: 'A3', nama: 'Lumba Susun', durasiMin: 20, itemDicover: ['i03', 'i04'],
    bahan: 'Board kosong, timer',
    langkah: [
      'Dua budak lawan susun board dari kosong',
      'Coach kira masa',
      'Rekod masa terpantas atas whiteboard',
      'Guna timer 10 minit penuh untuk latih fokus',
    ],
    coachTip: 'Ni aktiviti utama untuk assess i04, perhati siapa bangun dari kerusi sebelum 10 minit',
  },
  {
    id: 'A4', nama: 'Pawn Race', durasiMin: 20, itemDicover: ['i05', 'i09'],
    bahan: 'Board, Pawn sahaja',
    langkah: [
      'Letak dua barisan Pawn, tiada piece lain',
      'Round 1: gerak sampai hujung, tak boleh makan',
      'Round 2: benarkan capture serong',
      'Siapa sampai hujung dulu menang',
    ],
    coachTip: 'Double move first turn keluar sendiri masa main, tak perlu terang awal',
  },
  {
    id: 'A5', nama: 'Lebuhraya Rook dan Bishop', durasiMin: 20, itemDicover: ['i06'],
    bahan: 'Board, 1 Rook, 1 Bishop, beberapa Pawn',
    langkah: [
      'Letak Rook dan beberapa Pawn lawan',
      'Budak makan semua Pawn, satu gerakan satu Pawn',
      'Ulang guna Bishop',
      'Kalau tersilap, mula semula',
    ],
    coachTip: 'Budak yang cuba gerak Rook serong akan nampak sendiri jalan tersekat, biar dia jumpa jawapan',
  },
  {
    id: 'A6', nama: 'Lompat Kuda', durasiMin: 20, itemDicover: ['i07'],
    bahan: 'Board, 1 Knight, 5-8 coin atau gula-gula',
    langkah: [
      'Letak coin atas 5 petak',
      'Budak guna Knight kutip semua ikut turutan',
      'Sebut kuat dua lurus satu belok setiap lompat',
      'Naik ke 8 petak bila dah lancar',
    ],
    coachTip: 'Aktiviti paling susah untuk umur ni, jangan expect lulus sebelum minggu ke-10',
  },
  {
    id: 'A7', nama: 'Rondaan Queen dan King', durasiMin: 20, itemDicover: ['i08', 'i10'],
    bahan: 'Board, Queen, King, Rook, beberapa Pawn',
    langkah: [
      'Queen lawan sekumpulan Pawn, budak makan semua',
      'Tukar: letak King budak, coach bagi check guna Rook',
      'Budak cari jalan escape',
      'Ulang 5 posisi berbeza, jerit check setiap kali',
    ],
    coachTip: 'Sebut check kuat-kuat supaya budak kaitkan bunyi dengan bahaya',
  },
  {
    id: 'A8', nama: 'Hari Mini Game', durasiMin: 20, itemDicover: ['i04', 'i11', 'i12'],
    bahan: 'Board penuh atau separuh set',
    langkah: [
      'Game penuh lawan kawan',
      'Kalau belum sedia, guna Pawn dan Rook sahaja',
      'Wajib salam sebelum dan selepas game',
      'Coach beri Bintang Sportsmanship pada yang kalah tapi tetap salam dan senyum',
    ],
    coachTip: 'Assess i12 pada budak yang KALAH, bukan yang menang',
  },
]

export function aktivitiById(id: string): Aktiviti | undefined {
  return AKTIVITI_LITTLE_PAWN.find((a) => a.id === id)
}

// Aktiviti yang melatih satu item (untuk popup "?" S6 & cadangan fokus S7).
export function aktivitiUntukItem(itemKey: string): Aktiviti[] {
  return AKTIVITI_LITTLE_PAWN.filter((a) => a.itemDicover.includes(itemKey))
}

// ---- Sesi 90 minit (7 slot) — const ----
export type JenisSlot = 'ritual' | 'activity' | 'break' | 'assess'
export type SlotSesi = {
  slotNo: number
  mulaMin: number
  tamatMin: number
  nama: string
  jenis: JenisSlot
  deskripsi: string
}

export const WARNA_SLOT: Record<JenisSlot, string> = {
  ritual: '#94A3B8',   // kelabu
  activity: '#1E63D5', // biru
  break: '#F5C400',    // kuning
  assess: '#8CC63E',   // hijau
}

export const SESI_LITTLE_PAWN: SlotSesi[] = [
  { slotNo: 1, mulaMin: 0, tamatMin: 10, nama: 'Buka', jenis: 'ritual', deskripsi: 'Salam sorang-sorang, free play piece atas board' },
  { slotNo: 2, mulaMin: 10, tamatMin: 25, nama: 'Aktiviti A', jenis: 'activity', deskripsi: 'Aktiviti pertama ikut jadual minggu' },
  { slotNo: 3, mulaMin: 25, tamatMin: 35, nama: 'Gerak Badan', jenis: 'break', deskripsi: 'Piece hidup: budak berdiri jadi piece, grid tape atas lantai' },
  { slotNo: 4, mulaMin: 35, tamatMin: 55, nama: 'Aktiviti B', jenis: 'activity', deskripsi: 'Aktiviti kedua, lebih mencabar' },
  { slotNo: 5, mulaMin: 55, tamatMin: 65, nama: 'Rehat Tenang', jenis: 'break', deskripsi: 'Minum, mewarna gambar piece, cerita pendek' },
  { slotNo: 6, mulaMin: 65, tamatMin: 85, nama: 'Free Play', jenis: 'assess', deskripsi: 'Main bebas lawan kawan, coach tandakan checklist' },
  { slotNo: 7, mulaMin: 85, tamatMin: 90, nama: 'Tutup', jenis: 'ritual', deskripsi: 'Bagi bintang, salam, brief parent' },
]

// ---- Jadual 12 minggu (aktiviti A/B) — const ----
export type MingguJadual = { minggu: number; aktivitiA: string; aktivitiB: string }
export const JADUAL_LITTLE_PAWN: MingguJadual[] = [
  { minggu: 1, aktivitiA: 'A1', aktivitiB: 'A2' },
  { minggu: 2, aktivitiA: 'A1', aktivitiB: 'A2' },
  { minggu: 3, aktivitiA: 'A3', aktivitiB: 'A2' },
  { minggu: 4, aktivitiA: 'A4', aktivitiB: 'A1' },
  { minggu: 5, aktivitiA: 'A4', aktivitiB: 'A3' },
  { minggu: 6, aktivitiA: 'A3', aktivitiB: 'A4' },
  { minggu: 7, aktivitiA: 'A5', aktivitiB: 'A4' },
  { minggu: 8, aktivitiA: 'A6', aktivitiB: 'A5' },
  { minggu: 9, aktivitiA: 'A7', aktivitiB: 'A5' },
  { minggu: 10, aktivitiA: 'A6', aktivitiB: 'A7' },
  { minggu: 11, aktivitiA: 'A8', aktivitiB: 'A6' },
  { minggu: 12, aktivitiA: 'A8', aktivitiB: 'A7' },
]

// Minggu semasa (1-based) dari tarikh mula kitaran; had 1..12.
export function mingguSemasa(tarikhMula: string, hariIni?: Date): number {
  const mula = new Date(tarikhMula)
  if (Number.isNaN(mula.getTime())) return 1
  const kini = hariIni ?? new Date()
  const beza = Math.floor((kini.getTime() - mula.getTime()) / (7 * 24 * 60 * 60 * 1000))
  return Math.min(12, Math.max(1, beza + 1))
}

export function jadualMinggu(minggu: number): MingguJadual | undefined {
  return JADUAL_LITTLE_PAWN.find((j) => j.minggu === minggu)
}
