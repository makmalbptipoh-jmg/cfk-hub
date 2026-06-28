'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatTarikhPendek } from '@/lib/utils'

type ImportRekod = {
  id: string
  nama_penuh: string
  tarikh_lahir: string | null
  nama_ibu_bapa: string | null
  no_telefon: string | null
  cawangan_pilihan: string | null
  adalah_pendua: boolean
  status: string
  tarikh_submit: string | null
}

export default function ImportPage() {
  const router = useRouter()
  const [rekod, setRekod] = useState<ImportRekod[]>([])
  const [dipilih, setDipilih] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [sedangImport, setSedangImport] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)
  const [berjaya, setBerjaya] = useState<string | null>(null)

  const muatRekod = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('import_antrian')
      .select('*')
      .eq('status', 'Menunggu')
      .order('tarikh_submit', { ascending: false })
    setRekod(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { muatRekod() }, [muatRekod])

  const togglePilih = (id: string) => {
    setDipilih((prev) => {
      const set = new Set(prev)
      set.has(id) ? set.delete(id) : set.add(id)
      return set
    })
  }

  const piliSemua = () => {
    const bukanPendua = rekod.filter((r) => !r.adalah_pendua).map((r) => r.id)
    setDipilih(new Set(bukanPendua))
  }

  const batalSemua = () => setDipilih(new Set())

  const sahkanImport = async () => {
    if (dipilih.size === 0) return
    setSedangImport(true)
    setRalat(null)

    const supabase = createClient()
    const rekodDipilih = rekod.filter((r) => dipilih.has(r.id))

    const insertData = rekodDipilih.map((r) => ({
      nama_penuh: r.nama_penuh,
      nama_ibu_bapa: r.nama_ibu_bapa ?? 'Tidak diketahui',
      no_telefon: r.no_telefon ?? '—',
      tarikh_lahir: r.tarikh_lahir,
      cawangan_daftar_id: null as unknown as string,
      jenis_kelas: 'Kumpulan' as const,
      yuran_bulanan: 70,
      sumber_daftar: 'GoogleForms' as const,
    }))

    const { error: errInsert } = await supabase.from('pelajar').insert(insertData)

    if (errInsert) {
      setRalat('Gagal import. Sila cuba lagi.')
      setSedangImport(false)
      setShowModal(false)
      return
    }

    await supabase
      .from('import_antrian')
      .update({ status: 'Diimport' })
      .in('id', Array.from(dipilih))

    setBerjaya(`${dipilih.size} pelajar berjaya diimport.`)
    setShowModal(false)
    setSedangImport(false)
    setDipilih(new Set())
    muatRekod()
  }

  const rekodDipilihCount = dipilih.size
  const rekodDilangkau = rekod.filter((r) => r.adalah_pendua && !dipilih.has(r.id)).length

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <Link href="/pelajar" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', display: 'block', marginBottom: '6px' }}>
            ← Senarai Pelajar
          </Link>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>
            Import Google Forms
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {rekod.length} rekod menunggu · Rekod pendua ditandakan merah
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
          Memuatkan rekod...
        </div>
      ) : rekod.length === 0 ? (
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: '14px', padding: '60px', textAlign: 'center',
        }}>
          <CheckCircle2 size={32} style={{ color: 'var(--success)', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            Tiada rekod menunggu
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Semua rekod dari Google Forms telah diproses.
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
              >Pilih Semua (bukan pendua)</button>
              <button onClick={batalSemua}
                style={{
                  padding: '6px 12px', fontSize: '12.5px', fontWeight: 600,
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--text-muted)',
                }}
              >Batalkan Pilihan</button>
            </div>
            {rekodDipilihCount > 0 && (
              <button
                onClick={() => setShowModal(true)}
                style={{
                  padding: '8px 18px',
                  background: 'var(--accent)', border: 'none',
                  borderRadius: '10px', fontSize: '13.5px', fontWeight: 700,
                  color: 'var(--accent-text)', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Sahkan Import ({rekodDipilihCount} rekod)
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
                  <tr key={r.id}
                    style={{
                      borderBottom: i < rekod.length - 1 ? '1px solid var(--border)' : 'none',
                      background: r.adalah_pendua ? '#FFF9F9' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '11px 16px' }}>
                      <input
                        type="checkbox"
                        checked={dipilih.has(r.id)}
                        onChange={() => togglePilih(r.id)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent)' }}
                      />
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {r.adalah_pendua && (
                          <AlertCircle size={14} style={{ color: '#EF4444', flexShrink: 0 }} />
                        )}
                        <span style={{ fontSize: '13.5px', fontWeight: 600, color: r.adalah_pendua ? '#EF4444' : 'var(--text)' }}>
                          {r.nama_penuh}
                        </span>
                        {r.adalah_pendua && (
                          <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '4px', background: '#FEE2E2', color: '#B91C1C', fontWeight: 600 }}>
                            Pendua
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>{r.nama_ibu_bapa || '—'}</td>
                    <td style={{ padding: '11px 16px', fontSize: '13px', color: 'var(--text)' }}>{r.no_telefon || '—'}</td>
                    <td style={{ padding: '11px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>{r.cawangan_pilihan || '—'}</td>
                    <td style={{ padding: '11px 16px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      {r.tarikh_submit ? formatTarikhPendek(r.tarikh_submit) : '—'}
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{
                        fontSize: '11.5px', padding: '3px 8px', borderRadius: '20px', fontWeight: 600,
                        background: '#FEF9C3', color: '#92400E',
                      }}>Menunggu</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal Sahkan Import */}
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
              Sahkan Import
            </h2>
            <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Rekod akan diimport</span>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--hadir-text)' }}>{rekodDipilihCount} rekod</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Rekod dilangkau</span>
                <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {rekod.length - rekodDipilihCount} rekod
                </span>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
              Pelajar yang diimport perlu dikemaskini dengan maklumat cawangan selepas import.
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
              <button onClick={sahkanImport} disabled={sedangImport}
                style={{
                  flex: 2, padding: '11px',
                  background: sedangImport ? '#94A3B8' : 'var(--accent)',
                  border: 'none', borderRadius: '12px',
                  fontSize: '13.5px', fontWeight: 700,
                  color: 'var(--accent-text)', cursor: sedangImport ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {sedangImport ? 'Mengimport...' : `Sahkan Import`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
