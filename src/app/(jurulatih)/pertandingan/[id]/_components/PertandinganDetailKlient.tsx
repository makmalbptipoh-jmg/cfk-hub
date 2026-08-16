'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Trophy, Download, Upload, Users, Trash2,
  AlertTriangle, Loader2, CheckCircle2, CalendarDays, MapPin,
} from 'lucide-react'
import { formatMata, WARNA_PINGAT, type JenisPingat } from '@/lib/pertandingan'
import { padanKeputusanManual, padamPertandingan } from '@/app/actions/pertandingan'
import { toast } from '@/lib/stores/toast-store'

export type PesertaData = {
  id: string
  pelajar_id: string
  nama_ekspot: string
  nama_penuh: string
  tarikh_lahir: string | null
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
  pelajar_id: string | null
  peserta_id: string | null
}

type Props = {
  id: string
  nama: string
  tarikh: string
  status: 'Draf' | 'Selesai'
  bilPusingan: number | null
  cawanganNama: string | null
  peserta: PesertaData[]
  keputusan: KeputusanData[]
}

function formatTarikh(s: string) {
  return new Date(s).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function PertandinganDetailKlient({
  id, nama, tarikh, status, bilPusingan, cawanganNama, peserta, keputusan,
}: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [tmpl, setTmpl] = useState(false)
  const [upload, setUpload] = useState(false)
  const [namaFail, setNamaFail] = useState<string | null>(null)

  const petaPeserta = new Map(peserta.map((p) => [p.id, p.nama_penuh]))
  const pesertaDiguna = new Set(keputusan.map((k) => k.peserta_id).filter(Boolean) as string[])
  const takPadan = keputusan.filter((k) => !k.pelajar_id)

  const muatTurunTemplate = async () => {
    if (peserta.length === 0) { toast.warning('Tiada peserta didaftar.'); return }
    setTmpl(true)
    try {
      const { binaBlobPendaftaran, namaFailTemplate } = await import('@/lib/pertandingan-template')
      const blob = await binaBlobPendaftaran(
        peserta.map((p) => ({ nama_ekspot: p.nama_ekspot, tarikh_lahir: p.tarikh_lahir, cawangan_nama: cawanganNama }))
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
              <span key={p.id} style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '8px', background: '#F1F5F9', color: 'var(--text)' }}>{p.nama_penuh}</span>
            ))}
          </div>
        )}
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
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>Kedudukan Akhir ({keputusan.length} pemain)</h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                {['#', 'Nama', 'Mata', 'BH', 'SB'].map((h, i) => (
                  <th key={h} style={{ padding: '9px 16px', textAlign: i >= 2 ? 'center' : 'left', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
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
                    <td style={{ padding: '10px 16px', fontSize: '12.5px', color: 'var(--text-muted)', textAlign: 'center' }}>{k.buchholz ?? '—'}</td>
                    <td style={{ padding: '10px 16px', fontSize: '12.5px', color: 'var(--text-muted)', textAlign: 'center' }}>{k.sonneborn ?? '—'}</td>
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
