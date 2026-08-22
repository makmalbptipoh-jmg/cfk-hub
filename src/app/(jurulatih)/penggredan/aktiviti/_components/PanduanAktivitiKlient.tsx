'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, Play, Square, ChevronDown, ChevronUp, ListChecks } from 'lucide-react'
import { AKTIVITI_LITTLE_PAWN, ITEM_CHECKLIST, type Aktiviti } from '@/lib/gradingLittlePawn'

function labelItem(key: string) {
  return ITEM_CHECKLIST.find((i) => i.key === key)?.label ?? key
}
function mmss(saat: number) {
  const m = Math.floor(saat / 60), s = saat % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function PanduanAktivitiKlient() {
  const [buka, setBuka] = useState<string | null>(null)

  return (
    <div style={{ maxWidth: '640px', padding: '0 16px', paddingBottom: '40px', margin: '0 auto' }}>
      <Link href="/penggredan" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '14px' }}>
        <ArrowLeft size={15} /> Penggredan
      </Link>
      <h1 style={{ fontSize: '21px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ListChecks size={20} /> Panduan Aktiviti
      </h1>
      <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '4px 0 18px' }}>8 aktiviti Little Pawn — buka untuk langkah, bahan &amp; tip coach.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {AKTIVITI_LITTLE_PAWN.map((a) => (
          <KadAktiviti key={a.id} a={a} terbuka={buka === a.id} toggle={() => setBuka(buka === a.id ? null : a.id)} />
        ))}
      </div>
    </div>
  )
}

function KadAktiviti({ a, terbuka, toggle }: { a: Aktiviti; terbuka: boolean; toggle: () => void }) {
  const [saat, setSaat] = useState<number | null>(null)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => () => { if (ref.current) clearInterval(ref.current) }, [])

  function mula() {
    if (ref.current) clearInterval(ref.current)
    setSaat(a.durasiMin * 60)
    ref.current = setInterval(() => {
      setSaat((prev) => {
        if (prev === null) return null
        if (prev <= 1) { if (ref.current) clearInterval(ref.current); return 0 }
        return prev - 1
      })
    }, 1000)
  }
  function henti() { if (ref.current) clearInterval(ref.current); setSaat(null) }

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
      <button onClick={toggle} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text)' }}>{a.id} · {a.nama}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Clock size={12} /> {a.durasiMin} min</span>
            {a.itemDicover.map((it) => <span key={it} style={chip}>{it}</span>)}
          </div>
        </div>
        {terbuka ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
      </button>

      {terbuka && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}><strong>Bahan:</strong> {a.bahan}</div>
          <ol style={{ margin: '0 0 12px', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {a.langkah.map((l, i) => <li key={i} style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.4 }}>{l}</li>)}
          </ol>
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '10px 12px', fontSize: '12.5px', color: '#92400E', marginBottom: '12px' }}>
            💡 {a.coachTip}
          </div>

          {/* Timer + mini-checklist item yang di-cover */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {saat === null ? (
              <button onClick={mula} style={btnMula}><Play size={15} /> Mula Aktiviti ({a.durasiMin} min)</button>
            ) : (
              <>
                <div style={{ fontSize: '22px', fontWeight: 800, color: saat === 0 ? 'var(--tidak-hadir-text)' : 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>{mmss(saat)}</div>
                <button onClick={henti} style={btnHenti}><Square size={13} /> Henti</button>
                {saat === 0 && <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--tidak-hadir-text)' }}>Masa tamat!</span>}
              </>
            )}
          </div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Tanda semasa aktiviti ini</div>
            {a.itemDicover.map((it) => (
              <div key={it} style={{ fontSize: '12.5px', color: 'var(--text)', marginBottom: '3px' }}>☐ {it} — {labelItem(it)}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const chip: React.CSSProperties = { fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '6px', background: 'var(--bg)', color: 'var(--text-muted)' }
const btnMula: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '10px', background: 'var(--accent)', color: 'var(--accent-text)', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
const btnHenti: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: '9px', background: 'var(--card)', color: 'var(--text)', border: '1.5px solid var(--border)', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }
