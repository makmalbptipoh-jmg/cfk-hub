'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Tempoh tidak aktif sebelum log keluar automatik (keselamatan peranti kongsi).
const TEMPOH_IDLE_MS = 30 * 60 * 1000 // 30 minit
const TEMPOH_AMARAN_MS = 60 * 1000 // amaran 60 saat sebelum log keluar

export function AutoLogout() {
  const router = useRouter()
  const [amaran, setAmaran] = useState(false)
  const [kiraDetik, setKiraDetik] = useState(60)
  const amaranRef = useRef(false)

  const pemasaAmaran = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pemasaLogout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pemasaDetik = useRef<ReturnType<typeof setInterval> | null>(null)

  const logKeluar = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }, [router])

  const bersihkanSemua = useCallback(() => {
    if (pemasaAmaran.current) clearTimeout(pemasaAmaran.current)
    if (pemasaLogout.current) clearTimeout(pemasaLogout.current)
    if (pemasaDetik.current) clearInterval(pemasaDetik.current)
  }, [])

  const mulaKira = useCallback(() => {
    bersihkanSemua()
    amaranRef.current = false
    setAmaran(false)
    // Papar amaran 60 saat sebelum tamat
    pemasaAmaran.current = setTimeout(() => {
      amaranRef.current = true
      setAmaran(true)
      setKiraDetik(Math.round(TEMPOH_AMARAN_MS / 1000))
      pemasaDetik.current = setInterval(() => {
        setKiraDetik((d) => (d > 0 ? d - 1 : 0))
      }, 1000)
    }, TEMPOH_IDLE_MS - TEMPOH_AMARAN_MS)
    pemasaLogout.current = setTimeout(logKeluar, TEMPOH_IDLE_MS)
  }, [bersihkanSemua, logKeluar])

  useEffect(() => {
    const acara = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']
    let throttle = false
    const semulakan = () => {
      // Jangan reset ketika amaran sedang dipapar — pengguna mesti klik butang
      if (throttle || amaranRef.current) return
      throttle = true
      setTimeout(() => (throttle = false), 2000)
      mulaKira()
    }
    acara.forEach((a) => window.addEventListener(a, semulakan, { passive: true }))
    mulaKira()
    return () => {
      acara.forEach((a) => window.removeEventListener(a, semulakan))
      bersihkanSemua()
    }
  }, [mulaKira, bersihkanSemua])

  const kekalLogMasuk = () => {
    mulaKira()
  }

  if (!amaran) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Amaran log keluar automatik"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '360px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 48px rgba(0,0,0,0.25)',
        }}
      >
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
          Anda akan dilog keluar
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '18px' }}>
          Tiada aktiviti dikesan. Sesi anda akan ditamatkan dalam{' '}
          <strong style={{ color: '#EF4444' }}>{kiraDetik} saat</strong> untuk keselamatan.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={logKeluar}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '10px',
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Log Keluar
          </button>
          <button
            onClick={kekalLogMasuk}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '10px',
              background: 'var(--accent, #65A30D)',
              border: 'none',
              color: 'var(--accent-text, #fff)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Kekal Log Masuk
          </button>
        </div>
      </div>
    </div>
  )
}
