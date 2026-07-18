import { hariMinggu } from './utils'

// ============================================================
// Tapisan sesi jurulatih vs kelas DIBATALKAN — satu sumber rule.
//
// Gaji jurulatih dikira dari check-in `kehadiran_jurulatih` (Hadir).
// Jika kelas pada tarikh itu DIBATALKAN (jadual_slot_batal), sesi
// check-in yang sepadan TIDAK dikira dalam gaji.
//
// Padanan: check-in (tarikh + cawangan + jenis kelas) lawan slot
// jadual yang jurulatih itu ditugaskan pada hari minggu tarikh itu.
// Sesi DIBUANG hanya jika ADA slot sepadan dan SEMUA slot sepadan
// dibatalkan pada tarikh itu — jika ada slot lain yang masih aktif
// (atau tiada slot langsung, cth. kelas ad-hoc), sesi dikekalkan.
// ============================================================

export type SesiJurulatih = {
  jurulatih_id: string
  tarikh: string
  cawangan_id: string | null
  jenis_kelas: string | null
}

export type SlotUntukGaji = {
  id: string
  hari_minggu: number
  cawangan_id: string | null
  jenis: string
  jurulatih_ids: string[]
}

export type BatalUntukGaji = { slot_id: string; tarikh: string }

export function tapisSesiDibatalkan<T extends SesiJurulatih>(
  sesi: T[],
  slot: SlotUntukGaji[],
  batal: BatalUntukGaji[]
): { sah: T[]; dibuang: T[] } {
  const setBatal = new Set(batal.map((b) => `${b.slot_id}:${b.tarikh}`))
  const sah: T[] = []
  const dibuang: T[] = []
  for (const s of sesi) {
    const hari = hariMinggu(s.tarikh)
    const slotSepadan = slot.filter(
      (x) =>
        x.hari_minggu === hari &&
        (x.cawangan_id ?? '') === (s.cawangan_id ?? '') &&
        x.jenis === (s.jenis_kelas ?? 'Kumpulan') &&
        x.jurulatih_ids.includes(s.jurulatih_id)
    )
    const semuaDibatal =
      slotSepadan.length > 0 && slotSepadan.every((x) => setBatal.has(`${x.id}:${s.tarikh}`))
    if (semuaDibatal) dibuang.push(s)
    else sah.push(s)
  }
  return { sah, dibuang }
}

// Select string standard untuk query kehadiran_jurulatih yang mahu
// ditapis dengan tapisSesiDibatalkan.
export const SELECT_SESI_GAJI = 'jurulatih_id, tarikh, cawangan_id, jenis_kelas'
export const SELECT_SLOT_GAJI = 'id, hari_minggu, cawangan_id, jenis, jurulatih_ids'
