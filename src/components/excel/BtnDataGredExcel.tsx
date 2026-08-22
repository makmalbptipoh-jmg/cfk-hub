'use client'

import { useState } from 'react'
import { FileSpreadsheet } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/stores/toast-store'
import { kiraPenilaian, tarafGred, namaFail, type InputPenilaian, type Gred } from '@/lib/grading'
import { KUNCI_ITEM, LABEL_NILAI, type NilaiItem } from '@/lib/gradingLittlePawn'

const FILL_HEADER = 'FF1E293B'
const WARNA_GRED_XLSX: Record<Gred, string> = { A: 'FFDCFCE7', B: 'FFDBEAFE', C: 'FFFEF9C3', D: 'FFFFEDD5', E: 'FFFFEDD5' }

type Kitaran = { id: string; nama: string }
type Props = {
  kitaranId: string
  kitaranNama: string
  cawanganId: string // 'semua' atau id
  cawanganNama: string
  senaraiKitaran: Kitaran[]
}

type PenilaianRow = {
  pelajar_id: string; kitaran_id: string; level_mula: number; band_umur: string | null
  theory_raw: number | null; theory_max: number | null; puzzle_raw: number | null; puzzle_max: number | null
  club_points: number; tournament_points: number; sesi_hadir: number; sesi_jumlah: number
  att_hormat: number; att_fokus: number; att_sportsmanship: number; att_usaha: number
  rating_mula: number | null; rating_tamat: number | null; bonus_helper: number
  skor_akhir: number | null; gred: Gred | null; naik_level: boolean; dinilai_pada: string | null
  pelajar: { nama_penuh: string; tarikh_lahir: string | null; cawangan_daftar_id: string } | null
  cawangan: { nama: string } | null
  penilai: { nama: string } | null
}
type LittlePawnRow = {
  pelajar_id: string; kitaran_id: string; sesi_hadir: number; sesi_jumlah: number
  skor_sikap: number; minigame_selesai: boolean; peringkat: number; graduasi: boolean; nota_coach: string | null
  pelajar: { nama_penuh: string; tarikh_lahir: string | null; cawangan_daftar_id: string } | null
  cawangan: { nama: string } | null
  [key: string]: unknown
}

function umurKini(tl: string | null): number | string {
  if (!tl) return '—'
  const d = new Date(tl); if (Number.isNaN(d.getTime())) return '—'
  const k = new Date(); let u = k.getFullYear() - d.getFullYear()
  const m = k.getMonth() - d.getMonth(); if (m < 0 || (m === 0 && k.getDate() < d.getDate())) u--
  return u
}
function inputDari(p: PenilaianRow): InputPenilaian {
  return {
    theoryRaw: p.theory_raw ?? 0, theoryMax: p.theory_max ?? 0, puzzleRaw: p.puzzle_raw ?? 0, puzzleMax: p.puzzle_max ?? 0,
    clubPoints: p.club_points, tournamentPoints: p.tournament_points, sesiHadir: p.sesi_hadir, sesiJumlah: p.sesi_jumlah,
    attHormat: p.att_hormat, attFokus: p.att_fokus, attSportsmanship: p.att_sportsmanship, attUsaha: p.att_usaha,
    ratingMula: p.rating_mula, ratingTamat: p.rating_tamat, bonusHelper: p.bonus_helper,
  }
}

export function BtnDataGredExcel({ kitaranId, kitaranNama, cawanganId, cawanganNama, senaraiKitaran }: Props) {
  const [loading, setLoading] = useState(false)

  const jana = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const [rP, rLP] = await Promise.all([
        supabase.from('gred_penilaian').select('pelajar_id, kitaran_id, level_mula, band_umur, theory_raw, theory_max, puzzle_raw, puzzle_max, club_points, tournament_points, sesi_hadir, sesi_jumlah, att_hormat, att_fokus, att_sportsmanship, att_usaha, rating_mula, rating_tamat, bonus_helper, skor_akhir, gred, naik_level, dinilai_pada, pelajar:pelajar_id(nama_penuh, tarikh_lahir, cawangan_daftar_id), cawangan:cawangan_id(nama), penilai:dinilai_oleh(nama)'),
        supabase.from('gred_little_pawn').select('*, pelajar:pelajar_id(nama_penuh, tarikh_lahir, cawangan_daftar_id), cawangan:cawangan_id(nama)'),
      ])
      const semuaP = (rP.data ?? []) as unknown as PenilaianRow[]
      const semuaLP = (rLP.data ?? []) as unknown as LittlePawnRow[]

      const tapisCaw = <T extends { pelajar: { cawangan_daftar_id: string } | null }>(rows: T[]) =>
        cawanganId === 'semua' ? rows : rows.filter((r) => r.pelajar?.cawangan_daftar_id === cawanganId)

      const pKitaran = tapisCaw(semuaP.filter((p) => p.kitaran_id === kitaranId))
      const lpKitaran = tapisCaw(semuaLP.filter((p) => p.kitaran_id === kitaranId))

      if (pKitaran.length === 0 && lpKitaran.length === 0) {
        toast.warning('Tiada data penilaian untuk penapis ini.')
        return
      }

      const ExcelJS = (await import('exceljs')).default
      const wb = new ExcelJS.Workbook()
      wb.creator = 'CFK HUB'

      const kepala = (ws: import('exceljs').Worksheet, labels: string[]) => {
        const row = ws.getRow(1)
        labels.forEach((l, i) => {
          const c = row.getCell(i + 1)
          c.value = l
          c.font = { bold: true, color: { argb: 'FFFFFFFF' } }
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: FILL_HEADER } }
        })
        ws.views = [{ state: 'frozen', ySplit: 1 }]
      }

      // ---- Sheet 1: Ringkasan ----
      const ws1 = wb.addWorksheet('Ringkasan')
      ws1.columns = [{ width: 5 }, { width: 26 }, { width: 6 }, { width: 16 }, { width: 12 }, { width: 12 }, { width: 9 }, { width: 9 }, { width: 10 }, { width: 10 }, { width: 8 }, { width: 12 }, { width: 8 }, { width: 9 }, { width: 7 }, { width: 11 }, { width: 18 }, { width: 12 }]
      kepala(ws1, ['Bil', 'Nama', 'Umur', 'Cawangan', 'Level Sebelum', 'Level Selepas', 'Theory', 'Puzzle', 'Practical', 'Kehadiran', 'Sikap', 'Improvement', 'Bonus', 'Jumlah', 'Gred', 'Naik Level', 'Dinilai Oleh', 'Tarikh'])
      pKitaran.forEach((p, i) => {
        const h = kiraPenilaian(inputDari(p))
        const levelSelepas = Math.min(6, p.level_mula + (p.naik_level ? 1 : 0))
        const r = ws1.getRow(i + 2)
        r.values = [
          i + 1, p.pelajar?.nama_penuh ?? '—', umurKini(p.pelajar?.tarikh_lahir ?? null), p.cawangan?.nama ?? '—',
          tarafGred(p.level_mula).nama, tarafGred(levelSelepas).nama,
          h.skorTheory, h.skorPuzzle, h.skorPractical, h.skorKehadiran, h.skorSikap, h.skorImprovement, h.bonus,
          p.skor_akhir ?? h.skorAkhir, p.gred ?? h.gred, p.naik_level ? 'Ya' : 'Tidak', p.penilai?.nama ?? '—', p.dinilai_pada ?? '—',
        ]
        const gred = (p.gred ?? h.gred) as Gred
        const cGred = r.getCell(15)
        cGred.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: WARNA_GRED_XLSX[gred] } }
        cGred.font = { bold: true }
      })

      // ---- Sheet 2: Data Mentah (audit) ----
      const ws2 = wb.addWorksheet('Data Mentah')
      const kolMentah = ['Nama', 'Theory Betul', 'Theory Penuh', 'Puzzle Betul', 'Puzzle Penuh', 'Club Pts', 'Tourn Pts', 'Sesi Hadir', 'Sesi Jumlah', 'Hormat', 'Fokus', 'Sportsmanship', 'Usaha', 'Rating Mula', 'Rating Tamat', 'Bonus']
      ws2.columns = kolMentah.map((_, i) => ({ width: i === 0 ? 26 : 12 }))
      kepala(ws2, kolMentah)
      pKitaran.forEach((p, i) => {
        ws2.getRow(i + 2).values = [
          p.pelajar?.nama_penuh ?? '—', p.theory_raw, p.theory_max, p.puzzle_raw, p.puzzle_max, p.club_points, p.tournament_points,
          p.sesi_hadir, p.sesi_jumlah, p.att_hormat, p.att_fokus, p.att_sportsmanship, p.att_usaha, p.rating_mula, p.rating_tamat, p.bonus_helper,
        ]
      })
      if (pKitaran.length > 0) ws2.autoFilter = { from: 'A1', to: { row: 1, column: kolMentah.length } }

      // ---- Sheet 3: Little Pawn ----
      const ws3 = wb.addWorksheet('Little Pawn')
      const kolLP = ['Bil', 'Nama', 'Umur', 'Cawangan', ...KUNCI_ITEM, 'Stage', 'Kehadiran', 'Sikap', 'Mini Game', 'Graduate', 'Nota Coach']
      ws3.columns = kolLP.map((_, i) => ({ width: i === 1 ? 24 : i === kolLP.length - 1 ? 30 : 10 }))
      kepala(ws3, kolLP)
      lpKitaran.forEach((p, i) => {
        const itemTeks = KUNCI_ITEM.map((k) => LABEL_NILAI[((p[k] as number) ?? 0) as NilaiItem])
        ws3.getRow(i + 2).values = [
          i + 1, p.pelajar?.nama_penuh ?? '—', umurKini(p.pelajar?.tarikh_lahir ?? null), p.cawangan?.nama ?? '—',
          ...itemTeks, p.graduasi ? 'Graduated' : `Stage ${p.peringkat}`, `${p.sesi_hadir}/${p.sesi_jumlah}`, p.skor_sikap,
          p.minigame_selesai ? 'Ya' : 'Tidak', p.graduasi ? 'Ya' : 'Tidak', p.nota_coach ?? '',
        ]
      })

      // ---- Sheet 4: Statistik Cawangan ----
      const ws4 = wb.addWorksheet('Statistik Cawangan')
      ws4.columns = [{ width: 20 }, { width: 14 }, { width: 14 }, { width: 6 }, { width: 6 }, { width: 6 }, { width: 6 }, { width: 6 }, { width: 12 }, { width: 16 }, { width: 16 }]
      kepala(ws4, ['Cawangan', 'Jumlah Student', 'Purata Jumlah', 'A', 'B', 'C', 'D', 'E', 'Naik Level', 'Purata Kehadiran %', 'Purata Rating Gain'])
      const perCaw = new Map<string, PenilaianRow[]>()
      for (const p of pKitaran) {
        const key = p.cawangan?.nama ?? 'Tiada Cawangan'
        if (!perCaw.has(key)) perCaw.set(key, [])
        perCaw.get(key)!.push(p)
      }
      const barisStat = (label: string, rows: PenilaianRow[]) => {
        const g: Record<Gred, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 }
        let jumSkor = 0, jumHadir = 0, jumGain = 0, naik = 0
        for (const p of rows) {
          const h = kiraPenilaian(inputDari(p))
          const gr = (p.gred ?? h.gred) as Gred; g[gr]++
          jumSkor += p.skor_akhir ?? h.skorAkhir
          jumHadir += p.sesi_jumlah > 0 ? (p.sesi_hadir / p.sesi_jumlah) * 100 : 0
          jumGain += (p.rating_tamat ?? 0) - (p.rating_mula ?? 0)
          if (p.naik_level) naik++
        }
        const n = rows.length || 1
        return [label, rows.length, Math.round((jumSkor / n) * 10) / 10, g.A, g.B, g.C, g.D, g.E, naik, Math.round(jumHadir / n), Math.round(jumGain / n)]
      }
      let ri = 2
      for (const [nama, rows] of perCaw) { ws4.getRow(ri++).values = barisStat(nama, rows) }
      const rowSemua = ws4.getRow(ri)
      rowSemua.values = barisStat('SEMUA CAWANGAN', pKitaran)
      rowSemua.font = { bold: true }

      // ---- Sheet 5: Sejarah Progress (semua kitaran) ----
      const ws5 = wb.addWorksheet('Sejarah Progress')
      ws5.columns = [{ width: 26 }, { width: 20 }, { width: 12 }, { width: 9 }, { width: 7 }, { width: 9 }, { width: 11 }]
      kepala(ws5, ['Nama', 'Cycle', 'Level', 'Jumlah', 'Gred', 'Rating', 'Naik Level'])
      const namaKitaran = new Map(senaraiKitaran.map((k) => [k.id, k.nama]))
      const sejarah = tapisCaw(semuaP)
        .map((p) => {
          const h = kiraPenilaian(inputDari(p))
          return { nama: p.pelajar?.nama_penuh ?? '—', cycle: namaKitaran.get(p.kitaran_id) ?? p.kitaran_id, level: tarafGred(p.level_mula).nama, jumlah: p.skor_akhir ?? h.skorAkhir, gred: p.gred ?? h.gred, rating: p.rating_tamat ?? '—', naik: p.naik_level ? 'Ya' : 'Tidak' }
        })
        .sort((a, b) => (a.nama === b.nama ? a.cycle.localeCompare(b.cycle) : a.nama.localeCompare(b.nama)))
      sejarah.forEach((s, i) => { ws5.getRow(i + 2).values = [s.nama, s.cycle, s.level, s.jumlah, s.gred, s.rating, s.naik] })

      const buffer = await wb.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${namaFail('CFK_Data', cawanganNama, kitaranNama)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Data Excel dimuat turun — semak folder Downloads.')
    } catch (e) {
      console.error(e)
      toast.error('Gagal jana Excel. Sila cuba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={jana} disabled={loading} style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 14px',
      background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '11px',
      fontSize: '13px', fontWeight: 600, color: 'var(--text)', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.6 : 1,
    }}>
      <FileSpreadsheet size={14} />
      {loading ? 'Menjana…' : 'Excel'}
    </button>
  )
}
