// Utiliti fail Bahan & Buku (bucket bahan-pengajaran). Digunakan oleh /bahan.

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
