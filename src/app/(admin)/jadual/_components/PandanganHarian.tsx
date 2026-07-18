'use client'

import { Ban, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { HARI, hariMinggu, formatMasa, formatTarikh, tarikhTempatan, tambahHari } from '@/lib/utils'
import type { Slot, Aktiviti, Batal } from './JadualKlient'
import { WARNA_KATEGORI } from './JadualKlient'

const btnNav = {
  display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px',
  background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '10px',
  fontSize: '12.5px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit',
}

export function PandanganHarian({
  tarikh,
  onUbahTarikh,
  slot,
  aktiviti,
  batal,
  namaJurulatih,
  onEditSlot,
  onEditAktiviti,
  onBatalSlot,
}: {
  tarikh: string
  onUbahTarikh: (t: string) => void
  slot: Slot[]
  aktiviti: Aktiviti[]
  batal: Batal[]
  namaJurulatih: (ids: string[]) => string
  onEditSlot: (s: Slot) => void
  onEditAktiviti: (a: Aktiviti) => void
  onBatalSlot: (s: Slot, tarikh: string) => void
}) {
  const hari = hariMinggu(tarikh)
  const hariIni = tarikhTempatan()

  type Baris = {
    kunci: string
    masa: string | null
    masaTamat: string | null
    label: string
    warnaBg: string
    warnaText: string
    nama: string
    butiran: string[]
    dibatalkan: boolean
    onKlik: () => void
    slotAsal?: Slot
  }

  const baris: Baris[] = [
    ...slot
      .filter((s) => s.hari_minggu === hari)
      .map((s) => {
        const dibatalkan = batal.some((b) => b.slot_id === s.id && b.tarikh === tarikh)
        return {
          kunci: `slot-${s.id}`,
          masa: s.masa_mula,
          masaTamat: s.masa_tamat,
          label: dibatalkan ? 'Dibatalkan' : s.jenis,
          warnaBg: dibatalkan ? '#FEE2E2' : s.jenis === 'Kumpulan' ? '#ECFCCB' : '#DBEAFE',
          warnaText: dibatalkan ? '#DC2626' : s.jenis === 'Kumpulan' ? '#3F6212' : '#1E40AF',
          nama: s.jenis === 'Kumpulan' ? s.cawangan?.nama ?? '—' : s.pelajar?.nama_penuh ?? '—',
          butiran: [
            s.jenis === 'Personal' && s.cawangan ? s.cawangan.nama : null,
            s.jurulatih_ids.length > 0 ? `J: ${namaJurulatih(s.jurulatih_ids)}` : null,
            s.lokasi ? `📍 ${s.lokasi}` : null,
            s.nota,
          ].filter(Boolean) as string[],
          dibatalkan,
          onKlik: () => (dibatalkan ? onBatalSlot(s, tarikh) : onEditSlot(s)),
          slotAsal: s,
        }
      }),
    ...aktiviti
      .filter((a) => a.tarikh === tarikh)
      .map((a) => ({
        kunci: `akt-${a.id}`,
        masa: a.masa_mula,
        masaTamat: a.masa_tamat,
        label: a.kategori,
        warnaBg: WARNA_KATEGORI[a.kategori].bg,
        warnaText: WARNA_KATEGORI[a.kategori].text,
        nama: a.nama,
        butiran: [
          a.pelajar?.nama_penuh,
          a.jurulatih_ids.length > 0 ? `J: ${namaJurulatih(a.jurulatih_ids)}` : null,
          a.cawangan?.nama,
          a.lokasi ? `📍 ${a.lokasi}` : null,
          a.penerangan,
        ].filter(Boolean) as string[],
        dibatalkan: false,
        onKlik: () => onEditAktiviti(a),
      })),
  ].sort((a, b) => (a.masa ?? '99').localeCompare(b.masa ?? '99'))

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '20px', marginBottom: '24px' }}>
      {/* Navigasi tarikh */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button onClick={() => onUbahTarikh(tambahHari(tarikh, -1))} style={btnNav}>
          <ChevronLeft size={14} /> Semalam
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <input
            type="date"
            value={tarikh}
            onChange={(e) => e.target.value && onUbahTarikh(e.target.value)}
            style={{ padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', fontFamily: 'inherit', color: 'var(--text)', background: 'var(--card)', outline: 'none' }}
          />
          <span style={{ fontSize: '14px', fontWeight: 700, color: tarikh === hariIni ? '#3F6212' : 'var(--text)' }}>
            {HARI[hari]}{tarikh === hariIni ? ' · HARI INI' : ''}
          </span>
          {tarikh !== hariIni && (
            <button onClick={() => onUbahTarikh(hariIni)} style={{ ...btnNav, padding: '6px 12px', fontSize: '11.5px' }}>
              Hari Ini
            </button>
          )}
        </div>
        <button onClick={() => onUbahTarikh(tambahHari(tarikh, 1))} style={btnNav}>
          Esok <ChevronRight size={14} />
        </button>
      </div>

      {baris.length === 0 ? (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '28px 0' }}>
          Tiada kelas atau aktiviti pada {formatTarikh(tarikh)}.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {baris.map((b) => (
            <div
              key={b.kunci}
              role="button"
              tabIndex={0}
              onClick={b.onKlik}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); b.onKlik() } }}
              title={b.dibatalkan ? 'Dibatalkan — klik untuk aktifkan semula' : 'Klik untuk edit'}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '14px', borderRadius: '14px', padding: '12px 16px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', width: '100%', flexWrap: 'wrap', boxSizing: 'border-box',
                background: b.dibatalkan ? '#FEF2F2' : 'var(--card)',
                border: b.dibatalkan ? '1px solid #FECACA' : '1px solid var(--border)',
              }}
            >
              <div style={{ minWidth: '110px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: b.dibatalkan ? '#94A3B8' : 'var(--text)', textDecoration: b.dibatalkan ? 'line-through' : 'none' }}>
                  {b.masa ? formatMasa(b.masa) : '—'}
                </div>
                {b.masaTamat && (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>hingga {formatMasa(b.masaTamat)}</div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: b.dibatalkan ? '#94A3B8' : 'var(--text)', textDecoration: b.dibatalkan ? 'line-through' : 'none' }}>{b.nama}</span>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: b.warnaBg, color: b.warnaText }}>
                    {b.label}
                  </span>
                </div>
                {b.butiran.length > 0 && (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                    {b.butiran.join(' · ')}
                  </div>
                )}
              </div>
              {b.slotAsal && (
                <button
                  onClick={(e) => { e.stopPropagation(); onBatalSlot(b.slotAsal!, tarikh) }}
                  title={b.dibatalkan ? 'Aktifkan semula kelas ini' : 'Batalkan kelas pada tarikh ini sahaja'}
                  aria-label={b.dibatalkan ? 'Aktifkan semula' : 'Batalkan tarikh ini'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', alignSelf: 'center',
                    background: b.dibatalkan ? '#ECFCCB' : 'var(--bg)', border: '1.5px solid ' + (b.dibatalkan ? '#BEF264' : 'var(--border)'),
                    borderRadius: '10px', fontSize: '11.5px', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                    color: b.dibatalkan ? '#3F6212' : '#B91C1C',
                  }}
                >
                  {b.dibatalkan ? <><RotateCcw size={13} /> Aktifkan</> : <><Ban size={13} /> Batal</>}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
