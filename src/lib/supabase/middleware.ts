import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Laluan awam yang TIDAK perlu maklumat auth — pulang SEGERA tanpa cipta
  // klien Supabase / round-trip getUser() (jimat TTFB → LCP lebih pantas).
  //  - /auth        : callback OAuth (kod belum jadi sesi)
  //  - /api/bayaran + /bayaran-selesai : callback ToyyibPay & page terima kasih
  if (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api/bayaran') ||
    pathname.startsWith('/bayaran-selesai')
  ) {
    return NextResponse.next({ request })
  }

  // /login untuk pelawat TANPA cookie auth Supabase = pasti belum log masuk →
  // sajikan terus tanpa panggil getUser() (TTFB pantas untuk halaman awam ini,
  // punca LCP mudah alih). Hanya bila ADA cookie kita sahkan — untuk redirect
  // pengguna yang sudah log masuk ke dashboard.
  const adaCookieAuth = request.cookies
    .getAll()
    .some((c) => c.name.startsWith('sb-') && c.name.includes('auth-token'))
  if (pathname.startsWith('/login') && !adaCookieAuth) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Halaman login (dengan cookie) — redirect ke dashboard jika sah log masuk
  if (pathname.startsWith('/login')) {
    if (user) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // Semua halaman lain perlu auth
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
