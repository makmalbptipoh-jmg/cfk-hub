'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, Megaphone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatTarikh, bulanTempatan } from '@/lib/utils'

type Rekod = {
  id: string
  jenis: 'Yuran' | 'Kelas' | 'Pertandingan' | 'Pembatalan'
  penerima: string
  teks: string
  created_at: string
  penghantar: { nama: string } | null
}

const JENIS = ['Yuran', 'Kelas', 'Pertandingan', 'Pembatalan'] as const

const WARNA_JENIS: Record<string, { bg: string; text: string }> = {
  Yuran: { bg: '#FEF3C7', text: '#92400E' },
  Kelas: { bg: '#DBEAFE', text: '#1E40AF' },
  Pertandingan: { bg: '#F3E8FF', text: '#6B21A8' },
  Pembatalan: { bg: '#FFE4E6', text: '#9F1239' },
}

function bulanSemasa() {
  return bulanTempatan()
}

export function HistoriMaklumanKlient({ isAdmin }: { isAdmin: boolean }) {
  const [bulan, setBulan] = useState(bulanSemasa())
  const [filterJenis, setFilterJenis] = useState('')
  const [senarai, setSenarai] = useState<Rekod[]>([])
  const [loading, setLoading] = useState(true)
  const [terbuka, setTerbuka] = useState<string | null>(null)

  const muatData = useCallback(async () => {
    setLoading(true)
    const [y, m] = bulan.split('-')
    // Sempadan bulan waktu Malaysia (+08:00) supaya rekod awal pagi 1 hb tidak
    // tercicir. created_at ialah timestamptz — offset eksplisit betul walau
    // zon masa sesi DB berlainan.
    const mn = +m
    const nextY = mn === 12 ? +y + 1 : +y
    const nextM = mn === 12 ? 1 : mn + 1
    const mula = `${y}-${m}-01T00:00:00+08:00`
    const akhir = `${nextY}-${String(nextM).padStart(2, '0')}-01T00:00:00+08:00`

    let q = createClient()
      .from('makluman_histori')
      .select('id, jenis, penerima, teks, created_at, penghantar:penghantar_id(nama)')
      .gte('created_at', mula)
      .lt('created_at', akhir)

    if (filterJenis) q = q.eq('jenis', filterJenis as Rekod['jenis'])

    const { data } = await q.order('created_at', { ascending: false }).limit(200)
    setSenarai((data ?? []) as unknown as Rekod[])
    setLoading(false)
  }, [bulan, filterJenis])

  useEffect(() => {
    muatData()
  }, [muatData])

  const gayaInput = {
    padding: '8px 12px',
    border: '1.5px solid var(--border)',
    borderRadius: '10px',
    fontSize: '13px',
    color: 'var(--text)',
    background: 'var(--card)',
    outline: 'none',
    fontFamily: 'inherit',
  }

  return (
    <div style={{ padding: '0 16px 16px' }}>
      <div style={{ marginBottom: '18px' }}>
        <Link href="/makluman" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>
          ← Kembali ke Makluman
        </Link>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>
          Histori Makluman
        </h1>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
          {isAdmin ? 'Semua makluman yang direkod' : 'Makluman yang anda hantar'}
        </p>
      </div>

      {/* Penapis */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <input type="month" value={bulan} onChange={(e) => setBulan(e.target.value)} style={gayaInput} />
        <select value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)} style={gayaInput}>
          <option value="">Semua Jenis</option>
          {JENIS.map((j) => (
            <option key={j} value={j}>{j}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>
          Memuatkan...
        </div>
      ) : senarai.length === 0 ? (
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '40px',
            textAlign: 'center',
          }}
        >
          <Megaphone size={30} style={{ color: 'var(--border)', margin: '0 auto 12px', display: 'block' }} />
          <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
            Tiada makluman bulan ini
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Rekod dicipta secara auto bila anda salin teks atau klik WA di page Makluman.
          </p>
        </div>
      ) : (
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            overflow: 'hidden',
          }}
        >
          {senarai.map((r, i) => {
            const w = WARNA_JENIS[r.jenis] ?? { bg: '#F1F5F9', text: '#475569' }
            const buka = terbuka === r.id
            return (
              <div key={r.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <button
                  onClick={() => setTerbuka(buka ? null : r.id)}
                  aria-expanded={buka}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 9px',
                          borderRadius: '20px',
                          fontWeight: 700,
                          background: w.bg,
                          color: w.text,
                        }}
                      >
                        {r.jenis}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.penerima}
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
                      {formatTarikh(r.created_at.slice(0, 10))}
                      {isAdmin && r.penghantar?.nama ? ` · oleh ${r.penghantar.nama}` : ''}
                    </div>
                  </div>
                  {buka ? (
                    <ChevronUp size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  ) : (
                    <ChevronDown size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  )}
                </button>
                {buka && (
                  <div
                    style={{
                      margin: '0 14px 12px',
                      padding: '12px 14px',
                      background: '#F8FAFC',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      fontSize: '12.5px',
                      color: 'var(--text)',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {r.teks}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
