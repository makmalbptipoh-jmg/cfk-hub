import { NAMA_BULAN } from './utils'

// ============================================================
// Logik tunggakan yuran pelajar — SATU sumber rule untuk semua:
// dashboard, senarai pelajar, laporan tunggakan, notifikasi & makluman.
//
// RULE: pelajar dikira tertunggak untuk sesuatu bulan jika dia
// hadir >= MIN_HADIR_TUNGGAKAN sesi bulan itu TETAPI tiada resit
// Aktif untuk bulan itu.
// ============================================================

export const MIN_HADIR_TUNGGAKAN = 4

export type RekodKehadiran = { pelajar_id: string; tarikh: string }
export type RekodResit = { pelajar_id: string; bulan_bayaran: string }

// Rule asas untuk SATU bulan — guna bila data sudah ditapis ke bulan itu.
export function perluBayarBulan(bilHadir: number, adaResitAktif: boolean): boolean {
  return bilHadir >= MIN_HADIR_TUNGGAKAN && !adaResitAktif
}

// Indeks kehadiran Hadir → hadir[pelajar_id][bulan 1-12] = bilangan sesi.
export function kiraHadirPerBulan(kehadiran: RekodKehadiran[]): Record<string, Record<number, number>> {
  const hadir: Record<string, Record<number, number>> = {}
  for (const k of kehadiran) {
    const m = +k.tarikh.slice(5, 7)
    ;(hadir[k.pelajar_id] ??= {})[m] = (hadir[k.pelajar_id][m] ?? 0) + 1
  }
  return hadir
}

// Set kunci `${pelajar_id}|${bulan_bayaran}` daripada resit Aktif.
export function setResitDibayar(resit: RekodResit[]): Set<string> {
  return new Set(resit.map((r) => `${r.pelajar_id}|${r.bulan_bayaran}`))
}

// Senarai nombor bulan (1-12) yang tertunggak untuk seorang pelajar,
// dari Januari hingga `bulanHingga` (biasanya bulan semasa).
export function bulanTertunggak(
  pelajarId: string,
  hadirPerBulan: Record<string, Record<number, number>>,
  dibayar: Set<string>,
  bulanHingga: number
): number[] {
  const senarai: number[] = []
  for (let m = 1; m <= bulanHingga; m++) {
    const bilHadir = hadirPerBulan[pelajarId]?.[m] ?? 0
    if (perluBayarBulan(bilHadir, dibayar.has(`${pelajarId}|${NAMA_BULAN[m - 1]}`))) senarai.push(m)
  }
  return senarai
}
