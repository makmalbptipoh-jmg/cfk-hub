'use client'

import { useState } from 'react'
import { ClipboardCheck, SearchCheck } from 'lucide-react'

interface Props {
  rekodView: React.ReactNode
  semakView: React.ReactNode
}

export function KehadiranAdminTabs({ rekodView, semakView }: Props) {
  const [tab, setTab] = useState<'rekod' | 'semak'>('rekod')

  const gayaTab = (aktif: boolean) => ({
    display: 'flex' as const, alignItems: 'center' as const, gap: '6px',
    padding: '9px 18px', borderRadius: '20px',
    border: `1.5px solid ${aktif ? 'var(--accent)' : 'var(--border)'}`,
    background: aktif ? 'var(--accent)' : 'var(--card)',
    color: aktif ? 'var(--accent-text)' : 'var(--text-muted)',
    fontSize: '13px', fontWeight: aktif ? 700 : 500,
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.15s',
  })

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', padding: '16px 28px 0' }}>
        <button onClick={() => setTab('rekod')} style={gayaTab(tab === 'rekod')}>
          <ClipboardCheck size={14} />
          Rekod Kehadiran
        </button>
        <button onClick={() => setTab('semak')} style={gayaTab(tab === 'semak')}>
          <SearchCheck size={14} />
          Semak & Edit
        </button>
      </div>
      <div style={{ display: tab === 'rekod' ? 'block' : 'none' }}>{rekodView}</div>
      <div style={{ display: tab === 'semak' ? 'block' : 'none' }}>{semakView}</div>
    </div>
  )
}
