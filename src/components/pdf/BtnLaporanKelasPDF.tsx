'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/stores/toast-store'
import { kiraPenilaian, tarafGred, namaFail, type InputPenilaian, type Gred } from '@/lib/grading'
import type { PelajarKelas } from './LaporanKelasGredPDF'

type Props = { kitaranId: string; kitaranNama: string; cawanganId: string; cawanganNama: string }

type Row = {
  pelajar_id: string; level_mula: number; naik_level: boolean; skor_akhir: number | null; gred: Gred | null; nota_coach: string | null
  theory_raw: number | null; theory_max: number | null; puzzle_raw: number | null; puzzle_max: number | null
  club_points: number; tournament_points: number; sesi_hadir: number; sesi_jumlah: number
  att_hormat: number; att_fokus: number; att_sportsmanship: number; att_usaha: number; rating_mula: number | null; rating_tamat: number | null; bonus_helper: number
  pelajar: { nama_penuh: string; tarikh_lahir: string | null; cawangan_daftar_id: string } | null
}

export function BtnLaporanKelasPDF({ kitaranId, kitaranNama, cawanganId, cawanganNama }: Props) {
  const [loading, setLoading] = useState(false)

  const jana = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('gred_penilaian')
        .select('pelajar_id, level_mula, naik_level, skor_akhir, gred, nota_coach, theory_raw, theory_max, puzzle_raw, puzzle_max, club_points, tournament_points, sesi_hadir, sesi_jumlah, att_hormat, att_fokus, att_sportsmanship, att_usaha, rating_mula, rating_tamat, bonus_helper, pelajar:pelajar_id(nama_penuh, tarikh_lahir, cawangan_daftar_id)')
        .eq('kitaran_id', kitaranId)
        .eq('status', 'Selesai')
      let rows = (data ?? []) as unknown as Row[]
      if (cawanganId !== 'semua') rows = rows.filter((r) => r.pelajar?.cawangan_daftar_id === cawanganId)
      rows.sort((a, b) => (a.pelajar?.nama_penuh ?? '').localeCompare(b.pelajar?.nama_penuh ?? ''))

      if (rows.length === 0) { toast.warning('Tiada penilaian Selesai untuk penapis ini.'); return }

      const pelajar: PelajarKelas[] = rows.map((r) => {
        const input: InputPenilaian = {
          theoryRaw: r.theory_raw ?? 0, theoryMax: r.theory_max ?? 0, puzzleRaw: r.puzzle_raw ?? 0, puzzleMax: r.puzzle_max ?? 0,
          clubPoints: r.club_points, tournamentPoints: r.tournament_points, sesiHadir: r.sesi_hadir, sesiJumlah: r.sesi_jumlah,
          attHormat: r.att_hormat, attFokus: r.att_fokus, attSportsmanship: r.att_sportsmanship, attUsaha: r.att_usaha,
          ratingMula: r.rating_mula, ratingTamat: r.rating_tamat, bonusHelper: r.bonus_helper,
        }
        const h = kiraPenilaian(input)
        const komponen = [
          { label: 'Theory', nilai: h.skorTheory, penuh: 25 }, { label: 'Puzzle', nilai: h.skorPuzzle, penuh: 20 },
          { label: 'Practical', nilai: h.skorPractical, penuh: 25 }, { label: 'Kehadiran', nilai: h.skorKehadiran, penuh: 10 },
          { label: 'Sikap', nilai: h.skorSikap, penuh: 10 }, { label: 'Improvement', nilai: h.skorImprovement, penuh: 10 },
        ]
        const fokus = [...komponen].sort((a, b) => a.nilai / a.penuh - b.nilai / b.penuh)[0]?.label ?? 'Theory'
        const gred = (r.gred ?? h.gred) as Gred
        const umur = r.pelajar?.tarikh_lahir ? umurKira(r.pelajar.tarikh_lahir) : null
        return {
          nama: r.pelajar?.nama_penuh ?? '—', umur, levelNama: `${tarafGred(r.level_mula).ikon} ${tarafGred(r.level_mula).nama}`,
          komponen, bonus: h.bonus, skorAkhir: r.skor_akhir ?? h.skorAkhir, gred,
          naikLevel: r.naik_level, levelBaru: tarafGred(Math.min(6, r.level_mula + 1)).nama,
          komenCoach: r.nota_coach, fokus,
        }
      })

      const { pdf } = await import('@react-pdf/renderer')
      const { LaporanKelasGredPDF } = await import('./LaporanKelasGredPDF')
      const blob = await pdf(<LaporanKelasGredPDF cawanganNama={cawanganNama} kitaranNama={kitaranNama} pelajar={pelajar} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${namaFail('CFK_Laporan', cawanganNama, kitaranNama)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Laporan kelas (${pelajar.length} pelajar) dimuat turun.`)
    } catch (e) {
      console.error(e)
      toast.error('Gagal jana laporan kelas. Cuba lagi.')
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
      <FileText size={14} />
      {loading ? 'Menjana…' : 'Laporan Kelas PDF'}
    </button>
  )
}

function umurKira(tl: string): number | null {
  const d = new Date(tl); if (Number.isNaN(d.getTime())) return null
  const k = new Date(); let u = k.getFullYear() - d.getFullYear()
  const m = k.getMonth() - d.getMonth(); if (m < 0 || (m === 0 && k.getDate() < d.getDate())) u--
  return u
}
