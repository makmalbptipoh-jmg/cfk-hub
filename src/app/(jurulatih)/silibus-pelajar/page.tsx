import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserX } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { JurulatihSilibusKlient } from './_components/JurulatihSilibusKlient'

export const dynamic = 'force-dynamic'

export default async function SilibusPelajarJurulatihPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: jurulatih } = await supabase
    .from('jurulatih')
    .select('id, nama_penuh, cawangan_ids')
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
          Minta admin kaitkan akaun anda dalam profil jurulatih (medan pengguna) untuk kemas kini silibus pelajar.
        </p>
        <Link href="/kehadiran" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}>
          ← Kembali ke Kehadiran
        </Link>
      </div>
    )
  }

  const [rCawangan, rTajuk, rSub, rPelajar, rProgress] = await Promise.all([
    supabase.from('cawangan').select('id, nama').eq('status', 'Aktif').order('nama'),
    supabase.from('silibus_tajuk').select('id, nama, susunan, nota, pautan, wajib, status').eq('wajib', true).eq('status', 'Aktif').order('susunan').order('nama'),
    supabase.from('silibus_subtajuk').select('id, tajuk_id, nama, susunan, fen, pgn_teks, pgn_path, pgn_nama, pgn_saiz, nota, pautan').order('susunan'),
    supabase.from('pelajar').select('id, nama_penuh, cawangan_daftar_id, jenis_kelas').eq('status', 'Aktif').order('nama_penuh'),
    supabase.from('silibus_progress_pelajar').select('id, subtajuk_id, pelajar_id, status'),
  ])

  return (
    <JurulatihSilibusKlient
      cawangan={rCawangan.data ?? []}
      cawanganSaya={jurulatih.cawangan_ids ?? []}
      tajukWajib={rTajuk.data ?? []}
      subtajuk={rSub.data ?? []}
      pelajar={rPelajar.data ?? []}
      progressAwal={rProgress.data ?? []}
    />
  )
}
