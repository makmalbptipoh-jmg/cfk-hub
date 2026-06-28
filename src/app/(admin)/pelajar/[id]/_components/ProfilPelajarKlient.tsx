'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Edit2, UserX, UserCheck, CalendarCheck, Receipt } from 'lucide-react'
import { ModalNyahaktif } from '@/components/pelajar/ModalNyahaktif'
import { formatTarikh, formatRinggit } from '@/lib/utils'

type Pelajar = {
  id: string
  nama_penuh: string
  tarikh_lahir: string | null
  nama_ibu_bapa: string
  no_telefon: string
  emel_ibu_bapa: string | null
  jenis_kelas: string
  yuran_bulanan: number
  status: string
  tarikh_daftar: string
  cawangan_nama: string
}

type StatKehadiran = {
  hadir: number
  tidak_hadir: number
  cuti: number
}

type Kehadiran = {
  id: string
  tarikh: string
  status: string
  nota: string | null
}

type Resit = {
  id: string
  nombor_resit: string
  bulan_bayaran: string
  jenis: string
  jumlah: number
  kaedah_bayaran: string | null
  tarikh_bayar: string
  status: string
}

interface ProfilPelajarKlientProps {
  pelajar: Pelajar
  stat: StatKehadiran
  sudahBayarBulanIni: boolean
  kehadiran: Kehadiran[]
  resit: Resit[]
}

const warnaBadge: Record<string, { bg: string; text: string }> = {
  Hadir: { bg: 'var(--hadir-bg)', text: 'var(--hadir-text)' },
  'Tidak Hadir': { bg: 'var(--tidak-hadir-bg)', text: 'var(--tidak-hadir-text)' },
  Cuti: { bg: 'var(--cuti-bg)', text: 'var(--cuti-text)' },
}

export function ProfilPelajarKlient({ pelajar, stat, sudahBayarBulanIni, kehadiran, resit }: ProfilPelajarKlientProps) {
  const [tab, setTab] = useState<'kehadiran' | 'bayaran'>('kehadiran')
  const [showModal, setShowModal] = useState(false)

  const jumlahSesi = stat.hadir + stat.tidak_hadir + stat.cuti
  const peratus = jumlahSesi > 0 ? Math.round((stat.hadir / jumlahSesi) * 100) : 0

  return (
    <div style={{ maxWidth: '760px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <Link href="/pelajar" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>
            ← Senarai Pelajar
          </Link>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>
            {pelajar.nama_penuh}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
            <span style={{
              fontSize: '12px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600,
              background: pelajar.status === 'Aktif' ? 'var(--hadir-bg)' : '#F1F5F9',
              color: pelajar.status === 'Aktif' ? 'var(--hadir-text)' : 'var(--text-muted)',
            }}>{pelajar.status}</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{pelajar.cawangan_nama} · {pelajar.jenis_kelas}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 14px',
              background: 'var(--card)', border: '1.5px solid var(--border)',
              borderRadius: '10px', fontSize: '13px', fontWeight: 600,
              color: pelajar.status === 'Aktif' ? 'var(--danger)' : 'var(--success)',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {pelajar.status === 'Aktif' ? <UserX size={14} /> : <UserCheck size={14} />}
            {pelajar.status === 'Aktif' ? 'Nyahaktifkan' : 'Aktifkan Semula'}
          </button>
          <Link href={`/pelajar/${pelajar.id}/edit`}
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

      {/* Maklumat + Statistik */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        {/* Info Kad */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
            Maklumat Peribadi
          </h2>
          {[
            { label: 'Tarikh Lahir', nilai: pelajar.tarikh_lahir ? formatTarikh(pelajar.tarikh_lahir) : '—' },
            { label: 'Ibu Bapa / Penjaga', nilai: pelajar.nama_ibu_bapa },
            { label: 'No. Telefon', nilai: pelajar.no_telefon },
            { label: 'E-mel', nilai: pelajar.emel_ibu_bapa || '—' },
            { label: 'Yuran Bulanan', nilai: formatRinggit(pelajar.yuran_bulanan) },
            { label: 'Tarikh Daftar', nilai: formatTarikh(pelajar.tarikh_daftar) },
          ].map((b, i, arr) => (
            <div key={b.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              paddingBottom: i < arr.length - 1 ? '10px' : 0,
              marginBottom: i < arr.length - 1 ? '10px' : 0,
              borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{b.label}</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', textAlign: 'right', maxWidth: '180px' }}>{b.nilai}</span>
            </div>
          ))}
        </div>

        {/* Statistik Bulan Ini */}
        <div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
              Kehadiran Bulan Ini
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
              {[
                { label: 'Hadir', nilai: stat.hadir, warna: 'var(--hadir-text)', bg: 'var(--hadir-bg)' },
                { label: 'Tidak Hadir', nilai: stat.tidak_hadir, warna: 'var(--tidak-hadir-text)', bg: 'var(--tidak-hadir-bg)' },
                { label: 'Cuti', nilai: stat.cuti, warna: 'var(--cuti-text)', bg: 'var(--cuti-bg)' },
              ].map((s) => (
                <div key={s.label} style={{ background: s.bg, borderRadius: '10px', padding: '12px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: s.warna }}>{s.nilai}</div>
                  <div style={{ fontSize: '11px', color: s.warna, marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Kadar kehadiran: <strong style={{ color: 'var(--text)' }}>{peratus}%</strong>
              {' '}({stat.hadir}/{jumlahSesi} sesi)
            </div>
          </div>

          {/* Status Yuran */}
          <div style={{
            background: sudahBayarBulanIni ? 'var(--hadir-bg)' : (stat.hadir >= 4 ? '#FFF7ED' : 'var(--card)'),
            border: `1px solid ${sudahBayarBulanIni ? '#BBF7D0' : (stat.hadir >= 4 ? '#FED7AA' : 'var(--border)')}`,
            borderRadius: '14px', padding: '16px 20px',
          }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Status Yuran Bulan Ini
            </div>
            <div style={{
              fontSize: '15px', fontWeight: 700,
              color: sudahBayarBulanIni ? 'var(--hadir-text)' : (stat.hadir >= 4 ? '#C2410C' : 'var(--text-muted)'),
            }}>
              {sudahBayarBulanIni ? '✓ Sudah Bayar' : stat.hadir >= 4 ? '⚠ Perlu Bayar (≥4 sesi)' : `Belum Cukup Sesi (${stat.hadir}/4)`}
            </div>
          </div>
        </div>
      </div>

      {/* Tab */}
      <div style={{ borderBottom: '2px solid var(--border)', display: 'flex', gap: '0', marginBottom: '20px' }}>
        {[
          { key: 'kehadiran', label: 'Kehadiran', icon: CalendarCheck },
          { key: 'bayaran', label: 'Bayaran & Resit', icon: Receipt },
        ].map(({ key, label, icon: Icon }) => {
          const aktif = tab === key
          return (
            <button key={key}
              onClick={() => setTab(key as 'kehadiran' | 'bayaran')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 16px',
                background: 'none', border: 'none',
                borderBottom: aktif ? '2px solid var(--primary)' : '2px solid transparent',
                marginBottom: '-2px',
                fontSize: '13.5px', fontWeight: aktif ? 700 : 500,
                color: aktif ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          )
        })}
      </div>

      {/* Kandungan Tab */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
        {tab === 'kehadiran' && (
          kehadiran.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <CalendarCheck size={32} style={{ color: 'var(--border)', margin: '0 auto 12px' }} />
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>Tiada rekod kehadiran lagi</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                  {['Tarikh', 'Status', 'Nota'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {kehadiran.map((k, i) => {
                  const w = warnaBadge[k.status] ?? { bg: '#F1F5F9', text: 'var(--text-muted)' }
                  return (
                    <tr key={k.id} style={{ borderBottom: i < kehadiran.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <td style={{ padding: '11px 16px', fontSize: '13.5px', color: 'var(--text)' }}>{formatTarikh(k.tarikh)}</td>
                      <td style={{ padding: '11px 16px' }}>
                        <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600, background: w.bg, color: w.text }}>
                          {k.status}
                        </span>
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>{k.nota || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )
        )}

        {tab === 'bayaran' && (
          resit.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <Receipt size={32} style={{ color: 'var(--border)', margin: '0 auto 12px' }} />
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>Tiada rekod bayaran lagi</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                  {['No. Resit', 'Bulan', 'Jenis', 'Jumlah', 'Kaedah', 'Status'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resit.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: i < resit.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '11px 16px', fontSize: '12.5px', fontWeight: 600, color: 'var(--text)', fontFamily: 'monospace' }}>{r.nombor_resit}</td>
                    <td style={{ padding: '11px 16px', fontSize: '13px', color: 'var(--text)' }}>{r.bulan_bayaran}</td>
                    <td style={{ padding: '11px 16px', fontSize: '13px', color: 'var(--text)' }}>{r.jenis}</td>
                    <td style={{ padding: '11px 16px', fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>{formatRinggit(r.jumlah)}</td>
                    <td style={{ padding: '11px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>{r.kaedah_bayaran || '—'}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{
                        fontSize: '11.5px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600,
                        background: r.status === 'Aktif' ? 'var(--hadir-bg)' : 'var(--tidak-hadir-bg)',
                        color: r.status === 'Aktif' ? 'var(--hadir-text)' : 'var(--tidak-hadir-text)',
                      }}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>

      {showModal && (
        <ModalNyahaktif
          pelajarId={pelajar.id}
          namaPelajar={pelajar.nama_penuh}
          statusSemasa={pelajar.status}
          onTutup={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
