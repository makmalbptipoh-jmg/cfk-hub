'use client'

import Link from 'next/link'
import { ArrowLeft, Pencil, Star } from 'lucide-react'
import { BtnKadLittlePawn, type PropsKadLP } from '@/components/pdf/BtnKadLittlePawn'

const WARNA_STATUS = ['#CBD5E1', '#F5C400', '#84CC16']

export function KadLittlePawnPreview({
  data, kitaranId, pelajarId, status,
}: {
  data: PropsKadLP
  kitaranId: string
  pelajarId: string
  status: 'Draf' | 'Selesai'
}) {
  const kumpulan = ['Kenal', 'Gerak', 'Main']
  return (
    <div style={{ maxWidth: '640px', padding: '0 16px', paddingBottom: '40px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
        <Link href="/penggredan" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none' }}>
          <ArrowLeft size={15} /> Penggredan
        </Link>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link href={`/penggredan/little-pawn/${pelajarId}?kitaran=${kitaranId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '9px 14px', background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '11px', fontSize: '13px', fontWeight: 600, color: 'var(--text)', textDecoration: 'none' }}>
            <Pencil size={14} /> Edit
          </Link>
          <BtnKadLittlePawn data={data} />
        </div>
      </div>

      {status === 'Draf' && (
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '9px 12px', fontSize: '12.5px', color: '#92400E', marginBottom: '14px' }}>
          Checklist ini masih <strong>Draf</strong>.
        </div>
      )}

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '18px', padding: '24px', textAlign: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-cfk.png" alt="CFK" style={{ height: '40px', width: 'auto', marginBottom: '10px' }} />
        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>{data.nama}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>{data.cawangan ? `${data.cawangan} · ` : ''}{data.kitaranNama} · Little Pawn</div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '20px' }}>
          {[1, 2, 3].map((b) => <Star key={b} size={30} fill={b <= data.bintang ? '#F5C400' : 'none'} color={b <= data.bintang ? '#F5C400' : 'var(--border)'} />)}
        </div>

        {kumpulan.map((grp) => (
          <div key={grp} style={{ marginBottom: '14px', textAlign: 'left' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{grp}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
              {data.items.filter((it) => it.kumpulan === grp).map((it, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: WARNA_STATUS[it.nilai] ?? '#CBD5E1', flexShrink: 0 }} />
                  <span style={{ fontSize: '12.5px', color: 'var(--text)' }}>{it.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ textAlign: 'left', marginTop: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Kata Coach</div>
          <p style={{ fontSize: '13px', color: 'var(--text)', margin: '0 0 14px' }}>{data.notaCoach || '—'}</p>
          {data.fokus.length > 0 && (
            <>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Fokus Bulan Depan</div>
              {data.fokus.map((f, i) => (
                <p key={i} style={{ fontSize: '13px', color: 'var(--text)', margin: '0 0 4px' }}>• {f.label}{f.aktiviti ? ` — cuba: ${f.aktiviti}` : ''}</p>
              ))}
            </>
          )}
        </div>

        {data.graduasi && (
          <div style={{ marginTop: '16px', background: 'var(--hadir-bg)', borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--hadir-text)' }}>
            🎉 Graduasi — sedia naik Pawn! Muat turun sijil di atas.
          </div>
        )}
      </div>
    </div>
  )
}
