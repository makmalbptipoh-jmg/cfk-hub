'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Receipt, UserRound } from 'lucide-react'
import { BorangYuran } from './BorangYuran'
import { BorangSesiPersonal } from './BorangSesiPersonal'

type Mod = 'yuran' | 'personal'

export function BorangHub({ modAwal }: { modAwal: Mod }) {
  const [mod, setMod] = useState<Mod>(modAwal)

  return (
    <div style={{ maxWidth: '620px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '20px' }}>
        <Link href="/bayaran" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>
          ← Senarai Resit
        </Link>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>
          Rekod Bayaran Baharu
        </h1>
      </div>

      {/* Togol jenis borang */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {([
          { mod: 'yuran' as Mod, label: 'Yuran Bulanan', sub: 'Kumpulan · Personal · Pendaftaran', Icon: Receipt },
          { mod: 'personal' as Mod, label: 'Sesi Kelas Personal', sub: 'Kehadiran + resit serentak', Icon: UserRound },
        ]).map((t) => {
          const aktif = mod === t.mod
          return (
            <button
              key={t.mod}
              type="button"
              onClick={() => setMod(t.mod)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left',
                padding: '13px 16px', borderRadius: '14px', cursor: 'pointer', fontFamily: 'inherit',
                border: `2px solid ${aktif ? 'var(--accent)' : 'var(--border)'}`,
                background: aktif ? '#F7FEE7' : 'var(--card)',
              }}
            >
              <t.Icon size={18} style={{ color: aktif ? 'var(--accent-dark)' : 'var(--text-muted)', flexShrink: 0 }} />
              <span>
                <span style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: aktif ? 'var(--accent-dark)' : 'var(--text)' }}>
                  {t.label}
                </span>
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
                  {t.sub}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {mod === 'yuran' ? <BorangYuran /> : <BorangSesiPersonal />}
    </div>
  )
}
