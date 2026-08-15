'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'
import { formatTarikhPendek, parseTimestampSheet } from '@/lib/utils'
import { daftarPelajarSheet } from '@/app/actions/pendaftaran'

type Cawangan = { id: string; nama: string }

type BarisSheet = {
  timestamp: string
  cawanganPilihan: string
  nama: string
  umur: string
  alamat: string
  sekolah: string
  namaIbuBapa: string
  telefon: string
  sudahDaftar: boolean
}

type BarisUI = BarisSheet & { key: string; cawanganId: string }

function padanCawangan(pilihan: string, list: Cawangan[]): string {
  const p = pilihan.trim().toUpperCase()
  if (!p) return ''
  const jumpa = list.find((c) => c.nama.trim().toUpperCase() === p)
  return jumpa?.id ?? ''
}

export function PendaftaranKlient({ cawanganList }: { cawanganList: Cawangan[] }) {
  const [rekod, setRekod] = useState<BarisUI[]>([])
  const [dipilih, setDipilih] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [ralatMuat, setRalatMuat] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [sedangDaftar, setSedangDaftar] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)
  const [berjaya, setBerjaya] = useState<string | null>(null)

  const muatRekod = useCallback(async () => {
    setLoading(true)
    setRalatMuat(null)
    setBerjaya(null)
    try {
      const res = await fetch('/api/pendaftaran/sync', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) {
        setRalatMuat(data?.ralat ?? 'Gagal tarik data dari Google Sheet.')
        setRekod([])
        setLoading(false)
        return
      }
      const baris: BarisSheet[] = data.rows ?? []
      setRekod(
        baris.map((b, i) => ({
          ...b,
          key: `${b.timestamp}|${b.nama}|${i}`,
          cawanganId: padanCawangan(b.cawanganPilihan, cawanganList),
        }))
      )
      setDipilih(new Set())
    } catch {
      setRalatMuat('Gagal sambung ke Google Sheet. Semak sambungan / konfigurasi.')
      setRekod([])
    }
    setLoading(false)
  }, [cawanganList])

  useEffect(() => {
    muatRekod()
  }, [muatRekod])

  const togglePilih = (key: string) => {
    setDipilih((prev) => {
      const set = new Set(prev)
      if (set.has(key)) set.delete(key)
      else set.add(key)
      return set
    })
  }

  const piliSemua = () => {
    setDipilih(new Set(rekod.filter((r) => !r.sudahDaftar).map((r) => r.key)))
  }
  const batalSemua = () => setDipilih(new Set())

  const setCawangan = (key: string, cawanganId: string) => {
    setRekod((prev) =>
      prev.map((r) => (r.key === key ? { ...r, cawanganId } : r))
    )
  }

  const rekodDipilih = rekod.filter((r) => dipilih.has(r.key))
  const adaTanpaCawangan = rekodDipilih.some((r) => !r.cawanganId)

  const bukaModal = () => {
    setRalat(null)
    if (rekodDipilih.length === 0) return
    setShowModal(true)
  }

  const sahkanDaftar = async () => {
    if (rekodDipilih.length === 0) return
    if (adaTanpaCawangan) {
      setRalat('Ada pelajar dipilih tanpa cawangan. Sila pilih cawangan dahulu.')
      return
    }
    setSedangDaftar(true)
    setRalat(null)

    const hasil = await daftarPelajarSheet(
      rekodDipilih.map((r) => ({
        nama: r.nama,
        namaIbuBapa: r.namaIbuBapa,
        telefon: r.telefon,
        alamat: r.alamat,
        cawanganId: r.cawanganId,
      }))
    )

    setSedangDaftar(false)
    setShowModal(false)

    if (hasil.ralat) {
      setRalat(hasil.ralat)
      return
    }
    setBerjaya(`${hasil.bilangan} pelajar berjaya didaftar.`)
    setDipilih(new Set())
    muatRekod()
  }

  const jumlahBaru = rekod.filter((r) => !r.sudahDaftar).length

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <Link href="/pelajar" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', display: 'block', marginBottom: '6px' }}>
            ← Senarai Pelajar
          </Link>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>
            Pendaftaran Baharu (Google Form)
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {rekod.length} entry · {jumlahBaru} baru · terus dari Google Sheet
          </p>
        </div>
        <button
          onClick={muatRekod}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '9px 14px',
            background: 'var(--card)', border: '1.5px solid var(--border)',
            borderRadius: '10px', fontSize: '13px', fontWeight: 600,
            color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <RefreshCw size={14} />
          Muat Semula
        </button>
      </div>

      {berjaya && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'var(--hadir-bg)', border: '1px solid #BBF7D0',
          borderRadius: '12px', padding: '14px 18px', marginBottom: '16px',
          fontSize: '13.5px', color: 'var(--hadir-text)', fontWeight: 600,
        }}>
          <CheckCircle2 size={16} />
          {berjaya}
        </div>
      )}

      {ralat && (
        <div style={{
          background: '#FFF1F2', border: '1px solid #FECDD3',
          borderRadius: '12px', padding: '14px 18px', marginBottom: '16px',
          fontSize: '13.5px', color: '#9F1239',
        }}>{ralat}</div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '14px' }}>
          Menarik data dari Google Sheet...
        </div>
      ) : ralatMuat ? (
        <div style={{
          background: '#FFF1F2', border: '1px solid #FECDD3',
          borderRadius: '14px', padding: '32px', textAlign: 'center',
        }}>
          <AlertCircle size={28} style={{ color: '#EF4444', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#9F1239', marginBottom: '6px' }}>
            Gagal tarik data
          </p>
          <p style={{ fontSize: '13px', color: '#B91C1C', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto' }}>
            {ralatMuat}
          </p>
        </div>
      ) : rekod.length === 0 ? (
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: '14px', padding: '60px', textAlign: 'center',
        }}>
          <CheckCircle2 size={32} style={{ color: 'var(--success)', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            Tiada entry
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Belum ada respons dalam Google Form.
          </p>
        </div>
      ) : (
        <>
          {/* Toolbar Pilih */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '12px 16px', marginBottom: '12px',
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={piliSemua}
                style={{
                  padding: '6px 12px', fontSize: '12.5px', fontWeight: 600,
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--text)',
                }}
              >Pilih Semua (baru sahaja)</button>
              <button onClick={batalSemua}
                style={{
                  padding: '6px 12px', fontSize: '12.5px', fontWeight: 600,
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--text-muted)',
                }}
              >Batalkan Pilihan</button>
            </div>
            {rekodDipilih.length > 0 && (
              <button
                onClick={bukaModal}
                style={{
                  padding: '8px 18px',
                  background: 'var(--accent)', border: 'none',
                  borderRadius: '10px', fontSize: '13.5px', fontWeight: 700,
                  color: 'var(--accent-text)', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Sahkan Daftar ({rekodDipilih.length})
              </button>
            )}
          </div>

          {/* Jadual */}
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: '14px', overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 16px', width: '40px' }}></th>
                  {['Nama', 'Ibu Bapa', 'No. Telefon', 'Cawangan', 'Tarikh Submit', 'Status'].map((h) => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left',
                      fontSize: '11px', fontWeight: 700,
                      color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rekod.map((r, i) => (
                  <tr key={r.key}
                    style={{
                      borderBottom: i < rekod.length - 1 ? '1px solid var(--border)' : 'none',
                      background: r.sudahDaftar ? 'var(--hadir-bg)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '11px 16px' }}>
                      <input
                        type="checkbox"
                        checked={dipilih.has(r.key)}
                        disabled={r.sudahDaftar}
                        onChange={() => togglePilih(r.key)}
                        style={{ width: '16px', height: '16px', cursor: r.sudahDaftar ? 'not-allowed' : 'pointer', accentColor: 'var(--accent)' }}
                      />
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>
                        {r.nama || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>{r.namaIbuBapa || '—'}</td>
                    <td style={{ padding: '11px 16px', fontSize: '13px', color: 'var(--text)' }}>{r.telefon || '—'}</td>
                    <td style={{ padding: '11px 16px' }}>
                      {r.sudahDaftar ? (
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>—</span>
                      ) : (
                        <select
                          value={r.cawanganId}
                          onChange={(e) => setCawangan(r.key, e.target.value)}
                          style={{
                            padding: '6px 8px',
                            fontSize: '12.5px', fontFamily: 'inherit',
                            background: 'var(--bg)',
                            border: `1.5px solid ${r.cawanganId ? 'var(--border)' : '#FCA5A5'}`,
                            borderRadius: '8px', color: 'var(--text)', cursor: 'pointer',
                            minWidth: '140px',
                          }}
                        >
                          <option value="">— Pilih cawangan —</option>
                          {cawanganList.map((c) => (
                            <option key={c.id} value={c.id}>{c.nama}</option>
                          ))}
                        </select>
                      )}
                      {!r.sudahDaftar && r.cawanganPilihan && (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                          Pilihan borang: {r.cawanganPilihan}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      {r.timestamp ? formatTarikhPendek(parseTimestampSheet(r.timestamp)) : '—'}
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      {r.sudahDaftar ? (
                        <span style={{
                          fontSize: '11.5px', padding: '3px 8px', borderRadius: '20px', fontWeight: 600,
                          background: '#DCFCE7', color: '#166534',
                        }}>Sudah Didaftar</span>
                      ) : (
                        <span style={{
                          fontSize: '11.5px', padding: '3px 8px', borderRadius: '20px', fontWeight: 600,
                          background: '#FEF9C3', color: '#92400E',
                        }}>Baru</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal Sahkan Daftar */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
        }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div style={{
            background: 'var(--card)', borderRadius: '20px',
            width: '100%', maxWidth: '400px',
            padding: '32px 28px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>
              Sahkan Pendaftaran
            </h2>
            <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Pelajar akan didaftar</span>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--hadir-text)' }}>{rekodDipilih.length} pelajar</span>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
              Pelajar didaftar sebagai kelas Kumpulan (RM70). Anda boleh kemas kini jenis kelas & yuran kemudian di profil pelajar.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowModal(false)}
                style={{
                  flex: 1, padding: '11px',
                  background: 'var(--bg)', border: '1.5px solid var(--border)',
                  borderRadius: '12px', fontSize: '13.5px', fontWeight: 600,
                  color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >Batal</button>
              <button onClick={sahkanDaftar} disabled={sedangDaftar}
                style={{
                  flex: 2, padding: '11px',
                  background: sedangDaftar ? '#94A3B8' : 'var(--accent)',
                  border: 'none', borderRadius: '12px',
                  fontSize: '13.5px', fontWeight: 700,
                  color: 'var(--accent-text)', cursor: sedangDaftar ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {sedangDaftar ? 'Mendaftar...' : 'Sahkan Daftar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
