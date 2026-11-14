'use client'

import { useState } from 'react'
import { BookOpen, ListTree, UserCheck, UserCog } from 'lucide-react'
import type { Cawangan, TajukBesar, Subtajuk, ProgresBaris, ProgresPelajarBaris } from '@/lib/silibus'
import { SilibusIndukKlient } from './SilibusIndukKlient'
import { SilibusPelajarKlient, type Pelajar } from './SilibusPelajarKlient'
import { SilibusPersonalKlient } from './SilibusPersonalKlient'

export type TabSilibus = 'induk' | 'pelajar' | 'personal'

export function SilibusKlient({
  tabAwal,
  cawanganAwal,
  tajukAwal,
  subtajukAwal,
  progressAwal,
  pelajarAwal,
  progressPelajarAwal,
}: {
  tabAwal: TabSilibus
  cawanganAwal: Cawangan[]
  tajukAwal: TajukBesar[]
  subtajukAwal: Subtajuk[]
  progressAwal: ProgresBaris[]
  pelajarAwal: Pelajar[]
  progressPelajarAwal: ProgresPelajarBaris[]
}) {
  const [tab, setTab] = useState<TabSilibus>(tabAwal)

  const tabBtn = (aktif: boolean) => ({
    display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 16px', borderRadius: '10px',
    fontSize: '13px', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
    background: aktif ? 'var(--accent)' : 'transparent',
    color: aktif ? 'var(--accent-text)' : 'var(--text-muted)',
    border: `1.5px solid ${aktif ? 'var(--accent)' : 'var(--border)'}`,
  })

  return (
    <div style={{ maxWidth: '1180px' }}>
      {/* Header */}
      <div style={{ marginBottom: '18px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={20} style={{ color: 'var(--text-muted)' }} /> Silibus Kelas
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Kurikulum catur berstruktur (Tajuk Besar &rarr; Subtajuk), progress setiap cawangan &amp; setiap pelajar.
        </p>
      </div>

      {/* Tab */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '22px', flexWrap: 'wrap' }}>
        <button onClick={() => setTab('induk')} style={tabBtn(tab === 'induk')}>
          <ListTree size={15} /> Silibus Induk
        </button>
        <button onClick={() => setTab('pelajar')} style={tabBtn(tab === 'pelajar')}>
          <UserCheck size={15} /> Silibus Pelajar
        </button>
        <button onClick={() => setTab('personal')} style={tabBtn(tab === 'personal')}>
          <UserCog size={15} /> Silibus Personal
        </button>
      </div>

      {tab === 'induk' ? (
        <SilibusIndukKlient
          cawangan={cawanganAwal}
          tajukAwal={tajukAwal}
          subtajukAwal={subtajukAwal}
          progressAwal={progressAwal}
        />
      ) : tab === 'pelajar' ? (
        <SilibusPelajarKlient
          cawangan={cawanganAwal}
          pelajar={pelajarAwal}
          tajukAwal={tajukAwal}
          subtajukAwal={subtajukAwal}
          progressPelajarAwal={progressPelajarAwal}
        />
      ) : (
        <SilibusPersonalKlient
          cawangan={cawanganAwal}
          pelajar={pelajarAwal}
          tajukAwal={tajukAwal}
          subtajukAwal={subtajukAwal}
          progressPelajarAwal={progressPelajarAwal}
        />
      )}
    </div>
  )
}
