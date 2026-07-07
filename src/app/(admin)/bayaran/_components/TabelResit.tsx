'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Edit2, Plus, Search, X } from 'lucide-react'
import { ModalBatalResit } from './ModalBatalResit'
import { ModalEditResit } from './ModalEditResit'
import { BtnUnduhResit } from '@/components/pdf/BtnUnduhResit'
import { useRouter } from 'next/navigation'
import { toast } from '@/lib/stores/toast-store'

type Resit = {
  id: string
  nombor_resit: string
  pelajar_id: string
  nama_pelajar: string
  cawangan: string
  jenis: 'Kumpulan' | 'Personal' | 'Pendaftaran'
  bulan_bayaran: string
  tahun_bayaran: number
  jumlah: number
  kaedah_bayaran: string | null
  tarikh_bayar: string
  status: 'Aktif' | 'Dibatalkan'
  sebab_batal: string | null
}

interface Props {
  resit: Resit[]
  bulanTersedia: string[]
}

const SAIZ_HALAMAN = 15

export function TabelResit({ resit, bulanTersedia }: Props) {
  const router = useRouter()
  const [carian, setCarian] = useState('')
  const [filterBulan, setFilterBulan] = useState('')
  const [filterJenis, setFilterJenis] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [halaman, setHalaman] = useState(1)
  const [modalBatal, setModalBatal] = useState<Resit | null>(null)
  const [modalEdit, setModalEdit] = useState<Resit | null>(null)

  const hasil = resit.filter((r) => {
    const cariCocokan = !carian || r.nombor_resit.toLowerCase().includes(carian.toLowerCase()) || r.nama_pelajar.toLowerCase().includes(carian.toLowerCase())
    const bulanCocokan = !filterBulan || `${r.bulan_bayaran} ${r.tahun_bayaran}` === filterBulan
    const jenisCocokan = !filterJenis || r.jenis === filterJenis
    const statusCocokan = !filterStatus || r.status === filterStatus
    return cariCocokan && bulanCocokan && jenisCocokan && statusCocokan
  })

  const jumlahHalaman = Math.ceil(hasil.length / SAIZ_HALAMAN)
  const halSemasa = hasil.slice((halaman - 1) * SAIZ_HALAMAN, halaman * SAIZ_HALAMAN)

  const setFilter = (key: string, val: string) => {
    if (key === 'carian') setCarian(val)
    if (key === 'bulan') setFilterBulan(val)
    if (key === 'jenis') setFilterJenis(val)
    if (key === 'status') setFilterStatus(val)
    setHalaman(1)
  }

  const adaFilter = carian || filterBulan || filterJenis || filterStatus

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>
            Bayaran & Resit
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {resit.length} rekod resit
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/bayaran/personal/baharu"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 14px',
              background: 'var(--bg)', border: '1.5px solid var(--border)',
              borderRadius: '10px', fontSize: '13px', fontWeight: 600,
              color: 'var(--text)', textDecoration: 'none',
            }}
          >
            <Plus size={13} />
            Kelas Personal
          </Link>
          <Link href="/bayaran/baharu"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 16px',
              background: 'var(--accent)', border: 'none',
              borderRadius: '10px', fontSize: '13px', fontWeight: 700,
              color: 'var(--accent-text)', textDecoration: 'none',
            }}
          >
            <Plus size={14} />
            Rekod Bayaran
          </Link>
        </div>
      </div>

      {/* Penapis */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={carian}
            onChange={(e) => setFilter('carian', e.target.value)}
            placeholder="Cari no. resit atau nama pelajar..."
            style={{
              width: '100%', padding: '9px 12px 9px 34px',
              border: '1.5px solid var(--border)', borderRadius: '10px',
              fontSize: '13px', color: 'var(--text)',
              background: 'var(--card)', outline: 'none', fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <select value={filterBulan} onChange={(e) => setFilter('bulan', e.target.value)}
          style={{ padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', color: 'var(--text)', background: 'var(--card)', cursor: 'pointer', fontFamily: 'inherit' }}>
          <option value="">Semua Bulan</option>
          {bulanTersedia.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={filterJenis} onChange={(e) => setFilter('jenis', e.target.value)}
          style={{ padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', color: 'var(--text)', background: 'var(--card)', cursor: 'pointer', fontFamily: 'inherit' }}>
          <option value="">Semua Jenis</option>
          <option value="Kumpulan">Kumpulan</option>
          <option value="Personal">Personal</option>
          <option value="Pendaftaran">Pendaftaran</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilter('status', e.target.value)}
          style={{ padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', color: 'var(--text)', background: 'var(--card)', cursor: 'pointer', fontFamily: 'inherit' }}>
          <option value="">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Dibatalkan">Dibatalkan</option>
        </select>
        {adaFilter && (
          <button onClick={() => { setCarian(''); setFilterBulan(''); setFilterJenis(''); setFilterStatus(''); setHalaman(1) }}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '9px 12px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit' }}>
            <X size={13} />Reset
          </button>
        )}
      </div>

      {/* Jadual */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
        {hasil.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🧾</div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
              {adaFilter ? 'Tiada resit sepadan' : 'Belum ada resit'}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {adaFilter ? 'Cuba ubah penapis carian.' : 'Klik "Rekod Bayaran" untuk mula.'}
            </p>
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                  {['No. Resit', 'Pelajar', 'Jenis', 'Bulan', 'Jumlah', 'Tarikh', 'Status', 'Tindakan'].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {halSemasa.map((r, i) => (
                  <tr key={r.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFBFC' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
                    <td style={{ padding: '10px 14px', fontSize: '12.5px', fontWeight: 700, fontFamily: 'monospace' }}>
                      <Link href={`/bayaran/${r.id}`} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                        {r.nombor_resit}
                      </Link>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{r.nama_pelajar}</td>
                    <td style={{ padding: '10px 14px', fontSize: '12.5px', color: 'var(--text-muted)' }}>{r.jenis}</td>
                    <td style={{ padding: '10px 14px', fontSize: '12.5px', color: 'var(--text-muted)' }}>{r.bulan_bayaran} {r.tahun_bayaran}</td>
                    <td style={{ padding: '10px 14px', fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>RM {r.jumlah.toFixed(2)}</td>
                    <td style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--text-muted)' }}>{r.tarikh_bayar}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600,
                        background: r.status === 'Aktif' ? 'var(--hadir-bg)' : '#FFF1F2',
                        color: r.status === 'Aktif' ? 'var(--hadir-text)' : '#9F1239',
                      }}>{r.status}</span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <BtnUnduhResit kecil data={{
                          nombor_resit: r.nombor_resit,
                          nama_pelajar: r.nama_pelajar,
                          cawangan: r.cawangan,
                          jenis: r.jenis,
                          bulan_bayaran: r.bulan_bayaran,
                          tahun_bayaran: r.tahun_bayaran,
                          jumlah: r.jumlah,
                          kaedah_bayaran: r.kaedah_bayaran,
                          tarikh_bayar: r.tarikh_bayar,
                          status: r.status,
                          sebab_batal: r.sebab_batal,
                        }} />
                        {r.status === 'Aktif' && (
                          <>
                            <button onClick={() => setModalEdit(r)} title="Edit" aria-label={`Edit resit ${r.nombor_resit}`}
                              style={{
                                display: 'inline-flex', alignItems: 'center',
                                padding: '5px 8px',
                                background: '#EFF6FF', border: '1px solid #BFDBFE',
                                borderRadius: '8px', color: '#1E40AF', cursor: 'pointer', fontFamily: 'inherit',
                              }}>
                              <Edit2 size={13} />
                            </button>
                            <button onClick={() => setModalBatal(r)}
                              style={{
                                display: 'inline-flex', alignItems: 'center',
                                padding: '5px 10px',
                                background: '#FFF1F2', border: '1px solid #FECDD3',
                                borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                                color: '#9F1239', cursor: 'pointer', fontFamily: 'inherit',
                              }}>
                              Batal
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {jumlahHalaman > 1 && (
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', borderTop: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  {hasil.length} rekod · Halaman {halaman} daripada {jumlahHalaman}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => setHalaman((h) => Math.max(1, h - 1))} disabled={halaman === 1}
                    style={{ padding: '6px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12.5px', color: halaman === 1 ? 'var(--text-muted)' : 'var(--text)', cursor: halaman === 1 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                    ← Sebelum
                  </button>
                  <button onClick={() => setHalaman((h) => Math.min(jumlahHalaman, h + 1))} disabled={halaman === jumlahHalaman}
                    style={{ padding: '6px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12.5px', color: halaman === jumlahHalaman ? 'var(--text-muted)' : 'var(--text)', cursor: halaman === jumlahHalaman ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                    Seterusnya →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {modalBatal && (
        <ModalBatalResit
          resit={{ id: modalBatal.id, nombor_resit: modalBatal.nombor_resit, nama_pelajar: modalBatal.nama_pelajar, jumlah: modalBatal.jumlah }}
          onTutup={() => setModalBatal(null)}
          onBerjaya={() => {
            setModalBatal(null)
            toast.success(`Resit ${modalBatal.nombor_resit} berjaya dibatalkan.`)
            router.refresh()
          }}
        />
      )}

      {modalEdit && (
        <ModalEditResit
          resit={{
            id: modalEdit.id,
            nombor_resit: modalEdit.nombor_resit,
            nama_pelajar: modalEdit.nama_pelajar,
            jenis: modalEdit.jenis,
            bulan_bayaran: modalEdit.bulan_bayaran,
            tahun_bayaran: modalEdit.tahun_bayaran,
            jumlah: modalEdit.jumlah,
            kaedah_bayaran: modalEdit.kaedah_bayaran,
            tarikh_bayar: modalEdit.tarikh_bayar,
          }}
          onTutup={() => setModalEdit(null)}
          onBerjaya={() => {
            setModalEdit(null)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
