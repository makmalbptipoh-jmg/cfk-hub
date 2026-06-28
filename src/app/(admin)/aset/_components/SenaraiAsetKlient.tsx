'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Package } from 'lucide-react'
import { ModalLupusAset } from './ModalLupusAset'
import { formatRinggit, formatTarikh } from '@/lib/utils'

type Aset = {
  id: string
  nama: string
  kategori: string | null
  nilai_asal: number | null
  tarikh_beli: string | null
  cawangan_id: string | null
  status: 'Aktif' | 'Lupus'
  sebab_lupus: string | null
  tarikh_lupus: string | null
  cawangan: { nama: string } | null
}

interface Props {
  aset: Aset[]
  cawangan: { id: string; nama: string }[]
}

const KATEGORI_ASET = ['Papan & Buah Catur', 'Jam Catur', 'Perabot', 'Elektronik', 'Bahan Pengajaran', 'Lain-lain']

export function SenaraiAsetKlient({ aset, cawangan }: Props) {
  const router = useRouter()
  const [filterStatus, setFilterStatus] = useState('Aktif')
  const [filterKategori, setFilterKategori] = useState('')
  const [filterCawangan, setFilterCawangan] = useState('')
  const [asetLupus, setAsetLupus] = useState<Aset | null>(null)

  const gayaSelect = {
    padding: '8px 12px',
    border: '1.5px solid var(--border)',
    borderRadius: '10px',
    fontSize: '13px',
    color: 'var(--text)',
    background: 'var(--card)',
    outline: 'none',
    fontFamily: 'inherit',
    cursor: 'pointer',
  }

  const hasil = aset.filter((a) => {
    if (filterStatus && a.status !== filterStatus) return false
    if (filterKategori && a.kategori !== filterKategori) return false
    if (filterCawangan === '__tiada__' && a.cawangan_id !== null) return false
    if (filterCawangan && filterCawangan !== '__tiada__' && a.cawangan_id !== filterCawangan) return false
    return true
  })

  const bilAktif = aset.filter((a) => a.status === 'Aktif').length
  const nilaiTotal = aset.filter((a) => a.status === 'Aktif').reduce((s, a) => s + (a.nilai_asal ?? 0), 0)

  return (
    <div style={{ maxWidth: '960px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: '4px' }}>
            Senarai Aset
          </h1>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
            {bilAktif} aset aktif · Nilai: {formatRinggit(nilaiTotal)}
          </p>
        </div>
        <Link
          href="/aset/baharu"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 16px',
            background: 'var(--accent)',
            border: 'none',
            borderRadius: '12px',
            fontSize: '13.5px',
            fontWeight: 700,
            color: 'var(--accent-text)',
            textDecoration: 'none',
          }}
        >
          <Plus size={14} /> Tambah Aset
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '18px' }}>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={gayaSelect}>
          <option value="">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Lupus">Dilupuskan</option>
        </select>
        <select value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)} style={gayaSelect}>
          <option value="">Semua Kategori</option>
          {KATEGORI_ASET.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        <select value={filterCawangan} onChange={(e) => setFilterCawangan(e.target.value)} style={gayaSelect}>
          <option value="">Semua Cawangan</option>
          <option value="__tiada__">Tiada Cawangan</option>
          {cawangan.map((c) => (
            <option key={c.id} value={c.id}>{c.nama}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {hasil.length === 0 ? (
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '56px',
            textAlign: 'center',
          }}
        >
          <Package size={36} style={{ color: 'var(--border)', margin: '0 auto 14px', display: 'block' }} />
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            Tiada aset ditemui
          </p>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
            {filterStatus || filterKategori || filterCawangan
              ? 'Cuba tukar penapis untuk lihat lebih banyak aset.'
              : 'Klik "Tambah Aset" untuk daftar aset pertama.'}
          </p>
        </div>
      ) : (
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                {['Nama', 'Kategori', 'Nilai', 'Cawangan', 'Tarikh Beli', 'Status', 'Tindakan'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '9px 14px',
                      textAlign: 'left',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hasil.map((a, i) => (
                <tr
                  key={a.id}
                  style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFBFC' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>{a.nama}</div>
                    {a.status === 'Lupus' && a.sebab_lupus && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Sebab: {a.sebab_lupus}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    {a.kategori ?? '—'}
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>
                    {a.nilai_asal != null ? formatRinggit(a.nilai_asal) : '—'}
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    {a.cawangan?.nama ?? 'Umum'}
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: '12.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {a.tarikh_beli ? formatTarikh(a.tarikh_beli) : '—'}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <span
                      style={{
                        fontSize: '11.5px',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontWeight: 600,
                        background: a.status === 'Aktif' ? 'var(--hadir-bg)' : '#F1F5F9',
                        color: a.status === 'Aktif' ? 'var(--hadir-text)' : '#64748B',
                      }}
                    >
                      {a.status === 'Aktif' ? 'Aktif' : 'Dilupuskan'}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {a.status === 'Aktif' && (
                        <>
                          <Link
                            href={`/aset/${a.id}/edit`}
                            title="Edit"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '5px',
                              background: 'var(--bg)',
                              border: '1px solid var(--border)',
                              borderRadius: '7px',
                              color: 'var(--text-muted)',
                              textDecoration: 'none',
                            }}
                          >
                            <Pencil size={13} />
                          </Link>
                          <button
                            onClick={() => setAsetLupus(a)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '5px 10px',
                              background: '#FFF1F2',
                              border: '1px solid #FECDD3',
                              borderRadius: '7px',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              color: '#9F1239',
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                            }}
                          >
                            Lupus
                          </button>
                        </>
                      )}
                      {a.status === 'Lupus' && a.tarikh_lupus && (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {formatTarikh(a.tarikh_lupus)}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {asetLupus && (
        <ModalLupusAset
          aset={{ id: asetLupus.id, nama: asetLupus.nama, nilai_asal: asetLupus.nilai_asal }}
          onTutup={() => setAsetLupus(null)}
          onBerjaya={() => {
            setAsetLupus(null)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
