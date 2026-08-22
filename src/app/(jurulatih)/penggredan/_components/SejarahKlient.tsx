'use client'

import Link from 'next/link'
import { ArrowLeft, TrendingUp, History } from 'lucide-react'
import { GrafProgres } from '@/components/GrafProgres'

export type TitikSejarah = { label: string; nilai: number; sub: string }
export type NaikRekod = { kitaran: string; ke: string }

export function SejarahKlient({ nama, skorSiri, ratingSiri, naik }: {
  nama: string
  skorSiri: TitikSejarah[]
  ratingSiri: TitikSejarah[]
  naik: NaikRekod[]
}) {
  const adaData = skorSiri.length > 0 || ratingSiri.length > 0

  return (
    <div style={{ maxWidth: '640px', padding: '0 16px', paddingBottom: '40px', margin: '0 auto' }}>
      <Link href="/penggredan" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '14px' }}>
        <ArrowLeft size={15} /> Penggredan
      </Link>
      <h1 style={{ fontSize: '21px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <History size={20} /> Sejarah Progress
      </h1>
      <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '4px 0 18px' }}>{nama}</p>

      {!adaData ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '40px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Belum ada rekod penilaian Level 1-6 untuk pelajar ini.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Kad tajuk="Final Score (setiap kitaran)">
            {skorSiri.length >= 2 ? <GrafProgres siri={skorSiri} warna="#84CC16" /> : <SatuTitik siri={skorSiri} unit="skor" />}
          </Kad>
          <Kad tajuk="Rating Pertandingan (setiap kitaran)">
            {ratingSiri.length >= 2 ? <GrafProgres siri={ratingSiri} warna="#2563EB" /> : <SatuTitik siri={ratingSiri} unit="rating" />}
          </Kad>
          <Kad tajuk="Timeline Naik Level">
            {naik.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Belum naik level.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {naik.map((n, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text)' }}>
                    <TrendingUp size={15} color="#166534" />
                    <span><strong>{n.kitaran}</strong> — naik ke {n.ke}</span>
                  </div>
                ))}
              </div>
            )}
          </Kad>
        </div>
      )}
    </div>
  )
}

function Kad({ tajuk, children }: { tajuk: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px 18px' }}>
      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>{tajuk}</div>
      {children}
    </div>
  )
}

function SatuTitik({ siri, unit }: { siri: TitikSejarah[]; unit: string }) {
  if (siri.length === 0) return <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Tiada data.</p>
  const t = siri[0]
  return <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>1 kitaran sahaja ({t.label}): {unit} <strong style={{ color: 'var(--text)' }}>{t.nilai}</strong>. Graf muncul selepas 2+ kitaran.</p>
}
