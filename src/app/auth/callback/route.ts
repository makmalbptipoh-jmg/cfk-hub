import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const errorDesc = searchParams.get('error_description') ?? ''

  // Vercel di belakang proxy — guna x-forwarded-host untuk URL sebenar
  const forwardedHost = request.headers.get('x-forwarded-host')
  const baseUrl =
    process.env.NODE_ENV === 'development'
      ? origin
      : forwardedHost
        ? `https://${forwardedHost}`
        : origin

  // Ralat dari Supabase/Google (cth. signup disekat, pengguna batal)
  if (!code) {
    const sebab = errorDesc.toLowerCase().includes('signups not allowed')
      ? 'tiada_akaun'
      : 'google_gagal'
    return NextResponse.redirect(`${baseUrl}/login?ralat=${sebab}`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(`${baseUrl}/login?ralat=google_gagal`)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(`${baseUrl}/login?ralat=google_gagal`)
  }

  // Pertahanan kedua: akaun Google tanpa profil CFK → log keluar serta-merta
  const { data: profil } = await supabase
    .from('pengguna_profil')
    .select('is_admin, nama')
    .eq('id', user.id)
    .maybeSingle()

  if (!profil) {
    await supabase.auth.signOut()
    return NextResponse.redirect(`${baseUrl}/login?ralat=tiada_akaun`)
  }

  // Rekod log masuk untuk audit (jangan halang navigasi jika gagal)
  await supabase.from('log_aktiviti').insert({
    aksi: 'Log Masuk',
    jadual: 'auth',
    pengguna_id: user.id,
    pengguna_nama: profil.nama ?? user.email ?? null,
  })

  return NextResponse.redirect(
    `${baseUrl}${profil.is_admin ? '/dashboard' : '/kehadiran'}`
  )
}
