'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CariPelajar } from '@/components/pelajar/CariPelajar'
import { BtnUnduhResit } from '@/components/pdf/BtnUnduhResit'
import { kirYuranBulanan } from '@/lib/utils'

type PelajarDipilih = {
  id: string
  nama_penuh: string
  jenis_kelas: string
  cawangan: string
  no_telefon: string
}

const YURAN_PENDAFTARAN = 50

const gayaInput = {
  width: '100%', padding: '10px 14px',
  border: '1.5px solid var(--border)', borderRadius: '12px',
  fontSize: '13.5px', color: 'var(--text)',
  background: 'var(--card)', outline: 'none', fontFamily: 'inherit',
  boxSizing: 'border-box' as const,
}

const labelInput = {
  display: 'block' as const,
  fontSize: '12px', fontWeight: 600 as const,
  color: 'var(--text-muted)', marginBottom: '6px',
  textTransform: 'uppercase' as const, letterSpacing: '0.05em',
}

function bulanMYToLabel(bm: string) {
  // bm = "2026-06" → { nama: "Jun", tahun: 2026 }
  const [yr, mo] = bm.split('-')
  const d = new Date(parseInt(yr), parseInt(mo) - 1, 1)
  return {
    nama: d.toLocaleString('ms-MY', { month: 'long' }),
    tahun: parseInt(yr),
    label: d.toLocaleString('ms-MY', { month: 'long', year: 'numeric' }),
  }
}

function bulanSemasa() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function RekodBayaranPage() {
  const router = useRouter()
  const [langkah, setLangkah] = useState(1)
  const [loading, setLoading] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)
  const [nomorResitBaru, setNomorResitBaru] = useState<string | null>(null)

  // Data form
  const [pelajar, setPelajar] = useState<PelajarDipilih | null>(null)
  const [jenis, setJenis] = useState<'Kumpulan' | 'Personal' | 'Pendaftaran'>('Kumpulan')
  const [bulanInput, setBulanInput] = useState(bulanSemasa())
  const [jumlahCustom, setJumlahCustom] = useState('')
  const [kaedah, setKaedah] = useState<'Tunai' | 'Transfer'>('Tunai')
  const [tarikhBayar, setTarikhBayar] = useState(new Date().toISOString().split('T')[0])

  // Kira jumlah automatik
  const bulanObj = bulanMYToLabel(bulanInput)

  const jumlahAuto = () => {
    if (jenis === 'Pendaftaran') return YURAN_PENDAFTARAN
    if (jenis === 'Personal') return 150
    if (!pelajar) return 70
    return kirYuranBulanan(pelajar.jenis_kelas === 'Kumpulan+Personal' ? 'Kumpulan' : pelajar.jenis_kelas)
  }

  const jumlahAkhir = jumlahCustom ? parseFloat(jumlahCustom) : jumlahAuto()

  const pilihPelajar = async (p: any) => {
    // Fetch full record to get jenis_kelas dan cawangan nama
    const supabase = createClient()
    const { data } = await supabase
      .from('pelajar')
      .select('id, nama_penuh, jenis_kelas, no_telefon, cawangan:cawangan_daftar_id(nama)')
      .eq('id', p.id)
      .single()

    const jenisPelajar = data?.jenis_kelas ?? 'Kumpulan'
    const cawanganNama = (data?.cawangan as any)?.nama ?? p.cawangan_nama ?? '—'

    setPelajar({
      id: p.id,
      nama_penuh: p.nama_penuh,
      jenis_kelas: jenisPelajar,
      cawangan: cawanganNama,
      no_telefon: p.no_telefon ?? '',
    })
    if (jenisPelajar === 'Personal') setJenis('Personal')
    else setJenis('Kumpulan')
  }

  const validLangkah1 = pelajar !== null && !isNaN(jumlahAkhir) && jumlahAkhir > 0

  const sambungLangkah2 = () => {
    if (!validLangkah1) { setRalat('Sila pilih pelajar dan semak jumlah bayaran.'); return }
    setRalat(null)
    setLangkah(2)
  }

  const jana = async () => {
    if (!pelajar) return
    setLoading(true)
    setRalat(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase.from('resit').insert({
      pelajar_id: pelajar.id,
      jenis,
      bulan_bayaran: bulanObj.nama,
      tahun_bayaran: bulanObj.tahun,
      jumlah: jumlahAkhir,
      kaedah_bayaran: kaedah,
      tarikh_bayar: tarikhBayar,
      direkod_oleh: user?.id ?? null,
    }).select('nombor_resit').single()

    if (error) {
      setRalat('Gagal simpan resit. Sila cuba lagi.')
      setLoading(false)
      return
    }
    setNomorResitBaru(data?.nombor_resit ?? null)
    setLangkah(3)
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '28px' }}>
        <Link href="/bayaran" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>
          ← Senarai Resit
        </Link>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>
          Rekod Bayaran Baharu
        </h1>
      </div>

      {/* Stepper indicator */}
      {langkah < 3 && (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px' }}>
          {[
            { n: 1, label: 'Maklumat Bayaran' },
            { n: 2, label: 'Semak & Jana' },
          ].map((s, i, arr) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < arr.length - 1 ? 1 : 'unset' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: langkah > s.n ? 'var(--accent)' : langkah === s.n ? 'var(--primary)' : 'var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700,
                  color: langkah >= s.n ? '#FFFFFF' : 'var(--text-muted)',
                }}>
                  {langkah > s.n ? <Check size={14} /> : s.n}
                </div>
                <span style={{
                  fontSize: '12.5px', fontWeight: langkah === s.n ? 700 : 500,
                  color: langkah === s.n ? 'var(--text)' : 'var(--text-muted)',
                }}>
                  {s.label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div style={{ flex: 1, height: '1.5px', background: langkah > s.n ? 'var(--accent)' : 'var(--border)', margin: '0 12px' }} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Langkah 1: Maklumat Bayaran ── */}
      {langkah === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Pilih Pelajar */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>Pelajar</h2>
            <CariPelajar onPilih={pilihPelajar} nilaiAwal={pelajar?.nama_penuh} />
            {pelajar && (
              <div style={{
                marginTop: '12px', background: '#F7FEE7', border: '1px solid #D9F99D',
                borderRadius: '12px', padding: '12px 14px',
              }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>{pelajar.nama_penuh}</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  {pelajar.cawangan} · {pelajar.jenis_kelas}
                </div>
              </div>
            )}
          </div>

          {/* Jenis & Bulan */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>Jenis & Bulan Bayaran</h2>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelInput}>Jenis Bayaran</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['Kumpulan', 'Personal', 'Pendaftaran'] as const).map((j) => {
                  const aktif = jenis === j
                  return (
                    <button key={j} type="button" onClick={() => { setJenis(j); setJumlahCustom('') }}
                      style={{
                        flex: 1, padding: '9px 8px', borderRadius: '10px',
                        border: `2px solid ${aktif ? 'var(--accent)' : 'var(--border)'}`,
                        background: aktif ? '#F7FEE7' : 'transparent',
                        color: aktif ? 'var(--accent-dark)' : 'var(--text-muted)',
                        fontSize: '12.5px', fontWeight: aktif ? 700 : 500,
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}>
                      {j}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelInput}>Bulan Bayaran</label>
                <input type="month" value={bulanInput} onChange={(e) => setBulanInput(e.target.value)} style={gayaInput} />
                <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>{bulanObj.label}</p>
              </div>
              <div>
                <label style={labelInput}>Jumlah (RM)</label>
                <input
                  type="number" min="0" step="10"
                  value={jumlahCustom || jumlahAuto()}
                  onChange={(e) => setJumlahCustom(e.target.value)}
                  style={gayaInput}
                />
                {!jumlahCustom && (
                  <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>Auto: RM {jumlahAuto()}</p>
                )}
              </div>
            </div>
          </div>

          {/* Kaedah & Tarikh */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>Kaedah & Tarikh</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelInput}>Kaedah Bayaran</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['Tunai', 'Transfer'] as const).map((k) => {
                    const aktif = kaedah === k
                    return (
                      <button key={k} type="button" onClick={() => setKaedah(k)}
                        style={{
                          flex: 1, padding: '9px',
                          border: `2px solid ${aktif ? 'var(--accent)' : 'var(--border)'}`,
                          borderRadius: '10px',
                          background: aktif ? '#F7FEE7' : 'transparent',
                          color: aktif ? 'var(--accent-dark)' : 'var(--text-muted)',
                          fontSize: '13px', fontWeight: aktif ? 700 : 500,
                          cursor: 'pointer', fontFamily: 'inherit',
                        }}>
                        {k}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label style={labelInput}>Tarikh Bayar</label>
                <input type="date" value={tarikhBayar} onChange={(e) => setTarikhBayar(e.target.value)} style={gayaInput} />
              </div>
            </div>
          </div>

          {ralat && (
            <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#9F1239' }}>
              {ralat}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/bayaran" style={{
              flex: 1, padding: '12px', textAlign: 'center',
              background: 'var(--bg)', border: '1.5px solid var(--border)',
              borderRadius: '12px', fontSize: '13.5px', fontWeight: 600,
              color: 'var(--text)', textDecoration: 'none',
            }}>Batal</Link>
            <button onClick={sambungLangkah2} disabled={!validLangkah1}
              style={{
                flex: 2, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                background: validLangkah1 ? 'var(--accent)' : '#94A3B8',
                border: 'none', borderRadius: '12px',
                fontSize: '13.5px', fontWeight: 700,
                color: 'var(--accent-text)', cursor: validLangkah1 ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
              }}>
              Semak Bayaran <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── Langkah 2: Semak & Jana ── */}
      {langkah === 2 && pelajar && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Pratonton Resit */}
          <div style={{
            background: 'var(--card)', border: '2px solid var(--border)',
            borderRadius: '20px', overflow: 'hidden',
          }}>
            {/* Header pratonton */}
            <div style={{
              background: 'var(--primary)', padding: '20px 24px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px', color: '#FFC94D' }}>{'♟︎'}</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>CFK HUB</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>Catur Untuk Kanak-Kanak</div>
                </div>
              </div>
              <span style={{
                fontSize: '11px', fontWeight: 700,
                background: 'var(--accent)', color: 'var(--accent-text)',
                padding: '5px 12px', borderRadius: '6px', letterSpacing: '0.08em',
              }}>
                RESIT RASMI
              </span>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>No. Resit</p>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', fontStyle: 'italic' }}>[Auto Jana]</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>Tarikh Bayar</p>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{tarikhBayar}</p>
                </div>
              </div>

              <div style={{ borderTop: '1.5px solid var(--border)', paddingTop: '16px', marginBottom: '16px' }}>
                {[
                  { label: 'Nama Pelajar', nilai: pelajar.nama_penuh },
                  { label: 'Cawangan', nilai: pelajar.cawangan },
                  { label: 'Jenis Bayaran', nilai: jenis },
                  { label: 'Bulan', nilai: bulanObj.label },
                  { label: 'Kaedah', nilai: kaedah },
                ].map((r) => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{r.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{r.nilai}</span>
                  </div>
                ))}
              </div>

              <div style={{
                background: '#F8FAFC', border: '1.5px solid var(--primary)',
                borderRadius: '12px', padding: '16px 20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Jumlah Dibayar</span>
                <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)' }}>RM {jumlahAkhir.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {ralat && (
            <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#9F1239' }}>
              {ralat}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setLangkah(1)} style={{
              flex: 1, padding: '12px',
              background: 'var(--bg)', border: '1.5px solid var(--border)',
              borderRadius: '12px', fontSize: '13.5px', fontWeight: 600,
              color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit',
            }}>
              ← Kembali Edit
            </button>
            <button onClick={jana} disabled={loading} style={{
              flex: 2, padding: '12px',
              background: loading ? '#94A3B8' : 'var(--accent)',
              border: 'none', borderRadius: '12px',
              fontSize: '13.5px', fontWeight: 700,
              color: 'var(--accent-text)', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}>
              {loading ? 'Jana resit...' : '✓ Jana Resit'}
            </button>
          </div>
        </div>
      )}

      {/* ── Langkah 3: Berjaya ── */}
      {langkah === 3 && pelajar && (
        <div style={{ background: 'var(--card)', border: '2px solid #BBF7D0', borderRadius: '20px', padding: '40px', textAlign: 'center' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'var(--hadir-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <Check size={28} style={{ color: 'var(--hadir-text)' }} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
            Resit Berjaya Dijana!
          </h2>
          {nomorResitBaru && (
            <p style={{ fontSize: '15px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
              {nomorResitBaru}
            </p>
          )}
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '28px' }}>
            {pelajar.nama_penuh} · {bulanObj.label} · RM {jumlahAkhir.toFixed(2)}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {nomorResitBaru && (
              <BtnUnduhResit data={{
                nombor_resit: nomorResitBaru,
                nama_pelajar: pelajar.nama_penuh,
                cawangan: pelajar.cawangan,
                jenis,
                bulan_bayaran: bulanObj.nama,
                tahun_bayaran: bulanObj.tahun,
                jumlah: jumlahAkhir,
                kaedah_bayaran: kaedah,
                tarikh_bayar: tarikhBayar,
                status: 'Aktif',
              }} />
            )}
            <button onClick={() => { setLangkah(1); setPelajar(null); setJumlahCustom(''); setNomorResitBaru(null) }}
              style={{
                padding: '9px 18px',
                background: 'var(--bg)', border: '1.5px solid var(--border)',
                borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit',
              }}>
              Rekod Lagi
            </button>
            <Link href="/bayaran" style={{
              padding: '9px 18px',
              background: 'var(--accent)', border: 'none',
              borderRadius: '10px', fontSize: '13px', fontWeight: 700,
              color: 'var(--accent-text)', textDecoration: 'none',
            }}>
              Lihat Semua Resit
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
