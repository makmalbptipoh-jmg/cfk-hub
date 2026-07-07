'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck, Plus, Pencil, Trash2, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { tandaDibaca, tandaSemuaDibaca } from '@/app/actions/notifikasi'

type Rekod = {
  id: string
  jenis: string
  tajuk: string
  mesej: string
  pautan: string | null
  dibaca: boolean
  created_at: string
}

type LogRekod = {
  id: string
  pengguna_nama: string | null
  aksi: string
  jadual: string
  data: Record<string, unknown> | null
  created_at: string
}

const LABEL_JADUAL: Record<string, string> = {
  resit: 'Resit bayaran',
  kewangan_perbelanjaan: 'Perbelanjaan',
  pendapatan_lain: 'Pendapatan lain',
  kehadiran: 'Kehadiran pelajar',
  kehadiran_jurulatih: 'Kehadiran jurulatih',
  pelajar: 'Pelajar',
  jurulatih: 'Jurulatih',
  aset: 'Aset',
  cawangan: 'Cawangan',
  pengguna_profil: 'Pengguna',
  auth: 'Sistem',
}

function perincianRekod(jadual: string, data: Record<string, unknown> | null): string {
  if (!data) return ''
  const ambil = (k: string) => (typeof data[k] === 'string' || typeof data[k] === 'number' ? String(data[k]) : '')
  switch (jadual) {
    case 'resit': return ambil('nombor_resit')
    case 'kewangan_perbelanjaan': return ambil('penerangan')
    case 'pendapatan_lain': return ambil('sumber')
    case 'kehadiran':
    case 'kehadiran_jurulatih': return ambil('tarikh')
    case 'pelajar':
    case 'jurulatih':
    case 'pengguna_profil': return ambil('nama_penuh') || ambil('nama')
    case 'aset':
    case 'cawangan': return ambil('nama')
    default: return ''
  }
}

const AKSI_GAYA: Record<string, { bg: string; text: string; Icon: React.ElementType }> = {
  Cipta: { bg: '#F0FDF4', text: '#15803D', Icon: Plus },
  Edit: { bg: '#EFF6FF', text: '#1E40AF', Icon: Pencil },
  Padam: { bg: '#FFF1F2', text: '#9F1239', Icon: Trash2 },
  'Log Masuk': { bg: '#F1F5F9', text: '#475569', Icon: LogIn },
}

function masaPenuh(iso: string): string {
  return new Intl.DateTimeFormat('ms-MY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

export default function NotifikasiPage() {
  const [paparan, setPaparan] = useState<'amaran' | 'aktiviti'>('amaran')

  return (
    <div style={{ maxWidth: '780px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        <Bell size={20} style={{ color: 'var(--text)' }} />
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>
          Notifikasi & Aktiviti
        </h1>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
        Amaran operasi automatik dan sejarah aktiviti pengguna (cipta/edit/padam & log masuk).
      </p>

      {/* Tab */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '2px solid var(--border)', marginBottom: '20px' }}>
        {([['amaran', 'Amaran Operasi'], ['aktiviti', 'Log Aktiviti']] as const).map(([key, label]) => {
          const active = paparan === key
          return (
            <button
              key={key}
              onClick={() => setPaparan(key)}
              style={{
                padding: '10px 16px', fontSize: '13.5px', fontWeight: active ? 700 : 500,
                color: active ? 'var(--accent)' : 'var(--text-muted)', background: 'none', border: 'none',
                borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: '-2px', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {paparan === 'amaran' ? <PaparanAmaran /> : <PaparanAktiviti />}
    </div>
  )
}

function PaparanAmaran() {
  const [senarai, setSenarai] = useState<Rekod[]>([])
  const [tapis, setTapis] = useState<'semua' | 'belum'>('semua')
  const [memuat, setMemuat] = useState(true)

  const muat = useCallback(async () => {
    setMemuat(true)
    let q = createClient()
      .from('notifikasi')
      .select('id, jenis, tajuk, mesej, pautan, dibaca, created_at')
      .order('created_at', { ascending: false })
      .limit(200)
    if (tapis === 'belum') q = q.eq('dibaca', false)
    const { data } = await q
    setSenarai((data ?? []) as Rekod[])
    setMemuat(false)
  }, [tapis])

  useEffect(() => { muat() }, [muat])

  const tandai = async (id: string) => {
    setSenarai((s) => s.map((x) => (x.id === id ? { ...x, dibaca: true } : x)))
    await tandaDibaca(id)
    if (tapis === 'belum') muat()
  }

  const semua = async () => {
    setSenarai((s) => s.map((x) => ({ ...x, dibaca: true })))
    await tandaSemuaDibaca()
    if (tapis === 'belum') muat()
  }

  const belumDibaca = senarai.filter((n) => !n.dibaca).length

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {(['semua', 'belum'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTapis(t)}
            style={{
              padding: '7px 14px', borderRadius: '9px', border: '1px solid var(--border)',
              background: tapis === t ? 'var(--accent, #65A30D)' : 'var(--card)',
              color: tapis === t ? 'var(--accent-text, #fff)' : 'var(--text)',
              fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {t === 'semua' ? 'Semua' : `Belum dibaca${belumDibaca > 0 ? ` (${belumDibaca})` : ''}`}
          </button>
        ))}
        {belumDibaca > 0 && (
          <button
            onClick={semua}
            style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '9px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <CheckCheck size={14} /> Tandai semua dibaca
          </button>
        )}
      </div>

      {memuat ? (
        <div style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>Memuat…</div>
      ) : senarai.length === 0 ? (
        <div style={{ padding: '48px 20px', textAlign: 'center', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>
          Tiada notifikasi. Semua terkawal 👍
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {senarai.map((n) => (
            <div
              key={n.id}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', background: n.dibaca ? 'var(--card)' : 'var(--hadir-bg, #F0FDF4)', border: `1px solid ${n.dibaca ? 'var(--border)' : '#BBF7D0'}`, borderRadius: '14px' }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px' }}>
                  {!n.dibaca && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />}
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>{n.tajuk}</span>
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text)', opacity: 0.85, lineHeight: 1.45 }}>{n.mesej}</div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '7px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{masaPenuh(n.created_at)}</span>
                  {n.pautan && (
                    <Link href={n.pautan} onClick={() => !n.dibaca && tandai(n.id)} style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--accent, #65A30D)' }}>
                      Lihat →
                    </Link>
                  )}
                  {!n.dibaca && (
                    <button onClick={() => tandai(n.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                      Tandai dibaca
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function PaparanAktiviti() {
  const [senarai, setSenarai] = useState<LogRekod[]>([])
  const [tapisAksi, setTapisAksi] = useState('')
  const [memuat, setMemuat] = useState(true)

  const muat = useCallback(async () => {
    setMemuat(true)
    let q = createClient()
      .from('log_aktiviti')
      .select('id, pengguna_nama, aksi, jadual, data, created_at')
      .order('created_at', { ascending: false })
      .limit(300)
    if (tapisAksi) q = q.eq('aksi', tapisAksi)
    const { data } = await q
    setSenarai((data ?? []) as LogRekod[])
    setMemuat(false)
  }, [tapisAksi])

  useEffect(() => { muat() }, [muat])

  const AKSI = ['', 'Cipta', 'Edit', 'Padam', 'Log Masuk']

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {AKSI.map((a) => (
          <button
            key={a || 'semua'}
            onClick={() => setTapisAksi(a)}
            style={{
              padding: '7px 13px', borderRadius: '9px', border: '1px solid var(--border)',
              background: tapisAksi === a ? 'var(--accent, #65A30D)' : 'var(--card)',
              color: tapisAksi === a ? 'var(--accent-text, #fff)' : 'var(--text)',
              fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {a || 'Semua'}
          </button>
        ))}
      </div>

      {memuat ? (
        <div style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>Memuat…</div>
      ) : senarai.length === 0 ? (
        <div style={{ padding: '48px 20px', textAlign: 'center', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>
          Tiada rekod aktiviti lagi. (Pastikan <code>log-aktiviti.sql</code> sudah dijalankan di Supabase.)
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {senarai.map((l) => {
            const gaya = AKSI_GAYA[l.aksi] ?? AKSI_GAYA['Edit']
            const Icon = gaya.Icon
            const label = LABEL_JADUAL[l.jadual] ?? l.jadual
            const perincian = perincianRekod(l.jadual, l.data)
            const isLogin = l.aksi === 'Log Masuk'
            return (
              <div
                key={l.id}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '9px', background: gaya.bg, color: gaya.text, flexShrink: 0 }}>
                  <Icon size={15} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.4 }}>
                    <strong>{l.pengguna_nama ?? 'Sistem'}</strong>{' '}
                    {isLogin ? (
                      <>log masuk ke sistem</>
                    ) : (
                      <>
                        <span style={{ color: gaya.text, fontWeight: 600 }}>{l.aksi.toLowerCase()}</span> {label.toLowerCase()}
                        {perincian && <span style={{ color: 'var(--text-muted)' }}> · {perincian}</span>}
                      </>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{masaPenuh(l.created_at)}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
