'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, Square, CalendarClock, Send } from 'lucide-react'
import {
  SESI_LITTLE_PAWN, WARNA_SLOT, JADUAL_LITTLE_PAWN, aktivitiById, mingguSemasa, type JenisSlot,
} from '@/lib/gradingLittlePawn'

const JUMLAH_SAAT = 90 * 60

function mmss(saat: number) {
  const m = Math.floor(saat / 60), s = saat % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
function chime() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AC()
    const osc = ctx.createOscillator(), gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = 880; osc.type = 'sine'
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5)
    osc.start(); osc.stop(ctx.currentTime + 0.5)
  } catch { /* senyap jika ditolak */ }
}

const LABEL_JENIS: Record<JenisSlot, string> = { ritual: 'Ritual', activity: 'Aktiviti', break: 'Rehat', assess: 'Nilai' }

export function PelanSesiKlient({ tarikhMula, cawanganNama }: { tarikhMula: string | null; cawanganNama: string | null }) {
  const minggu = tarikhMula ? mingguSemasa(tarikhMula) : 1
  const jadual = JADUAL_LITTLE_PAWN.find((j) => j.minggu === minggu)
  const aktA = jadual ? aktivitiById(jadual.aktivitiA) : undefined
  const aktB = jadual ? aktivitiById(jadual.aktivitiB) : undefined

  const [jalan, setJalan] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [tamat, setTamat] = useState(false)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)
  const slotRef = useRef<(HTMLDivElement | null)[]>([])
  const idxLepas = useRef<number>(-1)

  const menit = elapsed / 60
  const idxSemasa = jalan ? SESI_LITTLE_PAWN.findIndex((s) => menit >= s.mulaMin && menit < s.tamatMin) : -1
  const slotSemasa = idxSemasa >= 0 ? SESI_LITTLE_PAWN[idxSemasa] : null
  const bakiSlot = slotSemasa ? Math.max(0, Math.round((slotSemasa.tamatMin * 60) - elapsed)) : 0

  useEffect(() => () => { if (ref.current) clearInterval(ref.current) }, [])

  // Chime + auto-scroll bila tukar slot.
  useEffect(() => {
    if (!jalan || idxSemasa < 0) return
    if (idxLepas.current !== idxSemasa) {
      if (idxLepas.current !== -1) chime()
      idxLepas.current = idxSemasa
      slotRef.current[idxSemasa]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [idxSemasa, jalan])

  function mula() {
    setJalan(true); setTamat(false); setElapsed(0); idxLepas.current = -1
    if (ref.current) clearInterval(ref.current)
    ref.current = setInterval(() => {
      setElapsed((prev) => {
        if (prev + 1 >= JUMLAH_SAAT) { if (ref.current) clearInterval(ref.current); setJalan(false); setTamat(true); return JUMLAH_SAAT }
        return prev + 1
      })
    }, 1000)
  }
  function henti() { if (ref.current) clearInterval(ref.current); setJalan(false); setTamat(true) }
  function lompat(mulaMin: number) { setElapsed(mulaMin * 60) }

  if (tamat) {
    return <RingkasanSesi minggu={minggu} aktA={aktA?.nama} aktB={aktB?.nama} cawanganNama={cawanganNama} onSemula={() => { setTamat(false); setElapsed(0) }} />
  }

  return (
    <div style={{ maxWidth: '480px', padding: '0 16px', paddingBottom: '40px', margin: '0 auto' }}>
      <Link href="/penggredan" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '12px' }}>
        <ArrowLeft size={15} /> Penggredan
      </Link>

      {/* Header minggu */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 16px', marginBottom: '14px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Minggu {minggu}</div>
        <div style={{ fontSize: '13.5px', color: 'var(--text)', marginTop: '4px' }}>
          <strong>A:</strong> {aktA?.nama ?? '—'} · <strong>B:</strong> {aktB?.nama ?? '—'}
        </div>
      </div>

      {/* Timer utama */}
      <div style={{ position: 'sticky', top: '8px', zIndex: 5, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', marginBottom: '14px', textAlign: 'center' }}>
        {jalan ? (
          <>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{slotSemasa?.nama ?? 'Sesi'} · baki slot</div>
            <div style={{ fontSize: '40px', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{mmss(bakiSlot)}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>Sesi: {mmss(elapsed)} / 90:00</div>
            <button onClick={henti} style={{ ...btn, background: 'var(--tidak-hadir-bg)', color: 'var(--tidak-hadir-text)' }}><Square size={15} /> Tamat Sesi</button>
          </>
        ) : (
          <button onClick={mula} style={{ ...btn, background: 'var(--accent)', color: 'var(--accent-text)', fontSize: '15px' }}><Play size={17} /> Mula Sesi (90 min)</button>
        )}
      </div>

      {/* Slot */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {SESI_LITTLE_PAWN.map((slot, i) => {
          const aktif = i === idxSemasa
          const warna = WARNA_SLOT[slot.jenis]
          return (
            <div
              key={slot.slotNo}
              ref={(el) => { slotRef.current[i] = el }}
              onClick={() => jalan && lompat(slot.mulaMin)}
              style={{
                background: 'var(--card)', border: `2px solid ${aktif ? warna : 'var(--border)'}`,
                borderRadius: '12px', padding: '12px 14px', cursor: jalan ? 'pointer' : 'default',
                boxShadow: aktif ? `0 0 0 3px ${warna}22` : 'none', transition: 'border 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '58px', flexShrink: 0, fontSize: '15px', fontWeight: 800, color: warna }}>{slot.mulaMin}-{slot.tamatMin}<span style={{ fontSize: '9px', fontWeight: 600 }}> min</span></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{slot.nama}</span>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#FFF', background: warna, padding: '1px 6px', borderRadius: '6px' }}>{LABEL_JENIS[slot.jenis]}</span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>{slot.deskripsi}</div>
                </div>
              </div>
              {aktif && (slot.jenis === 'activity' || slot.jenis === 'assess') && (
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                  {slot.jenis === 'activity' && <Link href="/penggredan/aktiviti" style={miniBtn}>Buka Aktiviti</Link>}
                  {slot.jenis === 'assess' && <Link href="/penggredan" style={miniBtn}>Buka Checklist</Link>}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {jalan && <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>Tap mana-mana slot untuk lompat manual.</p>}
    </div>
  )
}

function RingkasanSesi({ minggu, aktA, aktB, cawanganNama, onSemula }: { minggu: number; aktA?: string; aktB?: string; cawanganNama: string | null; onSemula: () => void }) {
  const [hadir, setHadir] = useState('')
  const [nota, setNota] = useState('')

  const aktiviti = [aktA, aktB].filter(Boolean).join(' & ')
  const teks = `Hari ni belajar ${aktiviti || 'catur'}${nota ? `. ${nota}` : ''} — CFK${cawanganNama ? ` ${cawanganNama}` : ''}`
  const waHref = `https://wa.me/?text=${encodeURIComponent(teks)}`

  return (
    <div style={{ maxWidth: '480px', padding: '0 16px', paddingBottom: '40px', margin: '0 auto' }}>
      <Link href="/penggredan" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '12px' }}>
        <ArrowLeft size={15} /> Penggredan
      </Link>
      <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <CalendarClock size={20} /> Ringkasan Sesi
      </h1>
      <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '18px' }}>Minggu {minggu} · {aktiviti || '—'}</p>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Bilangan budak hadir</span>
          <input value={hadir} onChange={(e) => setHadir(e.target.value)} inputMode="numeric" placeholder="cth 8" style={inp} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Nota untuk parent (maks 140 aksara)</span>
          <textarea value={nota} onChange={(e) => setNota(e.target.value.slice(0, 140))} rows={3} style={{ ...inp, resize: 'vertical' }} />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right' }}>{nota.length}/140</span>
        </label>

        <div style={{ background: 'var(--bg)', borderRadius: '10px', padding: '10px 12px', fontSize: '12.5px', color: 'var(--text)' }}>{teks}</div>

        <a href={waHref} target="_blank" rel="noopener noreferrer" style={{ ...btn, background: '#25D366', color: '#FFF', textDecoration: 'none' }}>
          <Send size={15} /> Hantar ke Parent (WhatsApp)
        </a>
      </div>

      <button onClick={onSemula} style={{ ...btn, background: 'var(--card)', color: 'var(--text)', border: '1.5px solid var(--border)', marginTop: '12px' }}>Mula sesi baharu</button>
    </div>
  )
}

const btn: React.CSSProperties = { width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px', borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
const miniBtn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', padding: '7px 12px', borderRadius: '9px', background: 'var(--primary)', color: '#FFF', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }
const inp: React.CSSProperties = { width: '100%', padding: '9px 11px', borderRadius: '9px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)', fontSize: '13.5px', fontFamily: 'inherit' }
