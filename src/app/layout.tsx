import type { Metadata, Viewport } from 'next'
import './globals.css'

const FONT_URL =
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap'

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
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ms" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={FONT_URL} rel="stylesheet" />
      </head>
      <body className="h-full">{children}</body>
    </html>
  )
}
