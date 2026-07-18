'use client'

import { useEffect, useState } from 'react'
import { Copy, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatRinggit, tarikhTempatan } from '@/lib/utils'
import { useTutupEscape } from '@/lib/hooks/useTutupEscape'
import { toast } from '@/lib/stores/toast-store'

const KAEDAH = ['Tunai', 'TNG eWallet', 'Transfer Bank'] as const

type AdvanceTertunggak = {
  id: string
  baki: number
  tarikh_advance: string
}

interface Props {
  jurulatihId: string
  namaJurulatih: string
  bulan: string
  tahun: number
  bilSesiHadir: number
  kadarPerSesi: number
  advanceTertunggak: AdvanceTertunggak[]
  noTng: string | null
  tngQrUrl: string | null
  onTutup: () => void
  onBerjaya: () => void
}

export function ModalRekodBayaran({ jurulatihId, namaJurulatih, bulan, tahun, bilSesiHadir, kadarPerSesi, advanceTertunggak, noTng, tngQrUrl, onTutup, onBerjaya }: Props) {
  const [bilSesi, setBilSesi] = useState(bilSesiHadir)
  const [kadar, setKadar] = useState(kadarPerSesi)
  const [tarikhBayar, setTarikhBayar] = useState(tarikhTempatan())
  const [kaedah, setKaedah] = useState<string>('Tunai')
  const [nota, setNota] = useState('')
  const [loading, setLoading] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)
  useTutupEscape(onTutup)

  const jumlah = bilSesi * kadar
  const totalBakiAdvance = advanceTertunggak.reduce((s, a) => s + a.baki, 0)
  const potonganMaks = Math.min(totalBakiAdvance, jumlah)
  const [potongan, setPotongan] = useState(potonganMaks)
  // Kira semula potongan default bila sesi/kadar berubah
  useEffect(() => { setPotongan(Math.min(totalBakiAdvance, bilSesi * kadar)) }, [bilSesi, kadar, totalBakiAdvance])
  const bersih = jumlah - potongan

  const salinNoTng = async () => {
    if (!noTng) return
    await navigator.clipboard.writeText(noTng)
    toast.success('No. TNG disalin')
  }

  const simpan = async () => {
    if (bilSesi <= 0) { setRalat('Bilangan sesi mesti lebih dari 0.'); return }
    // Gaji WAJIB ikut kehadiran — tidak boleh bayar melebihi sesi Hadir yang direkod
    if (bilSesi > bilSesiHadir) {
      setRalat(`Bilangan sesi melebihi kehadiran direkod (${bilSesiHadir} sesi hadir). Rekod kehadiran dahulu di page Kehadiran.`)
      return
    }
    if (potongan < 0 || potongan > potonganMaks) {
      setRalat(`Potongan advance mesti antara RM0 dan ${formatRinggit(potonganMaks)}.`)
      return
    }
    setLoading(true)
    setRalat(null)
    const supabase = createClient()
    // jumlah TIDAK dihantar — kolum GENERATED dalam DB (auto: bilangan_sesi × kadar_per_sesi)
    const { data: bayaranBaru, error } = await supabase.from('bayaran_jurulatih').insert({
      jurulatih_id: jurulatihId,
      bulan_bayaran: bulan,
      tahun_bayaran: tahun,
      bilangan_sesi: bilSesi,
      kadar_per_sesi: kadar,
      potongan_advance: potongan,
      kaedah_bayaran: kaedah,
      tarikh_bayar: tarikhBayar,
      status: 'Sudah Bayar',
      nota: nota || null,
    }).select('id').single()
    if (error || !bayaranBaru) { setRalat('Gagal simpan. Cuba lagi.'); setLoading(false); return }

    // Agih potongan ke baris advance secara FIFO (paling lama dahulu)
    let sisa = potongan
    let gagalAdvance = false
    for (const a of advanceTertunggak) {
      if (sisa <= 0) break
      const ambil = Math.min(a.baki, sisa)
      const bakiBaru = a.baki - ambil
      const { error: errAdv } = await supabase.from('advance_jurulatih').update({
        baki: bakiBaru,
        status: bakiBaru === 0 ? 'Selesai' : 'Belum Selesai',
        ...(bakiBaru === 0 ? { bayaran_id: bayaranBaru.id } : {}),
      }).eq('id', a.id)
      if (errAdv) { gagalAdvance = true; break }
      sisa -= ambil
    }
    if (gagalAdvance) {
      toast.error('Bayaran direkod tetapi baki advance gagal dikemas kini — semak tab Advance.')
    }

    // Auto-rekod dalam Kewangan sebagai perbelanjaan (kategori Gaji Jurulatih).
    // Hanya BERSIH diposkan — bahagian advance sudah dipos masa advance direkod,
    // jadi jumlah belanja terkumpul = advance + bersih = gaji kasar (tiada kira dua kali).
    if (bersih > 0) {
      const { error: errBelanja } = await supabase.from('kewangan_perbelanjaan').insert({
        tarikh: tarikhBayar,
        kategori: 'Gaji Jurulatih',
        penerangan: potongan > 0
          ? `Gaji ${namaJurulatih} — ${bulan} ${tahun} (${bilSesi} sesi × RM${kadar.toFixed(2)}, tolak advance RM${potongan.toFixed(2)})`
          : `Gaji ${namaJurulatih} — ${bulan} ${tahun} (${bilSesi} sesi × RM${kadar.toFixed(2)})`,
        jumlah: bersih,
      })
      if (errBelanja) {
        toast.error('Gaji direkod, tetapi gagal masuk Kewangan — tambah manual dalam Perbelanjaan.')
      }
    }
    onBerjaya()
  }

  const gayaInput = {
    width: '100%', padding: '9px 12px',
    border: '1.5px solid var(--border)', borderRadius: '10px',
    fontSize: '13.5px', color: 'var(--text)',
    background: 'var(--card)', outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }} onClick={(e) => { if (e.target === e.currentTarget) onTutup() }}
      role="dialog" aria-modal="true" aria-label="Rekod Bayaran Jurulatih">
      <div style={{
        background: 'var(--card)', borderRadius: '20px',
        padding: '28px', width: '100%', maxWidth: '460px',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>Rekod Bayaran Jurulatih</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{namaJurulatih} · {bulan} {tahun}</p>
          </div>
          <button onClick={onTutup} aria-label="Tutup" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Pengiraan */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
              Bil. Sesi Hadir
            </label>
            <input type="number" min="0" max={bilSesiHadir} value={bilSesi} onChange={(e) => setBilSesi(+e.target.value)} style={gayaInput} />
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Kehadiran direkod: {bilSesiHadir} sesi (had maksimum)
            </p>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
              Kadar / Sesi (RM)
            </label>
            <input type="number" min="0" step="5" value={kadar} onChange={(e) => setKadar(+e.target.value)} style={gayaInput} />
          </div>
        </div>

        {/* Potongan Advance */}
        {totalBakiAdvance > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
              Potongan Advance (RM)
            </label>
            <input type="number" min="0" max={potonganMaks} step="10" value={potongan}
              onChange={(e) => setPotongan(+e.target.value)} style={gayaInput} />
            <p style={{ fontSize: '11px', color: '#C2410C', marginTop: '4px' }}>
              Baki advance belum selesai: {formatRinggit(totalBakiAdvance)} — ditolak automatik (maksimum {formatRinggit(potonganMaks)})
            </p>
          </div>
        )}

        {/* Jumlah: Kasar − Potongan = Bersih */}
        <div style={{
          background: '#F7FEE7', border: '2px solid var(--accent)',
          borderRadius: '12px', padding: '14px 18px',
          marginBottom: '14px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: potongan > 0 ? '6px' : 0 }}>
            <span style={{ fontSize: '13px', color: 'var(--accent-dark)' }}>
              {potongan > 0 ? 'Gaji Kasar' : `${bilSesi} sesi × ${formatRinggit(kadar)}`}
            </span>
            <span style={{
              fontSize: potongan > 0 ? '14px' : '22px',
              fontWeight: potongan > 0 ? 600 : 800,
              color: 'var(--accent-dark)',
            }}>
              {formatRinggit(jumlah)}
            </span>
          </div>
          {potongan > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', paddingBottom: '6px', borderBottom: '1px dashed var(--accent)' }}>
                <span style={{ fontSize: '13px', color: '#C2410C' }}>(−) Potongan Advance</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#C2410C' }}>− {formatRinggit(potongan)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-dark)' }}>Gaji Bersih</span>
                <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-dark)' }}>{formatRinggit(bersih)}</span>
              </div>
            </>
          )}
        </div>

        {/* Kaedah Bayaran */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
            Kaedah Bayaran
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {KAEDAH.map((k) => {
              const dipilih = kaedah === k
              return (
                <button key={k} type="button" onClick={() => setKaedah(k)}
                  style={{
                    flex: 1, padding: '8px 4px', borderRadius: '10px',
                    border: `2px solid ${dipilih ? 'var(--accent)' : 'var(--border)'}`,
                    background: dipilih ? '#F7FEE7' : 'transparent',
                    color: dipilih ? 'var(--accent-dark)' : 'var(--text-muted)',
                    fontSize: '12.5px', fontWeight: dipilih ? 700 : 500,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {k}
                </button>
              )
            })}
          </div>
        </div>

        {/* Panel TNG eWallet */}
        {kaedah === 'TNG eWallet' && (
          <div style={{
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '14px 16px', marginBottom: '12px',
          }}>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Transfer ke TNG eWallet
            </div>
            {noTng ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: tngQrUrl ? '10px' : 0 }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>{noTng}</span>
                <button type="button" onClick={salinNoTng}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '5px 10px', background: 'var(--card)',
                    border: '1.5px solid var(--border)', borderRadius: '8px',
                    fontSize: '12px', fontWeight: 600, color: 'var(--text)',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  <Copy size={12} /> Salin
                </button>
              </div>
            ) : (
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: tngQrUrl ? '10px' : 0 }}>
                Tiada no. TNG — tambah melalui Edit jurulatih.
              </p>
            )}
            {tngQrUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tngQrUrl} alt={`QR TNG ${namaJurulatih}`}
                style={{ width: '160px', height: '160px', objectFit: 'contain', borderRadius: '10px', border: '1px solid var(--border)', background: '#fff' }} />
            )}
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '8px' }}>
              Transfer {formatRinggit(bersih)} guna app TNG / bank (DuitNow ke no telefon atau scan QR), kemudian simpan rekod ini.
            </p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
              Tarikh Bayar
            </label>
            <input type="date" value={tarikhBayar} onChange={(e) => setTarikhBayar(e.target.value)} style={gayaInput} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
              Nota (pilihan)
            </label>
            <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Cth: Tunai" style={gayaInput} />
          </div>
        </div>

        {ralat && (
          <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#9F1239', marginBottom: '14px' }}>
            {ralat}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onTutup} style={{
            flex: 1, padding: '11px',
            background: 'var(--bg)', border: '1.5px solid var(--border)',
            borderRadius: '12px', fontSize: '13.5px', fontWeight: 600,
            color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Batal
          </button>
          <button onClick={simpan} disabled={loading} style={{
            flex: 2, padding: '11px',
            background: loading ? '#94A3B8' : 'var(--accent)',
            border: 'none', borderRadius: '12px',
            fontSize: '13.5px', fontWeight: 700,
            color: 'var(--accent-text)', cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
          }}>
            {loading ? 'Menyimpan...' : 'Rekod Bayaran'}
          </button>
        </div>
      </div>
    </div>
  )
}
