'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { HARI, formatMasa, formatTarikhPendek, tarikhTempatan, tambahHari, hariMinggu } from '@/lib/utils'
import type { Slot, Aktiviti } from './JadualKlient'
import { WARNA_KATEGORI } from './JadualKlient'

const btnNav = {
  display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px',
  background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '10px',
  fontSize: '12.5px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit',
}

export function PandanganMingguan({
  mingguMula,
  onUbahMinggu,
  slot,
  aktiviti,
  namaJurulatih,
  onEditSlot,
  onEditAktiviti,
}: {
  mingguMula: string // Ahad minggu dipilih (YYYY-MM-DD)
  onUbahMinggu: (mula: string) => void
  slot: Slot[]
  aktiviti: Aktiviti[]
  namaJurulatih: (ids: string[]) => string
  onEditSlot: (s: Slot) => void
  onEditAktiviti: (a: Aktiviti) => void
}) {
  const hariIni = tarikhTempatan()
  const mingguIni = tambahHari(hariIni, -hariMinggu(hariIni))

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '20px', marginBottom: '24px' }}>
      {/* Navigasi minggu */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button onClick={() => onUbahMinggu(tambahHari(mingguMula, -7))} style={btnNav}>
          <ChevronLeft size={14} /> Minggu Lepas
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>
            {formatTarikhPendek(mingguMula)} — {formatTarikhPendek(tambahHari(mingguMula, 6))}
          </span>
          {mingguMula !== mingguIni && (
            <button onClick={() => onUbahMinggu(mingguIni)} style={{ ...btnNav, padding: '6px 12px', fontSize: '11.5px' }}>
              Minggu Ini
            </button>
          )}
        </div>
        <button onClick={() => onUbahMinggu(tambahHari(mingguMula, 7))} style={btnNav}>
          Minggu Depan <ChevronRight size={14} />
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(120px, 1fr))', gap: '10px', minWidth: '880px' }}>
          {HARI.map((nama, hari) => {
            const tarikhKolum = tambahHari(mingguMula, hari)
            const slotHari = slot.filter((s) => s.hari_minggu === hari)
            const aktivitiHari = aktiviti.filter((a) => a.tarikh === tarikhKolum)
            const ialahHariIni = tarikhKolum === hariIni
            return (
              <div key={hari} style={{ borderRadius: '14px', padding: '10px', background: ialahHariIni ? '#F7FEE7' : 'var(--bg)', border: ialahHariIni ? '1.5px solid var(--accent)' : '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: ialahHariIni ? '#3F6212' : 'var(--text-muted)', marginBottom: '2px', textAlign: 'center' }}>
                  {nama}
                </div>
                <div style={{ fontSize: '10.5px', fontWeight: 600, color: ialahHariIni ? '#3F6212' : 'var(--text-muted)', marginBottom: '10px', textAlign: 'center' }}>
                  {formatTarikhPendek(tarikhKolum).slice(0, 5)}{ialahHariIni ? ' · HARI INI' : ''}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {slotHari.length === 0 && aktivitiHari.length === 0 ? (
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>—</div>
                  ) : (
                    <>
                      {slotHari.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => onEditSlot(s)}
                          title="Klik untuk edit"
                          style={{ textAlign: 'left', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 10px', cursor: 'pointer', fontFamily: 'inherit', display: 'block', width: '100%' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text)' }}>
                              {formatMasa(s.masa_mula)}
                            </span>
                            <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 7px', borderRadius: '20px', background: s.jenis === 'Kumpulan' ? '#ECFCCB' : '#DBEAFE', color: s.jenis === 'Kumpulan' ? '#3F6212' : '#1E40AF' }}>
                              {s.jenis}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
                            {s.jenis === 'Kumpulan' ? s.cawangan?.nama ?? '—' : s.pelajar?.nama_penuh ?? '—'}
                          </div>
                          {(s.jenis === 'Personal' && s.cawangan) && (
                            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.cawangan.nama}</div>
                          )}
                          {s.jurulatih_ids.length > 0 && (
                            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>J: {namaJurulatih(s.jurulatih_ids)}</div>
                          )}
                          {s.lokasi && (
                            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>📍 {s.lokasi}</div>
                          )}
                        </button>
                      ))}
                      {aktivitiHari.map((a) => {
                        const warna = WARNA_KATEGORI[a.kategori]
                        return (
                          <button
                            key={a.id}
                            onClick={() => onEditAktiviti(a)}
                            title="Klik untuk edit"
                            style={{ textAlign: 'left', background: warna.bg, border: `1px solid ${warna.text}33`, borderRadius: '10px', padding: '8px 10px', cursor: 'pointer', fontFamily: 'inherit', display: 'block', width: '100%' }}
                          >
                            <div style={{ fontSize: '10px', fontWeight: 700, color: warna.text, marginBottom: '2px' }}>
                              {a.kategori}{a.masa_mula ? ` · ${formatMasa(a.masa_mula)}` : ''}
                            </div>
                            <div style={{ fontSize: '11.5px', fontWeight: 700, color: warna.text, lineHeight: 1.3 }}>
                              {a.nama}
                            </div>
                            {a.pelajar && (
                              <div style={{ fontSize: '10px', color: warna.text, marginTop: '2px', opacity: 0.8 }}>{a.pelajar.nama_penuh}</div>
                            )}
                          </button>
                        )
                      })}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '12px' }}>
        Klik mana-mana slot atau aktiviti untuk edit. Kelas mingguan berulang setiap minggu; aktiviti berwarna hanya pada tarikhnya.
      </p>
    </div>
  )
}
