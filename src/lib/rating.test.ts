import { describe, it, expect } from 'vitest'
import { kiraRating } from './rating'

describe('kiraRating', () => {
  it('1 bintang = 10 point', () => {
    expect(kiraRating(5).point).toBe(50)
    expect(kiraRating(12).point).toBe(120)
  })

  it('level Bidak pada 0 bintang, seterusnya Kuda', () => {
    const r = kiraRating(0)
    expect(r.level.nama).toBe('Bidak')
    expect(r.levelSeterusnya?.nama).toBe('Kuda')
    expect(r.bakiKeSeterusnya).toBe(10)
  })

  it('naik level ikut ambang bintang', () => {
    expect(kiraRating(10).level.nama).toBe('Kuda')
    expect(kiraRating(24).level.nama).toBe('Kuda')
    expect(kiraRating(25).level.nama).toBe('Gajah')
    expect(kiraRating(50).level.nama).toBe('Benteng')
    expect(kiraRating(100).level.nama).toBe('Menteri')
  })

  it('Raja = tahap tertinggi (tiada seterusnya)', () => {
    const r = kiraRating(250)
    expect(r.level.nama).toBe('Raja')
    expect(r.levelSeterusnya).toBeNull()
    expect(r.peratusKemajuan).toBe(100)
  })

  it('nilai negatif/pecahan dikendalikan selamat', () => {
    expect(kiraRating(-5).bintang).toBe(0)
    expect(kiraRating(7.8).bintang).toBe(7)
  })
})
