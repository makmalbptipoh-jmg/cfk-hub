import { describe, it, expect } from 'vitest'
import { kiraRating } from './rating'

describe('kiraRating', () => {
  it('1 bintang = 10 point', () => {
    expect(kiraRating(5).point).toBe(50)
    expect(kiraRating(12).point).toBe(120)
  })

  it('level Pawn pada 0 bintang, seterusnya Knight', () => {
    const r = kiraRating(0)
    expect(r.level.nama).toBe('Pawn')
    expect(r.levelSeterusnya?.nama).toBe('Knight')
    expect(r.bakiKeSeterusnya).toBe(10)
  })

  it('naik level ikut ambang bintang', () => {
    expect(kiraRating(10).level.nama).toBe('Knight')
    expect(kiraRating(24).level.nama).toBe('Knight')
    expect(kiraRating(25).level.nama).toBe('Bishop')
    expect(kiraRating(50).level.nama).toBe('Rook')
    expect(kiraRating(100).level.nama).toBe('Queen')
  })

  it('King = tahap tertinggi (tiada seterusnya)', () => {
    const r = kiraRating(250)
    expect(r.level.nama).toBe('King')
    expect(r.levelSeterusnya).toBeNull()
    expect(r.peratusKemajuan).toBe(100)
  })

  it('nilai negatif/pecahan dikendalikan selamat', () => {
    expect(kiraRating(-5).bintang).toBe(0)
    expect(kiraRating(7.8).bintang).toBe(7)
  })
})
