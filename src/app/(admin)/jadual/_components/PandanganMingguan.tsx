'use client'

import { useState } from 'react'
import { Ban, ChevronLeft, ChevronRight, Printer, RotateCcw } from 'lucide-react'
import { HARI, formatMasa, formatTarikhPendek, tarikhTempatan, tambahHari, hariMinggu } from '@/lib/utils'
import { toast } from '@/lib/stores/toast-store'
import type { Slot, Aktiviti, Batal } from './JadualKlient'
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
  batal,
  namaJurulatih,
  cawanganLabel,
  onEditSlot,
  onEditAktiviti,
  onBatalSlot,
}: {
  mingguMula: string // Ahad minggu dipilih (YYYY-MM-DD)
  onUbahMinggu: (mula: string) => void
  slot: Slot[]
  aktiviti: Aktiviti[]
  batal: Batal[]
  namaJurulatih: (ids: string[]) => string
  cawanganLabel: string
  onEditSlot: (s: Slot) => void
  onEditAktiviti: (a: Aktiviti) => void
  onBatalSlot: (s: Slot, tarikh: string) => void
}) {
  const hariIni = tarikhTempatan()
  const mingguIni = tambahHari(hariIni, -hariMinggu(hariIni))
  const [pdfLoading, setPdfLoading] = useState(false)

  const unduhPDF = async () => {
    setPdfLoading(true)
    try {
      const { pdf } = await import('@react-pdf/renderer')
      const { JadualMingguPDF } = await import('@/components/pdf/JadualMingguPDF')
      const slotPdf = slot.map((x) => ({
        hari_minggu: x.hari_minggu,
        masa: `${formatMasa(x.masa_mula)} - ${formatMasa(x.masa_tamat)}`,
        nama: x.jenis === 'Kumpulan' ? x.cawangan?.nama ?? '—' : x.pelajar?.nama_penuh ?? '—',
        jenis: x.jenis,
        jurulatih: namaJurulatih(x.jurulatih_ids),
        lokasi: x.lokasi ?? (x.jenis === 'Personal' && x.cawangan ? x.cawangan.nama : ''),
        dibatalkan: batal.some((b) => b.slot_id === x.id && b.tarikh === tambahHari(mingguMula, x.hari_minggu)),
      }))
      const tarikhJana = hariIni.split('-').reverse().join('/')
      const tarikhKolum = Array.from({ length: 7 }, (_, h) => formatTarikhPendek(tambahHari(mingguMula, h)).slice(0, 5))
      const blob = await pdf(
        <JadualMingguPDF cawangan={cawanganLabel} slot={slotPdf} tarikhJana={tarikhJana} tarikhKolum={tarikhKolum} />
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Jadual_Mingguan_${cawanganLabel.replace(/[^\w]+/g, '_')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF jadual mingguan dimuat turun.')
    } catch (e) {
      console.error(e)
      toast.error('Gagal jana PDF. Refresh (Ctrl+Shift+R) dan cuba lagi.')
    } finally {
      setPdfLoading(false)
    }
  }

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
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => onUbahMinggu(tambahHari(mingguMula, 7))} style={btnNav}>
            Minggu Depan <ChevronRight size={14} />
          </button>
          <button
            onClick={unduhPDF}
            disabled={pdfLoading}
            style={{ ...btnNav, background: pdfLoading ? '#94A3B8' : 'var(--primary)', border: 'none', color: '#fff' }}
          >
            <Printer size={14} /> {pdfLoading ? 'Menjana...' : 'Cetak PDF'}
          </button>
        </div>
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
                      {slotHari.map((s) => {
                        const batalSlot = batal.find((b) => b.slot_id === s.id && b.tarikh === tarikhKolum)
                        const dibatalkan = Boolean(batalSlot)
                        const klikKad = () => (dibatalkan ? onBatalSlot(s, tarikhKolum) : onEditSlot(s))
                        return (
                          <div
                            key={s.id}
                            role="button"
                            tabIndex={0}
                            onClick={klikKad}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); klikKad() } }}
                            title={dibatalkan ? 'Dibatalkan — klik untuk aktifkan semula' : 'Klik untuk edit'}
                            style={{
                              textAlign: 'left', borderRadius: '10px', padding: '8px 10px', cursor: 'pointer', fontFamily: 'inherit', display: 'block', width: '100%', boxSizing: 'border-box',
                              background: dibatalkan ? '#FEF2F2' : 'var(--card)',
                              border: dibatalkan ? '1px solid #FECACA' : '1px solid var(--border)',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '11.5px', fontWeight: 700, color: dibatalkan ? '#94A3B8' : 'var(--text)', textDecoration: dibatalkan ? 'line-through' : 'none' }}>
                                {formatMasa(s.masa_mula)}
                              </span>
                              {dibatalkan ? (
                                <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 7px', borderRadius: '20px', background: '#FEE2E2', color: '#DC2626' }}>
                                  Dibatalkan
                                </span>
                              ) : (
                                <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 7px', borderRadius: '20px', background: s.jenis === 'Kumpulan' ? '#ECFCCB' : '#DBEAFE', color: s.jenis === 'Kumpulan' ? '#3F6212' : '#1E40AF' }}>
                                  {s.jenis}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: dibatalkan ? '#94A3B8' : 'var(--text)', lineHeight: 1.3, textDecoration: dibatalkan ? 'line-through' : 'none' }}>
                              {s.jenis === 'Kumpulan' ? s.cawangan?.nama ?? '—' : s.pelajar?.nama_penuh ?? '—'}
                            </div>
                            {(s.jenis === 'Personal' && s.cawangan) && (
                              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.cawangan.nama}</div>
                            )}
                            {s.jurulatih_ids.length > 0 && (
                              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>J: {namaJurulatih(s.jurulatih_ids)}</div>
                            )}
                            {s.lokasi && !dibatalkan && (
                              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>📍 {s.lokasi}</div>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); onBatalSlot(s, tarikhKolum) }}
                              title={dibatalkan ? 'Aktifkan semula kelas ini' : 'Batalkan kelas minggu ini sahaja'}
                              aria-label={dibatalkan ? 'Aktifkan semula' : 'Batalkan minggu ini'}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', padding: '3px 8px',
                                background: dibatalkan ? '#ECFCCB' : 'var(--bg)', border: '1px solid ' + (dibatalkan ? '#BEF264' : 'var(--border)'),
                                borderRadius: '8px', fontSize: '10px', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                                color: dibatalkan ? '#3F6212' : '#B91C1C',
                              }}
                            >
                              {dibatalkan ? <><RotateCcw size={10} /> Aktifkan</> : <><Ban size={10} /> Batal minggu ini</>}
                            </button>
                          </div>
                        )
                      })}
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
        Guna butang &quot;Batal minggu ini&quot; untuk batalkan kelas pada minggu dipapar sahaja — minggu lain tidak terjejas.
      </p>
    </div>
  )
}
