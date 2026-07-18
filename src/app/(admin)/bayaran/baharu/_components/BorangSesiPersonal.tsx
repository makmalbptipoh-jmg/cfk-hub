'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CariPelajar, type PelajarCarian } from '@/components/pelajar/CariPelajar'
import { BtnUnduhResit } from '@/components/pdf/BtnUnduhResit'
import { formatRinggit, formatTarikh, tarikhTempatan } from '@/lib/utils'
import { gayaInput, gayaLabel } from '@/components/ui/borang'

type FullPelajar = {
  id: string
  nama_penuh: string
  cawangan_daftar_id: string
  cawangan_nama: string
}

type ResitBerjaya = {
  nombor_resit: string
  nama_pelajar: string
  cawangan: string
  jenis: string
  bulan_bayaran: string
  tahun_bayaran: number
  jumlah: number
  kaedah_bayaran: string | null
  tarikh_bayar: string
  status: 'Aktif' | 'Dibatalkan'
}

export function BorangSesiPersonal() {
  const [langkah, setLangkah] = useState(0)

  const [pelajar, setPelajar] = useState<PelajarCarian | null>(null)
  const [fullPelajar, setFullPelajar] = useState<FullPelajar | null>(null)
  const [tarikhSesi, setTarikhSesi] = useState(tarikhTempatan())
  const [kaedah, setKaedah] = useState<'Online' | 'Face-to-face'>('Face-to-face')
  const [lokasi, setLokasi] = useState('')
  const [jumlah, setJumlah] = useState('')
  const [statusHadir, setStatusHadir] = useState<'Hadir' | 'Tidak Hadir'>('Hadir')
  const [kaedahBayaran, setKaedahBayaran] = useState<'Tunai' | 'Transfer'>('Tunai')

  const [loading, setLoading] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)
  const [resitBerjaya, setResitBerjaya] = useState<ResitBerjaya | null>(null)

  const pilihPelajar = async (p: PelajarCarian) => {
    setPelajar(p)
    const { data } = await createClient()
      .from('pelajar')
      .select('id, nama_penuh, cawangan_daftar_id, cawangan:cawangan_daftar_id(nama)')
      .eq('id', p.id)
      .single()
    if (data) {
      setFullPelajar({
        id: data.id,
        nama_penuh: data.nama_penuh,
        cawangan_daftar_id: data.cawangan_daftar_id,
        cawangan_nama: (data.cawangan as any)?.nama ?? '—',
      })
    }
  }

  const semakForm = () => {
    if (!fullPelajar) { setRalat('Sila pilih pelajar terlebih dahulu.'); return false }
    if (!tarikhSesi) { setRalat('Sila pilih tarikh sesi.'); return false }
    if (!jumlah || +jumlah <= 0) { setRalat('Sila masukkan jumlah bayaran yang sah.'); return false }
    return true
  }

  const teruskanPratonton = () => {
    setRalat(null)
    if (!semakForm()) return
    setLangkah(1)
  }

  const jana = async () => {
    if (!fullPelajar) return
    setLoading(true)
    setRalat(null)

    const supabase = createClient()
    const d = new Date(tarikhSesi)
    const bulan_bayaran = d.toLocaleString('ms-MY', { month: 'long' })
    const tahun_bayaran = d.getFullYear()
    const nota = `Kelas Personal (${kaedah})${lokasi ? ' — ' + lokasi : ''}`

    const { error: errK } = await supabase.from('kehadiran').insert({
      pelajar_id: fullPelajar.id,
      tarikh: tarikhSesi,
      status: statusHadir,
      nota,
      cawangan_daftar_id: fullPelajar.cawangan_daftar_id,
      cawangan_sesi_id: fullPelajar.cawangan_daftar_id,
    })

    if (errK) {
      setRalat('Gagal rekod kehadiran. Mungkin sudah ada rekod pada tarikh ini.')
      setLoading(false)
      return
    }

    const { data: resitData, error: errR } = await supabase
      .from('resit')
      .insert({
        pelajar_id: fullPelajar.id,
        jenis: 'Personal',
        bulan_bayaran,
        tahun_bayaran,
        jumlah: +jumlah,
        bil_kelas: 1, // bayar-per-sesi: kredit 1 kelas, sesi ini guna 1 — baki pakej seimbang
        kaedah_bayaran: kaedahBayaran,
        tarikh_bayar: tarikhSesi,
        status: 'Aktif',
      })
      .select('nombor_resit')
      .single()

    if (errR || !resitData) {
      setRalat('Kehadiran direkod tetapi gagal jana resit. Sila rekod resit secara manual.')
      setLoading(false)
      return
    }

    setResitBerjaya({
      nombor_resit: resitData.nombor_resit,
      nama_pelajar: fullPelajar.nama_penuh,
      cawangan: fullPelajar.cawangan_nama,
      jenis: 'Personal',
      bulan_bayaran,
      tahun_bayaran,
      jumlah: +jumlah,
      kaedah_bayaran: kaedahBayaran,
      tarikh_bayar: tarikhSesi,
      status: 'Aktif',
    })
    setLangkah(2)
    setLoading(false)
  }

  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
        Rekod satu sesi kelas personal — kehadiran dan resit dijana serentak.
      </p>

      {/* Stepper indicator */}
      {langkah < 2 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {['Maklumat Sesi', 'Pratonton & Sahkan'].map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%',
                background: i <= langkah ? 'var(--accent)' : 'var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700,
                color: i <= langkah ? 'var(--accent-text)' : 'var(--text-muted)',
              }}>
                {i + 1}
              </div>
              <span style={{ fontSize: '12px', fontWeight: i === langkah ? 700 : 400, color: i === langkah ? 'var(--text)' : 'var(--text-muted)' }}>
                {label}
              </span>
              {i < 1 && <div style={{ width: '24px', height: '1px', background: 'var(--border)', margin: '0 4px' }} />}
            </div>
          ))}
        </div>
      )}

      {/* LANGKAH 0 — Form */}
      {langkah === 0 && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={gayaLabel}>Pelajar <span style={{ color: '#EF4444' }}>*</span></label>
            <CariPelajar onPilih={pilihPelajar} nilaiAwal={pelajar?.nama_penuh} />
            {fullPelajar && (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>
                Cawangan: {fullPelajar.cawangan_nama}
              </p>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={gayaLabel}>Tarikh Sesi <span style={{ color: '#EF4444' }}>*</span></label>
              <input type="date" value={tarikhSesi} onChange={(e) => setTarikhSesi(e.target.value)} style={gayaInput} />
            </div>
            <div>
              <label style={gayaLabel}>Kaedah</label>
              <select value={kaedah} onChange={(e) => setKaedah(e.target.value as any)} style={gayaInput}>
                <option value="Face-to-face">Face-to-face</option>
                <option value="Online">Online</option>
              </select>
            </div>
          </div>

          {kaedah === 'Face-to-face' && (
            <div>
              <label style={gayaLabel}>Lokasi (pilihan)</label>
              <input
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                placeholder="Cth: Cawangan Klebang, Rumah Pelajar..."
                style={gayaInput}
              />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={gayaLabel}>Status Kehadiran</label>
              <select value={statusHadir} onChange={(e) => setStatusHadir(e.target.value as any)} style={gayaInput}>
                <option value="Hadir">Hadir</option>
                <option value="Tidak Hadir">Tidak Hadir</option>
              </select>
            </div>
            <div>
              <label style={gayaLabel}>Jumlah Bayaran (RM) <span style={{ color: '#EF4444' }}>*</span></label>
              <input
                type="number"
                min="0"
                step="5"
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
                placeholder="Cth: 80, 100, 150"
                style={gayaInput}
              />
            </div>
          </div>

          <div>
            <label style={gayaLabel}>Kaedah Bayaran</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {(['Tunai', 'Transfer'] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setKaedahBayaran(k)}
                  style={{
                    flex: 1, padding: '10px',
                    background: kaedahBayaran === k ? 'var(--accent)' : 'var(--bg)',
                    border: `1.5px solid ${kaedahBayaran === k ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: '10px',
                    fontSize: '13.5px', fontWeight: 600,
                    color: kaedahBayaran === k ? 'var(--accent-text)' : 'var(--text)',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          {ralat && (
            <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#9F1239' }}>
              {ralat}
            </div>
          )}

          <button
            onClick={teruskanPratonton}
            style={{
              padding: '12px',
              background: 'var(--accent)', border: 'none', borderRadius: '12px',
              fontSize: '13.5px', fontWeight: 700, color: 'var(--accent-text)',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Pratonton →
          </button>
        </div>
      )}

      {/* LANGKAH 1 — Pratonton */}
      {langkah === 1 && fullPelajar && (
        <div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '18px' }}>Semak Sebelum Jana</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Pelajar', nilai: fullPelajar.nama_penuh },
                { label: 'Cawangan', nilai: fullPelajar.cawangan_nama },
                { label: 'Tarikh Sesi', nilai: formatTarikh(tarikhSesi) },
                { label: 'Kaedah', nilai: `${kaedah}${lokasi ? ' — ' + lokasi : ''}` },
                { label: 'Status Kehadiran', nilai: statusHadir },
                { label: 'Kaedah Bayaran', nilai: kaedahBayaran },
              ].map(({ label, nilai }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>{nilai}</span>
                </div>
              ))}
            </div>

            <div style={{ background: '#F7FEE7', border: '2px solid var(--accent)', borderRadius: '12px', padding: '16px 20px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--accent-dark)', fontWeight: 600 }}>Jumlah Bayaran</span>
              <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-dark)' }}>{formatRinggit(+jumlah)}</span>
            </div>
          </div>

          {ralat && (
            <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#9F1239', marginBottom: '14px' }}>
              {ralat}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setLangkah(0)}
              style={{
                flex: 1, padding: '12px',
                background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '12px',
                fontSize: '13.5px', fontWeight: 600, color: 'var(--text)',
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
            >
              <ChevronLeft size={14} /> Kembali Edit
            </button>
            <button
              onClick={jana}
              disabled={loading}
              style={{
                flex: 2, padding: '12px',
                background: loading ? '#94A3B8' : 'var(--accent)', border: 'none', borderRadius: '12px',
                fontSize: '13.5px', fontWeight: 700, color: 'var(--accent-text)',
                cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              }}
            >
              {loading ? 'Menyimpan...' : 'Jana Kehadiran & Resit'}
            </button>
          </div>
        </div>
      )}

      {/* LANGKAH 2 — Berjaya */}
      {langkah === 2 && resitBerjaya && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
          <CheckCircle size={48} style={{ color: 'var(--accent)', margin: '0 auto 16px', display: 'block' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>Rekod Berjaya Disimpan!</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Kehadiran dan resit untuk {resitBerjaya.nama_pelajar} telah direkod.
          </p>

          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 20px', marginBottom: '20px', display: 'inline-block', minWidth: '260px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>No. Resit</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', fontFamily: 'monospace' }}>{resitBerjaya.nombor_resit}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {resitBerjaya.bulan_bayaran} {resitBerjaya.tahun_bayaran} · {formatRinggit(resitBerjaya.jumlah)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <BtnUnduhResit data={resitBerjaya} />
            <button
              onClick={() => {
                setPelajar(null); setFullPelajar(null); setJumlah(''); setLokasi('')
                setTarikhSesi(tarikhTempatan())
                setResitBerjaya(null)
                setLangkah(0)
              }}
              style={{
                padding: '8px 16px',
                background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px',
                fontSize: '13px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Rekod Lagi
            </button>
            <Link
              href="/bayaran"
              style={{
                padding: '8px 16px',
                background: 'var(--accent)', border: 'none', borderRadius: '10px',
                fontSize: '13px', fontWeight: 600, color: 'var(--accent-text)', textDecoration: 'none',
              }}
            >
              Lihat Senarai Resit
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
