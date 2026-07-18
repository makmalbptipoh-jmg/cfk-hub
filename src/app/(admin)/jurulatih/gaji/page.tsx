'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Wallet, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { akhirBulan, bulanTempatan, formatRinggit, NAMA_BULAN } from '@/lib/utils'
import { tapisSesiDibatalkan, SELECT_SESI_GAJI, SELECT_SLOT_GAJI, type SlotUntukGaji } from '@/lib/gajiSesi'

type BarisGaji = {
  id: string
  nama_penuh: string
  sesiKumpulan: number
  sesiPersonal: number
  sesiDibuang: number
  kadar: number
  patutDibayar: number
  bakiAdvance: number
  sudahDibayar: number
  baki: number
  status: 'Selesai' | 'Sebahagian' | 'Belum Bayar' | 'Tiada Sesi'
}

type Tunggakan = {
  jurulatihId: string
  nama_penuh: string
  bulanLabel: string
  sesi: number
}

// [tahun, bulan 1-12] − n bulan
function tolakBulan(tahun: number, bulan: number, n: number): [number, number] {
  const idx = tahun * 12 + (bulan - 1) - n
  return [Math.floor(idx / 12), (idx % 12) + 1]
}

const WARNA_STATUS: Record<BarisGaji['status'], { bg: string; text: string }> = {
  Selesai: { bg: 'var(--hadir-bg)', text: 'var(--hadir-text)' },
  Sebahagian: { bg: '#FEF3C7', text: '#92400E' },
  'Belum Bayar': { bg: '#FEE2E2', text: '#DC2626' },
  'Tiada Sesi': { bg: '#F1F5F9', text: '#64748B' },
}

export default function GajiBulananPage() {
  const [bulan, setBulan] = useState(bulanTempatan())
  const [loading, setLoading] = useState(true)
  const [baris, setBaris] = useState<BarisGaji[]>([])
  const [tunggakan, setTunggakan] = useState<Tunggakan[]>([])

  const muatData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const [tahun, bulanNum] = bulan.split('-').map(Number)
    const namaBulan = NAMA_BULAN[bulanNum - 1]
    const mulaB = `${bulan}-01`
    const akhirB = akhirBulan(tahun, bulanNum)

    // Julat imbasan tunggakan: 3 bulan sebelum bulan dipilih
    const [tahunImbas, bulanImbas] = tolakBulan(tahun, bulanNum, 3)
    const mulaImbas = `${tahunImbas}-${String(bulanImbas).padStart(2, '0')}-01`
    const bulanSebelum = [1, 2, 3].map((n) => tolakBulan(tahun, bulanNum, n))

    const [{ data: jurulatih }, { data: hadir }, { data: bayaran }, { data: advance }, { data: hadirImbas }, { data: bayaranImbas }, { data: slotGaji }, { data: batalGaji }] = await Promise.all([
      supabase.from('jurulatih').select('id, nama_penuh, kadar_bayaran').eq('status', 'Aktif').order('nama_penuh'),
      supabase.from('kehadiran_jurulatih').select(SELECT_SESI_GAJI).eq('status', 'Hadir').gte('tarikh', mulaB).lte('tarikh', akhirB),
      supabase.from('bayaran_jurulatih').select('jurulatih_id, jumlah, status').eq('bulan_bayaran', namaBulan).eq('tahun_bayaran', tahun),
      supabase.from('advance_jurulatih').select('jurulatih_id, baki').eq('status', 'Belum Selesai'),
      supabase.from('kehadiran_jurulatih').select(SELECT_SESI_GAJI).eq('status', 'Hadir').gte('tarikh', mulaImbas).lt('tarikh', mulaB),
      supabase
        .from('bayaran_jurulatih')
        .select('jurulatih_id, bulan_bayaran, tahun_bayaran')
        .in('bulan_bayaran', bulanSebelum.map(([, m]) => NAMA_BULAN[m - 1]))
        .in('tahun_bayaran', [...new Set(bulanSebelum.map(([y]) => y))]),
      supabase.from('jadual_slot').select(SELECT_SLOT_GAJI),
      supabase.from('jadual_slot_batal').select('slot_id, tarikh').gte('tarikh', mulaImbas).lte('tarikh', akhirB),
    ])

    // Sesi pada kelas DIBATALKAN tidak dikira dalam gaji
    const slotSemua = (slotGaji ?? []) as SlotUntukGaji[]
    const batalSemua = batalGaji ?? []
    const { sah: hadirSah, dibuang: hadirDibuang } = tapisSesiDibatalkan(hadir ?? [], slotSemua, batalSemua)
    const { sah: hadirImbasSah } = tapisSesiDibatalkan(hadirImbas ?? [], slotSemua, batalSemua)

    const sesiK: Record<string, number> = {}
    const sesiP: Record<string, number> = {}
    const sesiBuang: Record<string, number> = {}
    for (const k of hadirSah) {
      if (k.jenis_kelas === 'Personal') sesiP[k.jurulatih_id] = (sesiP[k.jurulatih_id] ?? 0) + 1
      else sesiK[k.jurulatih_id] = (sesiK[k.jurulatih_id] ?? 0) + 1
    }
    for (const k of hadirDibuang) {
      sesiBuang[k.jurulatih_id] = (sesiBuang[k.jurulatih_id] ?? 0) + 1
    }
    const dibayar: Record<string, number> = {}
    for (const b of bayaran ?? []) {
      if (b.status === 'Sudah Bayar') dibayar[b.jurulatih_id] = (dibayar[b.jurulatih_id] ?? 0) + (b.jumlah ?? 0)
    }
    const bakiAdv: Record<string, number> = {}
    for (const a of advance ?? []) {
      bakiAdv[a.jurulatih_id] = (bakiAdv[a.jurulatih_id] ?? 0) + (a.baki ?? 0)
    }

    const barisBaru: BarisGaji[] = (jurulatih ?? []).map((j) => {
      const kump = sesiK[j.id] ?? 0
      const pers = sesiP[j.id] ?? 0
      const sesi = kump + pers
      const kadar = j.kadar_bayaran ?? 0
      const patut = sesi * kadar
      const sudah = dibayar[j.id] ?? 0
      const baki = Math.max(0, patut - sudah)
      const status: BarisGaji['status'] =
        sesi === 0 ? 'Tiada Sesi' : baki === 0 ? 'Selesai' : sudah > 0 ? 'Sebahagian' : 'Belum Bayar'
      return {
        id: j.id,
        nama_penuh: j.nama_penuh,
        sesiKumpulan: kump,
        sesiPersonal: pers,
        sesiDibuang: sesiBuang[j.id] ?? 0,
        kadar,
        patutDibayar: patut,
        bakiAdvance: bakiAdv[j.id] ?? 0,
        sudahDibayar: sudah,
        baki,
        status,
      }
    })

    // Tunggakan: bulan lepas dengan sesi Hadir tetapi tiada langsung rekod bayaran
    const namaJurulatih = new Map((jurulatih ?? []).map((j) => [j.id, j.nama_penuh]))
    const sesiPerBulan = new Map<string, number>() // `${jurulatih_id}:${tahun}-${bulan}`
    for (const k of hadirImbasSah) {
      const kunci = `${k.jurulatih_id}:${String(k.tarikh).slice(0, 7)}`
      sesiPerBulan.set(kunci, (sesiPerBulan.get(kunci) ?? 0) + 1)
    }
    const adaBayaran = new Set(
      (bayaranImbas ?? []).map((b) => {
        const idxBulan = NAMA_BULAN.indexOf(b.bulan_bayaran) + 1
        return `${b.jurulatih_id}:${b.tahun_bayaran}-${String(idxBulan).padStart(2, '0')}`
      })
    )
    const tunggakanBaru: Tunggakan[] = []
    for (const [y, m] of bulanSebelum) {
      const bulanKunci = `${y}-${String(m).padStart(2, '0')}`
      for (const j of jurulatih ?? []) {
        const sesi = sesiPerBulan.get(`${j.id}:${bulanKunci}`) ?? 0
        if (sesi > 0 && !adaBayaran.has(`${j.id}:${bulanKunci}`)) {
          tunggakanBaru.push({
            jurulatihId: j.id,
            nama_penuh: namaJurulatih.get(j.id) ?? '—',
            bulanLabel: `${NAMA_BULAN[m - 1]} ${y}`,
            sesi,
          })
        }
      }
    }

    setBaris(barisBaru)
    setTunggakan(tunggakanBaru)
    setLoading(false)
  }, [bulan])

  useEffect(() => {
    muatData()
  }, [muatData])

  const [tahun, bulanNum] = bulan.split('-').map(Number)
  const labelBulan = `${NAMA_BULAN[bulanNum - 1]} ${tahun}`
  const jumlah = baris.reduce(
    (t, b) => ({ patut: t.patut + b.patutDibayar, dibayar: t.dibayar + b.sudahDibayar, baki: t.baki + b.baki }),
    { patut: 0, dibayar: 0, baki: 0 }
  )

  return (
    <div style={{ maxWidth: '1000px' }}>
      <Link href="/jurulatih" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '14px' }}>
        <ArrowLeft size={14} /> Kembali ke Jurulatih
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '9px' }}>
            <Wallet size={20} /> Gaji Bulanan Jurulatih
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Sesi hadir × kadar − sudah dibayar = baki perlu dibayar — {labelBulan}
          </p>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Bulan
          </label>
          <input
            type="month"
            value={bulan}
            onChange={(e) => e.target.value && setBulan(e.target.value)}
            style={{ padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13.5px', color: 'var(--text)', background: 'var(--card)', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Memuatkan...</div>
      ) : (
        <>
          {/* Ringkasan */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'Patut Dibayar', nilai: jumlah.patut, bg: 'var(--card)', border: 'var(--border)', warna: 'var(--text)' },
              { label: 'Sudah Dibayar', nilai: jumlah.dibayar, bg: '#F7FEE7', border: '#D9F99D', warna: 'var(--accent-dark)' },
              { label: 'Baki Perlu Dibayar', nilai: jumlah.baki, bg: jumlah.baki > 0 ? '#FEF2F2' : 'var(--card)', border: jumlah.baki > 0 ? '#FECACA' : 'var(--border)', warna: jumlah.baki > 0 ? '#DC2626' : 'var(--text)' },
            ].map((k) => (
              <div key={k.label} style={{ background: k.bg, border: `1px solid ${k.border}`, borderRadius: '14px', padding: '16px 18px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  {k.label} — {labelBulan}
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: k.warna }}>{formatRinggit(k.nilai)}</div>
              </div>
            ))}
          </div>

          {/* Tunggakan bulan lepas */}
          {tunggakan.length > 0 && (
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '14px', padding: '16px 20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
                <AlertTriangle size={15} style={{ color: '#92400E' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#92400E' }}>
                  Tunggakan bulan lepas — ada sesi hadir tetapi tiada rekod bayaran
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {tunggakan.map((t, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ fontSize: '13px', color: '#78350F' }}>
                      ⚠ <strong>{t.nama_penuh}</strong> — {t.bulanLabel}: {t.sesi} sesi hadir, tiada rekod bayaran
                    </span>
                    <Link href={`/jurulatih/${t.jurulatihId}/bayaran`} style={{ fontSize: '12px', fontWeight: 700, color: '#92400E', textDecoration: 'underline' }}>
                      Rekod bayaran →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Jadual payroll */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
            {baris.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', fontSize: '13.5px', color: 'var(--text-muted)' }}>
                Tiada jurulatih aktif.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '820px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                      {['Jurulatih', 'Sesi Hadir', 'Kadar', 'Patut Dibayar', 'Baki Advance', 'Sudah Dibayar', 'Baki', 'Status', ''].map((h) => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {baris.map((b, i) => (
                      <tr key={b.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                        <td style={{ padding: '11px 14px', fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>{b.nama_penuh}</td>
                        <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>{b.sesiKumpulan + b.sesiPersonal}</span>
                          {b.sesiKumpulan + b.sesiPersonal > 0 && (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                              (K:{b.sesiKumpulan} P:{b.sesiPersonal})
                            </span>
                          )}
                          {b.sesiDibuang > 0 && (
                            <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#DC2626', marginTop: '2px' }}>
                              −{b.sesiDibuang} sesi kelas dibatalkan
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '11px 14px', fontSize: '13px', color: 'var(--text)', whiteSpace: 'nowrap' }}>
                          {b.kadar > 0 ? formatRinggit(b.kadar) : '—'}
                        </td>
                        <td style={{ padding: '11px 14px', fontSize: '13.5px', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap' }}>
                          {formatRinggit(b.patutDibayar)}
                        </td>
                        <td style={{ padding: '11px 14px', fontSize: '13px', color: b.bakiAdvance > 0 ? '#92400E' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {b.bakiAdvance > 0 ? formatRinggit(b.bakiAdvance) : '—'}
                        </td>
                        <td style={{ padding: '11px 14px', fontSize: '13px', color: 'var(--text)', whiteSpace: 'nowrap' }}>
                          {formatRinggit(b.sudahDibayar)}
                        </td>
                        <td style={{ padding: '11px 14px', fontSize: '13.5px', fontWeight: 800, color: b.baki > 0 ? '#DC2626' : 'var(--hadir-text)', whiteSpace: 'nowrap' }}>
                          {formatRinggit(b.baki)}
                        </td>
                        <td style={{ padding: '11px 14px' }}>
                          <span style={{ fontSize: '11.5px', padding: '3px 10px', borderRadius: '20px', fontWeight: 700, background: WARNA_STATUS[b.status].bg, color: WARNA_STATUS[b.status].text, whiteSpace: 'nowrap' }}>
                            {b.status}
                          </span>
                        </td>
                        <td style={{ padding: '11px 14px' }}>
                          <Link
                            href={`/jurulatih/${b.id}/bayaran`}
                            style={{ display: 'inline-block', padding: '6px 12px', background: b.baki > 0 ? 'var(--accent)' : 'var(--bg)', border: b.baki > 0 ? 'none' : '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: b.baki > 0 ? 'var(--accent-text)' : 'var(--text)', textDecoration: 'none', whiteSpace: 'nowrap' }}
                          >
                            Rekod Bayaran
                          </Link>
                        </td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: '2px solid var(--text)', background: '#F8FAFC' }}>
                      <td colSpan={3} style={{ padding: '11px 14px', fontSize: '13.5px', fontWeight: 800, color: 'var(--text)' }}>JUMLAH</td>
                      <td style={{ padding: '11px 14px', fontSize: '13.5px', fontWeight: 800, color: 'var(--text)', whiteSpace: 'nowrap' }}>{formatRinggit(jumlah.patut)}</td>
                      <td />
                      <td style={{ padding: '11px 14px', fontSize: '13.5px', fontWeight: 800, color: 'var(--text)', whiteSpace: 'nowrap' }}>{formatRinggit(jumlah.dibayar)}</td>
                      <td style={{ padding: '11px 14px', fontSize: '13.5px', fontWeight: 800, color: jumlah.baki > 0 ? '#DC2626' : 'var(--hadir-text)', whiteSpace: 'nowrap' }}>{formatRinggit(jumlah.baki)}</td>
                      <td colSpan={2} />
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '12px' }}>
            Sesi hadir direkod oleh jurulatih sendiri (check-in) atau admin. Sesi pada kelas yang DIBATALKAN tidak dikira dalam gaji.
            Baki Advance ditolak automatik semasa rekod bayaran gaji.
          </p>
        </>
      )}
    </div>
  )
}
