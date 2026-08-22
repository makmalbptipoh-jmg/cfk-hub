'use client'

import Link from 'next/link'
import { ArrowLeft, Pencil, TrendingUp, Minus, History } from 'lucide-react'
import { WARNA_GRED } from '@/lib/grading'
import { BtnKadGredPDF, type PropsKadGred } from '@/components/pdf/BtnKadGredPDF'

export function KadPenilaianPreview({
  data, kitaranId, pelajarId, status,
}: {
  data: PropsKadGred
  kitaranId: string
  pelajarId: string
  status: 'Draf' | 'Selesai'
}) {
  const wg = WARNA_GRED[data.gred]
  const delta = data.ratingMula != null && data.ratingTamat != null ? data.ratingTamat - data.ratingMula : null

  return (
    <div style={{ maxWidth: '720px', padding: '0 16px', paddingBottom: '40px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
        <Link href="/penggredan" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none' }}>
          <ArrowLeft size={15} /> Penggredan
        </Link>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/penggredan/sejarah/${pelajarId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '9px 14px', background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '11px', fontSize: '13px', fontWeight: 600, color: 'var(--text)', textDecoration: 'none' }}>
            <History size={14} /> Sejarah
          </Link>
          <Link href={`/penggredan/nilai/${pelajarId}?kitaran=${kitaranId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '9px 14px', background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '11px', fontSize: '13px', fontWeight: 600, color: 'var(--text)', textDecoration: 'none' }}>
            <Pencil size={14} /> Edit
          </Link>
          <BtnKadGredPDF data={data} />
        </div>
      </div>

      {status === 'Draf' && (
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '9px 12px', fontSize: '12.5px', color: '#92400E', marginBottom: '14px' }}>
          Penilaian ini masih <strong>Draf</strong> — belum ditandakan Selesai.
        </div>
      )}

      {/* Kad laporan */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '18px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '16px', borderBottom: '2px solid var(--primary)', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-cfk.png" alt="CFK" style={{ height: '40px', width: 'auto' }} />
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary)' }}>CFK HUB</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Catur Untuk Kanak-Kanak</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary)' }}>Laporan Penggredan</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{data.kitaranNama}{data.cawangan ? ` · ${data.cawangan}` : ''}</div>
          </div>
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '12.5px', color: 'var(--text)', marginBottom: '18px' }}>
          <span><strong>Nama:</strong> {data.nama}</span>
          {data.umur != null && <span><strong>Umur:</strong> {data.umur} tahun</span>}
          <span><strong>Tahap Silibus:</strong> {data.levelNama}</span>
        </div>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '18px' }}>
          {/* Breakdown */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={tajukSeksyen}>Pecahan Markah</div>
            {[...data.komponen, { label: 'Bonus', nilai: data.bonus, penuh: 5 }].map((k) => (
              <div key={k.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ width: '84px', fontSize: '12px', color: 'var(--text-muted)' }}>{k.label}</div>
                <div style={{ flex: 1, height: '8px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (k.nilai / k.penuh) * 100)}%`, height: '100%', background: wg.solid, borderRadius: '4px' }} />
                </div>
                <div style={{ width: '52px', fontSize: '12px', fontWeight: 700, color: 'var(--text)', textAlign: 'right' }}>{k.nilai}/{k.penuh}</div>
              </div>
            ))}
          </div>

          {/* Bulatan gred */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '120px' }}>
            <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: wg.bg, border: `4px solid ${wg.solid}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '30px', fontWeight: 800, color: wg.text, lineHeight: 1 }}>{data.gred}</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: wg.text }}>{data.skorAkhir}/105</div>
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: wg.text, marginTop: '6px' }}>{data.labelGred}</div>
          </div>
        </div>

        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: data.naikLevel ? 'var(--hadir-bg)' : 'var(--bg)', borderLeft: `3px solid ${data.naikLevel ? '#84CC16' : '#94A3B8'}`, borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
          {data.naikLevel ? <TrendingUp size={16} color="#166534" /> : <Minus size={16} color="#475569" />}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: data.naikLevel ? 'var(--hadir-text)' : 'var(--text)' }}>
              {data.naikLevel ? `NAIK KE ${data.levelBaru}` : `KEKAL DI ${data.levelNama}`}
            </div>
            {delta != null && (
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Rating Pertandingan: {data.ratingMula} → {data.ratingTamat} ({delta >= 0 ? '+' : ''}{delta})</div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <div style={tajukSeksyen}>Komen Coach</div>
          <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.5, margin: 0 }}>{data.komenCoach || '—'}</p>
        </div>
        <div>
          <div style={tajukSeksyen}>Fokus 3 Bulan Akan Datang</div>
          <p style={{ fontSize: '13px', color: 'var(--text)', margin: 0 }}>Beri perhatian lebih pada: <strong>{data.fokus}</strong>.</p>
        </div>
      </div>
    </div>
  )
}

const tajukSeksyen: React.CSSProperties = {
  fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px',
}
