import { describe, it, expect } from 'vitest'
import {
  skorChecklist, skorKehadiranLP, skorSikapLP, skorMinigame,
  peringkatDariItems, kiraLittlePawn, bilDahBoleh, aktivitiUntukItem,
  aktivitiById, mingguSemasa, jadualMinggu, ITEM_CHECKLIST, KUNCI_ITEM,
  AKTIVITI_LITTLE_PAWN, SESI_LITTLE_PAWN, JADUAL_LITTLE_PAWN,
} from './gradingLittlePawn'

const semua2 = Array(12).fill(2)
const semua0 = Array(12).fill(0)

describe('komponen skor Little Pawn', () => {
  it('checklist (sum/24)*50', () => {
    expect(skorChecklist(semua2)).toBe(50) // 24/24
    expect(skorChecklist(semua0)).toBe(0)
    expect(skorChecklist(Array(12).fill(1))).toBe(25) // 12/24
  })
  it('kehadiran *20, sikap *20, minigame 10|0', () => {
    expect(skorKehadiranLP(10, 10)).toBe(20)
    expect(skorKehadiranLP(5, 0)).toBe(0)
    expect(skorSikapLP(5)).toBe(20)
    expect(skorSikapLP(3)).toBe(12)
    expect(skorMinigame(true)).toBe(10)
    expect(skorMinigame(false)).toBe(0)
  })
})

describe('peringkatDariItems (stage logic)', () => {
  it('semua 2 → graduated', () => {
    expect(peringkatDariItems(semua2)).toBe('graduated')
  })
  it('i01-i09 = 2 (tapi tak semua) → stage 3', () => {
    const v = [2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0]
    expect(peringkatDariItems(v)).toBe(3)
  })
  it('i01-i04 = 2 (tapi i05+ tak) → stage 2', () => {
    const v = [2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0]
    expect(peringkatDariItems(v)).toBe(2)
  })
  it('kurang dari i01-i04 → stage 1', () => {
    const v = [2, 2, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0]
    expect(peringkatDariItems(v)).toBe(1)
    expect(peringkatDariItems(semua0)).toBe(1)
  })
})

describe('kiraLittlePawn', () => {
  it('skor penuh + graduasi', () => {
    const r = kiraLittlePawn({
      items: semua2, sesiHadir: 10, sesiJumlah: 10, skorSikapMentah: 5, minigameSelesai: true,
    })
    expect(r.skorAkhir).toBe(100) // 50+20+20+10
    expect(r.graduasi).toBe(true)
    expect(r.peringkat).toBe('graduated')
  })
  it('separa siap tidak graduasi', () => {
    const r = kiraLittlePawn({
      items: [2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0], sesiHadir: 5, sesiJumlah: 10,
      skorSikapMentah: 3, minigameSelesai: false,
    })
    expect(r.graduasi).toBe(false)
    expect(r.peringkat).toBe(2)
    // checklist 8/24*50=16.7, kehadiran 10, sikap 12, minigame 0
    expect(r.skorAkhir).toBeCloseTo(38.7, 1)
  })
})

describe('bilDahBoleh', () => {
  it('kira item = 2', () => {
    expect(bilDahBoleh([2, 2, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0])).toBe(3)
    expect(bilDahBoleh(semua2)).toBe(12)
  })
})

describe('data rujukan', () => {
  it('12 item, 8 aktiviti, 7 slot, 12 minggu', () => {
    expect(ITEM_CHECKLIST).toHaveLength(12)
    expect(KUNCI_ITEM).toEqual(['i01','i02','i03','i04','i05','i06','i07','i08','i09','i10','i11','i12'])
    expect(AKTIVITI_LITTLE_PAWN).toHaveLength(8)
    expect(SESI_LITTLE_PAWN).toHaveLength(7)
    expect(JADUAL_LITTLE_PAWN).toHaveLength(12)
  })
  it('setiap aktiviti cover item sah', () => {
    for (const a of AKTIVITI_LITTLE_PAWN) {
      expect(a.itemDicover.length).toBeGreaterThan(0)
      for (const it of a.itemDicover) expect(KUNCI_ITEM).toContain(it)
    }
  })
  it('maksimum 2 slot activity satu sesi', () => {
    expect(SESI_LITTLE_PAWN.filter((s) => s.jenis === 'activity')).toHaveLength(2)
  })
  it('jadual rujuk aktiviti wujud', () => {
    for (const j of JADUAL_LITTLE_PAWN) {
      expect(aktivitiById(j.aktivitiA)).toBeDefined()
      expect(aktivitiById(j.aktivitiB)).toBeDefined()
    }
  })
})

describe('aktivitiUntukItem', () => {
  it('i07 dilatih oleh A6 (Lompat Kuda)', () => {
    const a = aktivitiUntukItem('i07')
    expect(a.map((x) => x.id)).toContain('A6')
  })
  it('i01 dilatih oleh A1 (Parade Piece)', () => {
    expect(aktivitiUntukItem('i01').map((x) => x.id)).toContain('A1')
  })
})

describe('mingguSemasa & jadualMinggu', () => {
  it('kira minggu dari tarikh mula (had 1..12)', () => {
    const mula = '2026-10-01'
    expect(mingguSemasa(mula, new Date('2026-10-01'))).toBe(1)
    expect(mingguSemasa(mula, new Date('2026-10-08'))).toBe(2)
    expect(mingguSemasa(mula, new Date('2026-09-01'))).toBe(1) // sebelum → clamp 1
    expect(mingguSemasa(mula, new Date('2027-06-01'))).toBe(12) // jauh → clamp 12
  })
  it('minggu 7 = A5 + A4', () => {
    const j = jadualMinggu(7)
    expect(j?.aktivitiA).toBe('A5')
    expect(j?.aktivitiB).toBe('A4')
  })
})
