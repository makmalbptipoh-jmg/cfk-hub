'use client'

import type { TitikGraf } from '@/lib/pertandingan'

// Graf garis ringan (SVG inline, tiada dependency) untuk progres rating
// merentas pertandingan. Papar garis + titik + label tarikh + paksi-Y.
export function GrafProgres({ siri, warna = '#7C3AED', tinggi = 160 }: {
  siri: TitikGraf[]
  warna?: string
  tinggi?: number
}) {
  if (!siri || siri.length < 2) return null

  const W = 340
  const H = tinggi
  const padL = 30, padR = 12, padT = 16, padB = 26
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  const nilai = siri.map((s) => s.nilai)
  let minY = Math.min(...nilai)
  let maxY = Math.max(...nilai)
  if (minY === maxY) { minY -= 10; maxY += 10 }
  const buffer = (maxY - minY) * 0.15
  minY -= buffer; maxY += buffer
  const range = maxY - minY || 1

  const X = (i: number) => padL + (i / (siri.length - 1)) * plotW
  const Y = (v: number) => padT + plotH - ((v - minY) / range) * plotH

  const titik = siri.map((s, i) => `${X(i)},${Y(s.nilai)}`).join(' ')
  const banyak = siri.length > 8
  const langkahLabel = banyak ? Math.ceil(siri.length / 6) : 1

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} role="img" aria-label="Graf progres rating pertandingan">
      {[maxY, (minY + maxY) / 2, minY].map((v, i) => {
        const y = Y(v)
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#E2E8F0" strokeWidth={1} />
            <text x={padL - 6} y={y + 3} textAnchor="end" fontSize={9} fill="#94A3B8">{Math.round(v)}</text>
          </g>
        )
      })}

      <polyline points={`${padL},${padT + plotH} ${titik} ${W - padR},${padT + plotH}`} fill={warna} opacity={0.08} stroke="none" />
      <polyline points={titik} fill="none" stroke={warna} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

      {siri.map((s, i) => (
        <g key={i}>
          <circle cx={X(i)} cy={Y(s.nilai)} r={3} fill={warna} />
          {!banyak && <text x={X(i)} y={Y(s.nilai) - 8} textAnchor="middle" fontSize={9} fontWeight={700} fill="#334155">{Math.round(s.nilai)}</text>}
          {(i === 0 || i === siri.length - 1 || i % langkahLabel === 0) && (
            <text x={X(i)} y={H - 8} textAnchor="middle" fontSize={8} fill="#94A3B8">{s.label}</text>
          )}
        </g>
      ))}
    </svg>
  )
}
