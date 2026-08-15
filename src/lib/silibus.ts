// Logik dikongsi untuk Silibus Berstruktur (Tajuk Besar → Subtajuk + progress per cawangan).
// Digunakan oleh SilibusIndukKlient, ModalTajuk, ModalSubtajuk.

export const STATUS_PROGRES = ['Belum', 'Sedang', 'Selesai'] as const
export type StatusProgres = (typeof STATUS_PROGRES)[number]

// Warna selari dengan token sedia ada (kelabu → kuning → hijau).
export const WARNA_PROGRES: Record<StatusProgres, { bg: string; text: string; border: string }> = {
  Belum: { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' },
  Sedang: { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A' },
  Selesai: { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
}

export type TajukBesar = {
  id: string
  nama: string
  susunan: number
  nota: string | null
  status: 'Aktif' | 'Tidak Aktif'
}

export type Subtajuk = {
  id: string
  tajuk_id: string
  nama: string
  susunan: number
  fen: string | null
  pgn_teks: string | null
  pgn_path: string | null
  pgn_nama: string | null
  pgn_saiz: number | null
  nota: string | null
  pautan: string | null
}

export type ProgresBaris = {
  id: string
  subtajuk_id: string
  cawangan_id: string
  status: StatusProgres
}

// ---- Fail PGN (guna semula bucket 'bahan-pengajaran') ----
export const PGN_BUCKET = 'bahan-pengajaran'
export const PGN_ACCEPT = '.pgn,.txt'
export const PGN_MAX_SAIZ = 2 * 1024 * 1024 // 2MB — fail PGN sangat kecil

export function sahkanFailPgn(file: File): string | null {
  if (file.size > PGN_MAX_SAIZ) return 'Fail terlalu besar. Had maksimum 2MB.'
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!['pgn', 'txt'].includes(ext)) return 'Hanya fail .pgn (atau .txt) dibenarkan.'
  return null
}

export function pathPgn(subtajukId: string) {
  return `silibus-pgn/${subtajukId}.pgn`
}

export function saizFail(bait: number | null) {
  if (!bait) return '—'
  if (bait < 1024 * 1024) return `${Math.round(bait / 1024)} KB`
  return `${(bait / (1024 * 1024)).toFixed(1)} MB`
}

// Peta: subtajuk_id → (cawangan_id → status). Untuk carian pantas dalam UI.
export function petaProgres(rows: ProgresBaris[]): Map<string, Map<string, StatusProgres>> {
  const peta = new Map<string, Map<string, StatusProgres>>()
  for (const r of rows) {
    if (!peta.has(r.subtajuk_id)) peta.set(r.subtajuk_id, new Map())
    peta.get(r.subtajuk_id)!.set(r.cawangan_id, r.status)
  }
  return peta
}

// Status satu subtajuk untuk satu cawangan (tiada baris = 'Belum').
export function statusSubtajuk(
  peta: Map<string, Map<string, StatusProgres>>,
  subtajukId: string,
  cawanganId: string
): StatusProgres {
  return peta.get(subtajukId)?.get(cawanganId) ?? 'Belum'
}

export type RingkasanProgres = { jumlah: number; selesai: number; sedang: number; belum: number; peratus: number }

// Ringkasan progress satu set subtajuk untuk satu cawangan tertentu.
export function kiraProgresCawangan(
  subtajuks: Subtajuk[],
  peta: Map<string, Map<string, StatusProgres>>,
  cawanganId: string
): RingkasanProgres {
  let selesai = 0, sedang = 0
  for (const s of subtajuks) {
    const st = statusSubtajuk(peta, s.id, cawanganId)
    if (st === 'Selesai') selesai++
    else if (st === 'Sedang') sedang++
  }
  const jumlah = subtajuks.length
  return {
    jumlah,
    selesai,
    sedang,
    belum: jumlah - selesai - sedang,
    peratus: jumlah > 0 ? Math.round((selesai / jumlah) * 100) : 0,
  }
}
