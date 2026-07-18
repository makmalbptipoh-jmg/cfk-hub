'use client'

import { Suspense, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  email: z.string().email('Format e-mel tidak sah'),
  password: z.string().min(6, 'Kata laluan sekurang-kurangnya 6 aksara'),
})

type FormData = z.infer<typeof schema>

const MESEJ_RALAT_CALLBACK: Record<string, string> = {
  tiada_akaun:
    'Akaun Google ini tidak berdaftar dalam CFK HUB. Sila hubungi Admin untuk pendaftaran.',
  google_gagal:
    'Log masuk dengan Google gagal. Sila cuba lagi atau log masuk dengan kata laluan.',
}

function LogoGoogle() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const ralatCallback = searchParams.get('ralat')

  const [authError, setAuthError] = useState<string | null>(
    MESEJ_RALAT_CALLBACK[ralatCallback ?? ''] ?? null
  )
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [tunjukKataLaluan, setTunjukKataLaluan] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const logMasukGoogle = async () => {
    setGoogleLoading(true)
    setAuthError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: 'select_account' },
      },
    })

    if (error) {
      setAuthError('Log masuk dengan Google gagal. Sila cuba lagi.')
      setGoogleLoading(false)
    }
    // Jika berjaya, pelayar akan dibawa ke Google — tiada apa lagi perlu dibuat
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setAuthError(null)

    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setAuthError('E-mel atau kata laluan salah. Sila cuba lagi.')
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    const { data: profil } = await supabase
      .from('pengguna_profil')
      .select('is_admin, nama')
      .single()

    // Rekod log masuk untuk audit (jangan halang navigasi jika gagal)
    if (user) {
      await supabase.from('log_aktiviti').insert({
        aksi: 'Log Masuk',
        jadual: 'auth',
        pengguna_id: user.id,
        pengguna_nama: profil?.nama ?? user.email ?? null,
      })
    }

    if (profil?.is_admin) {
      router.push('/dashboard')
    } else {
      router.push('/kehadiran')
    }
  }

  return (
    <div
      style={{ background: 'var(--bg)', minHeight: '100vh' }}
      className="flex items-center justify-center p-4"
    >
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          width: '100%',
          maxWidth: '400px',
          padding: '40px 36px',
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-cfk.png" alt="Logo Chess For Kids" style={{ height: '88px', width: 'auto', display: 'block' }} />
          </div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--primary)',
              letterSpacing: '-0.5px',
            }}
          >
            CFK HUB
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Sistem Pengurusan Catur
          </p>
        </div>

        {/* Auth Error */}
        {authError && (
          <div
            style={{
              background: '#FFF1F2',
              border: '1px solid #FECDD3',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#9F1239',
            }}
          >
            {authError}
          </div>
        )}

        {/* Butang Google — cara utama */}
        <button
          type="button"
          onClick={logMasukGoogle}
          disabled={googleLoading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '12px',
            background: '#FFFFFF',
            color: '#1F2937',
            border: '1.5px solid var(--border)',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: googleLoading ? 'not-allowed' : 'pointer',
            opacity: googleLoading ? 0.7 : 1,
            transition: 'background 0.15s',
            fontFamily: 'inherit',
          }}
        >
          <LogoGoogle />
          {googleLoading ? 'Membuka Google...' : 'Log Masuk dengan Google'}
        </button>

        {/* Pembahagi */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '20px 0',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>atau</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        {!tunjukKataLaluan ? (
          <button
            type="button"
            onClick={() => setTunjukKataLaluan(true)}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              padding: '4px',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--primary)',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Log masuk dengan kata laluan
          </button>
        ) : (
          <>
            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
              {/* Email */}
              <div style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="email"
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  E-mel
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="off"
                  placeholder="nama@email.com"
                  {...register('email')}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: errors.email
                      ? '1.5px solid #EF4444'
                      : '1.5px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '13.5px',
                    color: 'var(--text)',
                    background: 'var(--card)',
                    outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                />
                {errors.email && (
                  <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div style={{ marginBottom: '24px' }}>
                <label
                  htmlFor="password"
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Kata Laluan
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  {...register('password')}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: errors.password
                      ? '1.5px solid #EF4444'
                      : '1.5px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '13.5px',
                    color: 'var(--text)',
                    background: 'var(--card)',
                    outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                />
                {errors.password && (
                  <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: loading ? '#94A3B8' : 'var(--accent)',
                  color: 'var(--accent-text)',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s',
                  fontFamily: 'inherit',
                }}
              >
                {loading ? 'Sedang masuk...' : 'Log Masuk'}
              </button>
            </form>

            {/* Help */}
            <p
              style={{
                textAlign: 'center',
                fontSize: '12px',
                color: 'var(--text-muted)',
                marginTop: '20px',
              }}
            >
              Terlupa kata laluan?{' '}
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Hubungi Admin.</span>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}
