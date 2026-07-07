'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { tandaDibaca, tandaSemuaDibaca } from '@/app/actions/notifikasi'

type Rekod = {
  id: string
  jenis: string
  tajuk: string
  mesej: string
  pautan: string | null
  dibaca: boolean
  created_at: string
}

export default function NotifikasiPage() {
  const [senarai, setSenarai] = useState<Rekod[]>([])
  const [tapis, setTapis] = useState<'semua' | 'belum'>('semua')
  const [memuat, setMemuat] = useState(true)

  const muat = useCallback(async () => {
    setMemuat(true)
    let q = createClient()
      .from('notifikasi')
      .select('id, jenis, tajuk, mesej, pautan, dibaca, created_at')
      .order('created_at', { ascending: false })
      .limit(200)
    if (tapis === 'belum') q = q.eq('dibaca', false)
    const { data } = await q
    setSenarai((data ?? []) as Rekod[])
    setMemuat(false)
  }, [tapis])

  useEffect(() => {
    muat()
  }, [muat])

  const tandai = async (id: string) => {
    setSenarai((s) => s.map((x) => (x.id === id ? { ...x, dibaca: true } : x)))
    await tandaDibaca(id)
    if (tapis === 'belum') muat()
  }

  const semua = async () => {
    setSenarai((s) => s.map((x) => ({ ...x, dibaca: true })))
    await tandaSemuaDibaca()
    if (tapis === 'belum') muat()
  }

  const belumDibaca = senarai.filter((n) => !n.dibaca).length

  return (
    <div style={{ maxWidth: '760px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        <Bell size={20} style={{ color: 'var(--text)' }} />
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>
          Notifikasi
        </h1>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
        Sejarah amaran operasi automatik (cth. pelajar belum bayar).
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {(['semua', 'belum'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTapis(t)}
            style={{
              padding: '7px 14px',
              borderRadius: '9px',
              border: '1px solid var(--border)',
              background: tapis === t ? 'var(--accent, #65A30D)' : 'var(--card)',
              color: tapis === t ? 'var(--accent-text, #fff)' : 'var(--text)',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {t === 'semua' ? 'Semua' : `Belum dibaca${belumDibaca > 0 ? ` (${belumDibaca})` : ''}`}
          </button>
        ))}
        {belumDibaca > 0 && (
          <button
            onClick={semua}
            style={{
              marginLeft: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '7px 14px',
              borderRadius: '9px',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <CheckCheck size={14} />
            Tandai semua dibaca
          </button>
        )}
      </div>

      {memuat ? (
        <div style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>Memuat…</div>
      ) : senarai.length === 0 ? (
        <div
          style={{
            padding: '48px 20px',
            textAlign: 'center',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            color: 'var(--text-muted)',
            fontSize: '13px',
          }}
        >
          Tiada notifikasi. Semua terkawal 👍
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {senarai.map((n) => (
            <div
              key={n.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '14px 16px',
                background: n.dibaca ? 'var(--card)' : 'var(--hadir-bg, #F0FDF4)',
                border: `1px solid ${n.dibaca ? 'var(--border)' : '#BBF7D0'}`,
                borderRadius: '14px',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px' }}>
                  {!n.dibaca && (
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />
                  )}
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>{n.tajuk}</span>
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text)', opacity: 0.85, lineHeight: 1.45 }}>{n.mesej}</div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '7px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {new Intl.DateTimeFormat('ms-MY', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(new Date(n.created_at))}
                  </span>
                  {n.pautan && (
                    <Link
                      href={n.pautan}
                      onClick={() => !n.dibaca && tandai(n.id)}
                      style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--accent, #65A30D)' }}
                    >
                      Lihat →
                    </Link>
                  )}
                  {!n.dibaca && (
                    <button
                      onClick={() => tandai(n.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        padding: 0,
                      }}
                    >
                      Tandai dibaca
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
