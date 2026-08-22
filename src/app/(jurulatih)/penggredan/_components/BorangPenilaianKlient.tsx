'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'
import {
  kiraPenilaian, tarafGred, WARNA_GRED, LABEL_GRED, type BandUmur, type InputPenilaian,
} from '@/lib/grading'
import { simpanPenilaian } from '@/app/actions/penggredan'
import type { Database } from '@/types/database'

type Sedia = Database['public']['Tables']['gred_penilaian']['Row']
type Kitaran = { id: string; nama: string; tarikh_mula: string; tarikh_tamat: string; status: 'Dibuka' | 'Ditutup' }

type Props = {
  pelajar: { id: string; nama_penuh: string; umur: number | null; cawangan_daftar_id: string }
  kitaran: Kitaran
  bandUmur: BandUmur
  hadirAuto: number
  jumlahAuto: number
  ratingMulaAuto: number
  ratingTamatAuto: number
  sedia: Sedia | null
}

const LABEL_BAND: Record<BandUmur, string> = {
  junior: 'Junior (6-8) — Penilaian Lisan',
  inter: 'Inter (9-12) — Written pendek + notation',
  senior: 'Senior (13-18) — Written penuh + annotate game',
}

function num(v: string): number { const n = parseFloat(v); return Number.isFinite(n) ? n : 0 }

export function BorangPenilaianKlient({
  pelajar, kitaran, bandUmur, hadirAuto, jumlahAuto, ratingMulaAuto, ratingTamatAuto, sedia,
}: Props) {
  const router = useRouter()
  const dikunci = kitaran.status === 'Ditutup'

  const [levelMula, setLevelMula] = useState(String(sedia?.level_mula ?? 1))
  const [theoryRaw, setTheoryRaw] = useState(sedia?.theory_raw != null ? String(sedia.theory_raw) : '')
  const [theoryMax, setTheoryMax] = useState(sedia?.theory_max != null ? String(sedia.theory_max) : '')
  const [puzzleRaw, setPuzzleRaw] = useState(sedia?.puzzle_raw != null ? String(sedia.puzzle_raw) : '')
  const [puzzleMax, setPuzzleMax] = useState(sedia?.puzzle_max != null ? String(sedia.puzzle_max) : '')
  const [clubPoints, setClubPoints] = useState(String(sedia?.club_points ?? 0))
  const [tournamentPoints, setTournamentPoints] = useState(String(sedia?.tournament_points ?? 0))
  const [sesiHadir, setSesiHadir] = useState(String(sedia?.sesi_hadir ?? hadirAuto))
  const [sesiJumlah, setSesiJumlah] = useState(String(sedia?.sesi_jumlah ?? jumlahAuto))
  const [attHormat, setAttHormat] = useState(sedia?.att_hormat ?? 0)
  const [attFokus, setAttFokus] = useState(sedia?.att_fokus ?? 0)
  const [attSportsmanship, setAttSportsmanship] = useState(sedia?.att_sportsmanship ?? 0)
  const [attUsaha, setAttUsaha] = useState(sedia?.att_usaha ?? 0)
  const [ratingMula] = useState(sedia?.rating_mula ?? ratingMulaAuto)
  const [ratingTamat] = useState(sedia?.rating_tamat ?? ratingTamatAuto)
  const [bonusHelper, setBonusHelper] = useState(String(sedia?.bonus_helper ?? 0))
  const [annotateGame, setAnnotateGame] = useState(sedia?.annotate_game ?? '')
  const [notaCoach, setNotaCoach] = useState(sedia?.nota_coach ?? '')

  const [simpanStatus, setSimpanStatus] = useState<'idle' | 'menyimpan' | 'tersimpan' | 'ralat'>('idle')
  const [ralat, setRalat] = useState<string | null>(null)
  const [selesaiLoading, setSelesaiLoading] = useState(false)

  const input: InputPenilaian = {
    theoryRaw: num(theoryRaw), theoryMax: num(theoryMax),
    puzzleRaw: num(puzzleRaw), puzzleMax: num(puzzleMax),
    clubPoints: num(clubPoints), tournamentPoints: num(tournamentPoints),
    sesiHadir: num(sesiHadir), sesiJumlah: num(sesiJumlah),
    attHormat, attFokus, attSportsmanship, attUsaha,
    ratingMula, ratingTamat, bonusHelper: num(bonusHelper),
  }
  const hasil = kiraPenilaian(input)
  const taraf = tarafGred(num(levelMula))

  const bina = useCallback((status: 'Draf' | 'Selesai') => ({
    pelajar_id: pelajar.id,
    kitaran_id: kitaran.id,
    cawangan_id: pelajar.cawangan_daftar_id,
    level_mula: num(levelMula),
    band_umur: bandUmur,
    theory_raw: theoryRaw === '' ? null : num(theoryRaw),
    theory_max: theoryMax === '' ? null : num(theoryMax),
    puzzle_raw: puzzleRaw === '' ? null : num(puzzleRaw),
    puzzle_max: puzzleMax === '' ? null : num(puzzleMax),
    club_points: num(clubPoints),
    tournament_points: num(tournamentPoints),
    sesi_hadir: num(sesiHadir),
    sesi_jumlah: num(sesiJumlah),
    att_hormat: attHormat, att_fokus: attFokus, att_sportsmanship: attSportsmanship, att_usaha: attUsaha,
    rating_mula: ratingMula, rating_tamat: ratingTamat,
    bonus_helper: num(bonusHelper),
    annotate_game: annotateGame.trim() || null,
    nota_coach: notaCoach.trim() || null,
    status,
  }), [pelajar, kitaran, levelMula, bandUmur, theoryRaw, theoryMax, puzzleRaw, puzzleMax, clubPoints, tournamentPoints, sesiHadir, sesiJumlah, attHormat, attFokus, attSportsmanship, attUsaha, ratingMula, ratingTamat, bonusHelper, annotateGame, notaCoach])

  // Auto-save draf (debounce). Skip render pertama & bila dikunci.
  const pertamaKali = useRef(true)
  const snapshot = JSON.stringify(bina('Draf'))
  useEffect(() => {
    if (dikunci) return
    if (pertamaKali.current) { pertamaKali.current = false; return }
    setSimpanStatus('menyimpan')
    const t = setTimeout(async () => {
      const r = await simpanPenilaian(bina('Draf'))
      if (r.ralat) { setSimpanStatus('ralat'); setRalat(r.ralat) }
      else { setSimpanStatus('tersimpan'); setRalat(null) }
    }, 900)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot, dikunci])

  async function simpanSelesai() {
    setSelesaiLoading(true)
    const r = await simpanPenilaian(bina('Selesai'))
    setSelesaiLoading(false)
    if (r.ralat) { setRalat(r.ralat); return }
    router.push('/penggredan')
  }

  return (
    <div style={{ maxWidth: '820px', padding: '0 16px', paddingBottom: '40px' }}>
      <Link href="/penggredan" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '14px' }}>
        <ArrowLeft size={15} /> Penggredan
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
        <div>
          <h1 style={{ fontSize: '21px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>{pelajar.nama_penuh}</h1>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
            {kitaran.nama} · {pelajar.umur != null ? `${pelajar.umur} tahun · ` : ''}Tahap Silibus: {taraf.ikon} {taraf.nama}
          </p>
        </div>
        <IndikatorSimpan status={simpanStatus} dikunci={dikunci} />
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '18px' }}>{LABEL_BAND[bandUmur]}</div>

      {dikunci && (
        <div style={{ ...kotakAmaran, background: '#F1F5F9', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          Kitaran <strong>Ditutup</strong> — borang baca sahaja.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: '16px' }}>
        {/* Input */}
        <fieldset disabled={dikunci} style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Seksyen tajuk="Tahap Silibus">
            <Baris label="Level semasa (1-6)">
              <select value={levelMula} onChange={(e) => setLevelMula(e.target.value)} style={gayaInput}>
                {[1, 2, 3, 4, 5, 6].map((l) => <option key={l} value={l}>{tarafGred(l).nama} (Level {l})</option>)}
              </select>
            </Baris>
          </Seksyen>

          <Seksyen tajuk="Theory (25) & Puzzles (20)">
            <div style={gridDua}>
              <Baris label="Theory betul"><input value={theoryRaw} onChange={(e) => setTheoryRaw(e.target.value)} inputMode="decimal" style={gayaInput} /></Baris>
              <Baris label="Theory penuh"><input value={theoryMax} onChange={(e) => setTheoryMax(e.target.value)} inputMode="decimal" style={gayaInput} /></Baris>
              <Baris label="Puzzle betul"><input value={puzzleRaw} onChange={(e) => setPuzzleRaw(e.target.value)} inputMode="decimal" style={gayaInput} /></Baris>
              <Baris label="Puzzle penuh"><input value={puzzleMax} onChange={(e) => setPuzzleMax(e.target.value)} inputMode="decimal" style={gayaInput} /></Baris>
            </div>
          </Seksyen>

          <Seksyen tajuk="Practical (25)">
            <div style={gridDua}>
              <Baris label="Club points (0-15)"><input value={clubPoints} onChange={(e) => setClubPoints(e.target.value)} inputMode="numeric" style={gayaInput} /></Baris>
              <Baris label="Tournament points (0-10)"><input value={tournamentPoints} onChange={(e) => setTournamentPoints(e.target.value)} inputMode="numeric" style={gayaInput} /></Baris>
            </div>
            <p style={helpTeks}>Tournament points dicadang auto dari modul Pertandingan — boleh ubah untuk acara luar.</p>
          </Seksyen>

          <Seksyen tajuk="Kehadiran (10)">
            <div style={gridDua}>
              <Baris label="Sesi hadir"><input value={sesiHadir} onChange={(e) => setSesiHadir(e.target.value)} inputMode="numeric" style={gayaInput} /></Baris>
              <Baris label="Sesi jumlah"><input value={sesiJumlah} onChange={(e) => setSesiJumlah(e.target.value)} inputMode="numeric" style={gayaInput} /></Baris>
            </div>
            <p style={helpTeks}>Auto dari sistem kehadiran ({hadirAuto}/{jumlahAuto}) — boleh betulkan.</p>
          </Seksyen>

          <Seksyen tajuk="Sikap (10) — skala 0-5 setiap satu">
            <Skala label="Hormat" nilai={attHormat} set={setAttHormat} />
            <Skala label="Fokus" nilai={attFokus} set={setAttFokus} />
            <Skala label="Sportsmanship" nilai={attSportsmanship} set={setAttSportsmanship} />
            <Skala label="Usaha" nilai={attUsaha} set={setAttUsaha} />
          </Seksyen>

          <Seksyen tajuk="Improvement (10) — auto dari Rating Pertandingan">
            <div style={{ display: 'flex', gap: '18px', fontSize: '13px', color: 'var(--text)' }}>
              <div>Rating mula: <strong>{ratingMula}</strong></div>
              <div>Rating tamat: <strong>{ratingTamat}</strong></div>
              <div>Delta: <strong>{ratingTamat - ratingMula >= 0 ? '+' : ''}{ratingTamat - ratingMula}</strong></div>
            </div>
            <p style={helpTeks}>Diambil dari keputusan pertandingan pelajar — tak perlu isi manual.</p>
          </Seksyen>

          <Seksyen tajuk="Bonus & Nota">
            <Baris label="Helper bonus (0-5) — tolong ajar level bawah"><input value={bonusHelper} onChange={(e) => setBonusHelper(e.target.value)} inputMode="numeric" style={gayaInput} /></Baris>
            {bandUmur === 'senior' && (
              <Baris label="Annotate game sendiri (senior)"><textarea value={annotateGame} onChange={(e) => setAnnotateGame(e.target.value)} rows={3} style={{ ...gayaInput, resize: 'vertical' }} /></Baris>
            )}
            <Baris label="Komen coach"><textarea value={notaCoach} onChange={(e) => setNotaCoach(e.target.value)} rows={3} style={{ ...gayaInput, resize: 'vertical' }} /></Baris>
          </Seksyen>
        </fieldset>

        {/* Preview langsung */}
        <PreviewSkor hasil={hasil} />

        {ralat && <div style={{ ...kotakAmaran, background: 'var(--tidak-hadir-bg)', borderColor: '#FECACA', color: 'var(--tidak-hadir-text)' }}>{ralat}</div>}

        {!dikunci && (
          <button onClick={simpanSelesai} disabled={selesaiLoading} style={gayaBtnSelesai}>
            {selesaiLoading ? <Loader2 size={16} className="spin" /> : <CheckCircle2 size={16} />}
            Tandakan Selesai
          </button>
        )}
      </div>
    </div>
  )
}

function IndikatorSimpan({ status, dikunci }: { status: 'idle' | 'menyimpan' | 'tersimpan' | 'ralat'; dikunci: boolean }) {
  if (dikunci) return null
  const peta = {
    idle: { ikon: <Save size={13} />, teks: 'Draf auto-simpan', warna: 'var(--text-muted)' },
    menyimpan: { ikon: <Loader2 size={13} />, teks: 'Menyimpan…', warna: 'var(--text-muted)' },
    tersimpan: { ikon: <CheckCircle2 size={13} />, teks: 'Draf tersimpan', warna: 'var(--hadir-text)' },
    ralat: { ikon: <AlertTriangle size={13} />, teks: 'Gagal simpan', warna: 'var(--tidak-hadir-text)' },
  }[status]
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, color: peta.warna }}>{peta.ikon}{peta.teks}</span>
}

function PreviewSkor({ hasil }: { hasil: ReturnType<typeof kiraPenilaian> }) {
  const wg = WARNA_GRED[hasil.gred]
  const komponen = [
    { label: 'Theory', nilai: hasil.skorTheory, penuh: 25 },
    { label: 'Puzzle', nilai: hasil.skorPuzzle, penuh: 20 },
    { label: 'Practical', nilai: hasil.skorPractical, penuh: 25 },
    { label: 'Kehadiran', nilai: hasil.skorKehadiran, penuh: 10 },
    { label: 'Sikap', nilai: hasil.skorSikap, penuh: 10 },
    { label: 'Improvement', nilai: hasil.skorImprovement, penuh: 10 },
    { label: 'Bonus', nilai: hasil.bonus, penuh: 5 },
  ]
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px', position: 'sticky', bottom: '0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <div style={{ width: '78px', height: '78px', borderRadius: '50%', background: wg.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `3px solid ${wg.solid}`, flexShrink: 0 }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: wg.text, lineHeight: 1 }}>{hasil.gred}</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: wg.text }}>{hasil.skorAkhir}</div>
        </div>
        <div style={{ flex: 1, minWidth: '160px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{LABEL_GRED[hasil.gred]} · {hasil.skorAkhir}/105</div>
          {hasil.naikLevel ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--hadir-text)', background: 'var(--hadir-bg)', padding: '4px 10px', borderRadius: '20px' }}>
              <CheckCircle2 size={13} /> Layak NAIK LEVEL
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--tidak-hadir-text)', background: 'var(--tidak-hadir-bg)', padding: '6px 10px', borderRadius: '10px' }}>
              <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: '1px' }} /> {hasil.sebabTakNaik}
            </div>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
        {komponen.map((k) => (
          <div key={k.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '80px', fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }}>{k.label}</div>
            <div style={{ flex: 1, height: '8px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (k.nilai / k.penuh) * 100)}%`, height: '100%', background: wg.solid, borderRadius: '4px' }} />
            </div>
            <div style={{ width: '54px', fontSize: '12px', fontWeight: 600, color: 'var(--text)', textAlign: 'right', flexShrink: 0 }}>{k.nilai}/{k.penuh}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Seksyen({ tajuk, children }: { tajuk: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px' }}>
      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>{tajuk}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{children}</div>
    </div>
  )
}

function Baris({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{label}</span>
      {children}
    </label>
  )
}

function Skala({ label, nilai, set }: { label: string; nilai: number; set: (n: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ width: '110px', fontSize: '12.5px', color: 'var(--text)', flexShrink: 0 }}>{label}</div>
      <div style={{ display: 'flex', gap: '5px' }}>
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => set(n)} style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid var(--border)', background: nilai === n ? 'var(--primary)' : 'var(--card)', color: nilai === n ? '#FFF' : 'var(--text-muted)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{n}</button>
        ))}
      </div>
    </div>
  )
}

const gayaInput: React.CSSProperties = {
  width: '100%', padding: '9px 11px', borderRadius: '9px', border: '1px solid var(--border)',
  background: 'var(--card)', color: 'var(--text)', fontSize: '13.5px', fontFamily: 'inherit',
}
const gridDua: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }
const helpTeks: React.CSSProperties = { fontSize: '11.5px', color: 'var(--text-muted)', margin: '2px 0 0' }
const kotakAmaran: React.CSSProperties = { border: '1px solid', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', marginBottom: '4px' }
const gayaBtnSelesai: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px 20px',
  borderRadius: '12px', background: 'var(--accent)', color: 'var(--accent-text)', border: 'none',
  fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
}
