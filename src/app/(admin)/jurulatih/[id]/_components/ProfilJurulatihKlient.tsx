'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Edit2, CalendarCheck, HandCoins, Wallet } from 'lucide-react'
import { BtnSlipGaji } from '@/components/pdf/BtnSlipGaji'
import { formatRinggit, formatTarikh } from '@/lib/utils'
import { toast } from '@/lib/stores/toast-store'
import { ModalRekodAdvance } from './ModalRekodAdvance'

type Jurulatih = {
  id: string
  nama_penuh: string
  no_ic: string | null
  no_telefon: string | null
  emel: string | null
  kadar_bayaran: number | null
  tarikh_mula: string | null
  pengalaman_ringkas: string | null
  kelayakan: string | null
  status: string
  cawangan_nama: string
  gambar_url: string | null
  no_tng: string | null
  tng_qr_url: string | null
}

type StatBulan = { bulan: string; sesi: number }

type Kehadiran = {
  id: string
  tarikh: string
  status: string
  jenis_kelas?: 'Kumpulan' | 'Personal'
  nota: string | null
  cawangan?: { nama: string } | null
}

type Bayaran = {
  id: string
  bulan_bayaran: string
  tahun_bayaran: number
  bilangan_sesi: number
  kadar_per_sesi: number
  jumlah: number
  potongan_advance: number
  kaedah_bayaran: string | null
  tarikh_bayar: string | null
  status: string
}

type Advance = {
  id: string
  jumlah: number
  baki: number
  tarikh_advance: string
  kaedah_bayaran: string | null
  status: 'Belum Selesai' | 'Selesai'
  nota: string | null
}

interface Props {
  jurulatih: Jurulatih
  statBulan: StatBulan[]
  kehadiran: Kehadiran[]
  bayaran: Bayaran[]
  advance: Advance[]
  namaBulanSemasa: string
  sudahBayarBulanIni: boolean
}

export function ProfilJurulatihKlient({ jurulatih: j, statBulan, kehadiran, bayaran, advance, namaBulanSemasa, sudahBayarBulanIni }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<'profil' | 'kehadiran' | 'bayaran' | 'advance'>('profil')
  const [modalAdvance, setModalAdvance] = useState(false)

  const bakiAdvance = advance
    .filter((a) => a.status === 'Belum Selesai')
    .reduce((s, a) => s + a.baki, 0)

  const totalGajiDibayar = bayaran
    .filter((b) => b.status === 'Sudah Bayar')
    .reduce((s, b) => s + b.jumlah, 0)

  const warnaStatus: Record<string, { bg: string; text: string }> = {
    Hadir: { bg: 'var(--hadir-bg)', text: 'var(--hadir-text)' },
    'Tidak Hadir': { bg: 'var(--tidak-hadir-bg)', text: 'var(--tidak-hadir-text)' },
    Cuti: { bg: 'var(--cuti-bg)', text: 'var(--cuti-text)' },
  }

  return (
    <div style={{ maxWidth: '760px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <Link href="/jurulatih" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>
            ← Senarai Jurulatih
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'var(--accent)', border: '2px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', flexShrink: 0,
              }}
            >
              {j.gambar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={j.gambar_url}
                  alt={`Gambar ${j.nama_penuh}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-text)' }}>
                  {j.nama_penuh.trim().charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>{j.nama_penuh}</h1>
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px', alignItems: 'center' }}>
                <span style={{
                  fontSize: '12px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600,
                  background: j.status === 'Aktif' ? 'var(--hadir-bg)' : '#F1F5F9',
                  color: j.status === 'Aktif' ? 'var(--hadir-text)' : 'var(--text-muted)',
                }}>{j.status}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{j.cawangan_nama || 'Tiada cawangan'}</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/jurulatih/${j.id}/kehadiran`}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 14px',
              background: 'var(--card)', border: '1.5px solid var(--border)',
              borderRadius: '10px', fontSize: '13px', fontWeight: 700,
              color: 'var(--text)', textDecoration: 'none',
            }}
          >
            <CalendarCheck size={14} />
            Rekod Kehadiran
          </Link>
          <Link href={`/jurulatih/${j.id}/edit`}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 14px',
              background: 'var(--accent)', border: 'none',
              borderRadius: '10px', fontSize: '13px', fontWeight: 700,
              color: 'var(--accent-text)', textDecoration: 'none',
            }}
          >
            <Edit2 size={14} />
            Edit
          </Link>
        </div>
      </div>

      {/* Statistik 3 Bulan */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {statBulan.map((s) => (
          <div key={s.bulan} style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: '14px', padding: '16px',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              {s.bulan}
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--primary)' }}>{s.sesi}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>sesi hadir</div>
          </div>
        ))}
      </div>

      {/* Status Bayaran Bulan Ini */}
      <div style={{
        background: sudahBayarBulanIni ? 'var(--hadir-bg)' : '#FFF7ED',
        border: `1px solid ${sudahBayarBulanIni ? '#BBF7D0' : '#FED7AA'}`,
        borderRadius: '14px', padding: '16px 20px', marginBottom: '20px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <Wallet size={18} style={{ color: sudahBayarBulanIni ? 'var(--hadir-text)' : '#C2410C' }} />
        <div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '2px' }}>Status Bayaran {namaBulanSemasa}</div>
          <div style={{
            fontSize: '15px', fontWeight: 700,
            color: sudahBayarBulanIni ? 'var(--hadir-text)' : '#C2410C',
          }}>
            {sudahBayarBulanIni ? '✓ Sudah Dibayar' : '⚠ Belum Dibayar'}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
            Jumlah Gaji Dibayar
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>
            {formatRinggit(totalGajiDibayar)}
          </div>
        </div>
        {!sudahBayarBulanIni && (
          <Link href={`/jurulatih/${j.id}/bayaran`}
            style={{
              padding: '7px 14px',
              background: 'var(--accent)', border: 'none',
              borderRadius: '8px', fontSize: '12.5px', fontWeight: 700,
              color: 'var(--accent-text)', textDecoration: 'none', whiteSpace: 'nowrap',
            }}
          >
            Rekod Bayaran
          </Link>
        )}
      </div>

      {/* Tab */}
      <div style={{ borderBottom: '2px solid var(--border)', display: 'flex', marginBottom: '20px' }}>
        {[
          { key: 'profil', label: 'Profil' },
          { key: 'kehadiran', label: 'Kehadiran', icon: CalendarCheck },
          { key: 'bayaran', label: 'Bayaran', icon: Wallet },
          { key: 'advance', label: bakiAdvance > 0 ? `Advance (${formatRinggit(bakiAdvance)})` : 'Advance', icon: HandCoins },
        ].map(({ key, label }) => {
          const aktif = tab === key
          return (
            <button key={key}
              onClick={() => setTab(key as any)}
              style={{
                padding: '10px 16px', background: 'none', border: 'none',
                borderBottom: aktif ? '2px solid var(--primary)' : '2px solid transparent',
                marginBottom: '-2px',
                fontSize: '13.5px', fontWeight: aktif ? 700 : 500,
                color: aktif ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
        {/* Profil */}
        {tab === 'profil' && (
          <div style={{ padding: '20px' }}>
            {[
              { label: 'No. IC', nilai: j.no_ic || '—' },
              { label: 'No. Telefon', nilai: j.no_telefon || '—' },
              { label: 'E-mel', nilai: <span style={{ textTransform: 'none' }}>{j.emel || '—'}</span> },
              { label: 'Kadar / Sesi', nilai: j.kadar_bayaran ? formatRinggit(j.kadar_bayaran) : '—' },
              { label: 'No. TNG eWallet', nilai: j.no_tng || '—' },
              { label: 'Tarikh Mula', nilai: j.tarikh_mula ? formatTarikh(j.tarikh_mula) : '—' },
              { label: 'Kelayakan', nilai: j.kelayakan || '—' },
            ].map((b, i, arr) => (
              <div key={b.label} style={{
                display: 'flex', justifyContent: 'space-between',
                paddingBottom: i < arr.length - 1 ? '12px' : 0,
                marginBottom: i < arr.length - 1 ? '12px' : 0,
                borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{b.label}</span>
                <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>{b.nilai}</span>
              </div>
            ))}
            {j.pengalaman_ringkas && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Pengalaman
                </div>
                <p style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.6 }}>{j.pengalaman_ringkas}</p>
              </div>
            )}
          </div>
        )}

        {/* Kehadiran */}
        {tab === 'kehadiran' && (
          kehadiran.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <CalendarCheck size={32} style={{ color: 'var(--border)', margin: '0 auto 12px' }} />
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>Tiada rekod kehadiran</p>
              <Link href={`/jurulatih/${j.id}/kehadiran`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px',
                  background: 'var(--accent)', borderRadius: '10px', fontSize: '13px',
                  fontWeight: 700, color: 'var(--accent-text)', textDecoration: 'none',
                }}
              >
                + Rekod Kehadiran
              </Link>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                  {['Tarikh', 'Cawangan', 'Kelas', 'Status', 'Nota'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {kehadiran.map((k, i) => {
                  const w = warnaStatus[k.status] ?? { bg: '#F1F5F9', text: 'var(--text-muted)' }
                  return (
                    <tr key={k.id} style={{ borderBottom: i < kehadiran.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <td style={{ padding: '11px 16px', fontSize: '13.5px', color: 'var(--text)' }}>{formatTarikh(k.tarikh)}</td>
                      <td style={{ padding: '11px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>{k.cawangan?.nama ?? '—'}</td>
                      <td style={{ padding: '11px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>{k.jenis_kelas ?? '—'}</td>
                      <td style={{ padding: '11px 16px' }}>
                        <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600, background: w.bg, color: w.text }}>{k.status}</span>
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>{k.nota || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )
        )}

        {/* Bayaran */}
        {tab === 'bayaran' && (
          bayaran.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <Wallet size={32} style={{ color: 'var(--border)', margin: '0 auto 12px' }} />
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>Tiada rekod bayaran</p>
              <Link href={`/jurulatih/${j.id}/bayaran`}
                style={{
                  display: 'inline-block', marginTop: '12px',
                  padding: '8px 16px', background: 'var(--accent)',
                  borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                  color: 'var(--accent-text)', textDecoration: 'none',
                }}
              >
                Rekod Bayaran Pertama
              </Link>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                  {['Bulan', 'Sesi', 'Kadar', 'Jumlah', 'Status', ''].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bayaran.map((b, i) => (
                  <tr key={b.id} style={{ borderBottom: i < bayaran.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '11px 16px', fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>{b.bulan_bayaran} {b.tahun_bayaran}</td>
                    <td style={{ padding: '11px 16px', fontSize: '13px', color: 'var(--text)' }}>{b.bilangan_sesi} sesi</td>
                    <td style={{ padding: '11px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>{formatRinggit(b.kadar_per_sesi)}</td>
                    <td style={{ padding: '11px 16px', fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>{formatRinggit(b.jumlah)}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{
                        fontSize: '11.5px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600,
                        background: b.status === 'Sudah Bayar' ? 'var(--hadir-bg)' : '#FFF7ED',
                        color: b.status === 'Sudah Bayar' ? 'var(--hadir-text)' : '#C2410C',
                      }}>{b.status}</span>
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <BtnSlipGaji
                        data={{
                          nama_jurulatih: j.nama_penuh,
                          no_ic: j.no_ic,
                          bulan_bayaran: b.bulan_bayaran,
                          tahun_bayaran: b.tahun_bayaran,
                          bilangan_sesi: b.bilangan_sesi,
                          kadar_per_sesi: b.kadar_per_sesi,
                          jumlah: b.jumlah,
                          potongan_advance: b.potongan_advance ?? 0,
                          kaedah_bayaran: b.kaedah_bayaran,
                          tarikh_bayar: b.tarikh_bayar,
                          status: b.status,
                          nota: null,
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {/* Advance */}
        {tab === 'advance' && (
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderBottom: '1px solid var(--border)',
              background: bakiAdvance > 0 ? '#FFF7ED' : 'var(--card)',
            }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                  Baki Advance Belum Selesai
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: bakiAdvance > 0 ? '#C2410C' : 'var(--text)' }}>
                  {formatRinggit(bakiAdvance)}
                </div>
                {bakiAdvance > 0 && (
                  <div style={{ fontSize: '12px', color: '#C2410C', marginTop: '2px' }}>
                    Akan ditolak automatik masa rekod gaji 30hb
                  </div>
                )}
              </div>
              <button onClick={() => setModalAdvance(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '9px 16px', background: 'var(--accent)', border: 'none',
                  borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                  color: 'var(--accent-text)', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                + Rekod Advance
              </button>
            </div>
            {advance.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <HandCoins size={32} style={{ color: 'var(--border)', margin: '0 auto 12px' }} />
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
                  Tiada rekod advance. Advance ialah gaji yang diambil awal sebelum 30hb.
                </p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                    {['Tarikh', 'Jumlah', 'Baki', 'Kaedah', 'Status', 'Nota'].map((h) => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {advance.map((a, i) => (
                    <tr key={a.id} style={{ borderBottom: i < advance.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <td style={{ padding: '11px 16px', fontSize: '13.5px', color: 'var(--text)' }}>{formatTarikh(a.tarikh_advance)}</td>
                      <td style={{ padding: '11px 16px', fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>{formatRinggit(a.jumlah)}</td>
                      <td style={{ padding: '11px 16px', fontSize: '13.5px', fontWeight: 600, color: a.baki > 0 ? '#C2410C' : 'var(--text-muted)' }}>
                        {a.baki > 0 ? formatRinggit(a.baki) : '—'}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>{a.kaedah_bayaran ?? '—'}</td>
                      <td style={{ padding: '11px 16px' }}>
                        <span style={{
                          fontSize: '11.5px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600,
                          background: a.status === 'Selesai' ? 'var(--hadir-bg)' : '#FFF7ED',
                          color: a.status === 'Selesai' ? 'var(--hadir-text)' : '#C2410C',
                        }}>{a.status}</span>
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>{a.nota || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {modalAdvance && (
        <ModalRekodAdvance
          jurulatihId={j.id}
          namaJurulatih={j.nama_penuh}
          noTng={j.no_tng}
          tngQrUrl={j.tng_qr_url}
          onTutup={() => setModalAdvance(false)}
          onBerjaya={() => {
            setModalAdvance(false)
            toast.success('Advance direkod')
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
