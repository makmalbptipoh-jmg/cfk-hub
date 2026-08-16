'use client'

import Link from 'next/link'
import { Trophy, Plus, ChevronRight, Users, CheckCircle2, FileEdit } from 'lucide-react'

export type PertandinganRingkas = {
  id: string
  nama: string
  tarikh: string
  status: 'Draf' | 'Selesai'
  cawangan: string | null
  bilPeserta: number
  bilKeputusan: number
}

function formatTarikh(s: string) {
  return new Date(s).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function PertandinganListKlient({ senarai }: { senarai: PertandinganRingkas[] }) {
  return (
    <div style={{ maxWidth: '760px', padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={22} /> Pertandingan
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Jana template pemain untuk Swiss-Manager, proses result & rekod pencapaian pelajar.
          </p>
        </div>
        <Link
          href="/pertandingan/baharu"
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '10px 18px', background: 'var(--primary)',
            border: 'none', borderRadius: '12px', textDecoration: 'none',
            fontSize: '13.5px', fontWeight: 700, color: '#FFFFFF',
          }}
        >
          <Plus size={16} /> Baharu
        </Link>
      </div>

      {senarai.length === 0 ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '48px 24px', textAlign: 'center' }}>
          <Trophy size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 12px', display: 'block' }} />
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Belum ada pertandingan. Klik <strong>Baharu</strong> untuk mula.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {senarai.map((p) => (
            <Link
              key={p.id}
              href={`/pertandingan/${p.id}`}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: '14px', padding: '14px 16px', textDecoration: 'none',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>{p.nama}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <span>{formatTarikh(p.tarikh)}</span>
                  {p.cawangan && <span>· {p.cawangan}</span>}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Users size={12} /> {p.bilPeserta}</span>
                </div>
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px',
                background: p.status === 'Selesai' ? 'var(--hadir-bg)' : '#FFF7ED',
                color: p.status === 'Selesai' ? 'var(--hadir-text)' : '#C2410C',
                flexShrink: 0,
              }}>
                {p.status === 'Selesai' ? <CheckCircle2 size={12} /> : <FileEdit size={12} />}
                {p.status === 'Selesai' ? `${p.bilKeputusan} result` : 'Draf'}
              </span>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
