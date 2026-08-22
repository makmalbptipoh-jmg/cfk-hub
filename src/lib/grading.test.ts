import { describe, it, expect } from 'vitest'
import {
  skorTheory, skorPuzzle, skorPractical, skorKehadiran, skorSikap, skorImprovement,
  markahClubDariWinRate, markahTournamentDariKedudukan,
  gredDariSkor, bolehNaikLevel, kiraPenilaian, bandUmurDariTarikhLahir,
  umurDariTarikhLahir, tarafGred, namaFail, levelSemasaPelajar, type InputPenilaian,
} from './grading'

describe('komponen skor', () => {
  it('theory (raw/max)*25, puzzle *20', () => {
    expect(skorTheory(20, 25)).toBe(20)
    expect(skorTheory(25, 25)).toBe(25)
    expect(skorPuzzle(10, 20)).toBe(10)
  })
  it('pembahagi 0 → 0 (tiada NaN)', () => {
    expect(skorTheory(10, 0)).toBe(0)
    expect(skorKehadiran(5, 0)).toBe(0)
  })
  it('practical dicap pada 25', () => {
    expect(skorPractical(15, 10)).toBe(25)
    expect(skorPractical(15, 20)).toBe(25) // 35 → cap 25
    expect(skorPractical(9, 6)).toBe(15)
  })
  it('kehadiran (hadir/jumlah)*10', () => {
    expect(skorKehadiran(8, 10)).toBe(8)
  })
  it('sikap (sum/20)*10', () => {
    expect(skorSikap(5, 5, 5, 5)).toBe(10)
    expect(skorSikap(3, 3, 3, 3)).toBe(6)
  })
})

describe('skorImprovement (band delta)', () => {
  it('sempadan band', () => {
    expect(skorImprovement(1000, 1100)).toBe(10) // +100
    expect(skorImprovement(1000, 1099)).toBe(8)  // +99
    expect(skorImprovement(1000, 1060)).toBe(8)  // +60
    expect(skorImprovement(1000, 1059)).toBe(6)  // +59
    expect(skorImprovement(1000, 1030)).toBe(6)  // +30
    expect(skorImprovement(1000, 1029)).toBe(4)  // +29
    expect(skorImprovement(1000, 1001)).toBe(4)  // +1
    expect(skorImprovement(1000, 1000)).toBe(2)  // 0
    expect(skorImprovement(1000, 999)).toBe(0)   // negatif
  })
  it('null → 2 (anggap delta 0)', () => {
    expect(skorImprovement(null, 1000)).toBe(2)
    expect(skorImprovement(1000, null)).toBe(2)
  })
})

describe('practical dari sumber', () => {
  it('club dari win rate', () => {
    expect(markahClubDariWinRate(70)).toBe(15)
    expect(markahClubDariWinRate(55)).toBe(12)
    expect(markahClubDariWinRate(40)).toBe(9)
    expect(markahClubDariWinRate(25)).toBe(6)
    expect(markahClubDariWinRate(10)).toBe(3)
    expect(markahClubDariWinRate(null)).toBe(0) // tak main
  })
  it('tournament dari kedudukan', () => {
    expect(markahTournamentDariKedudukan('Juara')).toBe(10)
    expect(markahTournamentDariKedudukan('Top3')).toBe(8)
    expect(markahTournamentDariKedudukan('Top10')).toBe(6)
    expect(markahTournamentDariKedudukan('Sertai')).toBe(4)
    expect(markahTournamentDariKedudukan('Tiada')).toBe(0)
  })
})

describe('gredDariSkor', () => {
  it('sempadan gred', () => {
    expect(gredDariSkor(85)).toBe('A')
    expect(gredDariSkor(84.9)).toBe('B')
    expect(gredDariSkor(70)).toBe('B')
    expect(gredDariSkor(69.9)).toBe('C')
    expect(gredDariSkor(55)).toBe('C')
    expect(gredDariSkor(40)).toBe('D')
    expect(gredDariSkor(39.9)).toBe('E')
  })
})

describe('bolehNaikLevel (gate promosi)', () => {
  it('lulus bila ketiga-tiga cukup', () => {
    const r = bolehNaikLevel(75, 20, 25, 20) // skor75, theory 80%, practical 80%
    expect(r.boleh).toBe(true)
    expect(r.sebab).toBeNull()
  })
  it('gagal bila theory bawah 60% walau jumlah cukup', () => {
    const r = bolehNaikLevel(72, 13, 25, 20) // theory 52%
    expect(r.boleh).toBe(false)
    expect(r.sebab).toContain('Theory bawah 60%')
  })
  it('gagal bila practical bawah 60%', () => {
    const r = bolehNaikLevel(72, 20, 25, 14) // practical 56%
    expect(r.boleh).toBe(false)
    expect(r.sebab).toContain('Practical bawah 60%')
  })
})

describe('kiraPenilaian (orkestra)', () => {
  it('jumlah semua komponen + gred + naik level', () => {
    const input: InputPenilaian = {
      theoryRaw: 25, theoryMax: 25,       // 25
      puzzleRaw: 20, puzzleMax: 20,        // 20
      clubPoints: 15, tournamentPoints: 10, // cap 25
      sesiHadir: 10, sesiJumlah: 10,       // 10
      attHormat: 5, attFokus: 5, attSportsmanship: 5, attUsaha: 5, // 10
      ratingMula: 1000, ratingTamat: 1100, // +100 → 10
      bonusHelper: 5,                      // 5
    }
    const r = kiraPenilaian(input)
    expect(r.skorAkhir).toBe(105) // maksimum
    expect(r.gred).toBe('A')
    expect(r.naikLevel).toBe(true)
  })
  it('bonus dicap 0..5', () => {
    const base: InputPenilaian = {
      theoryRaw: 0, theoryMax: 25, puzzleRaw: 0, puzzleMax: 20,
      clubPoints: 0, tournamentPoints: 0, sesiHadir: 0, sesiJumlah: 10,
      attHormat: 0, attFokus: 0, attSportsmanship: 0, attUsaha: 0,
      ratingMula: 1000, ratingTamat: 1000, bonusHelper: 99,
    }
    expect(kiraPenilaian(base).bonus).toBe(5)
  })
})

describe('band umur & taraf', () => {
  it('umur dari tarikh lahir', () => {
    expect(umurDariTarikhLahir('2016-08-22', new Date('2026-08-22'))).toBe(10)
    expect(umurDariTarikhLahir('2016-08-23', new Date('2026-08-22'))).toBe(9) // belum hari lahir
    expect(umurDariTarikhLahir(null)).toBeNull()
  })
  it('band junior/inter/senior', () => {
    expect(bandUmurDariTarikhLahir('2019-01-01', new Date('2026-08-22'))).toBe('junior') // 7
    expect(bandUmurDariTarikhLahir('2015-01-01', new Date('2026-08-22'))).toBe('inter')  // 11
    expect(bandUmurDariTarikhLahir('2010-01-01', new Date('2026-08-22'))).toBe('senior') // 16
  })
  it('taraf gred ikut level', () => {
    expect(tarafGred(1).nama).toBe('Pawn')
    expect(tarafGred(6).nama).toBe('King')
    expect(tarafGred(0).nama).toBe('Little Pawn')
  })
})

describe('levelSemasaPelajar', () => {
  it('rekod penilaian terbaru: level_mula + naik_level', () => {
    expect(levelSemasaPelajar({
      penilaianTerbaruDahulu: [{ level_mula: 3, naik_level: true }, { level_mula: 2, naik_level: true }],
      adaLittlePawnGraduated: false, adaLittlePawnBelumGraduate: false, umur: 12,
    })).toBe(4)
  })
  it('kekal level bila tak naik', () => {
    expect(levelSemasaPelajar({
      penilaianTerbaruDahulu: [{ level_mula: 3, naik_level: false }],
      adaLittlePawnGraduated: false, adaLittlePawnBelumGraduate: false, umur: 12,
    })).toBe(3)
  })
  it('Little Pawn graduated → Level 1', () => {
    expect(levelSemasaPelajar({
      penilaianTerbaruDahulu: [], adaLittlePawnGraduated: true, adaLittlePawnBelumGraduate: false, umur: 6,
    })).toBe(1)
  })
  it('Little Pawn belum graduate → Level 0', () => {
    expect(levelSemasaPelajar({
      penilaianTerbaruDahulu: [], adaLittlePawnGraduated: false, adaLittlePawnBelumGraduate: true, umur: 5,
    })).toBe(0)
  })
  it('tiada rekod → ikut umur', () => {
    expect(levelSemasaPelajar({ penilaianTerbaruDahulu: [], adaLittlePawnGraduated: false, adaLittlePawnBelumGraduate: false, umur: 5 })).toBe(0)
    expect(levelSemasaPelajar({ penilaianTerbaruDahulu: [], adaLittlePawnGraduated: false, adaLittlePawnBelumGraduate: false, umur: 8 })).toBe(1)
    expect(levelSemasaPelajar({ penilaianTerbaruDahulu: [], adaLittlePawnGraduated: false, adaLittlePawnBelumGraduate: false, umur: null })).toBe(1)
  })
})

describe('namaFail', () => {
  it('space → underscore, buang simbol', () => {
    expect(namaFail('Ali Bin Abu', 'Q4 2026 (Okt-Dis)')).toBe('Ali_Bin_Abu_Q4_2026_OktDis')
  })
})
