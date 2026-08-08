import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/Toaster'

// Self-host fon (bukan <link> ke fonts.googleapis.com) — Next muat turun fon
// pada masa build & sajikan dari origin sama. Ini buang permintaan CSS pihak
// ketiga yang menyekat render (render-blocking) + preconnect, dan kurangkan
// anjakan susun atur (CLS) melalui metrik fon sandaran. Punca skor mudah alih.
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-jakarta',
})

export const metadata: Metadata = {
  title: 'CFK HUB',
  description: 'Sistem Pengurusan Catur Untuk Kanak-Kanak',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CFK HUB',
  },
  icons: {
    apple: '/icon-192.png',
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: '#1E293B',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ms" className={`h-full ${jakarta.variable}`}>
      <body className="h-full" suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
