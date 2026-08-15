import { NextResponse } from 'next/server'
import { bacaPendaftaranSheet } from '@/lib/google-sheets'
import { createClient } from '@/lib/supabase/server'

// WAJIB: guna Node runtime (google-auth-library perlu Node crypto) &
// sentiasa tarik segar dari sheet (jangan cache).
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function normNama(s: string): string {
  return s.trim().toUpperCase().replace(/\s+/g, ' ')
}

// Ambil digit sahaja, guna 8 digit terakhir (elak isu +60/0 & 2 nombor).
function kunciTelefon(s: string): string {
  const digit = (s.match(/\d/g) ?? []).join('')
  return digit.slice(-8)
}

export async function GET() {
  try {
    const [baris, supabase] = await Promise.all([
      bacaPendaftaranSheet(),
      createClient(),
    ])

    const { data: sediaAda } = await supabase
      .from('pelajar')
      .select('nama_penuh, no_telefon')

    // Set kunci pelajar sedia ada: 'NAMA|last8telefon'
    const set = new Set(
      (sediaAda ?? []).map(
        (p) => `${normNama(p.nama_penuh)}|${kunciTelefon(p.no_telefon ?? '')}`
      )
    )

    const rows = baris.map((b) => ({
      ...b,
      sudahDaftar: set.has(`${normNama(b.nama)}|${kunciTelefon(b.telefon)}`),
    }))

    return NextResponse.json({ rows })
  } catch (e) {
    const mesej =
      e instanceof Error ? e.message : 'Ralat tidak diketahui semasa baca sheet.'
    return NextResponse.json({ ralat: mesej }, { status: 500 })
  }
}
