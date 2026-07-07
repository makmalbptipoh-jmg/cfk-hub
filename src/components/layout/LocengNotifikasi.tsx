'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck } from 'lucide-react'
import {
  janaDanMuatNotifikasi,
  tandaDibaca,
  tandaSemuaDibaca,
  type Notifikasi,
} from '@/app/actions/notifikasi'

function masaLalu(iso: string): string {
  const saat = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (saat < 60) return 'baru sahaja'
  const minit = Math.floor(saat / 60)
  if (minit < 60) return `${minit} minit lalu`
  const jam = Math.floor(minit / 60)
  if (jam < 24) return `${jam} jam lalu`
  const hari = Math.floor(jam / 24)
  if (hari < 30) return `${hari} hari lalu`
  return new Intl.DateTimeFormat('ms-MY', { day: 'numeric', month: 'short' }).format(new Date(iso))
}

export function LocengNotifikasi() {
  const router = useRouter()
  const [buka, setBuka] = useState(false)
  const [senarai, setSenarai] = useState<Notifikasi[]>([])
  const [belumDibaca, setBelumDibaca] = useState(0)
  const [memuat, setMemuat] = useState(false)
  const bekasRef = useRef<HTMLDivElement>(null)

  const muat = useCallback(async () => {
    setMemuat(true)
    try {
      const { senarai, belumDibaca } = await janaDanMuatNotifikasi()
      setSenarai(senarai)
      setBelumDibaca(belumDibaca)
    } finally {
      setMemuat(false)
    }
  }, [])

  // Muat pada mula + setiap 5 minit
  useEffect(() => {
    muat()
    const id = setInterval(muat, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [muat])

  // Tutup bila klik di luar
  useEffect(() => {
    if (!buka) return
    const kendali = (e: MouseEvent) => {
      if (bekasRef.current && !bekasRef.current.contains(e.target as Node)) setBuka(false)
    }
    document.addEventListener('mousedown', kendali)
    return () => document.removeEventListener('mousedown', kendali)
  }, [buka])

  const bukaPanel = () => {
    const akan = !buka
    setBuka(akan)
    if (akan) muat()
  }

  const klikItem = async (n: Notifikasi) => {
    setBuka(false)
    if (!n.dibaca) {
      setSenarai((s) => s.map((x) => (x.id === n.id ? { ...x, dibaca: true } : x)))
      setBelumDibaca((b) => Math.max(0, b - 1))
      await tandaDibaca(n.id)
    }
    if (n.pautan) router.push(n.pautan)
  }

  const semuaDibaca = async () => {
    setSenarai((s) => s.map((x) => ({ ...x, dibaca: true })))
    setBelumDibaca(0)
    await tandaSemuaDibaca()
  }

  return (
    <div ref={bekasRef} style={{ position: 'relative' }}>
      <button
        onClick={bukaPanel}
        aria-label={`Notifikasi${belumDibaca > 0 ? ` (${belumDibaca} belum dibaca)` : ''}`}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '34px',
          height: '32px',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '9px',
          color: 'var(--text)',
          cursor: 'pointer',
        }}
      >
        <Bell size={15} />
        {belumDibaca > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              minWidth: '17px',
              height: '17px',
              padding: '0 4px',
              background: '#EF4444',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 700,
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            {belumDibaca > 99 ? '99+' : belumDibaca}
          </span>
        )}
      </button>

      {buka && (
        <div
          role="dialog"
          aria-label="Senarai notifikasi"
          style={{
            position: 'absolute',
            top: '40px',
            right: 0,
            width: 'min(340px, 90vw)',
            maxHeight: '440px',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.14)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>Notifikasi</span>
            {belumDibaca > 0 && (
              <button
                onClick={semuaDibaca}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent, #65A30D)',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <CheckCheck size={13} />
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {memuat && senarai.length === 0 ? (
              <div style={{ padding: '28px 14px', textAlign: 'center', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Memuat…
              </div>
            ) : senarai.length === 0 ? (
              <div style={{ padding: '28px 14px', textAlign: 'center', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Tiada notifikasi. Semua terkawal 👍
              </div>
            ) : (
              senarai.map((n) => (
                <button
                  key={n.id}
                  onClick={() => klikItem(n)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '11px 14px',
                    background: n.dibaca ? 'transparent' : 'var(--hadir-bg, #F0FDF4)',
                    border: 'none',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px' }}>
                    {!n.dibaca && (
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />
                    )}
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text)' }}>{n.tajuk}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text)', opacity: 0.85, lineHeight: 1.4 }}>{n.mesej}</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '4px' }}>{masaLalu(n.created_at)}</div>
                </button>
              ))
            )}
          </div>

          <button
            onClick={() => {
              setBuka(false)
              router.push('/notifikasi')
            }}
            style={{
              padding: '11px 14px',
              background: 'var(--card)',
              border: 'none',
              borderTop: '1px solid var(--border)',
              color: 'var(--text)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Lihat semua sejarah notifikasi
          </button>
        </div>
      )}
    </div>
  )
}
