// ============================================================
// Pakej kelas personal (prabayar, default 4 kelas) — satu sumber rule.
//
// Kredit  = jumlah `resit.bil_kelas` (resit Personal Aktif berpakej).
// Digunakan = bilangan kehadiran Hadir sesi personal SEJAK tarikh
//             resit berpakej PERTAMA pelajar itu (anchor) — sejarah
//             lama sebelum pakej pertama tidak dikira.
// Baki    = kredit − digunakan. Baki <= 0 → masa kutip bayaran baru.
//
// Sesi personal:
// - pelajar jenis 'Personal': SEMUA kehadiran Hadir dikira.
// - pelajar 'Kumpulan+Personal': hanya kehadiran bernota
//   "Kelas Personal..." (dari borang Sesi Kelas Personal) dikira —
//   kehadiran kelas kumpulan tidak menyentuh baki pakej.
// ============================================================

export type PelajarPersonal = { id: string; jenis_kelas: string | null }
export type ResitPakej = { pelajar_id: string; bil_kelas: number | null; tarikh_bayar: string }
export type KehadiranPelajar = { pelajar_id: string; tarikh: string; nota: string | null }

export type StatusPakej = {
  kredit: number // jumlah kelas dibeli
  digunakan: number // sesi personal hadir sejak pakej pertama
  baki: number // kredit − digunakan (boleh negatif jika terlebih guna)
  tarikhPakejPertama: string | null // null = belum ada resit berpakej
  tarikhSesiTerakhir: string | null
}

export function sesiPersonalPelajar(
  jenisKelas: string | null,
  kehadiran: KehadiranPelajar[]
): KehadiranPelajar[] {
  if (jenisKelas === 'Personal') return kehadiran
  return kehadiran.filter((k) => (k.nota ?? '').startsWith('Kelas Personal'))
}

// Kira status pakej untuk setiap pelajar personal.
// `kehadiranHadir` mesti rekod status 'Hadir' sahaja.
export function kiraPakejPersonal(
  pelajar: PelajarPersonal[],
  resitPakej: ResitPakej[],
  kehadiranHadir: KehadiranPelajar[]
): Map<string, StatusPakej> {
  const kehadiranPerPelajar = new Map<string, KehadiranPelajar[]>()
  for (const k of kehadiranHadir) {
    const senarai = kehadiranPerPelajar.get(k.pelajar_id) ?? []
    senarai.push(k)
    kehadiranPerPelajar.set(k.pelajar_id, senarai)
  }

  const hasil = new Map<string, StatusPakej>()
  for (const p of pelajar) {
    const resitP = resitPakej.filter((r) => r.pelajar_id === p.id && (r.bil_kelas ?? 0) > 0)
    const kredit = resitP.reduce((s, r) => s + (r.bil_kelas ?? 0), 0)
    const anchor = resitP.length > 0 ? resitP.map((r) => r.tarikh_bayar).sort()[0] : null

    const sesiPersonal = sesiPersonalPelajar(p.jenis_kelas, kehadiranPerPelajar.get(p.id) ?? [])
    const sesiDikira = anchor ? sesiPersonal.filter((k) => k.tarikh >= anchor) : []
    const tarikhSesiTerakhir =
      sesiPersonal.length > 0 ? sesiPersonal.map((k) => k.tarikh).sort().at(-1)! : null

    hasil.set(p.id, {
      kredit,
      digunakan: sesiDikira.length,
      baki: kredit - sesiDikira.length,
      tarikhPakejPertama: anchor,
      tarikhSesiTerakhir,
    })
  }
  return hasil
}
