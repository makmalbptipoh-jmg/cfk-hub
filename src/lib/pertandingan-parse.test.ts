import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { parseMata, parseRowsRanking, parseRankingBuffer } from './pertandingan-parse'

const here = dirname(fileURLToPath(import.meta.url))

describe('parseMata', () => {
  it('tukar simbol pecahan catur', () => {
    expect(parseMata('7½')).toBe(7.5)
    expect(parseMata('½')).toBe(0.5)
    expect(parseMata('5')).toBe(5)
    expect(parseMata('3¼')).toBe(3.25)
    expect(parseMata('3¾')).toBe(3.75)
    expect(parseMata(6)).toBe(6)
    expect(parseMata('')).toBe(0)
    expect(parseMata(null)).toBe(0)
  })
})

describe('parseRowsRanking', () => {
  it('kesan header di tengah & langkau footer', () => {
    const rows: unknown[][] = [
      ['PERTANDINGAN MINGGUAN CFK 141225'],
      ['Final ranking'],
      ['Rank', 'SNo.', 'Name', 'FED', 'Pts', 'BH:GP', 'SB/C1', 'PS'],
      [1, 8, 'AZIM', 'MAS', '7½', '40.5', '32.75', '33.5'],
      [2, 9, 'AZKA', 'MAS', '7½', '38', '32.25', '33.5'],
      ['Program Swiss-Manager developed and copyright'],
    ]
    const { tajuk, baris } = parseRowsRanking(rows)
    expect(tajuk).toBe('PERTANDINGAN MINGGUAN CFK 141225')
    expect(baris).toHaveLength(2)
    expect(baris[0]).toMatchObject({ kedudukan: 1, sno: 8, nama: 'AZIM', fed: 'MAS', mata: 7.5, buchholz: 40.5, sonneborn: 32.75 })
    expect(baris[1].nama).toBe('AZKA')
  })

  it('lempar ralat jika tiada header dikenali', () => {
    expect(() => parseRowsRanking([['a', 'b'], [1, 2]])).toThrow()
  })
})

describe('parseRankingBuffer — fail sebenar Swiss-Manager', () => {
  it('parse ranking-141225.xls (27 pemain)', () => {
    const buf = readFileSync(join(here, '__fixtures__', 'ranking-141225.xls'))
    const { tajuk, baris } = parseRankingBuffer(buf)
    expect(tajuk).toBe('PERTANDINGAN MINGGUAN CFK 141225')
    expect(baris).toHaveLength(27)
    // Juara
    expect(baris[0]).toMatchObject({ kedudukan: 1, nama: 'AZIM', mata: 7.5 })
    // Tempat akhir
    expect(baris[26]).toMatchObject({ kedudukan: 27, nama: 'HANA', mata: 0 })
    // Semua kedudukan unik & berturut 1..27
    expect(baris.map((b) => b.kedudukan)).toEqual(Array.from({ length: 27 }, (_, i) => i + 1))
    // Semua ada nama
    expect(baris.every((b) => b.nama.length > 0)).toBe(true)
  })
})
