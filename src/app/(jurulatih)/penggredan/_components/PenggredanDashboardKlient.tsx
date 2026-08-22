'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Award, Users, CheckCircle2, Clock, TrendingUp, ChevronRight, FileText } from 'lucide-react'
import {
  umurDariTarikhLahir, levelSemasaPelajar, tarafGred, WARNA_GRED, type Gred,
} from '@/lib/grading'
import { BtnDataGredExcel } from '@/components/excel/BtnDataGredExcel'
import { BtnLaporanKelasPDF } from '@/components/pdf/BtnLaporanKelasPDF'

type Cawangan = { id: string; nama: string }
type Kitaran = { id: string; nama: string; tarikh_mula: string; tarikh_tamat: string; status: 'Dibuka' | 'Ditutup' }
type Pelajar = { id: string; nama_penuh: string; tarikh_lahir: string | null; cawangan_daftar_id: string; jenis_kelas: string }
type Penilaian = { id: string; pelajar_id: string; kitaran_id: string; level_mula: number; naik_level: boolean; skor_akhir: number | null; gred: Gred | null; status: 'Draf' | 'Selesai' }
type LittlePawn = { id: string; pelajar_id: string; kitaran_id: string; peringkat: number; graduasi: boolean; status: 'Draf' | 'Selesai' }

type Props = {
  isAdmin: boolean
  cawanganSaya: string[]
  cawangan: Cawangan[]
  kitaran: Kitaran[]
  pelajar: Pelajar[]
  penilaian: Penilaian[]
  littlePawn: LittlePawn[]
}

type StatusNilai = 'Belum' | 'Draf' | 'Selesai'

type BarisPelajar = {
  pelajar: Pelajar
  umur: number | null
  level: number
  status: StatusNilai
  skor: number | null
  gred: Gred | null
  naik: boolean
}

const GRED_SENARAI: Gred[] = ['A', 'B', 'C', 'D', 'E']

export function PenggredanDashboardKlient({
  isAdmin, cawanganSaya, cawangan, kitaran, pelajar, penilaian, littlePawn,
}: Props) {
  const router = useRouter()

  // Kitaran default: yang Dibuka terkini, jika tiada ambil terkini.
  const kitaranDefault = kitaran.find((k) => k.status === 'Dibuka')?.id ?? kitaran[0]?.id ?? ''
  const [kitaranId, setKitaranId] = useState(kitaranDefault)

  // Cawangan default: admin = semua; jurulatih = cawangan pertama sendiri.
  const cawanganPilihan = isAdmin
    ? cawangan
    : cawangan.filter((c) => cawanganSaya.includes(c.id))
  const [cawanganId, setCawanganId] = useState<string>(
    isAdmin ? 'semua' : (cawanganPilihan[0]?.id ?? 'semua'),
  )

  // Susunan kitaran (terbaru dahulu) untuk kira level semasa.
  const indeksKitaran = useMemo(() => {
    const m = new Map<string, number>()
    kitaran.forEach((k, i) => m.set(k.id, i)) // kitaran sudah desc tarikh_mula
    return m
  }, [kitaran])

  const kitaranTerpilih = kitaran.find((k) => k.id === kitaranId) ?? null

  const baris = useMemo<BarisPelajar[]>(() => {
    const rujukan = kitaranTerpilih ? new Date(kitaranTerpilih.tarikh_tamat) : undefined

    return pelajar
      .filter((p) => (cawanganId === 'semua' ? true : p.cawangan_daftar_id === cawanganId))
      .filter((p) => (isAdmin ? true : cawanganSaya.length === 0 || cawanganSaya.includes(p.cawangan_daftar_id)))
      .map((p) => {
        const umur = umurDariTarikhLahir(p.tarikh_lahir, rujukan)

        const penilaianP = penilaian
          .filter((x) => x.pelajar_id === p.id)
          .sort((a, b) => (indeksKitaran.get(a.kitaran_id) ?? 99) - (indeksKitaran.get(b.kitaran_id) ?? 99))
        const lpP = littlePawn.filter((x) => x.pelajar_id === p.id)

        const level = levelSemasaPelajar({
          penilaianTerbaruDahulu: penilaianP.map((x) => ({ level_mula: x.level_mula, naik_level: x.naik_level })),
          adaLittlePawnGraduated: lpP.some((x) => x.graduasi),
          adaLittlePawnBelumGraduate: lpP.some((x) => !x.graduasi),
          umur,
        })

        // Rekod kitaran terpilih.
        let status: StatusNilai = 'Belum'
        let skor: number | null = null
        let gred: Gred | null = null
        let naik = false
        if (level === 0) {
          const rec = lpP.find((x) => x.kitaran_id === kitaranId)
          if (rec) { status = rec.status; naik = rec.graduasi }
        } else {
          const rec = penilaianP.find((x) => x.kitaran_id === kitaranId)
          if (rec) { status = rec.status; skor = rec.skor_akhir; gred = rec.gred; naik = rec.naik_level }
        }

        return { pelajar: p, umur, level, status, skor, gred, naik }
      })
  }, [pelajar, penilaian, littlePawn, cawanganId, kitaranId, isAdmin, cawanganSaya, kitaranTerpilih, indeksKitaran])

  // Statistik.
  const jumlah = baris.length
  const dinilai = baris.filter((b) => b.status === 'Selesai').length
  const belum = jumlah - dinilai
  const naikLevel = baris.filter((b) => b.naik && b.status === 'Selesai').length
  const taburanGred = useMemo(() => {
    const t: Record<Gred, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 }
    for (const b of baris) if (b.status === 'Selesai' && b.gred) t[b.gred]++
    return t
  }, [baris])
  const maxGred = Math.max(1, ...GRED_SENARAI.map((g) => taburanGred[g]))

  function pergiNilai(b: BarisPelajar) {
    if (!kitaranId) return
    const asas = b.level === 0 ? 'little-pawn' : 'nilai'
    router.push(`/penggredan/${asas}/${b.pelajar.id}?kitaran=${kitaranId}`)
  }

  return (
    <div style={{ maxWidth: '1000px', padding: '0 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={22} /> Penggredan
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Penilaian catur setiap kitaran — Level 1-6 (gred A-E) &amp; Level 0 Little Pawn (checklist).
        </p>
      </div>

      {/* Penapis */}
      {kitaran.length === 0 ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '40px 24px', textAlign: 'center' }}>
          <Award size={34} style={{ color: 'var(--text-muted)', margin: '0 auto 12px', display: 'block' }} />
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Belum ada kitaran grading. {isAdmin ? 'Sila cipta satu kitaran dahulu (seed `gred_kitaran`).' : 'Minta admin buka kitaran grading.'}
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '18px' }}>
            <select value={kitaranId} onChange={(e) => setKitaranId(e.target.value)} style={gayaSelect}>
              {kitaran.map((k) => (
                <option key={k.id} value={k.id}>{k.nama}{k.status === 'Ditutup' ? ' (Ditutup)' : ''}</option>
              ))}
            </select>
            {(isAdmin || cawanganPilihan.length > 1) && (
              <select value={cawanganId} onChange={(e) => setCawanganId(e.target.value)} style={gayaSelect}>
                {isAdmin && <option value="semua">Semua Cawangan</option>}
                {cawanganPilihan.map((c) => (
                  <option key={c.id} value={c.id}>{c.nama}</option>
                ))}
              </select>
            )}
            {kitaranTerpilih && (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Link href="/penggredan/batch" style={gayaBtnKad}>Batch Entry</Link>
                <BtnLaporanKelasPDF
                  kitaranId={kitaranId}
                  kitaranNama={kitaranTerpilih.nama}
                  cawanganId={cawanganId}
                  cawanganNama={cawanganId === 'semua' ? 'Semua Cawangan' : (cawangan.find((c) => c.id === cawanganId)?.nama ?? 'Cawangan')}
                />
                <BtnDataGredExcel
                  kitaranId={kitaranId}
                  kitaranNama={kitaranTerpilih.nama}
                  cawanganId={cawanganId}
                  cawanganNama={cawanganId === 'semua' ? 'Semua_Cawangan' : (cawangan.find((c) => c.id === cawanganId)?.nama ?? 'Cawangan')}
                  senaraiKitaran={kitaran.map((k) => ({ id: k.id, nama: k.nama }))}
                />
              </div>
            )}
          </div>

          {/* Kad stat */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '18px' }}>
            <KadStat ikon={<Users size={18} />} label="Jumlah Pelajar" nilai={jumlah} warna="#2563EB" />
            <KadStat ikon={<CheckCircle2 size={18} />} label="Dah Dinilai" nilai={dinilai} warna="#84CC16" />
            <KadStat ikon={<Clock size={18} />} label="Belum Dinilai" nilai={belum} warna="#EA580C" />
            <KadStat ikon={<TrendingUp size={18} />} label="Naik Level" nilai={naikLevel} warna="#7C3AED" />
          </div>

          {/* Taburan gred */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px 18px', marginBottom: '18px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>Taburan Gred (Level 1-6 selesai)</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px', height: '120px', paddingBottom: '4px' }}>
              {GRED_SENARAI.map((g) => (
                <div key={g} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>{taburanGred[g]}</div>
                  <div style={{ width: '100%', maxWidth: '54px', height: `${(taburanGred[g] / maxGred) * 84}px`, minHeight: taburanGred[g] > 0 ? '6px' : '2px', background: taburanGred[g] > 0 ? WARNA_GRED[g].solid : 'var(--border)', borderRadius: '8px 8px 0 0', transition: 'height 0.2s' }} />
                  <div style={{ fontSize: '13px', fontWeight: 700, color: WARNA_GRED[g].text }}>{g}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Jadual pelajar */}
          {baris.length === 0 ? (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '36px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Tiada pelajar Aktif untuk penapis ini.</p>
            </div>
          ) : (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg)', textAlign: 'left' }}>
                      <th style={gayaTh}>Nama</th>
                      <th style={gayaTh}>Tahap Silibus</th>
                      <th style={gayaTh}>Status</th>
                      <th style={{ ...gayaTh, textAlign: 'right' }}>Skor</th>
                      <th style={{ ...gayaTh, textAlign: 'center' }}>Gred</th>
                      <th style={{ ...gayaTh, textAlign: 'right' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {baris.map((b) => {
                      const taraf = tarafGred(b.level)
                      return (
                        <tr key={b.pelajar.id} style={{ borderTop: '1px solid var(--border)' }}>
                          <td style={gayaTd}>
                            <div style={{ fontWeight: 600, color: 'var(--text)' }}>{b.pelajar.nama_penuh}</div>
                            {b.umur !== null && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{b.umur} tahun</div>}
                          </td>
                          <td style={gayaTd}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', color: 'var(--text)' }}>
                              <span aria-hidden style={{ fontSize: '15px' }}>{taraf.ikon}</span>
                              {taraf.nama}
                            </span>
                          </td>
                          <td style={gayaTd}>
                            <BadgeStatus status={b.status} />
                          </td>
                          <td style={{ ...gayaTd, textAlign: 'right', fontWeight: 600, color: 'var(--text)' }}>
                            {b.level === 0 ? '—' : (b.skor ?? '—')}
                          </td>
                          <td style={{ ...gayaTd, textAlign: 'center' }}>
                            {b.level === 0 ? (
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{b.naik ? 'Graduasi' : '—'}</span>
                            ) : b.gred ? (
                              <span style={{ display: 'inline-block', minWidth: '22px', padding: '2px 6px', borderRadius: '6px', fontWeight: 700, fontSize: '12px', background: WARNA_GRED[b.gred].bg, color: WARNA_GRED[b.gred].text }}>{b.gred}</span>
                            ) : '—'}
                          </td>
                          <td style={{ ...gayaTd, textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                              {b.status !== 'Belum' && (
                                <Link href={`/penggredan/${b.level === 0 ? 'kad-lp' : 'kad'}/${b.pelajar.id}?kitaran=${kitaranId}`} style={gayaBtnKad} title="Lihat kad laporan">
                                  <FileText size={13} /> Kad
                                </Link>
                              )}
                              <button onClick={() => pergiNilai(b)} style={gayaBtnNilai}>
                                {b.status === 'Belum' ? 'Nilai' : 'Kemas kini'} <ChevronRight size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {kitaranTerpilih?.status === 'Ditutup' && (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px' }}>
              Kitaran ini <strong>Ditutup</strong> — gred dikunci (baca sahaja).
            </p>
          )}
        </>
      )}
    </div>
  )
}

function KadStat({ ikon, label, nilai, warna }: { ikon: React.ReactNode; label: string; nilai: number; warna: string }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: warna, marginBottom: '8px' }}>{ikon}</div>
      <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{nilai}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{label}</div>
    </div>
  )
}

function BadgeStatus({ status }: { status: StatusNilai }) {
  const peta: Record<StatusNilai, { bg: string; text: string; label: string }> = {
    Selesai: { bg: 'var(--hadir-bg)', text: 'var(--hadir-text)', label: 'Selesai' },
    Draf: { bg: '#FFFBEB', text: '#92400E', label: 'Draf' },
    Belum: { bg: 'var(--bg)', text: 'var(--text-muted)', label: 'Belum' },
  }
  const s = peta[status]
  return <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '20px', background: s.bg, color: s.text }}>{s.label}</span>
}

const gayaSelect: React.CSSProperties = {
  padding: '9px 12px', borderRadius: '10px', border: '1px solid var(--border)',
  background: 'var(--card)', color: 'var(--text)', fontSize: '13px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer',
}
const gayaTh: React.CSSProperties = {
  padding: '11px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
}
const gayaTd: React.CSSProperties = { padding: '11px 14px', verticalAlign: 'middle' }
const gayaBtnNilai: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '6px 12px', borderRadius: '9px',
  background: 'var(--primary)', color: '#FFFFFF', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
}
const gayaBtnKad: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '6px 10px', borderRadius: '9px',
  background: 'var(--card)', color: 'var(--text)', border: '1.5px solid var(--border)', fontSize: '12px', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap',
}
