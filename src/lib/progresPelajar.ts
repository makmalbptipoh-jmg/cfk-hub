// Logik dikongsi untuk Progress Pembelajaran pelajar (kelas Personal).
// Digunakan oleh tab progress dalam profil pelajar, modal topik, dan PDF.

export const TAHAP = ['Baru Diajar', 'Sedang Latih', 'Sudah Kuasai'] as const
export type Tahap = (typeof TAHAP)[number]

// Warna selari dengan token kehadiran sedia ada (biru → kuning → hijau).
export const WARNA_TAHAP: Record<Tahap, { bg: string; text: string; border: string }> = {
  'Baru Diajar': { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE' },
  'Sedang Latih': { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A' },
  'Sudah Kuasai': { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
}

export type TopikPelajar = {
  id: string
  kategori_id: string | null
  tajuk: string
  butiran: string | null
  tahap: Tahap
  tarikh: string
  tarikh_kuasai: string | null
  buku_id: string | null
  muka_surat: string | null
}

export type KategoriTopik = { id: string; nama: string; susunan: number; status: string }
export type BukuRujukan = { id: string; nama: string; pengarang: string | null; fail_path: string | null }

// Tab progress hanya untuk pelajar yang ada kelas personal
// ('Personal' dan 'Kumpulan+Personal').
export const adaKelasPersonal = (jenisKelas: string) => jenisKelas.includes('Personal')

export type RingkasanProgres = {
  jumlah: number
  baruDiajar: number
  sedangLatih: number
  sudahKuasai: number
  peratusKuasai: number
  bilKategori: number
  topikTerakhir: TopikPelajar | null
}

export function kiraRingkasan(topik: TopikPelajar[]): RingkasanProgres {
  const kira = (t: Tahap) => topik.filter((x) => x.tahap === t).length
  const sudahKuasai = kira('Sudah Kuasai')
  // Tarikh paling baharu; seri diputuskan oleh susunan asal (senarai sudah disusun DESC).
  const topikTerakhir = topik.reduce<TopikPelajar | null>(
    (p, t) => (p === null || t.tarikh > p.tarikh ? t : p),
    null
  )
  return {
    jumlah: topik.length,
    baruDiajar: kira('Baru Diajar'),
    sedangLatih: kira('Sedang Latih'),
    sudahKuasai,
    peratusKuasai: topik.length > 0 ? Math.round((sudahKuasai / topik.length) * 100) : 0,
    bilKategori: new Set(topik.map((t) => t.kategori_id ?? '__tiada__')).size,
    topikTerakhir,
  }
}

// Kumpul topik ikut kategori, susun ikut `susunan` kategori.
// Topik tanpa kategori dikumpul di hujung sebagai "Tiada Kategori".
export function kumpulIkutKategori(topik: TopikPelajar[], kategori: KategoriTopik[]) {
  const petaKategori = new Map(kategori.map((k) => [k.id, k]))
  const kumpulan = new Map<string, { nama: string; susunan: number; topik: TopikPelajar[] }>()

  for (const t of topik) {
    const k = t.kategori_id ? petaKategori.get(t.kategori_id) : undefined
    const kunci = k?.id ?? '__tiada__'
    if (!kumpulan.has(kunci)) {
      kumpulan.set(kunci, { nama: k?.nama ?? 'Tiada Kategori', susunan: k?.susunan ?? 9999, topik: [] })
    }
    kumpulan.get(kunci)!.topik.push(t)
  }

  return [...kumpulan.values()].sort((a, b) => a.susunan - b.susunan || a.nama.localeCompare(b.nama))
}

// ---- Fail buku ----
export const BAHAN_BUCKET = 'bahan-pengajaran'
export const BAHAN_ACCEPT = '.pdf,.jpg,.jpeg,.png,.webp'
export const BAHAN_MAX_SAIZ = 25 * 1024 * 1024 // 25MB — buku PDF biasanya besar

export function sahkanFailBahan(file: File): string | null {
  if (file.size > BAHAN_MAX_SAIZ) return 'Fail terlalu besar. Had maksimum 25MB.'
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!['pdf', 'jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
    return 'Hanya fail PDF atau imej (JPG/PNG/WebP) dibenarkan.'
  }
  return null
}

export function pathBahan(bukuId: string, namaFail: string) {
  const ext = namaFail.split('.').pop()?.toLowerCase() ?? 'pdf'
  return `buku/${bukuId}.${ext}`
}

export function saizFail(bait: number | null) {
  if (!bait) return '—'
  if (bait < 1024 * 1024) return `${Math.round(bait / 1024)} KB`
  return `${(bait / (1024 * 1024)).toFixed(1)} MB`
}
