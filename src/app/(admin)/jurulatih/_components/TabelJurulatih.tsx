'use client'

import Link from 'next/link'
import { Plus, Eye, Wallet, CalendarCheck, Star } from 'lucide-react'
import { formatRinggit } from '@/lib/utils'

type Jurulatih = {
  id: string
  nama_penuh: string
  no_telefon: string | null
  kadar_bayaran: number | null
  tarikh_mula: string | null
  status: string
  cawangan_nama: string
  gaji_dibayar: number
  sesi_bulan_ini: number
  point: number
}

type Stat = {
  totalGajiDibayar: number
  gajiBulanIni: number
  sesiHadirBulanIni: number
  namaBulan: string
}

interface Props {
  jurulatih: Jurulatih[]
  stat: Stat
}

export function TabelJurulatih({ jurulatih, stat }: Props) {
  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>
            Jurulatih
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {jurulatih.length} jurulatih berdaftar
          </p>
        </div>
        <Link href="/jurulatih/baharu"
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '9px 16px',
            background: 'var(--accent)', border: 'none',
            borderRadius: '10px', fontSize: '13px', fontWeight: 700,
            color: 'var(--accent-text)', textDecoration: 'none',
          }}
        >
          <Plus size={14} />
          Tambah Jurulatih
        </Link>
      </div>

      {/* Dashboard ringkas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: `Gaji Dibayar ${stat.namaBulan}`, nilai: formatRinggit(stat.gajiBulanIni), icon: Wallet, bg: '#F7FEE7', border: '#D9F99D', warna: 'var(--accent-dark)' },
          { label: 'Jumlah Gaji Keseluruhan', nilai: formatRinggit(stat.totalGajiDibayar), icon: Wallet, bg: 'var(--card)', border: 'var(--border)', warna: 'var(--text)' },
          { label: `Sesi Hadir ${stat.namaBulan}`, nilai: `${stat.sesiHadirBulanIni} sesi`, icon: CalendarCheck, bg: 'var(--card)', border: 'var(--border)', warna: 'var(--text)' },
        ].map((k) => {
          const Icon = k.icon
          return (
            <div key={k.label} style={{
              background: k.bg, border: `1px solid ${k.border}`,
              borderRadius: '14px', padding: '16px 18px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Icon size={13} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {k.label}
                </span>
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: k.warna }}>{k.nilai}</div>
            </div>
          )
        })}
      </div>

      {/* Jadual */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
        {jurulatih.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>👨‍🏫</div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
              Belum ada jurulatih berdaftar
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Klik "Tambah Jurulatih" untuk daftar jurulatih pertama.
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                {['Nama', 'Cawangan', 'Kadar/Sesi', 'Sesi Bln Ini', 'Point', 'Gaji Dibayar', 'Status', ''].map((h) => (
                  <th key={h} style={{
                    padding: '11px 16px', textAlign: 'left',
                    fontSize: '11px', fontWeight: 700,
                    color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jurulatih.map((j, i) => (
                <tr key={j.id} style={{
                  borderBottom: i < jurulatih.length - 1 ? '1px solid var(--border)' : 'none',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFBFC' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>{j.nama_penuh}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {j.cawangan_nama || '—'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>
                    {j.kadar_bayaran ? formatRinggit(j.kadar_bayaran) : '—'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>
                    {j.sesi_bulan_ini}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      fontSize: '12px', padding: '3px 10px', borderRadius: '20px', fontWeight: 700,
                      background: '#FEF3C7', color: '#92400E',
                    }}>
                      <Star size={11} fill="#F59E0B" stroke="#F59E0B" /> {j.point}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13.5px', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap' }}>
                    {formatRinggit(j.gaji_dibayar)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: '11.5px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600,
                      background: j.status === 'Aktif' ? 'var(--hadir-bg)' : '#F1F5F9',
                      color: j.status === 'Aktif' ? 'var(--hadir-text)' : 'var(--text-muted)',
                    }}>{j.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Link href={`/jurulatih/${j.id}`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '6px 12px',
                        background: 'var(--bg)', border: '1px solid var(--border)',
                        borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                        color: 'var(--text)', textDecoration: 'none',
                      }}
                    >
                      <Eye size={12} />
                      Lihat
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
