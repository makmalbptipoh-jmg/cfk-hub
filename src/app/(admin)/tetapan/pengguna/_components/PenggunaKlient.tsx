'use client'

import { useState } from 'react'
import { Plus, RotateCcw, UserX, UserCheck, Shield, User, Edit2 } from 'lucide-react'
import { ModalResetKataLaluan } from '@/components/tetapan/ModalResetKataLaluan'
import { ModalTambahPengguna } from './ModalTambahPengguna'
import { ModalEditPengguna } from './ModalEditPengguna'
import { kemaskiniStatusPengguna } from '@/app/actions/pengguna'
import { useRouter } from 'next/navigation'
import { toast } from '@/lib/stores/toast-store'

type Pengguna = {
  id: string
  nama: string
  emel: string | null
  is_admin: boolean
  cawangan_id: string | null
  cawangan_nama: string | null
  status: 'Aktif' | 'Diblok'
}

type Cawangan = { id: string; nama: string }

interface Props {
  pengguna: Pengguna[]
  cawangan: Cawangan[]
}

export function PenggunaKlient({ pengguna, cawangan }: Props) {
  const router = useRouter()
  const [modalReset, setModalReset] = useState<{ id: string; nama: string } | null>(null)
  const [modalTambah, setModalTambah] = useState(false)
  const [modalEdit, setModalEdit] = useState<Pengguna | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const toggleStatus = async (p: Pengguna) => {
    setLoading(p.id)
    const aktifBaharu = p.status !== 'Aktif'
    const { ralat } = await kemaskiniStatusPengguna(p.id, aktifBaharu)
    setLoading(null)
    if (ralat) { toast.error(ralat); return }
    toast.success(`${p.nama} telah di${aktifBaharu ? 'aktifkan' : 'blok'}.`)
    router.refresh()
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {pengguna.length} akaun berdaftar
          </p>
        </div>
        <button onClick={() => setModalTambah(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '9px 16px',
            background: 'var(--accent)', border: 'none',
            borderRadius: '10px', fontSize: '13px', fontWeight: 700,
            color: 'var(--accent-text)', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <Plus size={14} />
          Tambah Pengguna
        </button>
      </div>

      {/* Senarai */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
        {pengguna.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>Tiada pengguna berdaftar.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                {['Nama', 'E-mel', 'Peranan', 'Cawangan', 'Status', 'Tindakan'].map((h) => (
                  <th key={h} style={{
                    padding: '11px 16px', textAlign: 'left',
                    fontSize: '11px', fontWeight: 700,
                    color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pengguna.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < pengguna.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {p.is_admin
                        ? <Shield size={14} style={{ color: 'var(--accent-dark)', flexShrink: 0 }} />
                        : <User size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      }
                      <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>{p.nama}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>{p.emel || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: '11.5px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600,
                      background: p.is_admin ? '#F7FEE7' : '#F1F5F9',
                      color: p.is_admin ? 'var(--accent-dark)' : 'var(--text-muted)',
                    }}>
                      {p.is_admin ? 'Admin' : 'Jurulatih'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {p.cawangan_nama || '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: '11.5px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600,
                      background: p.status === 'Aktif' ? 'var(--hadir-bg)' : '#FFF1F2',
                      color: p.status === 'Aktif' ? 'var(--hadir-text)' : '#9F1239',
                    }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => setModalEdit(p)}
                        title="Edit Maklumat"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '6px 10px',
                          background: '#EFF6FF', border: '1px solid #BFDBFE',
                          borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                          color: '#1E40AF', cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        <Edit2 size={12} />
                        Edit
                      </button>
                      <button
                        onClick={() => setModalReset({ id: p.id, nama: p.nama })}
                        title="Reset Kata Laluan"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '6px 10px',
                          background: 'var(--bg)', border: '1px solid var(--border)',
                          borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                          color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        <RotateCcw size={12} />
                        Reset
                      </button>
                      <button
                        onClick={() => toggleStatus(p)}
                        disabled={loading === p.id}
                        title={p.status === 'Aktif' ? 'Blok Pengguna' : 'Aktifkan Semula'}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '6px 10px',
                          background: p.status === 'Aktif' ? '#FFF1F2' : 'var(--hadir-bg)',
                          border: `1px solid ${p.status === 'Aktif' ? '#FECDD3' : '#BBF7D0'}`,
                          borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                          color: p.status === 'Aktif' ? '#9F1239' : 'var(--hadir-text)',
                          cursor: loading === p.id ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                          opacity: loading === p.id ? 0.5 : 1,
                        }}
                      >
                        {p.status === 'Aktif' ? <><UserX size={12} /> Blok</> : <><UserCheck size={12} /> Aktif</>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {modalReset && (
        <ModalResetKataLaluan
          penggunaId={modalReset.id}
          namaPengguna={modalReset.nama}
          onTutup={() => setModalReset(null)}
          onBerjaya={() => {
            setModalReset(null)
            toast.success('Kata laluan berjaya direset.')
          }}
        />
      )}

      {modalTambah && (
        <ModalTambahPengguna
          cawangan={cawangan}
          onTutup={() => setModalTambah(false)}
          onBerjaya={() => {
            setModalTambah(false)
            toast.success('Pengguna baharu berjaya ditambah.')
            router.refresh()
          }}
        />
      )}

      {modalEdit && (
        <ModalEditPengguna
          pengguna={modalEdit}
          cawangan={cawangan}
          onTutup={() => setModalEdit(null)}
          onBerjaya={() => {
            setModalEdit(null)
            toast.success('Maklumat pengguna dikemaskini.')
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
