'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import { JADUAL_LITTLE_PAWN, aktivitiById, mingguSemasa } from '@/lib/gradingLittlePawn'

export function JadualLittlePawnKlient({ kitaranNama, tarikhMula }: { kitaranNama: string | null; tarikhMula: string | null }) {
  const semasa = tarikhMula ? mingguSemasa(tarikhMula) : 0
  const [pilih, setPilih] = useState<number>(semasa || 1)

  const jadualPilih = JADUAL_LITTLE_PAWN.find((j) => j.minggu === pilih)
  const aktA = jadualPilih ? aktivitiById(jadualPilih.aktivitiA) : undefined
  const aktB = jadualPilih ? aktivitiById(jadualPilih.aktivitiB) : undefined

  return (
    <div style={{ maxWidth: '640px', padding: '0 16px', paddingBottom: '40px', margin: '0 auto' }}>
      <Link href="/penggredan" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '14px' }}>
        <ArrowLeft size={15} /> Penggredan
      </Link>
      <h1 style={{ fontSize: '21px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <CalendarDays size={20} /> Jadual Kelas
      </h1>
      <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '4px 0 18px' }}>
        Program 12 minggu Little Pawn. {kitaranNama ? `Kitaran: ${kitaranNama}.` : 'Tiada kitaran dibuka.'} {semasa > 0 && `Minggu semasa: ${semasa}.`}
      </p>

      {/* Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '8px', marginBottom: '20px' }}>
        {JADUAL_LITTLE_PAWN.map((j) => {
          const ini = j.minggu === semasa
          const dipilih = j.minggu === pilih
          return (
            <button
              key={j.minggu}
              onClick={() => setPilih(j.minggu)}
              style={{
                padding: '10px 4px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit',
                border: dipilih ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: ini ? '#1E63D5' : 'var(--card)',
                color: ini ? '#FFF' : 'var(--text)',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 600, opacity: 0.7 }}>Minggu</div>
              <div style={{ fontSize: '17px', fontWeight: 800 }}>{j.minggu}</div>
              {ini && <div style={{ fontSize: '9px', fontWeight: 700, marginTop: '2px' }}>SEKARANG</div>}
            </button>
          )
        })}
      </div>

      {/* Detail minggu dipilih */}
      {jadualPilih && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '14px' }}>Minggu {jadualPilih.minggu}</div>
          {[{ tag: 'Aktiviti A', a: aktA }, { tag: 'Aktiviti B', a: aktB }].map(({ tag, a }) => (
            <div key={tag} style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{tag}</div>
              {a ? (
                <Link href="/penggredan/aktiviti" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '12px 14px', background: 'var(--bg)', borderRadius: '10px', textDecoration: 'none' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{a.id} · {a.nama}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>{a.durasiMin} min · {a.itemDicover.join(', ')}</div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)' }}>Buka →</span>
                </Link>
              ) : <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>—</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
