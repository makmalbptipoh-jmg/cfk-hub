'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  email: z.string().email('Format e-mel tidak sah'),
  password: z.string().min(6, 'Kata laluan sekurang-kurangnya 6 aksara'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [authError, setAuthError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

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
          <div
            style={{
              fontSize: '48px',
              lineHeight: 1,
              marginBottom: '12px',
              color: '#FFC94D',
            }}
          >
            {'♟︎'}
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

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
              autoComplete="email"
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
              autoComplete="current-password"
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
      </div>
    </div>
  )
}
