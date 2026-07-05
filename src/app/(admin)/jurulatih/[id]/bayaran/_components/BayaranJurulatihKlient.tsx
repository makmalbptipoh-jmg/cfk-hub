'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Wallet } from 'lucide-react'
import { ModalRekodBayaran } from './ModalRekodBayaran'
import { formatRinggit, formatTarikh } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { toast } from '@/lib/stores/toast-store'

type Jurulatih = {
  id: string
  nama_penuh: string
  kadar_bayaran: number
}

type Bayaran = {
  id: string
  bulan_bayaran: string
  tahun_bayaran: number
  bilangan_sesi: number
  kadar_per_sesi: number
  jumlah: number
  tarikh_bayar: string | null
  status: string
  nota: string | null
}

interface Props {
  jurulatih: Jurulatih
  bayaran: Bayaran[]
  bulanSemasa: string
  tahunSemasa: number
  bilSesiHadirBulanIni: number
  sudahRekodBulanIni: boolean
}

export function BayaranJurulatihKlient({ jurulatih, bayaran, bulanSemasa, tahunSemasa, bilSesiHadirBulanIni, sudahRekodBulanIni }: Props) {
  const router = useRouter()
  const [modal, setModal] = useState(false)

  const jumlahKeseluruhan = bayaran.filter((b) => b.status === 'Sudah Bayar').reduce((sum, b) => sum + b.jumlah, 0)

  return (
    <div style={{ maxWidth: '720px' }}>
      {/* Breadcrumb */}
      <Link href={`/jurulatih/${jurulatih.id}`} style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>
        ← {jurulatih.nama_penuh}
      </Link>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: '20px' }}>
        Bayaran Jurulatih
      </h1>

      {/* Ringkasan + CTA Bulan Ini */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', marginBottom: '20px', alignItems: 'stretch' }}>
        <div style={{
          background: sudahRekodBulanIni ? 'var(--hadir-bg)' : '#FFF7ED',
          border: `1px solid ${sudahRekodBulanIni ? '#BBF7D0' : '#FED7AA'}`,
          borderRadius: '14px', padding: '16px 20px',
        }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: sudahRekodBulanIni ? 'var(--hadir-text)' : '#92400E', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            {bulanSemasa} {tahunSemasa}
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: sudahRekodBulanIni ? 'var(--hadir-text)' : '#C2410C', marginBottom: '3px' }}>
            {sudahRekodBulanIni ? '✓ Sudah Direkod' : '⚠ Belum Direkod'}
          </div>
          <div style={{ fontSize: '12.5px', color: sudahRekodBulanIni ? 'var(--hadir-text)' : '#92400E', opacity: 0.8 }}>
            {bilSesiHadirBulanIni} sesi hadir bulan ini · Kadar: {formatRinggit(jurulatih.kadar_bayaran)}/sesi
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {!sudahRekodBulanIni && (
            <button
              onClick={() => setModal(true)}
              disabled={bilSesiHadirBulanIni === 0}
              title={bilSesiHadirBulanIni === 0 ? 'Tiada sesi hadir bulan ini — rekod kehadiran dahulu' : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '11px 16px', height: '100%',
                background: bilSesiHadirBulanIni === 0 ? '#94A3B8' : 'var(--accent)',
                border: 'none',
                borderRadius: '14px', fontSize: '13px', fontWeight: 700,
                color: 'var(--accent-text)',
                cursor: bilSesiHadirBulanIni === 0 ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}>
              <Plus size={14} />
              Rekod Bayaran<br />Bulan Ini
            </button>
          )}
          <Link href={`/jurulatih/${jurulatih.id}/kehadiran`}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 14px',
              background: 'var(--bg)', border: '1.5px solid var(--border)',
              borderRadius: '12px', fontSize: '12.5px', fontWeight: 600,
              color: 'var(--text)', textDecoration: 'none', whiteSpace: 'nowrap',
            }}>
            Lihat Kehadiran
          </Link>
        </div>
      </div>

      {/* Jumlah keseluruhan */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: '12px', padding: '14px 20px', marginBottom: '16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Jumlah Keseluruhan Dibayar</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{bayaran.filter((b) => b.status === 'Sudah Bayar').length} rekod bayaran</div>
        </div>
        <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text)' }}>{formatRinggit(jumlahKeseluruhan)}</div>
      </div>

      {/* Senarai Bayaran */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>Sejarah Bayaran</h2>
          {sudahRekodBulanIni && (
            <button onClick={() => setModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '7px 12px',
                background: 'var(--bg)', border: '1.5px solid var(--border)',
                borderRadius: '9px', fontSize: '12.5px', fontWeight: 600,
                color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit',
              }}>
              <Plus size={12} />Rekod Baharu
            </button>
          )}
        </div>

        {bayaran.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <Wallet size={32} style={{ color: 'var(--border)', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>Belum ada rekod bayaran</p>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Klik "Rekod Bayaran Bulan Ini" untuk mula.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                {['Bulan', 'Sesi', 'Kadar', 'Jumlah', 'Tarikh Bayar', 'Status', 'Nota'].map((h) => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bayaran.map((b, i) => (
                <tr key={b.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFBFC' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
                  <td style={{ padding: '10px 14px', fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>{b.bulan_bayaran} {b.tahun_bayaran}</td>
                  <td style={{ padding: '10px 14px', fontSize: '13px', color: 'var(--text)' }}>{b.bilangan_sesi}</td>
                  <td style={{ padding: '10px 14px', fontSize: '13px', color: 'var(--text-muted)' }}>{formatRinggit(b.kadar_per_sesi)}</td>
                  <td style={{ padding: '10px 14px', fontSize: '14px', fontWeight: 800, color: 'var(--text)' }}>{formatRinggit(b.jumlah)}</td>
                  <td style={{ padding: '10px 14px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    {b.tarikh_bayar ? formatTarikh(b.tarikh_bayar) : '—'}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      fontSize: '11.5px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600,
                      background: b.status === 'Sudah Bayar' ? 'var(--hadir-bg)' : '#FFF7ED',
                      color: b.status === 'Sudah Bayar' ? 'var(--hadir-text)' : '#C2410C',
                    }}>
                      {b.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: '12.5px', color: 'var(--text-muted)' }}>{b.nota || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <ModalRekodBayaran
          jurulatihId={jurulatih.id}
          namaJurulatih={jurulatih.nama_penuh}
          bulan={bulanSemasa}
          tahun={tahunSemasa}
          bilSesiHadir={bilSesiHadirBulanIni}
          kadarPerSesi={jurulatih.kadar_bayaran}
          onTutup={() => setModal(false)}
          onBerjaya={() => {
            setModal(false)
            toast.success(`Bayaran ${bulanSemasa} ${tahunSemasa} berjaya direkod.`)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
