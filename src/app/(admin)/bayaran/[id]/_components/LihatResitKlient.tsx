'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Ban } from 'lucide-react'
import { BtnUnduhResit } from '@/components/pdf/BtnUnduhResit'
import { ModalBatalResit } from '../../_components/ModalBatalResit'
import { formatRinggit, formatTarikh } from '@/lib/utils'

type Resit = {
  id: string
  nombor_resit: string
  jenis: string
  bulan_bayaran: string
  tahun_bayaran: number
  jumlah: number
  kaedah_bayaran: string | null
  tarikh_bayar: string
  status: 'Aktif' | 'Dibatalkan'
  sebab_batal: string | null
  tarikh_batal: string | null
  pelajar_id: string | null
  nama_pelajar: string
  cawangan: string
}

export function LihatResitKlient({ resit }: { resit: Resit }) {
  const router = useRouter()
  const [modalBatal, setModalBatal] = useState(false)
  const batal = resit.status === 'Dibatalkan'

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <Link href="/bayaran" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>
        ← Senarai Resit
      </Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>
          Resit {resit.nombor_resit}
        </h1>
        <span
          style={{
            fontSize: '12px', padding: '4px 12px', borderRadius: '20px', fontWeight: 700,
            background: batal ? '#FFF1F2' : 'var(--hadir-bg)',
            color: batal ? '#9F1239' : 'var(--hadir-text)',
          }}
        >
          {batal ? 'Dibatalkan' : 'Aktif'}
        </span>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', marginBottom: '16px' }}>
        {[
          { label: 'Nama Pelajar', nilai: resit.nama_pelajar, pautan: resit.pelajar_id ? `/pelajar/${resit.pelajar_id}` : null },
          { label: 'Cawangan', nilai: resit.cawangan, pautan: null },
          { label: 'Jenis Bayaran', nilai: resit.jenis, pautan: null },
          { label: 'Bulan', nilai: `${resit.bulan_bayaran} ${resit.tahun_bayaran}`, pautan: null },
          { label: 'Kaedah Bayaran', nilai: resit.kaedah_bayaran ?? 'Tunai', pautan: null },
          { label: 'Tarikh Bayar', nilai: formatTarikh(resit.tarikh_bayar), pautan: null },
        ].map((b, i, arr) => (
          <div
            key={b.label}
            style={{
              display: 'flex', justifyContent: 'space-between', gap: '16px',
              paddingBottom: '12px', marginBottom: '12px',
              borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{b.label}</span>
            {b.pautan ? (
              <Link href={b.pautan} style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--primary)', textDecoration: 'underline' }}>
                {b.nilai}
              </Link>
            ) : (
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', textAlign: 'right' }}>{b.nilai}</span>
            )}
          </div>
        ))}

        <div
          style={{
            background: '#F8FAFC', border: '1.5px solid var(--primary)',
            borderRadius: '12px', padding: '16px 20px', marginTop: '4px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Jumlah Dibayar</span>
          <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)' }}>{formatRinggit(resit.jumlah)}</span>
        </div>
      </div>

      {batal && resit.sebab_batal && (
        <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '12px', padding: '14px 16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#9F1239', marginBottom: '4px' }}>
            RESIT DIBATALKAN{resit.tarikh_batal ? ` — ${formatTarikh(resit.tarikh_batal)}` : ''}
          </div>
          <div style={{ fontSize: '13px', color: '#9F1239' }}>Sebab: {resit.sebab_batal}</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <BtnUnduhResit
          data={{
            nombor_resit: resit.nombor_resit,
            nama_pelajar: resit.nama_pelajar,
            cawangan: resit.cawangan,
            jenis: resit.jenis,
            bulan_bayaran: resit.bulan_bayaran,
            tahun_bayaran: resit.tahun_bayaran,
            jumlah: resit.jumlah,
            kaedah_bayaran: resit.kaedah_bayaran,
            tarikh_bayar: resit.tarikh_bayar,
            status: resit.status,
            sebab_batal: resit.sebab_batal,
          }}
        />
        {!batal && (
          <button
            onClick={() => setModalBatal(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', background: '#FFF1F2', border: '1px solid #FECDD3',
              borderRadius: '10px', fontSize: '13px', fontWeight: 600,
              color: '#9F1239', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <Ban size={14} /> Batal Resit
          </button>
        )}
      </div>

      {modalBatal && (
        <ModalBatalResit
          resit={{ id: resit.id, nombor_resit: resit.nombor_resit, nama_pelajar: resit.nama_pelajar, jumlah: resit.jumlah }}
          onTutup={() => setModalBatal(false)}
          onBerjaya={() => {
            setModalBatal(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
