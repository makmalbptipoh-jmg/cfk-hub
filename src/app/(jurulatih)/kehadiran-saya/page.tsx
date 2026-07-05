import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserX } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { KehadiranSayaKlient } from './_components/KehadiranSayaKlient'

export const dynamic = 'force-dynamic'

export default async function KehadiranSayaPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: jurulatih } = await supabase
    .from('jurulatih')
    .select('id, nama_penuh, kadar_bayaran, cawangan_ids')
    .eq('pengguna_id', user.id)
    .maybeSingle()

  if (!jurulatih) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
        <UserX size={36} style={{ color: 'var(--border)', margin: '0 auto 14px', display: 'block' }} />
        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
          Akaun belum dikaitkan dengan profil jurulatih
        </p>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Minta admin kaitkan akaun anda dalam profil jurulatih (medan pengguna),
          atau jika anda admin, guna page kehadiran dalam profil jurulatih.
        </p>
        <Link href="/kehadiran" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}>
          ← Kembali ke Kehadiran
        </Link>
      </div>
    )
  }

  // Senarai cawangan jurulatih (untuk pilihan semasa rekod); fallback semua cawangan aktif
  let q = supabase.from('cawangan').select('id, nama').eq('status', 'Aktif').order('nama')
  if ((jurulatih.cawangan_ids ?? []).length > 0) q = q.in('id', jurulatih.cawangan_ids)
  const { data: cawangan } = await q

  return (
    <KehadiranSayaKlient
      jurulatihId={jurulatih.id}
      nama={jurulatih.nama_penuh}
      kadarBayaran={jurulatih.kadar_bayaran}
      cawangan={cawangan ?? []}
    />
  )
}
