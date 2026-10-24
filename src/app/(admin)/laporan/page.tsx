'use client'

import { useState } from 'react'
import { FileText, Download, CalendarCheck, BookOpen, Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { akhirBulan, HARI } from '@/lib/utils'
import { CariPelajar, type PelajarCarian } from '@/components/pelajar/CariPelajar'
import { LaporanKelasKlient } from './_components/LaporanKelasKlient'
import { toast } from '@/lib/stores/toast-store'
import {
  WARNA_PROGRES, petaProgresPelajar, statusSubtajuk,
  type ProgresPelajarBaris, type StatusProgres,
} from '@/lib/silibus'
import {
  kiraRingkasanPertandingan, kiraSiriRating, WARNA_PINGAT, formatMata,
  type RingkasanPertandingan, type JenisPingat, type TitikGraf,
} from '@/lib/pertandingan'
import { GrafProgres } from '@/components/GrafProgres'

type Rekod = {
  tarikh: string
  status: 'Hadir' | 'Tidak Hadir' | 'Cuti'
  nota: string | null
}

type SilibusSub = { nama: string; status: StatusProgres; nota: string | null }
type SilibusTajuk = { nama: string; selesai: number; jumlah: number; peratus: number; subtajuk: SilibusSub[] }
type SilibusLaporan = {
  jumlah: number
  selesai: number
  sedang: number
  belum: number
  peratus: number
  tajuk: SilibusTajuk[]
}

const warnaBarSilibus = (p: number) => (p < 34 ? '#EF4444' : p < 67 ? '#F59E0B' : '#10B981')

type PertandinganRekod = { nama: string; tarikh: string; kedudukan: number; jumlah_peserta: number; mata: number; pingat: JenisPingat | null }
type PertandinganLaporan = { ringkasan: RingkasanPertandingan; rekod: PertandinganRekod[]; siri: TitikGraf[] }

// Ringkasan kehadiran satu bulan — untuk mod Keseluruhan (semua bulan)
type BulanRingkasan = {
  kunci: string // YYYY-MM
  nama: string
  tahun: number
  hadir: number
  tidakHadir: number
  cuti: number
  peratus: number
  sudahBayar: boolean
  perluBayar: boolean
}

type ModLaporan = 'bulan' | 'keseluruhan'
type TabLaporan = 'kehadiran' | 'silibus' | 'pertandingan'

type DataLaporan = {
  nama_pelajar: string
  cawangan: string
  jenis_kelas: string
  rekod: Rekod[]
  jumlahHadir: number
  jumlahTidakHadir: number
  jumlahCuti: number
  peratus: number
  perluBayar: boolean
  sudahBayar: boolean
  bulan: string
  tahun: number
  silibus: SilibusLaporan | null
  pertandingan: PertandinganLaporan | null
  // null = mod Bulanan; berisi = mod Keseluruhan (susun terbaru dahulu)
  ringkasanBulan: BulanRingkasan[] | null
  tempoh: string
}

const warnaPeratus = (p: number) => (p < 50 ? '#EF4444' : p < 75 ? '#F59E0B' : '#10B981')

function namaBulanPendek(kunci: string) {
  const [yr, mo] = kunci.split('-')
  return new Date(parseInt(yr), parseInt(mo) - 1, 1).toLocaleString('ms-MY', { month: 'short', year: 'numeric' })
}

function bulanMY(input: string) {
  const [yr, mo] = input.split('-')
  const d = new Date(parseInt(yr), parseInt(mo) - 1, 1)
  return {
    nama: d.toLocaleString('ms-MY', { month: 'long' }),
    tahun: parseInt(yr),
    mula: `${yr}-${mo}-01`,
    akhir: akhirBulan(parseInt(yr), parseInt(mo)),
  }
}

function bulanSemasa() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function formatTarikhPanjang(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getDate()} ${d.toLocaleString('ms-MY', { month: 'long' })} ${d.getFullYear()}`
}

export default function LaporanPage() {
  const [pelajar, setPelajar] = useState<PelajarCarian | null>(null)
  const [bulanInput, setBulanInput] = useState(bulanSemasa())
  const [laporan, setLaporan] = useState<DataLaporan | null>(null)
  const [loading, setLoading] = useState(false)
  const [unduhLoading, setUnduhLoading] = useState(false)
  const [mod, setMod] = useState<ModLaporan>('bulan')
  const [tab, setTab] = useState<TabLaporan>('kehadiran')

  const jana = async (modJana: ModLaporan = mod, bulanJana: string = bulanInput) => {
    if (!pelajar) return
    setLoading(true)
    setLaporan(null)

    const supabase = createClient()
    const b = bulanMY(bulanJana)
    const semua = modJana === 'keseluruhan'

    let qKehadiran = supabase.from('kehadiran').select('tarikh, status, nota').eq('pelajar_id', pelajar.id)
    let qResit = supabase.from('resit').select('bulan_bayaran, tahun_bayaran').eq('pelajar_id', pelajar.id).eq('status', 'Aktif')
    if (!semua) {
      qKehadiran = qKehadiran.gte('tarikh', b.mula).lte('tarikh', b.akhir)
      qResit = qResit.eq('bulan_bayaran', b.nama).eq('tahun_bayaran', b.tahun)
    }

    const [
      { data: profil },
      { data: kehadiran },
      { data: resit },
    ] = await Promise.all([
      supabase.from('pelajar').select('nama_penuh, jenis_kelas, cawangan:cawangan_daftar_id(nama)').eq('id', pelajar.id).single(),
      qKehadiran.order('tarikh'),
      qResit,
    ])

    // Relasi `cawangan:cawangan_daftar_id(nama)` tiada jenis dijana Supabase
    type BarisProfil = { nama_penuh: string; jenis_kelas: string; cawangan: { nama: string } | null }
    const profilR = profil as unknown as BarisProfil | null

    const rekod: Rekod[] = (kehadiran ?? []).map((k) => ({
      tarikh: k.tarikh,
      status: k.status as Rekod['status'],
      nota: k.nota,
    }))

    const jumlahHadir = rekod.filter((r) => r.status === 'Hadir').length
    const jumlahTidakHadir = rekod.filter((r) => r.status === 'Tidak Hadir').length
    const jumlahCuti = rekod.filter((r) => r.status === 'Cuti').length
    const jumlahSesi = rekod.length
    const peratus = jumlahSesi > 0 ? Math.round((jumlahHadir / jumlahSesi) * 100) : 0
    const sudahBayar = (resit ?? []).length > 0
    const perluBayar = !semua && jumlahHadir >= 4 && !sudahBayar

    // ---- Mod Keseluruhan: pecahan kehadiran + yuran per bulan ----
    let ringkasanBulan: BulanRingkasan[] | null = null
    if (semua) {
      const resitSet = new Set((resit ?? []).map((r) => `${r.bulan_bayaran} ${r.tahun_bayaran}`))
      const kumpulan = new Map<string, Rekod[]>()
      for (const r of rekod) {
        const kunci = r.tarikh.slice(0, 7)
        const senarai = kumpulan.get(kunci)
        if (senarai) senarai.push(r)
        else kumpulan.set(kunci, [r])
      }
      ringkasanBulan = [...kumpulan.entries()]
        .sort(([a], [b2]) => (a < b2 ? 1 : -1))
        .map(([kunci, senarai]) => {
          const info = bulanMY(kunci)
          const hadir = senarai.filter((r) => r.status === 'Hadir').length
          const bayar = resitSet.has(`${info.nama} ${info.tahun}`)
          return {
            kunci, nama: info.nama, tahun: info.tahun,
            hadir,
            tidakHadir: senarai.filter((r) => r.status === 'Tidak Hadir').length,
            cuti: senarai.filter((r) => r.status === 'Cuti').length,
            peratus: Math.round((hadir / senarai.length) * 100),
            sudahBayar: bayar,
            perluBayar: hadir >= 4 && !bayar,
          }
        })
    }
    const tempoh = !semua
      ? `${b.nama} ${b.tahun}`
      : ringkasanBulan && ringkasanBulan.length > 0
        ? `Keseluruhan (${namaBulanPendek(ringkasanBulan[ringkasanBulan.length - 1].kunci)} – ${namaBulanPendek(ringkasanBulan[0].kunci)})`
        : 'Keseluruhan'

    // ---- Progress Silibus (tajuk wajib: CFK STEP BY STEP dll) untuk pelajar ini ----
    let silibus: SilibusLaporan | null = null
    const { data: tajukRows } = await supabase
      .from('silibus_tajuk')
      .select('id, nama, susunan')
      .eq('wajib', true)
      .eq('status', 'Aktif')
      .order('susunan')
    const tajukIds = (tajukRows ?? []).map((t) => t.id)
    if (tajukIds.length > 0) {
      const [{ data: subtajukRows }, { data: progRows }] = await Promise.all([
        supabase.from('silibus_subtajuk').select('id, tajuk_id, nama, susunan, nota').in('tajuk_id', tajukIds).order('susunan'),
        supabase.from('silibus_progress_pelajar').select('id, subtajuk_id, pelajar_id, status').eq('pelajar_id', pelajar.id),
      ])
      const peta = petaProgresPelajar((progRows ?? []) as ProgresPelajarBaris[])
      const tajuk: SilibusTajuk[] = (tajukRows ?? []).map((t) => {
        const subtajuk: SilibusSub[] = (subtajukRows ?? [])
          .filter((x) => x.tajuk_id === t.id)
          .map((x) => ({ nama: x.nama, status: statusSubtajuk(peta, x.id, pelajar.id), nota: x.nota as string | null }))
        const selesai = subtajuk.filter((x) => x.status === 'Selesai').length
        const jumlah = subtajuk.length
        return { nama: t.nama, selesai, jumlah, peratus: jumlah > 0 ? Math.round((selesai / jumlah) * 100) : 0, subtajuk }
      })
      const jumlah = tajuk.reduce((a, t) => a + t.jumlah, 0)
      const selesai = tajuk.reduce((a, t) => a + t.selesai, 0)
      const sedang = tajuk.reduce((a, t) => a + t.subtajuk.filter((s) => s.status === 'Sedang').length, 0)
      silibus = {
        jumlah, selesai, sedang,
        belum: jumlah - selesai - sedang,
        peratus: jumlah > 0 ? Math.round((selesai / jumlah) * 100) : 0,
        tajuk,
      }
    }

    // ---- Pencapaian Pertandingan (rating terkumpul + pingat) untuk pelajar ini ----
    let pertandingan: PertandinganLaporan | null = null
    const { data: keputusanRows } = await supabase
      .from('pertandingan_keputusan')
      .select('kedudukan, jumlah_peserta, mata, pingat, pertandingan:pertandingan_id(nama, tarikh)')
      .eq('pelajar_id', pelajar.id)
    type KeputusanBaris = {
      kedudukan: number; jumlah_peserta: number; mata: number
      pingat: JenisPingat | null; pertandingan: { nama: string; tarikh: string } | null
    }
    const kRows = (keputusanRows ?? []) as unknown as KeputusanBaris[]
    if (kRows.length > 0) {
      const ringkasan = kiraRingkasanPertandingan(kRows.map((k) => ({
        kedudukan: k.kedudukan, jumlah_peserta: k.jumlah_peserta, mata: k.mata, pingat: k.pingat,
      })))
      const rekod: PertandinganRekod[] = kRows
        .map((k) => ({
          nama: k.pertandingan?.nama ?? 'Pertandingan',
          tarikh: k.pertandingan?.tarikh ?? '',
          kedudukan: k.kedudukan, jumlah_peserta: k.jumlah_peserta, mata: k.mata, pingat: k.pingat,
        }))
        .sort((a, b2) => (a.tarikh < b2.tarikh ? 1 : -1))
      const siri = kiraSiriRating(kRows.map((k) => ({
        kedudukan: k.kedudukan, jumlah_peserta: k.jumlah_peserta, tarikh: k.pertandingan?.tarikh ?? null,
      })))
      pertandingan = { ringkasan, rekod, siri }
    }

    setLaporan({
      nama_pelajar: profilR?.nama_penuh ?? pelajar.nama_penuh,
      cawangan: profilR?.cawangan?.nama ?? pelajar.cawangan_nama ?? '—',
      jenis_kelas: profilR?.jenis_kelas ?? '—',
      rekod,
      jumlahHadir,
      jumlahTidakHadir,
      jumlahCuti,
      peratus,
      perluBayar,
      sudahBayar,
      bulan: b.nama,
      tahun: b.tahun,
      silibus,
      pertandingan,
      ringkasanBulan,
      tempoh,
    })
    setLoading(false)
  }

  const unduhPDF = async () => {
    if (!laporan) return
    setUnduhLoading(true)
    try {
      const { pdf } = await import('@react-pdf/renderer')
      const { LaporanPDF } = await import('@/components/pdf/LaporanPDF')
      const blob = await pdf(
        <LaporanPDF
          nama_pelajar={laporan.nama_pelajar}
          cawangan={laporan.cawangan}
          jenis_kelas={laporan.jenis_kelas}
          bulan={laporan.bulan}
          tahun={laporan.tahun}
          rekod={laporan.rekod}
          jumlahHadir={laporan.jumlahHadir}
          jumlahTidakHadir={laporan.jumlahTidakHadir}
          jumlahCuti={laporan.jumlahCuti}
          peratus={laporan.peratus}
          perluBayar={laporan.perluBayar}
          silibus={laporan.silibus}
          pertandingan={laporan.pertandingan}
          ringkasanBulan={laporan.ringkasanBulan}
          tempoh={laporan.tempoh}
        />
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const akhiran = laporan.ringkasanBulan ? 'Keseluruhan' : `${laporan.bulan}_${laporan.tahun}`
      a.download = `Laporan_${laporan.nama_pelajar.replace(/[\\/:*?"<>|]/g, '-')}_${akhiran}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF laporan kehadiran dimuat turun — semak folder Downloads.')
    } catch (e) {
      console.error(e)
      toast.error('Gagal jana PDF. Sila refresh halaman (Ctrl+Shift+R) dan cuba lagi.')
    } finally {
      setUnduhLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '760px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>
          Laporan Kehadiran
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Jana laporan kehadiran — per kelas (cawangan + hari, harian atau bulanan) atau per pelajar, dalam format PDF/Excel
        </p>
      </div>

      {/* Laporan Per Kelas (PDF + Excel) */}
      <LaporanKelasKlient />

      {/* Borang Jana (Per Pelajar) */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>Pilih Pelajar & Tempoh</h2>
          {/* Togol mod: satu bulan vs keseluruhan bulan */}
          <div style={{ display: 'inline-flex', background: '#F1F5F9', borderRadius: '10px', padding: '3px' }}>
            {([['bulan', 'Bulanan'], ['keseluruhan', 'Keseluruhan']] as const).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setMod(k)}
                style={{
                  padding: '6px 14px', border: 'none', borderRadius: '8px',
                  fontSize: '12.5px', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                  background: mod === k ? 'var(--card)' : 'transparent',
                  color: mod === k ? 'var(--text)' : 'var(--text-muted)',
                  boxShadow: mod === k ? '0 1px 3px rgba(15,23,42,0.12)' : 'none',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pelajar
            </label>
            <CariPelajar onPilih={setPelajar} nilaiAwal={pelajar?.nama_penuh} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Bulan
            </label>
            {mod === 'bulan' ? (
              <input
                type="month"
                value={bulanInput}
                onChange={(e) => setBulanInput(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px',
                  border: '1.5px solid var(--border)', borderRadius: '12px',
                  fontSize: '13.5px', color: 'var(--text)',
                  background: 'var(--card)', outline: 'none', fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            ) : (
              <div style={{
                padding: '10px 14px', border: '1.5px dashed var(--border)', borderRadius: '12px',
                fontSize: '13px', color: 'var(--text-muted)', background: '#F8FAFC',
              }}>
                Semua bulan — pecahan prestasi ikut bulan
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => jana()}
          disabled={!pelajar || loading}
          style={{
            marginTop: '16px', padding: '11px 24px',
            background: !pelajar || loading ? '#94A3B8' : 'var(--primary)',
            border: 'none', borderRadius: '12px',
            fontSize: '13.5px', fontWeight: 700,
            color: '#FFFFFF', cursor: !pelajar || loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          <FileText size={15} />
          {loading ? 'Memuatkan...' : 'Jana Laporan'}
        </button>
      </div>

      {/* Hasil Laporan */}
      {laporan && (
        <div>
          {/* Header laporan */}
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: '20px', overflow: 'hidden', marginBottom: '16px',
          }}>
            <div style={{
              background: 'var(--primary)', padding: '20px 24px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF', marginBottom: '3px' }}>
                  {laporan.nama_pelajar}
                </h2>
                <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.7)' }}>
                  {laporan.cawangan} · {laporan.jenis_kelas} · {laporan.tempoh}
                </p>
              </div>
              <button
                onClick={unduhPDF}
                disabled={unduhLoading}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '9px 16px',
                  background: unduhLoading ? '#94A3B8' : 'var(--accent)',
                  border: 'none', borderRadius: '10px',
                  fontSize: '13px', fontWeight: 700,
                  color: 'var(--accent-text)', cursor: unduhLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <Download size={14} />
                {unduhLoading ? 'Jana PDF...' : 'Muat Turun PDF'}
              </button>
            </div>

            {/* Statistik */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
              {[
                { label: 'Hadir', nilai: laporan.jumlahHadir, bg: 'var(--hadir-bg)', color: 'var(--hadir-text)', border: '#BBF7D0' },
                { label: 'Tidak Hadir', nilai: laporan.jumlahTidakHadir, bg: 'var(--tidak-hadir-bg)', color: 'var(--tidak-hadir-text)', border: '#FECDD3' },
                { label: 'Cuti', nilai: laporan.jumlahCuti, bg: 'var(--cuti-bg)', color: 'var(--cuti-text)', border: '#FDE68A' },
                { label: 'Kehadiran', nilai: `${laporan.peratus}%`, bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' },
              ].map((s, i) => (
                <div key={s.label} style={{
                  padding: '16px 20px', textAlign: 'center',
                  background: s.bg,
                  borderRight: i < 3 ? `1px solid ${s.border}` : 'none',
                  borderTop: '1px solid var(--border)',
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: s.color }}>{s.nilai}</div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: s.color, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tab: asingkan Kehadiran / Silibus / Pertandingan */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {([
              ['kehadiran', 'Kehadiran', CalendarCheck],
              ['silibus', 'Silibus', BookOpen],
              ['pertandingan', 'Pencapaian Pertandingan', Trophy],
            ] as const).map(([k, label, Ikon]) => {
              const aktif = tab === k
              return (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '9px 16px', borderRadius: '12px', cursor: 'pointer',
                    fontSize: '13px', fontWeight: 700, fontFamily: 'inherit',
                    border: aktif ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                    background: aktif ? 'var(--primary)' : 'var(--card)',
                    color: aktif ? '#FFFFFF' : 'var(--text)',
                  }}
                >
                  <Ikon size={14} />
                  {label}
                </button>
              )
            })}
          </div>

          {tab === 'kehadiran' && (<>
          {/* Status Yuran */}
          {laporan.ringkasanBulan ? (() => {
            const tertunggak = laporan.ringkasanBulan.filter((m) => m.perluBayar)
            return (
              <div style={{
                background: tertunggak.length > 0 ? '#FFF7ED' : 'var(--hadir-bg)',
                border: `1px solid ${tertunggak.length > 0 ? '#FED7AA' : '#BBF7D0'}`,
                borderRadius: '14px', padding: '14px 20px', marginBottom: '16px',
              }}>
                <p style={{ fontSize: '13.5px', fontWeight: 700, color: tertunggak.length > 0 ? '#C2410C' : 'var(--hadir-text)' }}>
                  {tertunggak.length > 0
                    ? `⚠ ${tertunggak.length} bulan yuran belum dijelaskan: ${tertunggak.map((m) => `${m.nama} ${m.tahun}`).join(', ')}`
                    : `✓ Tiada yuran tertunggak (${laporan.ringkasanBulan.length} bulan direkod)`}
                </p>
              </div>
            )
          })() : (
          <div style={{
            background: laporan.perluBayar ? '#FFF7ED' : laporan.sudahBayar ? 'var(--hadir-bg)' : '#F8FAFC',
            border: `1px solid ${laporan.perluBayar ? '#FED7AA' : laporan.sudahBayar ? '#BBF7D0' : 'var(--border)'}`,
            borderRadius: '14px', padding: '14px 20px',
            marginBottom: '16px',
          }}>
            <p style={{
              fontSize: '13.5px', fontWeight: 700,
              color: laporan.perluBayar ? '#C2410C' : laporan.sudahBayar ? 'var(--hadir-text)' : 'var(--text-muted)',
            }}>
              {laporan.perluBayar
                ? `⚠ Yuran ${laporan.bulan} ${laporan.tahun} perlu dijelaskan (${laporan.jumlahHadir} sesi hadir ≥ 4)`
                : laporan.sudahBayar
                  ? `✓ Yuran ${laporan.bulan} ${laporan.tahun} sudah dijelaskan`
                  : `ℹ ${laporan.jumlahHadir} sesi hadir — belum mencapai 4 sesi minimum`
              }
            </p>
          </div>
          )}

          {/* Jadual Rekod */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>
                {laporan.ringkasanBulan ? 'Prestasi Kehadiran Ikut Bulan' : `Rekod Kehadiran — ${laporan.bulan} ${laporan.tahun}`}
              </h3>
            </div>
            {laporan.ringkasanBulan ? (
              laporan.ringkasanBulan.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13.5px' }}>
                  Tiada rekod kehadiran lagi untuk pelajar ini.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                        {['Bulan', 'Hadir', 'T. Hadir', 'Cuti', 'Kehadiran', 'Yuran', ''].map((h, i) => (
                          <th key={h + i} style={{ padding: '9px 12px', textAlign: i === 0 || i === 4 ? 'left' : 'center', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {laporan.ringkasanBulan.map((m, i) => (
                        <tr key={m.kunci} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', background: i % 2 === 1 ? '#FAFBFC' : 'transparent' }}>
                          <td style={{ padding: '10px 12px', fontSize: '13.5px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>{m.nama} {m.tahun}</td>
                          <td style={{ padding: '10px 12px', fontSize: '13px', textAlign: 'center', color: 'var(--hadir-text)', fontWeight: 700 }}>{m.hadir}</td>
                          <td style={{ padding: '10px 12px', fontSize: '13px', textAlign: 'center', color: 'var(--tidak-hadir-text)', fontWeight: 700 }}>{m.tidakHadir}</td>
                          <td style={{ padding: '10px 12px', fontSize: '13px', textAlign: 'center', color: 'var(--cuti-text)', fontWeight: 700 }}>{m.cuti}</td>
                          <td style={{ padding: '10px 12px', minWidth: '130px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ flex: 1, height: '8px', background: '#E2E8F0', borderRadius: '99px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${m.peratus}%`, background: warnaPeratus(m.peratus), borderRadius: '99px' }} />
                              </div>
                              <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text)', minWidth: '36px', textAlign: 'right' }}>{m.peratus}%</span>
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap', color: m.sudahBayar ? 'var(--hadir-text)' : m.perluBayar ? '#C2410C' : 'var(--text-muted)' }}>
                            {m.sudahBayar ? '✓ Bayar' : m.perluBayar ? '⚠ Belum' : '—'}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                            <button
                              onClick={() => { setMod('bulan'); setBulanInput(m.kunci); jana('bulan', m.kunci) }}
                              style={{ padding: '5px 10px', fontSize: '12px', fontWeight: 600, border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--card)', color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                            >
                              Lihat
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : laporan.rekod.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13.5px' }}>
                Tiada rekod kehadiran untuk bulan ini.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                    {['Tarikh', 'Hari', 'Status', 'Nota'].map((h) => (
                      <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {laporan.rekod.map((r, i) => {
                    const warnaStatus: Record<string, { bg: string; text: string }> = {
                      Hadir: { bg: 'var(--hadir-bg)', text: 'var(--hadir-text)' },
                      'Tidak Hadir': { bg: 'var(--tidak-hadir-bg)', text: 'var(--tidak-hadir-text)' },
                      Cuti: { bg: 'var(--cuti-bg)', text: 'var(--cuti-text)' },
                    }
                    const w = warnaStatus[r.status]
                    const d = new Date(r.tarikh)
                    return (
                      <tr key={r.tarikh} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', background: i % 2 === 1 ? '#FAFBFC' : 'transparent' }}>
                        <td style={{ padding: '10px 16px', fontSize: '13.5px', color: 'var(--text)', fontWeight: 500 }}>{formatTarikhPanjang(r.tarikh)}</td>
                        <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>{HARI[d.getDay()]}</td>
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600, background: w.bg, color: w.text }}>{r.status}</span>
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>{r.nota || '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
          </>)}

          {/* Progress Silibus */}
          {tab === 'silibus' && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>
                Progress Silibus (Wajib)
              </h3>
              {laporan.silibus && laporan.silibus.jumlah > 0 && (
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text)' }}>
                  {laporan.silibus.selesai}/{laporan.silibus.jumlah} selesai ({laporan.silibus.peratus}%)
                </span>
              )}
            </div>

            {!laporan.silibus || laporan.silibus.jumlah === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13.5px' }}>
                Belum ada silibus wajib ditetapkan.
              </div>
            ) : (
              <div style={{ padding: '16px 20px' }}>
                {/* Bar keseluruhan */}
                <div style={{ height: '10px', background: '#E2E8F0', borderRadius: '99px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div style={{ height: '100%', width: `${laporan.silibus.peratus}%`, background: warnaBarSilibus(laporan.silibus.peratus), borderRadius: '99px' }} />
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  {laporan.silibus.selesai} selesai · {laporan.silibus.sedang} sedang · {laporan.silibus.belum} belum
                </p>

                {/* Per Tajuk Besar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {laporan.silibus.tajuk.map((t) => (
                    <div key={t.nama} style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#F8FAFC', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{t.nama}</span>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{t.selesai}/{t.jumlah} ({t.peratus}%)</span>
                      </div>
                      {t.subtajuk.length > 0 && (
                        <div>
                          {t.subtajuk.map((sub, i) => {
                            const w = WARNA_PROGRES[sub.status]
                            return (
                              <div key={sub.nama + i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '8px 14px', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '12.5px', color: 'var(--text)', flex: 1, minWidth: '140px' }}>
                                  {sub.nama}{sub.nota ? <span style={{ color: 'var(--text-muted)' }}> · {sub.nota}</span> : null}
                                </span>
                                <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: w.bg, color: w.text, border: `1px solid ${w.border}`, flexShrink: 0 }}>
                                  {sub.status}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          )}

          {/* Pencapaian Pertandingan */}
          {tab === 'pertandingan' && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>Pencapaian Pertandingan</h3>
              {laporan.pertandingan && (
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: laporan.pertandingan.ringkasan.taraf.warna, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '15px' }}>{laporan.pertandingan.ringkasan.taraf.ikon}</span>
                  {laporan.pertandingan.ringkasan.taraf.nama} · Rating {laporan.pertandingan.ringkasan.rating}
                </span>
              )}
            </div>

            {!laporan.pertandingan ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13.5px' }}>
                Belum menyertai sebarang pertandingan.
              </div>
            ) : (
              <div style={{ padding: '16px 20px' }}>
                {/* Ringkasan */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
                  {[
                    { label: 'Pertandingan', nilai: laporan.pertandingan.ringkasan.bilPertandingan },
                    { label: 'Terbaik', nilai: laporan.pertandingan.ringkasan.kedudukanTerbaik ? `#${laporan.pertandingan.ringkasan.kedudukanTerbaik}` : '—' },
                    { label: 'Purata Tempat', nilai: laporan.pertandingan.ringkasan.purataKedudukan ?? '—' },
                    { label: 'Jumlah Mata', nilai: formatMata(laporan.pertandingan.ringkasan.jumlahMata) },
                  ].map((s) => (
                    <div key={s.label} style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '12px', padding: '10px 8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>{s.nilai}</div>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '2px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Pingat */}
                {(laporan.pertandingan.ringkasan.emas + laporan.pertandingan.ringkasan.perak + laporan.pertandingan.ringkasan.gangsa) > 0 && (
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    {([['Emas', laporan.pertandingan.ringkasan.emas], ['Perak', laporan.pertandingan.ringkasan.perak], ['Gangsa', laporan.pertandingan.ringkasan.gangsa]] as const).filter(([, n]) => n > 0).map(([jenis, n]) => {
                      const w = WARNA_PINGAT[jenis]
                      return (
                        <span key={jenis} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', fontWeight: 700, padding: '5px 12px', borderRadius: '20px', background: w.bg, color: w.text, border: `1px solid ${w.border}` }}>
                          {w.emoji} {n} {jenis}
                        </span>
                      )
                    })}
                  </div>
                )}

                {/* Graf Progres Rating */}
                {laporan.pertandingan.siri.length >= 2 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                      Graf Progres Rating
                    </div>
                    <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '8px 10px' }}>
                      <GrafProgres siri={laporan.pertandingan.siri} warna={laporan.pertandingan.ringkasan.taraf.warna} />
                    </div>
                  </div>
                )}

                {/* Senarai pertandingan */}
                <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                  {laporan.pertandingan.rekod.map((r, i) => {
                    const w = r.pingat ? WARNA_PINGAT[r.pingat] : null
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '10px 14px', borderTop: i > 0 ? '1px solid var(--border)' : 'none', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '160px' }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{r.nama}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{r.tarikh ? formatTarikhPanjang(r.tarikh) : '—'}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{formatMata(r.mata)} mata</span>
                          <span style={{ fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: w ? w.bg : '#F1F5F9', color: w ? w.text : 'var(--text)', border: w ? `1px solid ${w.border}` : '1px solid var(--border)' }}>
                            {w ? `${w.emoji} #${r.kedudukan}` : `#${r.kedudukan}`}<span style={{ opacity: 0.6, fontWeight: 500 }}>/{r.jumlah_peserta}</span>
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          )}
        </div>
      )}
    </div>
  )
}
