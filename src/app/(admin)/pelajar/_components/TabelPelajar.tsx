'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Plus, Upload, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { formatRinggit } from '@/lib/utils'

type Pelajar = {
  id: string
  nama_penuh: string
  nama_ibu_bapa: string
  no_telefon: string
  jenis_kelas: string
  yuran_bulanan: number
  status: string
  cawangan_daftar_id: string
  cawangan_nama?: string
}

type Cawangan = { id: string; nama: string }

interface TabelPelajarProps {
  pelajar: Pelajar[]
  cawangan: Cawangan[]
}

const REKOD_PER_HALAMAN = 10

export function TabelPelajar({ pelajar, cawangan }: TabelPelajarProps) {
  const [carian, setCarian] = useState('')
  const [filterCawangan, setFilterCawangan] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [halaman, setHalaman] = useState(1)

  const senarai = useMemo(() => {
    return pelajar.filter((p) => {
      const cocokCarian = carian.length < 2 || (
        p.nama_penuh.toLowerCase().includes(carian.toLowerCase()) ||
        p.no_telefon.includes(carian)
      )
      const cocokCawangan = !filterCawangan || p.cawangan_daftar_id === filterCawangan
      const cocokStatus = !filterStatus || p.status === filterStatus
      return cocokCarian && cocokCawangan && cocokStatus
    })
  }, [pelajar, carian, filterCawangan, filterStatus])

  const jumlahHalaman = Math.max(1, Math.ceil(senarai.length / REKOD_PER_HALAMAN))
  const halamanSelamat = Math.min(halaman, jumlahHalaman)
  const paparan = senarai.slice((halamanSelamat - 1) * REKOD_PER_HALAMAN, halamanSelamat * REKOD_PER_HALAMAN)

  const handleCarian = (val: string) => { setCarian(val); setHalaman(1) }
  const handleFilterC = (val: string) => { setFilterCawangan(val); setHalaman(1) }
  const handleFilterS = (val: string) => { setFilterStatus(val); setHalaman(1) }

  const inputStyle = {
    padding: '9px 12px',
    border: '1.5px solid var(--border)',
    borderRadius: '10px',
    fontSize: '13px',
    color: 'var(--text)',
    background: 'var(--card)',
    outline: 'none',
    fontFamily: 'inherit',
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>
            Pelajar
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {pelajar.length} pelajar berdaftar
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/pelajar/import"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 16px',
              background: 'var(--card)', border: '1.5px solid var(--border)',
              borderRadius: '10px', fontSize: '13px', fontWeight: 600,
              color: 'var(--text)', textDecoration: 'none',
            }}
          >
            <Upload size={14} />
            Import Google Forms
          </Link>
          <Link href="/pelajar/baharu"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 16px',
              background: 'var(--accent)', border: 'none',
              borderRadius: '10px', fontSize: '13px', fontWeight: 700,
              color: 'var(--accent-text)', textDecoration: 'none',
            }}
          >
            <Plus size={14} />
            Tambah Pelajar
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: '14px', padding: '16px 20px',
        display: 'flex', gap: '12px', alignItems: 'center',
        marginBottom: '16px',
      }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
          <Search size={14} style={{
            position: 'absolute', left: '10px', top: '50%',
            transform: 'translateY(-50%)', color: 'var(--text-muted)',
          }} />
          <input
            type="text"
            placeholder="Cari nama atau telefon..."
            value={carian}
            onChange={(e) => handleCarian(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '32px', width: '100%' }}
          />
        </div>
        <select value={filterCawangan} onChange={(e) => handleFilterC(e.target.value)} style={inputStyle}>
          <option value="">Semua Cawangan</option>
          {cawangan.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => handleFilterS(e.target.value)} style={inputStyle}>
          <option value="">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Tidak Aktif">Tidak Aktif</option>
        </select>
      </div>

      {/* Table */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: '14px', overflow: 'hidden',
      }}>
        {paparan.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>👤</div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
              {senarai.length === 0 && !carian && !filterCawangan && !filterStatus
                ? 'Belum ada pelajar berdaftar'
                : 'Tiada pelajar sepadan dengan carian'}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {senarai.length === 0 && !carian && !filterCawangan && !filterStatus
                ? 'Klik "Tambah Pelajar" untuk daftar pelajar pertama.'
                : 'Cuba ubah kata carian atau penapis.'}
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: '#F8FAFC' }}>
                {['Nama', 'Cawangan', 'Jenis', 'Yuran/Bulan', 'Ibu Bapa', 'Status', ''].map((h) => (
                  <th key={h} style={{
                    padding: '11px 16px', textAlign: 'left',
                    fontSize: '11px', fontWeight: 700,
                    color: 'var(--text-muted)', textTransform: 'uppercase',
                    letterSpacing: '0.06em', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paparan.map((p, i) => (
                <tr key={p.id} style={{
                  borderBottom: i < paparan.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.1s',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFBFC' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>{p.nama_penuh}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{p.cawangan_nama ?? '—'}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: '11.5px', padding: '3px 8px', borderRadius: '6px', fontWeight: 600,
                      background: '#EFF6FF', color: '#1D4ED8',
                    }}>{p.jenis_kelas}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>
                      {formatRinggit(p.yuran_bulanan)}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text)' }}>{p.nama_ibu_bapa}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.no_telefon}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: '11.5px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600,
                      background: p.status === 'Aktif' ? 'var(--hadir-bg)' : '#F1F5F9',
                      color: p.status === 'Aktif' ? 'var(--hadir-text)' : 'var(--text-muted)',
                    }}>{p.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Link href={`/pelajar/${p.id}`}
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

      {/* Pagination */}
      {jumlahHalaman > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: '16px',
        }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {senarai.length} rekod · Halaman {halamanSelamat} daripada {jumlahHalaman}
          </p>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setHalaman((h) => Math.max(1, h - 1))}
              disabled={halamanSelamat === 1}
              style={{
                padding: '7px 12px', display: 'flex', alignItems: 'center', gap: '4px',
                background: 'var(--card)', border: '1.5px solid var(--border)',
                borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                color: halamanSelamat === 1 ? 'var(--text-muted)' : 'var(--text)',
                cursor: halamanSelamat === 1 ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <ChevronLeft size={14} />
              Sebelum
            </button>
            <button
              onClick={() => setHalaman((h) => Math.min(jumlahHalaman, h + 1))}
              disabled={halamanSelamat === jumlahHalaman}
              style={{
                padding: '7px 12px', display: 'flex', alignItems: 'center', gap: '4px',
                background: 'var(--card)', border: '1.5px solid var(--border)',
                borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                color: halamanSelamat === jumlahHalaman ? 'var(--text-muted)' : 'var(--text)',
                cursor: halamanSelamat === jumlahHalaman ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Seterusnya
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
