'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import {
  kiraPenilaian, gredDariSkor, umurDariTarikhLahir, bandUmurDariUmur, WARNA_GRED, type Gred, type InputPenilaian,
} from '@/lib/grading'
import { simpanBatch, type InputSimpanPenilaian } from '@/app/actions/penggredan'

type Cawangan = { id: string; nama: string }
type Kitaran = { id: string; nama: string; status: 'Dibuka' | 'Ditutup' }
type Pelajar = { id: string; nama_penuh: string; tarikh_lahir: string | null; cawangan_daftar_id: string }
type Penilaian = {
  pelajar_id: string; kitaran_id: string; level_mula: number
  theory_raw: number | null; theory_max: number | null; puzzle_raw: number | null; puzzle_max: number | null
  club_points: number; tournament_points: number; sesi_hadir: number; sesi_jumlah: number
  att_hormat: number; att_fokus: number; att_sportsmanship: number; att_usaha: number; bonus_helper: number; status: string
}

type Sel = 'level' | 'tr' | 'tm' | 'pr' | 'pm' | 'club' | 'tourn' | 'hadir' | 'jumlah' | 'hormat' | 'fokus' | 'sport' | 'usaha' | 'bonus'
type BarisNilai = Record<Sel, string>

const KOSONG: BarisNilai = { level: '1', tr: '', tm: '', pr: '', pm: '', club: '', tourn: '', hadir: '', jumlah: '', hormat: '', fokus: '', sport: '', usaha: '', bonus: '' }

function n(v: string) { const x = parseFloat(v); return Number.isFinite(x) ? x : 0 }

export function BatchEntryKlient({
  isAdmin, cawanganSaya, cawangan, kitaran, pelajar, penilaian, ratingPelajar,
}: {
  isAdmin: boolean
  cawanganSaya: string[]
  cawangan: Cawangan[]
  kitaran: Kitaran[]
  pelajar: Pelajar[]
  penilaian: Penilaian[]
  ratingPelajar: Record<string, number>
}) {
  const router = useRouter()
  const kitaranDefault = kitaran.find((k) => k.status === 'Dibuka')?.id ?? kitaran[0]?.id ?? ''
  const [kitaranId, setKitaranId] = useState(kitaranDefault)
  const cawanganPilihan = isAdmin ? cawangan : cawangan.filter((c) => cawanganSaya.includes(c.id))
  const [cawanganId, setCawanganId] = useState(cawanganPilihan[0]?.id ?? cawangan[0]?.id ?? '')

  const kitaranObj = kitaran.find((k) => k.id === kitaranId)
  const dikunci = kitaranObj?.status === 'Ditutup'

  const senaraiPelajar = useMemo(
    () => pelajar.filter((p) => p.cawangan_daftar_id === cawanganId),
    [pelajar, cawanganId],
  )

  const [nilai, setNilai] = useState<Record<string, BarisNilai>>({})
  const [edited, setEdited] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [mesej, setMesej] = useState<string | null>(null)

  // Prapopulasi dari rekod sedia ada bila tukar kitaran/cawangan.
  useEffect(() => {
    const peta: Record<string, BarisNilai> = {}
    for (const p of senaraiPelajar) {
      const rec = penilaian.find((x) => x.pelajar_id === p.id && x.kitaran_id === kitaranId)
      peta[p.id] = rec ? {
        level: String(rec.level_mula), tr: str(rec.theory_raw), tm: str(rec.theory_max), pr: str(rec.puzzle_raw), pm: str(rec.puzzle_max),
        club: String(rec.club_points), tourn: String(rec.tournament_points), hadir: String(rec.sesi_hadir), jumlah: String(rec.sesi_jumlah),
        hormat: String(rec.att_hormat), fokus: String(rec.att_fokus), sport: String(rec.att_sportsmanship), usaha: String(rec.att_usaha), bonus: String(rec.bonus_helper),
      } : { ...KOSONG }
    }
    setNilai(peta)
    setEdited(new Set())
    setMesej(null)
  }, [kitaranId, cawanganId, senaraiPelajar, penilaian])

  function set(id: string, sel: Sel, v: string) {
    setNilai((prev) => ({ ...prev, [id]: { ...prev[id], [sel]: v } }))
    setEdited((prev) => new Set(prev).add(id))
  }

  function hasil(id: string) {
    const b = nilai[id] ?? KOSONG
    const rt = ratingPelajar[id] ?? 1000
    const input: InputPenilaian = {
      theoryRaw: n(b.tr), theoryMax: n(b.tm), puzzleRaw: n(b.pr), puzzleMax: n(b.pm),
      clubPoints: n(b.club), tournamentPoints: n(b.tourn), sesiHadir: n(b.hadir), sesiJumlah: n(b.jumlah),
      attHormat: n(b.hormat), attFokus: n(b.fokus), attSportsmanship: n(b.sport), attUsaha: n(b.usaha),
      ratingMula: rt, ratingTamat: rt, bonusHelper: n(b.bonus),
    }
    return kiraPenilaian(input)
  }

  async function simpan(status: 'Draf' | 'Selesai') {
    const ids = [...edited]
    if (ids.length === 0) { setMesej('Tiada baris diubah.'); return }
    setLoading(true)
    const rows: InputSimpanPenilaian[] = ids.map((id) => {
      const b = nilai[id]
      const p = senaraiPelajar.find((x) => x.id === id)!
      const rt = ratingPelajar[id] ?? 1000
      const umur = umurDariTarikhLahir(p.tarikh_lahir)
      return {
        pelajar_id: id, kitaran_id: kitaranId, cawangan_id: p.cawangan_daftar_id,
        level_mula: n(b.level) || 1, band_umur: bandUmurDariUmur(umur),
        theory_raw: b.tr === '' ? null : n(b.tr), theory_max: b.tm === '' ? null : n(b.tm),
        puzzle_raw: b.pr === '' ? null : n(b.pr), puzzle_max: b.pm === '' ? null : n(b.pm),
        club_points: n(b.club), tournament_points: n(b.tourn), sesi_hadir: n(b.hadir), sesi_jumlah: n(b.jumlah),
        att_hormat: n(b.hormat), att_fokus: n(b.fokus), att_sportsmanship: n(b.sport), att_usaha: n(b.usaha),
        rating_mula: rt, rating_tamat: rt, bonus_helper: n(b.bonus), annotate_game: null, nota_coach: null, status,
      }
    })
    const r = await simpanBatch(rows)
    setLoading(false)
    if (r.ralat) { setMesej(r.ralat); return }
    setMesej(`${r.bil} rekod disimpan (${status}).`)
    setEdited(new Set())
    router.refresh()
  }

  const kol: { sel: Sel; label: string; w: number }[] = [
    { sel: 'level', label: 'Lvl', w: 44 }, { sel: 'tr', label: 'Th', w: 44 }, { sel: 'tm', label: '/Max', w: 44 },
    { sel: 'pr', label: 'Pz', w: 44 }, { sel: 'pm', label: '/Max', w: 44 }, { sel: 'club', label: 'Club', w: 44 },
    { sel: 'tourn', label: 'Trn', w: 44 }, { sel: 'hadir', label: 'Hdr', w: 44 }, { sel: 'jumlah', label: 'Jml', w: 44 },
    { sel: 'hormat', label: 'Hrm', w: 40 }, { sel: 'fokus', label: 'Fks', w: 40 }, { sel: 'sport', label: 'Spo', w: 40 },
    { sel: 'usaha', label: 'Ush', w: 40 }, { sel: 'bonus', label: 'Bns', w: 40 },
  ]

  return (
    <div style={{ maxWidth: '1100px', padding: '0 16px', paddingBottom: '80px' }}>
      <Link href="/penggredan" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '12px' }}>
        <ArrowLeft size={15} /> Penggredan
      </Link>
      <h1 style={{ fontSize: '21px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>Batch Entry (Level 1-6)</h1>
      <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '4px 0 14px' }}>Isi markah ramai pelajar sekali gus. Tab antara sel. Improvement guna rating pertandingan semasa (delta 0 dalam batch — perhalusi di borang penuh jika perlu).</p>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
        <select value={kitaranId} onChange={(e) => setKitaranId(e.target.value)} style={sel}>
          {kitaran.map((k) => <option key={k.id} value={k.id}>{k.nama}{k.status === 'Ditutup' ? ' (Ditutup)' : ''}</option>)}
        </select>
        <select value={cawanganId} onChange={(e) => setCawanganId(e.target.value)} style={sel}>
          {cawanganPilihan.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
        </select>
      </div>

      {senaraiPelajar.length === 0 ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '32px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>Tiada pelajar Aktif untuk cawangan ini.</div>
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', fontSize: '12px', minWidth: '820px' }}>
              <thead>
                <tr style={{ background: 'var(--bg)' }}>
                  <th style={{ ...th, position: 'sticky', left: 0, background: 'var(--bg)', minWidth: '150px', textAlign: 'left' }}>Nama</th>
                  {kol.map((c) => <th key={c.sel} style={th} title={c.sel}>{c.label}</th>)}
                  <th style={th}>Skor</th>
                  <th style={th}>Gred</th>
                </tr>
              </thead>
              <tbody>
                {senaraiPelajar.map((p) => {
                  const h = hasil(p.id)
                  const g = gredDariSkor(h.skorAkhir) as Gred
                  const b = nilai[p.id] ?? KOSONG
                  return (
                    <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ ...td, position: 'sticky', left: 0, background: 'var(--card)', fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>{p.nama_penuh}</td>
                      {kol.map((c) => (
                        <td key={c.sel} style={td}>
                          <input
                            value={b[c.sel]}
                            onChange={(e) => set(p.id, c.sel, e.target.value)}
                            disabled={dikunci}
                            inputMode="numeric"
                            style={{ width: `${c.w}px`, padding: '5px 4px', borderRadius: '6px', border: '1px solid var(--border)', background: dikunci ? 'var(--bg)' : 'var(--card)', color: 'var(--text)', fontSize: '12px', fontFamily: 'inherit', textAlign: 'center' }}
                          />
                        </td>
                      ))}
                      <td style={{ ...td, fontWeight: 700 }}>{h.skorAkhir}</td>
                      <td style={td}><span style={{ display: 'inline-block', minWidth: '20px', padding: '2px 5px', borderRadius: '5px', fontWeight: 700, background: WARNA_GRED[g].bg, color: WARNA_GRED[g].text }}>{g}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {mesej && <div style={{ marginTop: '12px', fontSize: '13px', fontWeight: 600, color: mesej.includes('Gagal') ? 'var(--tidak-hadir-text)' : 'var(--hadir-text)' }}>{mesej}</div>}

      {!dikunci && senaraiPelajar.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--card)', borderTop: '1px solid var(--border)', padding: '12px 16px', display: 'flex', gap: '10px', justifyContent: 'flex-end', zIndex: 20 }}>
          <span style={{ alignSelf: 'center', fontSize: '12px', color: 'var(--text-muted)', marginRight: 'auto' }}>{edited.size} baris diubah</span>
          <button onClick={() => simpan('Draf')} disabled={loading} style={{ ...btn, background: 'var(--card)', color: 'var(--text)', border: '1.5px solid var(--border)' }}>Simpan Draf</button>
          <button onClick={() => simpan('Selesai')} disabled={loading} style={{ ...btn, background: 'var(--accent)', color: 'var(--accent-text)', border: 'none' }}>
            {loading ? <Loader2 size={15} /> : <Save size={15} />} Simpan Semua (Selesai)
          </button>
        </div>
      )}
    </div>
  )
}

function str(v: number | null) { return v == null ? '' : String(v) }
const sel: React.CSSProperties = { padding: '9px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)', fontSize: '13px', fontFamily: 'inherit', fontWeight: 600 }
const th: React.CSSProperties = { padding: '9px 6px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '5px 6px', textAlign: 'center', verticalAlign: 'middle' }
const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '11px 18px', borderRadius: '11px', fontSize: '13.5px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
