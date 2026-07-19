import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserX } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { BorangPelajarKlient } from './_components/BorangPelajarKlient'

export const dynamic = 'force-dynamic'

export default async function PelajarBaharuPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: profil }, { data: jurulatih }] = await Promise.all([
    supabase.from('pengguna_profil').select('is_admin').eq('id', user.id).single(),
    supabase
      .from('jurulatih')
      .select('id, cawangan_ids')
      .eq('pengguna_id', user.id)
      .maybeSingle(),
  ])

  const isAdmin = profil?.is_admin === true

  // RLS hanya benarkan admin ATAU jurulatih berpaut menambah pelajar.
  if (!isAdmin && !jurulatih) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
        <UserX size={36} style={{ color: 'var(--border)', margin: '0 auto 14px', display: 'block' }} />
        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
          Akaun belum dikaitkan dengan profil jurulatih
        </p>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Minta admin kaitkan akaun anda dalam profil jurulatih (medan pengguna)
          sebelum boleh daftar pelajar dari telefon.
        </p>
        <Link href="/kehadiran" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}>
          ← Kembali ke Kehadiran
        </Link>
      </div>
    )
  }

  // Cawangan untuk pilihan; pra-isi cawangan jurulatih jika ada.
  const { data: cawangan } = await supabase
    .from('cawangan')
    .select('id, nama')
    .eq('status', 'Aktif')
    .order('nama')

  const cawanganIds = jurulatih?.cawangan_ids ?? []
  const defaultCawanganId = cawanganIds.length > 0 ? cawanganIds[0] : ''

  return (
    <BorangPelajarKlient
      cawangan={cawangan ?? []}
      defaultCawanganId={defaultCawanganId}
    />
  )
}
