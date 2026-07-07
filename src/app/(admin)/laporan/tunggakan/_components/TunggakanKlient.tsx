'use client'

import { useState, useMemo } from 'react'
import { MessageCircle, AlertCircle } from 'lucide-react'
import { formatRinggit } from '@/lib/utils'
import type { BarisTunggakan } from '../page'

const NAMA_BULAN = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
]
const SINGKAT = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis']

type Cawangan = { id: string; nama: string }

export function TunggakanKlient({ baris, cawangan, tahun }: { baris: BarisTunggakan[]; cawangan: Cawangan[]; tahun: number }) {
  const [filterCawangan, setFilterCawangan] = useState('')

  const senarai = useMemo(() => {
    if (!filterCawangan) return baris
    const nama = cawangan.find((c) => c.id === filterCawangan)?.nama
    return baris.filter((b) => b.cawangan_nama === nama)
  }, [baris, filterCawangan, cawangan])

  const jumlahBesar = senarai.reduce((s, b) => s + b.jumlah, 0)

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>Laporan Tunggakan</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Yuran belum dijelaskan bagi tahun {tahun} (bulan dengan ≥4 kehadiran tetapi tiada resit).
          </p>
        </div>
        <select
          value={filterCawangan}
          onChange={(e) => setFilterCawangan(e.target.value)}
          style={{ padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13.5px', color: 'var(--text)', background: 'var(--card)', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}
        >
          <option value="">Semua Cawangan</option>
          {cawangan.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
        </select>
      </div>

      {/* Ringkasan */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '22px', maxWidth: '480px' }}>
        <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '16px', padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <AlertCircle size={15} style={{ color: '#C2410C' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pelajar Bertunggak</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#C2410C' }}>{senarai.length}</div>
        </div>
        <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '16px', padding: '18px 20px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#9F1239', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Jumlah Tertunggak</span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#9F1239', marginTop: '8px' }}>{formatRinggit(jumlahBesar)}</div>
        </div>
      </div>

      {senarai.length === 0 ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '48px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>✓</div>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--hadir-text)' }}>Tiada tunggakan!</p>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>Semua pelajar aktif sudah menjelaskan yuran (atau belum mencapai 4 kehadiran sebulan).</p>
        </div>
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                {['Pelajar', 'Cawangan', 'Bulan Tertunggak', 'Jumlah', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {senarai.map((b, i) => {
                const noTel = b.no_telefon.replace(/\D/g, '').replace(/^0/, '60')
                const senaraiBulan = b.bulanTunggak.map((m) => NAMA_BULAN[m - 1]).join(', ')
                const msg = encodeURIComponent(
                  `Assalamualaikum, sebagai peringatan mesra, yuran kelas catur CFK bagi ${b.nama_penuh} masih tertunggak untuk bulan ${senaraiBulan} ${tahun} (jumlah ${formatRinggit(b.jumlah)}). Mohon jelaskan bila senang. Terima kasih. 🙏`
                )
                return (
                  <tr key={b.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '11px 14px', fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>{b.nama_penuh}</td>
                    <td style={{ padding: '11px 14px', fontSize: '12.5px', color: 'var(--text-muted)' }}>{b.cawangan_nama}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {b.bulanTunggak.map((m) => (
                          <span key={m} style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: '#FFF1F2', color: '#9F1239' }}>{SINGKAT[m - 1]}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: '14px', fontWeight: 700, color: '#9F1239', whiteSpace: 'nowrap' }}>{formatRinggit(b.jumlah)}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <a
                        href={`https://wa.me/${noTel}?text=${msg}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#166534', textDecoration: 'none', whiteSpace: 'nowrap' }}
                      >
                        <MessageCircle size={12} /> WA
                      </a>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
