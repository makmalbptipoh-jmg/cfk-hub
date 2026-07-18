'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { HARI, akhirBulan, hariMinggu, tarikhTempatan, bulanTempatan } from '@/lib/utils'
import type { Slot, Aktiviti, Batal } from './JadualKlient'
import { WARNA_KATEGORI } from './JadualKlient'

const btnNav = {
  display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px',
  background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '10px',
  fontSize: '12.5px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit',
}

// 'YYYY-MM' ± n bulan
function ubahBulan(bulan: string, n: number): string {
  const [y, m] = bulan.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 7)
}

export function PandanganBulanan({
  bulan,
  onUbahBulan,
  slot,
  aktiviti,
  batal,
  onPilihTarikh,
}: {
  bulan: string // 'YYYY-MM'
  onUbahBulan: (b: string) => void
  slot: Slot[]
  aktiviti: Aktiviti[]
  batal: Batal[]
  onPilihTarikh: (tarikh: string) => void
}) {
  const hariIni = tarikhTempatan()
  const bulanIni = bulanTempatan()
  const [tahun, bulanNum] = bulan.split('-').map(Number)
  const bilHari = Number(akhirBulan(tahun, bulanNum).split('-')[2])
  const offsetMula = hariMinggu(`${bulan}-01`)

  // Kiraan slot berulang per hari minggu (0-6)
  const kiraSlotHari = Array.from({ length: 7 }, (_, h) => slot.filter((s) => s.hari_minggu === h).length)

  // Aktiviti per tarikh
  const aktivitiPerTarikh = new Map<string, Aktiviti[]>()
  for (const a of aktiviti) {
    const senarai = aktivitiPerTarikh.get(a.tarikh) ?? []
    senarai.push(a)
    aktivitiPerTarikh.set(a.tarikh, senarai)
  }

  // Sel kalendar: null = petak kosong sebelum 1hb
  const sel: (number | null)[] = [
    ...Array.from({ length: offsetMula }, () => null),
    ...Array.from({ length: bilHari }, (_, i) => i + 1),
  ]
  while (sel.length % 7 !== 0) sel.push(null)

  const namaBulanPanjang = new Date(Date.UTC(tahun, bulanNum - 1, 1)).toLocaleString('ms-MY', { month: 'long', year: 'numeric', timeZone: 'UTC' })

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '20px', marginBottom: '24px' }}>
      {/* Navigasi bulan */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button onClick={() => onUbahBulan(ubahBulan(bulan, -1))} style={btnNav}>
          <ChevronLeft size={14} /> Bulan Lepas
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <input
            type="month"
            value={bulan}
            onChange={(e) => e.target.value && onUbahBulan(e.target.value)}
            style={{ padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', fontFamily: 'inherit', color: 'var(--text)', background: 'var(--card)', outline: 'none' }}
          />
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{namaBulanPanjang}</span>
          {bulan !== bulanIni && (
            <button onClick={() => onUbahBulan(bulanIni)} style={{ ...btnNav, padding: '6px 12px', fontSize: '11.5px' }}>
              Bulan Ini
            </button>
          )}
        </div>
        <button onClick={() => onUbahBulan(ubahBulan(bulan, 1))} style={btnNav}>
          Bulan Depan <ChevronRight size={14} />
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: '760px' }}>
          {/* Header hari */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '6px' }}>
            {HARI.map((h) => (
              <div key={h} style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'center', padding: '4px 0' }}>
                {h}
              </div>
            ))}
          </div>
          {/* Grid tarikh */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {sel.map((hariBulan, i) => {
              if (hariBulan === null) {
                return <div key={`kosong-${i}`} style={{ minHeight: '86px', borderRadius: '12px', background: 'transparent' }} />
              }
              const tarikh = `${bulan}-${String(hariBulan).padStart(2, '0')}`
              const hariM = i % 7
              const idSlotHari = new Set(slot.filter((s) => s.hari_minggu === hariM).map((s) => s.id))
              const bilBatal = batal.filter((b) => b.tarikh === tarikh && idSlotHari.has(b.slot_id)).length
              const bilKelas = kiraSlotHari[hariM] - bilBatal
              const aktivitiHari = aktivitiPerTarikh.get(tarikh) ?? []
              const ialahHariIni = tarikh === hariIni
              return (
                <button
                  key={tarikh}
                  onClick={() => onPilihTarikh(tarikh)}
                  title="Klik untuk lihat harian"
                  style={{
                    minHeight: '86px', borderRadius: '12px', padding: '7px 8px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                    background: ialahHariIni ? '#F7FEE7' : 'var(--bg)',
                    border: ialahHariIni ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                    display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start', overflow: 'hidden',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 800, color: ialahHariIni ? '#3F6212' : 'var(--text)' }}>
                    {hariBulan}
                  </span>
                  {bilKelas > 0 && (
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 7px', borderRadius: '20px', background: '#ECFCCB', color: '#3F6212' }}>
                      {bilKelas} kelas
                    </span>
                  )}
                  {bilBatal > 0 && (
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 7px', borderRadius: '20px', background: '#FEE2E2', color: '#DC2626' }}>
                      −{bilBatal} dibatalkan
                    </span>
                  )}
                  {aktivitiHari.slice(0, 2).map((a) => {
                    const warna = WARNA_KATEGORI[a.kategori]
                    return (
                      <span key={a.id} style={{ fontSize: '9.5px', fontWeight: 700, padding: '1px 7px', borderRadius: '20px', background: warna.bg, color: warna.text, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                        {a.nama}
                      </span>
                    )
                  })}
                  {aktivitiHari.length > 2 && (
                    <span style={{ fontSize: '9.5px', fontWeight: 600, color: 'var(--text-muted)' }}>
                      +{aktivitiHari.length - 2} lagi
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
      <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '12px' }}>
        &quot;N kelas&quot; = kelas mingguan pada hari itu (yang dibatalkan sudah ditolak). Klik mana-mana tarikh untuk lihat butiran harian.
      </p>
    </div>
  )
}
