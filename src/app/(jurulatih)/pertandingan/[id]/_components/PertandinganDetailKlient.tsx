'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Trophy, Download, Upload, Users, Trash2,
  AlertTriangle, Loader2, CheckCircle2, CalendarDays, MapPin,
  FileText, FileSpreadsheet, UserPlus, Search, X,
} from 'lucide-react'
import { formatMata, WARNA_PINGAT, type JenisPingat } from '@/lib/pertandingan'
import type { PecahSeriItem } from '@/lib/pertandingan-parse'
import { createClient } from '@/lib/supabase/client'
import { padanKeputusanManual, padamPertandingan, tambahPeserta, buangPeserta } from '@/app/actions/pertandingan'
import { toast } from '@/lib/stores/toast-store'

export type PesertaData = {
  id: string
  pelajar_id: string
  nama_ekspot: string
  nama_penuh: string
  tarikh_lahir: string | null
  cawangan_nama: string | null
}

export type KeputusanData = {
  id: string
  nama_ranking: string
  kedudukan: number
  sno: number | null
  mata: number
  buchholz: number | null
  sonneborn: number | null
  jumlah_peserta: number
  pingat: JenisPingat | null
  pecah_seri: PecahSeriItem[] | null
  pelajar_id: string | null
  peserta_id: string | null
}

// Tie-break satu baris: guna pecah_seri (semua tie-break ikut label) jika ada,
// jika tidak jatuh balik ke buchholz/sonneborn (data lama).
function tiebreaksBaris(k: KeputusanData): PecahSeriItem[] {
  if (Array.isArray(k.pecah_seri) && k.pecah_seri.length > 0) return k.pecah_seri
  const arr: PecahSeriItem[] = []
  if (k.buchholz != null) arr.push({ label: 'BH', nilai: k.buchholz })
  if (k.sonneborn != null) arr.push({ label: 'SB', nilai: k.sonneborn })
  return arr
}

type CawanganPilihan = { id: string; nama: string }
type PelajarCari = { id: string; nama_penuh: string; cawangan_nama: string | null }

type Props = {
  id: string
  nama: string
  tarikh: string
  status: 'Draf' | 'Selesai'
  bilPusingan: number | null
  cawanganNama: string | null
  peserta: PesertaData[]
  keputusan: KeputusanData[]
  cawanganSenarai: CawanganPilihan[]
}

function formatTarikh(s: string) {
  return new Date(s).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function PertandinganDetailKlient({
  id, nama, tarikh, status, bilPusingan, cawanganNama, peserta, keputusan, cawanganSenarai,
}: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [tmpl, setTmpl] = useState(false)
  const [upload, setUpload] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [excelLoading, setExcelLoading] = useState(false)
  const [namaFail, setNamaFail] = useState<string | null>(null)

  // — Tambah peserta (ikut kehadiran + carian nama) —
  const [tambahCawangan, setTambahCawangan] = useState('')
  const [tambahTarikh, setTambahTarikh] = useState(tarikh)
  const [calonHadir, setCalonHadir] = useState<PelajarCari[]>([])
  const [pilihHadir, setPilihHadir] = useState<Set<string>>(new Set())
  const [memuatHadir, setMemuatHadir] = useState(false)
  const [cari, setCari] = useState('')
  const [hasilCari, setHasilCari] = useState<PelajarCari[]>([])
  const [memuatCari, setMemuatCari] = useState(false)
  const [menyimpan, setMenyimpan] = useState(false)

  const idPelajarSediaAda = new Set(peserta.map((p) => p.pelajar_id))

  const muatHadir = async (cawanganId: string, tkh: string) => {
    if (!cawanganId || !tkh) { setCalonHadir([]); setPilihHadir(new Set()); return }
    setMemuatHadir(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('kehadiran')
      .select('pelajar:pelajar_id(id, nama_penuh, cawangan:cawangan_daftar_id(nama))')
      .eq('cawangan_sesi_id', cawanganId)
      .eq('tarikh', tkh)
      .eq('status', 'Hadir')
    type Baris = { pelajar: { id: string; nama_penuh: string; cawangan: { nama: string } | null } | null }
    const senarai = ((data ?? []) as unknown as Baris[])
      .map((r) => r.pelajar)
      .filter((p): p is { id: string; nama_penuh: string; cawangan: { nama: string } | null } => !!p)
      .filter((p) => !idPelajarSediaAda.has(p.id)) // buang yang sudah peserta
      .map((p) => ({ id: p.id, nama_penuh: p.nama_penuh, cawangan_nama: p.cawangan?.nama ?? null }))
      .sort((a, b) => a.nama_penuh.localeCompare(b.nama_penuh, 'ms'))
    setCalonHadir(senarai)
    setPilihHadir(new Set(senarai.map((p) => p.id))) // default: semua dipilih
    setMemuatHadir(false)
  }

  const cariPelajar = async (q: string) => {
    setCari(q)
    if (q.trim().length < 2) { setHasilCari([]); return }
    setMemuatCari(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('pelajar')
      .select('id, nama_penuh, cawangan:cawangan_daftar_id(nama)')
      .eq('status', 'Aktif')
      .ilike('nama_penuh', `%${q.trim()}%`)
      .order('nama_penuh')
      .limit(20)
    type Baris = { id: string; nama_penuh: string; cawangan: { nama: string } | null }
    const senarai = ((data ?? []) as unknown as Baris[])
      .filter((p) => !idPelajarSediaAda.has(p.id))
      .map((p) => ({ id: p.id, nama_penuh: p.nama_penuh, cawangan_nama: p.cawangan?.nama ?? null }))
    setHasilCari(senarai)
    setMemuatCari(false)
  }

  const simpanTambah = async (pelajar: PelajarCari[]) => {
    if (pelajar.length === 0) { toast.warning('Tiada pelajar dipilih.'); return }
    setMenyimpan(true)
    const { ralat, ditambah } = await tambahPeserta(id, pelajar.map((p) => ({ id: p.id, nama_penuh: p.nama_penuh })))
    setMenyimpan(false)
    if (ralat) { toast.error(ralat); return }
    toast.success(`${ditambah} peserta ditambah.`)
    setCalonHadir([]); setPilihHadir(new Set()); setTambahCawangan('')
    setCari(''); setHasilCari([])
    router.refresh()
  }

  const buang = async (pesertaId: string, namaP: string) => {
    if (!confirm(`Buang ${namaP} dari pertandingan?`)) return
    const { ralat } = await buangPeserta(pesertaId, id)
    if (ralat) { toast.error(ralat); return }
    toast.success('Peserta dibuang.')
    router.refresh()
  }

  const petaPeserta = new Map(peserta.map((p) => [p.id, p.nama_penuh]))
  const pesertaDiguna = new Set(keputusan.map((k) => k.peserta_id).filter(Boolean) as string[])
  const takPadan = keputusan.filter((k) => !k.pelajar_id)

  const namaFailAsas = `Keputusan_${nama.replace(/[\\/:*?"<>|]/g, '-')}_${tarikh}`
  const labelTiebreak = keputusan.length > 0 ? tiebreaksBaris(keputusan[0]).map((t) => t.label) : []
  const barisEksport = keputusan.map((k) => {
    const tb = tiebreaksBaris(k)
    return {
      kedudukan: k.kedudukan,
      nama: (k.peserta_id ? petaPeserta.get(k.peserta_id) : null) ?? k.nama_ranking,
      mata: k.mata,
      tiebreaks: labelTiebreak.map((_, j) => tb[j]?.nilai ?? null),
      pingat: k.pingat,
    }
  })

  const muatTurunPDF = async () => {
    setPdfLoading(true)
    try {
      const { pdf } = await import('@react-pdf/renderer')
      const { KeputusanPertandinganPDF } = await import('@/components/pdf/KeputusanPertandinganPDF')
      const blob = await pdf(
        <KeputusanPertandinganPDF nama={nama} tarikh={tarikh} cawangan={cawanganNama} tiebreakLabels={labelTiebreak} keputusan={barisEksport} />
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${namaFailAsas}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF keputusan dimuat turun.')
    } catch (e) {
      console.error(e)
      toast.error('Gagal jana PDF. Cuba lagi.')
    } finally {
      setPdfLoading(false)
    }
  }

  const muatTurunExcel = async () => {
    setExcelLoading(true)
    try {
      const ExcelJS = (await import('exceljs')).default
      const { formatMata } = await import('@/lib/pertandingan')
      const wb = new ExcelJS.Workbook()
      wb.creator = 'CFK HUB'
      const ws = wb.addWorksheet('Keputusan')
      const kepala = ['#', 'Nama', 'Mata', ...labelTiebreak, 'Pingat']
      ws.columns = kepala.map((_, i) => ({ width: i === 1 ? 30 : i === 0 ? 8 : 11 }))
      const lajurAkhir = String.fromCharCode(64 + kepala.length) // cth 'F', 'G'

      ws.mergeCells(`A1:${lajurAkhir}1`)
      ws.getCell('A1').value = nama
      ws.getCell('A1').font = { bold: true, size: 14 }
      ws.mergeCells(`A2:${lajurAkhir}2`)
      ws.getCell('A2').value = `${new Date(tarikh).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}${cawanganNama ? ` · ${cawanganNama}` : ''} · ${barisEksport.length} pemain`
      ws.getCell('A2').font = { size: 10, color: { argb: 'FF64748B' } }

      const rowKepala = ws.getRow(4)
      kepala.forEach((label, i) => {
        const c = rowKepala.getCell(i + 1)
        c.value = label
        c.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }
      })

      barisEksport.forEach((k, i) => {
        const row = ws.getRow(5 + i)
        row.getCell(1).value = k.kedudukan
        row.getCell(2).value = k.nama
        row.getCell(3).value = formatMata(k.mata)
        k.tiebreaks.forEach((v, j) => { row.getCell(4 + j).value = v ?? '—' })
        row.getCell(4 + labelTiebreak.length).value = k.pingat ?? '—'
      })

      const buffer = await wb.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${namaFailAsas}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Excel keputusan dimuat turun.')
    } catch (e) {
      console.error(e)
      toast.error('Gagal jana Excel. Cuba lagi.')
    } finally {
      setExcelLoading(false)
    }
  }

  const muatTurunTemplate = async () => {
    if (peserta.length === 0) { toast.warning('Tiada peserta didaftar.'); return }
    setTmpl(true)
    try {
      const { binaBlobPendaftaran, namaFailTemplate } = await import('@/lib/pertandingan-template')
      const blob = await binaBlobPendaftaran(
        peserta.map((p) => ({ nama_ekspot: p.nama_ekspot, tarikh_lahir: p.tarikh_lahir, cawangan_nama: p.cawangan_nama ?? cawanganNama }))
      )
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = namaFailTemplate(nama, tarikh)
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Template pemain dimuat turun — import ke Swiss-Manager.')
    } catch (e) {
      console.error(e)
      toast.error('Gagal jana template. Cuba lagi.')
    } finally {
      setTmpl(false)
    }
  }

  const prosesResult = async () => {
    const fail = fileRef.current?.files?.[0]
    if (!fail) { toast.warning('Pilih fail result dahulu.'); return }
    setUpload(true)
    try {
      const fd = new FormData()
      fd.append('fail', fail)
      const res = await fetch(`/api/pertandingan/${id}/result`, { method: 'POST', body: fd })
      const j = await res.json()
      if (!res.ok) { toast.error(j.ralat ?? 'Gagal proses result.'); return }
      const extra = j.takPadan?.length ? ` ${j.takPadan.length} nama tidak dipadan — padan manual di bawah.` : ''
      toast.success(`Result diproses: ${j.dipadan}/${j.jumlah} pelajar dipadan.${extra}`)
      if (fileRef.current) fileRef.current.value = ''
      setNamaFail(null)
      router.refresh()
    } catch {
      toast.error('Ralat rangkaian. Cuba lagi.')
    } finally {
      setUpload(false)
    }
  }

  const padamKeputusan = async () => {
    if (!confirm('Padam pertandingan ini beserta semua peserta & result?')) return
    const { ralat } = await padamPertandingan(id)
    if (ralat) { toast.error(ralat); return }
    toast.success('Pertandingan dipadam.')
    router.push('/pertandingan')
  }

  const padanManual = async (keputusanId: string, pesertaId: string) => {
    if (!pesertaId) return
    const { ralat } = await padanKeputusanManual(keputusanId, pesertaId)
    if (ralat) { toast.error(ralat); return }
    toast.success('Peserta dipadan.')
    router.refresh()
  }

  return (
    <div style={{ maxWidth: '760px', padding: '0 16px' }}>
      <Link href="/pertandingan" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '16px' }}>
        <ArrowLeft size={15} /> Semua Pertandingan
      </Link>

      {/* Header */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '18px', padding: '20px 22px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={19} /> {nama}
            </h1>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CalendarDays size={13} /> {formatTarikh(tarikh)}</span>
              {cawanganNama && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><MapPin size={13} /> {cawanganNama}</span>}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Users size={13} /> {peserta.length} peserta</span>
              {bilPusingan ? <span>{bilPusingan} pusingan</span> : null}
            </div>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '11px', fontWeight: 700, padding: '5px 12px', borderRadius: '20px',
            background: status === 'Selesai' ? 'var(--hadir-bg)' : '#FFF7ED',
            color: status === 'Selesai' ? 'var(--hadir-text)' : '#C2410C',
          }}>
            {status === 'Selesai' ? <CheckCircle2 size={12} /> : null}{status}
          </span>
        </div>
      </div>

      {/* Langkah 1 — Template */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '18px', padding: '20px 22px', marginBottom: '18px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>1. Template Pendaftaran Pemain</h2>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Muat turun senarai {peserta.length} peserta dalam format Excel, kemudian <em>import</em> terus ke Swiss-Manager.
        </p>
        <button
          onClick={muatTurunTemplate}
          disabled={tmpl || peserta.length === 0}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '11px 20px', borderRadius: '12px', border: 'none',
            background: tmpl || peserta.length === 0 ? '#94A3B8' : 'var(--primary)',
            color: '#FFFFFF', fontSize: '13.5px', fontWeight: 700,
            cursor: tmpl || peserta.length === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          }}
        >
          {tmpl ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          {tmpl ? 'Menjana...' : 'Muat Turun Template'}
        </button>

        {peserta.length > 0 && (
          <div style={{ marginTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {peserta.map((p) => (
              <span key={p.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '4px 6px 4px 10px', borderRadius: '8px', background: '#F1F5F9', color: 'var(--text)' }}>
                {p.nama_penuh}
                {p.cawangan_nama && <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>· {p.cawangan_nama}</span>}
                <button
                  onClick={() => buang(p.id, p.nama_penuh)}
                  title="Buang peserta"
                  style={{ display: 'inline-flex', alignItems: 'center', border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', padding: '2px', borderRadius: '6px' }}
                >
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tambah peserta (kehadiran + carian nama) */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '18px', padding: '20px 22px', marginBottom: '18px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <UserPlus size={16} /> Tambah Peserta
        </h2>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Tambah pelajar dari <strong>mana-mana cawangan</strong> — ikut kehadiran pada satu tarikh, atau cari terus dengan nama.
        </p>

        {/* Ikut kehadiran */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: '10px', marginBottom: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px' }}>Cawangan / Kelas</label>
            <select
              value={tambahCawangan}
              onChange={(e) => { setTambahCawangan(e.target.value); muatHadir(e.target.value, tambahTarikh) }}
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', background: 'var(--card)', color: 'var(--text)', fontFamily: 'inherit', boxSizing: 'border-box' }}
            >
              <option value="">— Pilih cawangan —</option>
              {cawanganSenarai.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px' }}>Tarikh</label>
            <input
              type="date"
              value={tambahTarikh}
              onChange={(e) => { setTambahTarikh(e.target.value); muatHadir(tambahCawangan, e.target.value) }}
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', background: 'var(--card)', color: 'var(--text)', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {tambahCawangan && (
          memuatHadir ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}><Loader2 size={16} className="animate-spin" style={{ display: 'inline' }} /> Memuatkan…</div>
          ) : calonHadir.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', fontSize: '12.5px', color: 'var(--text-muted)', background: 'var(--bg)', borderRadius: '10px' }}>Tiada pelajar <strong>Hadir</strong> yang belum menjadi peserta pada tarikh ini.</div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>{pilihHadir.size}/{calonHadir.length} dipilih</span>
                <button
                  onClick={() => setPilihHadir(pilihHadir.size === calonHadir.length ? new Set() : new Set(calonHadir.map((p) => p.id)))}
                  style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  {pilihHadir.size === calonHadir.length ? 'Nyahpilih semua' : 'Pilih semua'}
                </button>
              </div>
              <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '10px', marginBottom: '10px' }}>
                {calonHadir.map((p, i) => (
                  <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px', borderTop: i > 0 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={pilihHadir.has(p.id)}
                      onChange={() => setPilihHadir((prev) => { const s = new Set(prev); if (s.has(p.id)) s.delete(p.id); else s.add(p.id); return s })}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                    />
                    <span style={{ fontSize: '13px', color: 'var(--text)' }}>{p.nama_penuh}</span>
                    {p.cawangan_nama && <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>{p.cawangan_nama}</span>}
                  </label>
                ))}
              </div>
              <button
                onClick={() => simpanTambah(calonHadir.filter((p) => pilihHadir.has(p.id)))}
                disabled={menyimpan || pilihHadir.size === 0}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '11px', border: 'none', background: menyimpan || pilihHadir.size === 0 ? '#94A3B8' : 'var(--primary)', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, cursor: menyimpan || pilihHadir.size === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
              >
                {menyimpan ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                Tambah {pilihHadir.size} dipilih
              </button>
            </>
          )
        )}

        {/* Carian nama */}
        <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px dashed var(--border)' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px' }}>Atau cari nama (semua cawangan)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: '10px', background: 'var(--card)' }}>
            <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              value={cari}
              onChange={(e) => cariPelajar(e.target.value)}
              placeholder="Taip sekurang-kurangnya 2 aksara…"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: 'var(--text)', fontFamily: 'inherit' }}
            />
            {memuatCari && <Loader2 size={14} className="animate-spin" style={{ color: 'var(--text-muted)' }} />}
          </div>
          {cari.trim().length >= 2 && !memuatCari && (
            hasilCari.length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Tiada pelajar Aktif ditemui (atau semua sudah menjadi peserta).</p>
            ) : (
              <div style={{ marginTop: '8px', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                {hasilCari.map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text)' }}>{p.nama_penuh}</span>
                    {p.cawangan_nama && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>· {p.cawangan_nama}</span>}
                    <button
                      onClick={() => simpanTambah([p])}
                      disabled={menyimpan}
                      style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '9px', border: 'none', background: 'var(--primary)', color: '#FFFFFF', fontSize: '12px', fontWeight: 700, cursor: menyimpan ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: menyimpan ? 0.6 : 1 }}
                    >
                      <UserPlus size={13} /> Tambah
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Langkah 2 — Upload result */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '18px', padding: '20px 22px', marginBottom: '18px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>2. Muat Naik Result</h2>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Selepas pertandingan, <em>export</em> &quot;Ranking List&quot; dari Swiss-Manager (.xls) dan muat naik di sini.
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px', borderRadius: '12px', border: '1.5px solid var(--border)',
            background: 'var(--bg)', color: 'var(--text)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}>
            <Upload size={15} />
            <span>{namaFail ?? 'Pilih fail .xls / .xlsx'}</span>
            <input
              ref={fileRef}
              type="file"
              accept=".xls,.xlsx"
              onChange={(e) => setNamaFail(e.target.files?.[0]?.name ?? null)}
              style={{ display: 'none' }}
            />
          </label>
          <button
            onClick={prosesResult}
            disabled={upload || !namaFail}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '11px 20px', borderRadius: '12px', border: 'none',
              background: upload || !namaFail ? '#94A3B8' : 'var(--accent)',
              color: 'var(--accent-text)', fontSize: '13.5px', fontWeight: 700,
              cursor: upload || !namaFail ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            }}
          >
            {upload ? <><Loader2 size={15} className="animate-spin" /> Memproses...</> : 'Proses Result'}
          </button>
        </div>
      </div>

      {/* Standings */}
      {keputusan.length > 0 && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '18px', overflow: 'hidden', marginBottom: '18px' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>Kedudukan Akhir ({keputusan.length} pemain)</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={muatTurunPDF}
                disabled={pdfLoading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '12.5px', fontWeight: 600, cursor: pdfLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: pdfLoading ? 0.6 : 1 }}
              >
                {pdfLoading ? <Loader2 size={13} className="animate-spin" /> : <FileText size={13} />} PDF
              </button>
              <button
                onClick={muatTurunExcel}
                disabled={excelLoading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '12.5px', fontWeight: 600, cursor: excelLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: excelLoading ? 0.6 : 1 }}
              >
                {excelLoading ? <Loader2 size={13} className="animate-spin" /> : <FileSpreadsheet size={13} />} Excel
              </button>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                {['#', 'Nama', 'Mata', ...labelTiebreak].map((h, i) => (
                  <th key={h + i} style={{ padding: '9px 16px', textAlign: i >= 2 ? 'center' : 'left', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keputusan.map((k, i) => {
                const namaPadan = k.peserta_id ? petaPeserta.get(k.peserta_id) : null
                const w = k.pingat ? WARNA_PINGAT[k.pingat] : null
                return (
                  <tr key={k.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', background: i % 2 === 1 ? '#FAFBFC' : 'transparent' }}>
                    <td style={{ padding: '10px 16px', fontSize: '13.5px', fontWeight: 800, color: 'var(--text)', width: '44px' }}>
                      {w ? w.emoji : k.kedudukan}
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: '13.5px', color: 'var(--text)' }}>
                      {namaPadan ?? k.nama_ranking}
                      {!k.pelajar_id && (
                        <span title="Tidak dipadan dengan pelajar" style={{ marginLeft: '6px', color: '#C2410C', display: 'inline-flex', verticalAlign: 'middle' }}><AlertTriangle size={13} /></span>
                      )}
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: '13.5px', fontWeight: 700, color: 'var(--text)', textAlign: 'center' }}>{formatMata(k.mata)}</td>
                    {labelTiebreak.map((_, j) => {
                      const tb = tiebreaksBaris(k)
                      return <td key={j} style={{ padding: '10px 16px', fontSize: '12.5px', color: 'var(--text-muted)', textAlign: 'center' }}>{tb[j]?.nilai ?? '—'}</td>
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Padan manual */}
      {takPadan.length > 0 && (
        <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '18px', padding: '18px 20px', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '13.5px', fontWeight: 700, color: '#9A3412', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={15} /> {takPadan.length} nama tidak dipadan
          </h2>
          <p style={{ fontSize: '12.5px', color: '#9A3412', marginBottom: '12px', opacity: 0.9 }}>
            Nama dalam fail berbeza daripada nama pelajar. Padankan secara manual:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {takPadan.map((k) => (
              <div key={k.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', minWidth: '120px' }}>
                  #{k.kedudukan} · {k.nama_ranking}
                </span>
                <select
                  defaultValue=""
                  onChange={(e) => padanManual(k.id, e.target.value)}
                  style={{ flex: 1, minWidth: '180px', padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', background: 'var(--card)', color: 'var(--text)', fontFamily: 'inherit' }}
                >
                  <option value="">— Pilih pelajar —</option>
                  {peserta.filter((p) => !pesertaDiguna.has(p.id)).map((p) => (
                    <option key={p.id} value={p.id}>{p.nama_penuh}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Padam */}
      <button
        onClick={padamKeputusan}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '9px 16px', borderRadius: '10px', border: '1.5px solid #FECACA',
          background: 'transparent', color: '#DC2626', fontSize: '12.5px', fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <Trash2 size={14} /> Padam Pertandingan
      </button>
    </div>
  )
}
