'use client'

import { useState, useEffect, useCallback } from 'react'
import { Printer } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { akhirBulan, bulanTempatan, hariMinggu, tambahHari, tarikhTempatan } from '@/lib/utils'
import { toast } from '@/lib/stores/toast-store'
import type { BarisBilKelas } from '@/components/pdf/LaporanBilKelasPDF'

const TIADA_CAWANGAN = 'Personal (tiada cawangan)'

function labelBulan(bm: string) {
  const [y, m] = bm.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString('ms-MY', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

export default function LaporanBilKelasPage() {
  const [bulan, setBulan] = useState(bulanTempatan())
  const [loading, setLoading] = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [baris, setBaris] = useState<BarisBilKelas[]>([])

  const muatData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const [y, m] = bulan.split('-').map(Number)
    const mulaB = `${bulan}-01`
    const akhirB = akhirBulan(y, m)

    const [{ data: cawangan }, { data: slot }, { data: batal }, { data: ganti }] = await Promise.all([
      supabase.from('cawangan').select('id, nama').eq('status', 'Aktif').order('nama'),
      supabase.from('jadual_slot').select('id, jenis, hari_minggu, cawangan_id').eq('status', 'Aktif'),
      supabase.from('jadual_slot_batal').select('slot_id, tarikh').gte('tarikh', mulaB).lte('tarikh', akhirB),
      supabase.from('aktiviti').select('cawangan_id').eq('kategori', 'Kelas Ganti').eq('status', 'Aktif').gte('tarikh', mulaB).lte('tarikh', akhirB),
    ])

    // Kira kejadian setiap slot dalam bulan: loop setiap tarikh, padankan hari
    // minggu slot, tolak tarikh yang dibatalkan.
    const setBatal = new Set((batal ?? []).map((b) => `${b.slot_id}:${b.tarikh}`))
    const slotPerHari = new Map<number, { id: string; jenis: string; cawangan_id: string | null }[]>()
    for (const s of slot ?? []) {
      const senarai = slotPerHari.get(s.hari_minggu) ?? []
      senarai.push(s)
      slotPerHari.set(s.hari_minggu, senarai)
    }

    type Kira = { kumpulan: number; personal: number; ganti: number; dibatalkan: number }
    const kira = new Map<string, Kira>()
    const ambil = (kunci: string) => {
      const sedia = kira.get(kunci)
      if (sedia) return sedia
      const baharu = { kumpulan: 0, personal: 0, ganti: 0, dibatalkan: 0 }
      kira.set(kunci, baharu)
      return baharu
    }

    for (let t = mulaB; t <= akhirB; t = tambahHari(t, 1)) {
      for (const s of slotPerHari.get(hariMinggu(t)) ?? []) {
        const kunci = s.cawangan_id ?? 'TIADA'
        if (setBatal.has(`${s.id}:${t}`)) {
          ambil(kunci).dibatalkan++
        } else if (s.jenis === 'Kumpulan') {
          ambil(kunci).kumpulan++
        } else {
          ambil(kunci).personal++
        }
      }
    }
    for (const a of ganti ?? []) {
      ambil(a.cawangan_id ?? 'TIADA').ganti++
    }

    const barisBaru: BarisBilKelas[] = []
    for (const c of cawangan ?? []) {
      const k = kira.get(c.id) ?? { kumpulan: 0, personal: 0, ganti: 0, dibatalkan: 0 }
      barisBaru.push({ cawangan: c.nama, ...k, jumlah: k.kumpulan + k.personal + k.ganti })
    }
    const tiada = kira.get('TIADA')
    if (tiada && tiada.kumpulan + tiada.personal + tiada.ganti + tiada.dibatalkan > 0) {
      barisBaru.push({ cawangan: TIADA_CAWANGAN, ...tiada, jumlah: tiada.kumpulan + tiada.personal + tiada.ganti })
    }

    setBaris(barisBaru)
    setLoading(false)
  }, [bulan])

  useEffect(() => {
    muatData()
  }, [muatData])

  const jumlahBesar = baris.reduce(
    (j, b) => ({
      kumpulan: j.kumpulan + b.kumpulan,
      personal: j.personal + b.personal,
      ganti: j.ganti + b.ganti,
      dibatalkan: j.dibatalkan + b.dibatalkan,
      jumlah: j.jumlah + b.jumlah,
    }),
    { kumpulan: 0, personal: 0, ganti: 0, dibatalkan: 0, jumlah: 0 }
  )

  const unduhPDF = async () => {
    setPdfLoading(true)
    try {
      const { pdf } = await import('@react-pdf/renderer')
      const { LaporanBilKelasPDF } = await import('@/components/pdf/LaporanBilKelasPDF')
      const tarikhJana = tarikhTempatan().split('-').reverse().join('/')
      const blob = await pdf(
        <LaporanBilKelasPDF bulanLabel={labelBulan(bulan)} baris={baris} jumlahBesar={jumlahBesar} tarikhJana={tarikhJana} />
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Laporan_Bil_Kelas_${bulan}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF laporan bilangan kelas dimuat turun.')
    } catch (e) {
      console.error(e)
      toast.error('Gagal jana PDF. Refresh (Ctrl+Shift+R) dan cuba lagi.')
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>
            Laporan Bilangan Kelas
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Bilangan kelas dijadualkan setiap cawangan — {labelBulan(bulan)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
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
          {!loading && baris.length > 0 && (
            <button
              onClick={unduhPDF}
              disabled={pdfLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', background: pdfLoading ? '#94A3B8' : 'var(--primary)', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: '#fff', cursor: pdfLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
            >
              <Printer size={14} /> {pdfLoading ? 'Menjana...' : 'Muat Turun PDF'}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Memuatkan...</div>
      ) : baris.length === 0 ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '40px', textAlign: 'center', fontSize: '13.5px', color: 'var(--text-muted)' }}>
          Tiada cawangan atau jadual kelas lagi.
        </div>
      ) : (
        <>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                  {['Cawangan', 'Kumpulan', 'Personal', 'Kelas Ganti', 'Dibatalkan', 'Jumlah'].map((h, i) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: i === 0 ? 'left' : 'center', fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {baris.map((b, i) => (
                  <tr key={b.cawangan} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '11px 16px', fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>{b.cawangan}</td>
                    <td style={{ padding: '11px 16px', textAlign: 'center', fontSize: '13.5px', color: 'var(--text)' }}>{b.kumpulan}</td>
                    <td style={{ padding: '11px 16px', textAlign: 'center', fontSize: '13.5px', color: 'var(--text)' }}>{b.personal}</td>
                    <td style={{ padding: '11px 16px', textAlign: 'center', fontSize: '13.5px', color: 'var(--text)' }}>{b.ganti}</td>
                    <td style={{ padding: '11px 16px', textAlign: 'center', fontSize: '13.5px', fontWeight: b.dibatalkan > 0 ? 700 : 400, color: b.dibatalkan > 0 ? '#DC2626' : 'var(--text-muted)' }}>
                      {b.dibatalkan > 0 ? `−${b.dibatalkan}` : 0}
                    </td>
                    <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)' }}>{b.jumlah}</div>
                      {b.dibatalkan > 0 && (
                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '1px' }}>
                          {b.jumlah + b.dibatalkan} dijadual − {b.dibatalkan} batal
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid var(--text)', background: '#F8FAFC' }}>
                  <td style={{ padding: '11px 16px', fontSize: '13.5px', fontWeight: 800, color: 'var(--text)' }}>JUMLAH BESAR</td>
                  <td style={{ padding: '11px 16px', textAlign: 'center', fontSize: '13.5px', fontWeight: 800, color: 'var(--text)' }}>{jumlahBesar.kumpulan}</td>
                  <td style={{ padding: '11px 16px', textAlign: 'center', fontSize: '13.5px', fontWeight: 800, color: 'var(--text)' }}>{jumlahBesar.personal}</td>
                  <td style={{ padding: '11px 16px', textAlign: 'center', fontSize: '13.5px', fontWeight: 800, color: 'var(--text)' }}>{jumlahBesar.ganti}</td>
                  <td style={{ padding: '11px 16px', textAlign: 'center', fontSize: '13.5px', fontWeight: 800, color: jumlahBesar.dibatalkan > 0 ? '#DC2626' : 'var(--text-muted)' }}>
                    {jumlahBesar.dibatalkan > 0 ? `−${jumlahBesar.dibatalkan}` : 0}
                  </td>
                  <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)' }}>{jumlahBesar.jumlah}</div>
                    {jumlahBesar.dibatalkan > 0 && (
                      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '1px' }}>
                        {jumlahBesar.jumlah + jumlahBesar.dibatalkan} dijadual − {jumlahBesar.dibatalkan} batal
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '12px' }}>
            Jumlah = kelas dijadualkan TOLAK yang dibatalkan (+ Kelas Ganti). Kiraan berdasarkan jadual kelas semasa —
            slot yang dipadam atau dinyahaktifkan tidak dikira untuk bulan lampau.
          </p>
        </>
      )}
    </div>
  )
}
