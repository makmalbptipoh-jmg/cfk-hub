import { describe, it, expect } from 'vitest'
import {
  kiraMarkahPrestasi, pingatUntukKedudukan, tarafRating,
  kiraRingkasanPertandingan, formatMata, RATING_ASAS, type BarisKeputusan,
} from './pertandingan'

describe('kiraMarkahPrestasi', () => {
  it('tempat pertama = 100, tempat akhir kecil', () => {
    expect(kiraMarkahPrestasi(1, 27)).toBe(100)
    expect(kiraMarkahPrestasi(27, 27)).toBe(4)
    expect(kiraMarkahPrestasi(14, 27)).toBe(52) // hampir median
  })
  it('kes tepi', () => {
    expect(kiraMarkahPrestasi(1, 1)).toBe(100)
    expect(kiraMarkahPrestasi(0, 10)).toBe(0)
    expect(kiraMarkahPrestasi(5, 0)).toBe(0)
  })
})

describe('pingatUntukKedudukan', () => {
  it('1/2/3 → Emas/Perak/Gangsa, selainnya null', () => {
    expect(pingatUntukKedudukan(1)).toBe('Emas')
    expect(pingatUntukKedudukan(2)).toBe('Perak')
    expect(pingatUntukKedudukan(3)).toBe('Gangsa')
    expect(pingatUntukKedudukan(4)).toBeNull()
  })
})

describe('tarafRating', () => {
  it('petakan rating ke taraf catur', () => {
    expect(tarafRating(1000).nama).toBe('Knight')
    expect(tarafRating(800).nama).toBe('Pawn')
    expect(tarafRating(1600).nama).toBe('King')
  })
})

describe('kiraRingkasanPertandingan', () => {
  it('kosong → rating asas', () => {
    const r = kiraRingkasanPertandingan([])
    expect(r.bilPertandingan).toBe(0)
    expect(r.rating).toBe(RATING_ASAS)
    expect(r.kedudukanTerbaik).toBeNull()
  })

  it('agregat kedudukan, mata, pingat & rating', () => {
    const rows: BarisKeputusan[] = [
      { kedudukan: 1, jumlah_peserta: 10, mata: 7, pingat: 'Emas' },
      { kedudukan: 5, jumlah_peserta: 10, mata: 4.5, pingat: null },
    ]
    const r = kiraRingkasanPertandingan(rows)
    expect(r.bilPertandingan).toBe(2)
    expect(r.kedudukanTerbaik).toBe(1)
    expect(r.purataKedudukan).toBe(3)
    expect(r.jumlahMata).toBe(11.5)
    expect(r.emas).toBe(1)
    // markah: (1,10)=100 → +4*50=+200 ; (5,10)=60 → +4*10=+40 ; jumlah +240
    expect(r.rating).toBe(RATING_ASAS + 240)
  })

  it('rating tidak bergantung susunan (komutatif)', () => {
    const a: BarisKeputusan[] = [
      { kedudukan: 2, jumlah_peserta: 8, mata: 6, pingat: 'Perak' },
      { kedudukan: 7, jumlah_peserta: 8, mata: 2, pingat: null },
    ]
    const b = [...a].reverse()
    expect(kiraRingkasanPertandingan(a).rating).toBe(kiraRingkasanPertandingan(b).rating)
  })

  it('rating tidak jatuh bawah minimum', () => {
    const rows: BarisKeputusan[] = Array.from({ length: 6 }, () => ({
      kedudukan: 30, jumlah_peserta: 30, mata: 0, pingat: null,
    }))
    expect(kiraRingkasanPertandingan(rows).rating).toBeGreaterThanOrEqual(100)
  })
})

describe('formatMata', () => {
  it('papar simbol pecahan', () => {
    expect(formatMata(7.5)).toBe('7½')
    expect(formatMata(0.5)).toBe('½')
    expect(formatMata(5)).toBe('5')
    expect(formatMata(0)).toBe('0')
  })
})
