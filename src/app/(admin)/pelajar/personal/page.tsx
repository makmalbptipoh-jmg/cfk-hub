import Link from 'next/link'
import { ArrowLeft, UserRound, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatTarikh } from '@/lib/utils'
import { kiraPakejPersonal, type StatusPakej } from '@/lib/pakejPersonal'

export const dynamic = 'force-dynamic'

type Status = 'Cukup' | 'Hampir' | 'OK' | 'TiadaPakej'

const WARNA_STATUS: Record<Status, { bg: string; text: string; label: string }> = {
  Cukup: { bg: '#FEE2E2', text: '#DC2626', label: 'CUKUP — kutip bayaran' },
  Hampir: { bg: '#FEF3C7', text: '#92400E', label: 'Tinggal 1 kelas' },
  OK: { bg: 'var(--hadir-bg)', text: 'var(--hadir-text)', label: 'OK' },
  TiadaPakej: { bg: '#F1F5F9', text: '#64748B', label: 'Belum ada pakej' },
}

function statusPakej(s: StatusPakej): Status {
  if (s.kredit === 0) return 'TiadaPakej'
  if (s.baki <= 0) return 'Cukup'
  if (s.baki === 1) return 'Hampir'
  return 'OK'
}

export default async function PantauanPersonalPage() {
  const supabase = await createClient()

  const { data: pelajarPersonal } = await supabase
    .from('pelajar')
    .select('id, nama_penuh, no_telefon, jenis_kelas, cawangan:cawangan_daftar_id(nama)')
    .in('jenis_kelas', ['Personal', 'Kumpulan+Personal'])
    .eq('status', 'Aktif')
    .order('nama_penuh')

  const ids = (pelajarPersonal ?? []).map((p) => p.id)
  const [{ data: resitPakej }, { data: kehadiran }] = await Promise.all([
    ids.length > 0
      ? supabase
          .from('resit')
          .select('pelajar_id, bil_kelas, tarikh_bayar')
          .in('pelajar_id', ids)
          .eq('jenis', 'Personal')
          .eq('status', 'Aktif')
          .not('bil_kelas', 'is', null)
      : Promise.resolve({ data: [] as { pelajar_id: string; bil_kelas: number | null; tarikh_bayar: string }[] }),
    ids.length > 0
      ? supabase
          .from('kehadiran')
          .select('pelajar_id, tarikh, nota')
          .in('pelajar_id', ids)
          .eq('status', 'Hadir')
      : Promise.resolve({ data: [] as { pelajar_id: string; tarikh: string; nota: string | null }[] }),
  ])

  const pakej = kiraPakejPersonal(pelajarPersonal ?? [], resitPakej ?? [], kehadiran ?? [])

  const baris = (pelajarPersonal ?? []).map((p: any) => {
    const s = pakej.get(p.id) ?? { kredit: 0, digunakan: 0, baki: 0, tarikhPakejPertama: null, tarikhSesiTerakhir: null }
    return { ...p, cawangan_nama: p.cawangan?.nama ?? '—', pakej: s, status: statusPakej(s) }
  })
  // Susun: Cukup dulu, kemudian Hampir, OK, TiadaPakej
  const susunan: Status[] = ['Cukup', 'Hampir', 'OK', 'TiadaPakej']
  baris.sort((a, b) => susunan.indexOf(a.status) - susunan.indexOf(b.status) || a.nama_penuh.localeCompare(b.nama_penuh))

  const bilCukup = baris.filter((b) => b.status === 'Cukup').length

  return (
    <div style={{ maxWidth: '1000px' }}>
      <Link href="/pelajar" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '14px' }}>
        <ArrowLeft size={14} /> Kembali ke Pelajar
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '9px' }}>
            <UserRound size={20} /> Pantauan Kelas Personal
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Baki pakej prabayar setiap pelajar personal — setiap kehadiran tolak 1 kelas
          </p>
        </div>
        {bilCukup > 0 && (
          <span style={{ fontSize: '13px', fontWeight: 800, padding: '8px 16px', borderRadius: '12px', background: '#FEE2E2', color: '#DC2626' }}>
            {bilCukup} pelajar perlu bayar semula
          </span>
        )}
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
        {baris.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', fontSize: '13.5px', color: 'var(--text-muted)' }}>
            Tiada pelajar kelas personal yang aktif.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                  {['Pelajar', 'Cawangan', 'Pakej', 'Sesi Terakhir', 'Status', 'Tindakan'].map((h, hi) => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: hi === 5 ? 'right' : 'left', fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {baris.map((b, i) => {
                  const w = WARNA_STATUS[b.status as Status]
                  const noTel = (b.no_telefon ?? '').replace(/\D/g, '').replace(/^0/, '60')
                  const msgWA = encodeURIComponent(
                    `Assalamualaikum, pakej kelas personal ${b.nama_penuh} sudah digunakan sepenuhnya (${b.pakej.digunakan}/${b.pakej.kredit}). Sila perbaharui pakej untuk kelas seterusnya. Terima kasih. 🙏`
                  )
                  return (
                    <tr key={b.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                      <td style={{ padding: '11px 14px' }}>
                        <Link href={`/pelajar/${b.id}`} style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', textDecoration: 'none' }}>
                          {b.nama_penuh}
                        </Link>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>{b.jenis_kelas}</div>
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '13px', color: 'var(--text-muted)' }}>{b.cawangan_nama}</td>
                      <td style={{ padding: '11px 14px', minWidth: '150px' }}>
                        {b.pakej.kredit > 0 ? (
                          <div>
                            <div style={{ fontSize: '13.5px', fontWeight: 800, color: b.pakej.baki <= 0 ? '#DC2626' : b.pakej.baki === 1 ? '#92400E' : 'var(--hadir-text)' }}>
                              {b.pakej.digunakan}/{b.pakej.kredit} digunakan
                            </div>
                            <div style={{ background: '#F1F5F9', borderRadius: '4px', height: '6px', overflow: 'hidden', marginTop: '5px', maxWidth: '130px' }}>
                              <div style={{
                                width: `${Math.min(100, (b.pakej.digunakan / b.pakej.kredit) * 100)}%`,
                                height: '100%',
                                background: b.pakej.baki <= 0 ? '#EF4444' : b.pakej.baki === 1 ? '#F59E0B' : '#22C55E',
                                borderRadius: '4px',
                              }} />
                            </div>
                            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '5px' }}>
                              {b.pakej.kredit} dibeli · baki {Math.max(0, b.pakej.baki)} kelas
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Belum ada pakej</span>
                        )}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '12.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {b.pakej.tarikhSesiTerakhir ? formatTarikh(b.pakej.tarikhSesiTerakhir) : '—'}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ fontSize: '11.5px', padding: '3px 10px', borderRadius: '20px', fontWeight: 700, background: w.bg, color: w.text, whiteSpace: 'nowrap' }}>
                          {w.label}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', whiteSpace: 'nowrap', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          {b.status === 'Cukup' && noTel && (
                            <a
                              href={`https://wa.me/${noTel}?text=${msgWA}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#166534', textDecoration: 'none' }}
                            >
                              <MessageCircle size={12} /> WA
                            </a>
                          )}
                          <Link
                            href="/bayaran/baharu"
                            style={{ display: 'inline-block', padding: '6px 12px', background: b.status === 'Cukup' ? 'var(--accent)' : 'var(--bg)', border: b.status === 'Cukup' ? 'none' : '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: b.status === 'Cukup' ? 'var(--accent-text)' : 'var(--text)', textDecoration: 'none' }}
                          >
                            Rekod Bayaran
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '12px' }}>
        Kiraan bermula dari resit personal PERTAMA yang direkod dengan bilangan kelas (pakej) — sejarah lama sebelum itu tidak dikira.
        Untuk pelajar Kumpulan+Personal, hanya sesi bernota &quot;Kelas Personal&quot; ditolak dari pakej.
        &quot;Belum ada pakej&quot; = belum ada resit personal baharu direkod selepas sistem pakej diperkenalkan.
      </p>
    </div>
  )
}
