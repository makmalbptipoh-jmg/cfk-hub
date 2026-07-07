import type { NextConfig } from 'next'
import withPWAInit from '@ducanh2912/next-pwa'
import { withSentryConfig } from '@sentry/nextjs'

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  // Pastikan service worker baharu terus aktif selepas deploy —
  // elak cache chunk JS lama (punca butang PDF gagal senyap)
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
  },
})

const SUPABASE_HOST = 'https://jfkmfmjsqbwcgzxiyees.supabase.co'
const SUPABASE_WS = 'wss://jfkmfmjsqbwcgzxiyees.supabase.co'

// unsafe-inline diperlukan: Next.js inline bootstrap script + inline style dalam komponen
const csp = [
  `default-src 'self'`,
  // wasm-unsafe-eval: @react-pdf/renderer guna enjin layout Yoga (WebAssembly) —
  // tanpa ini semua butang jana PDF gagal senyap di production
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `font-src 'self' https://fonts.gstatic.com`,
  // Supabase host: gambar profil jurulatih & bukti dari Storage (signed URL)
  `img-src 'self' data: blob: ${SUPABASE_HOST}`,
  // *.sentry.io: pemantauan ralat (client SDK hantar ke ingest Sentry)
  `connect-src 'self' ${SUPABASE_HOST} ${SUPABASE_WS} https://fonts.googleapis.com https://fonts.gstatic.com https://*.sentry.io`,
  `worker-src 'self' blob:`,
  `frame-src 'self' blob:`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'self'`,
].join('; ')

const nextConfig: NextConfig = {
  turbopack: {},
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
        ],
      },
    ]
  },
}

export default withSentryConfig(withPWA(nextConfig), {
  silent: true,
  telemetry: false,
  // Jangan muat naik source map (perlu SENTRY_AUTH_TOKEN) — elak kegagalan build
  sourcemaps: { disable: true },
})
