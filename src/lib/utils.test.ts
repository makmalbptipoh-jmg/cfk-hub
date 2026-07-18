import { describe, it, expect } from 'vitest'
import { akhirBulan, tarikhTempatan, bulanTempatan, formatRinggit, kirYuranBulanan, hariMinggu, formatMasa, HARI } from './utils'

describe('akhirBulan', () => {
  it('memulangkan hari akhir bulan yang betul', () => {
    expect(akhirBulan(2026, 2)).toBe('2026-02-28')
    expect(akhirBulan(2024, 2)).toBe('2024-02-29') // tahun lompat
    expect(akhirBulan(2026, 1)).toBe('2026-01-31')
    expect(akhirBulan(2026, 4)).toBe('2026-04-30')
    expect(akhirBulan(2026, 12)).toBe('2026-12-31')
  })
})

describe('tarikhTempatan (waktu Malaysia UTC+8)', () => {
  it('kekal hari sama pada waktu siang MYT', () => {
    // 2026-01-15 10:00 UTC = 18:00 MYT (hari sama)
    expect(tarikhTempatan(new Date('2026-01-15T10:00:00Z'))).toBe('2026-01-15')
  })
  it('BUKAN semalam antara tengah malam–8 pagi MYT (regresi bug zon masa)', () => {
    // 2026-07-06 20:00 UTC = 2026-07-07 04:00 MYT → mesti 7 Julai
    expect(tarikhTempatan(new Date('2026-07-06T20:00:00Z'))).toBe('2026-07-07')
  })
  it('melintasi sempadan bulan dengan betul', () => {
    // 2026-01-31 18:00 UTC = 2026-02-01 02:00 MYT
    expect(tarikhTempatan(new Date('2026-01-31T18:00:00Z'))).toBe('2026-02-01')
  })
})

describe('bulanTempatan', () => {
  it('memulangkan YYYY-MM waktu Malaysia', () => {
    expect(bulanTempatan(new Date('2026-07-06T20:00:00Z'))).toBe('2026-07')
    expect(bulanTempatan(new Date('2026-01-31T18:00:00Z'))).toBe('2026-02')
  })
})

describe('formatRinggit', () => {
  it('format mata wang RM dengan 2 titik perpuluhan', () => {
    const s = formatRinggit(70)
    expect(s).toContain('RM')
    expect(s).toContain('70.00')
  })
})

describe('hariMinggu', () => {
  it('memulangkan hari minggu yang betul, bebas zon masa', () => {
    expect(hariMinggu('2026-07-05')).toBe(0) // Ahad
    expect(hariMinggu('2026-07-18')).toBe(6) // Sabtu
    expect(hariMinggu('2026-07-13')).toBe(1) // Isnin
    expect(HARI[hariMinggu('2026-07-05')]).toBe('Ahad')
  })
  it('betul pada hari pertama & akhir bulan', () => {
    expect(hariMinggu('2026-07-01')).toBe(3) // Rabu
    expect(hariMinggu('2026-07-31')).toBe(5) // Jumaat
  })
})

describe('formatMasa', () => {
  it('menerima HH:MM:SS dari Postgres TIME', () => {
    expect(formatMasa('15:30:00')).toBe('3:30 PTG')
    expect(formatMasa('09:00:00')).toBe('9:00 PG')
  })
  it('menerima HH:MM dari input type=time', () => {
    expect(formatMasa('20:15')).toBe('8:15 MLM')
    expect(formatMasa('12:00')).toBe('12:00 TGH')
  })
  it('sempadan tengah malam dan tengah hari', () => {
    expect(formatMasa('00:00:00')).toBe('12:00 PG')
    expect(formatMasa('14:59')).toBe('2:59 TGH')
    expect(formatMasa('19:00')).toBe('7:00 MLM')
  })
})

describe('kirYuranBulanan', () => {
  it('memetakan jenis kelas ke yuran', () => {
    expect(kirYuranBulanan('Kumpulan')).toBe(70)
    expect(kirYuranBulanan('Personal')).toBe(150)
    expect(kirYuranBulanan('Kumpulan+Personal')).toBe(220)
    expect(kirYuranBulanan('tak diketahui')).toBe(70)
  })
})
