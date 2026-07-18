'use client'

import { useCallback, useState } from 'react'
import { CalendarDays, Plus, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { HARI, hariMinggu, formatMasa, formatTarikh, tarikhTempatan } from '@/lib/utils'
import { toast } from '@/lib/stores/toast-store'
import { ModalSlot } from './ModalSlot'
import { ModalAktiviti } from './ModalAktiviti'

export type Cawangan = { id: string; nama: string }
export type JurulatihPilihan = { id: string; nama_penuh: string }

export type Slot = {
  id: string
  jenis: 'Kumpulan' | 'Personal'
  hari_minggu: number
  masa_mula: string
  masa_tamat: string
  cawangan_id: string | null
  pelajar_id: string | null
  jurulatih_id: string | null
  lokasi: string | null
  nota: string | null
  status: 'Aktif' | 'Tidak Aktif'
  cawangan: { nama: string } | null
  pelajar: { nama_penuh: string } | null
  jurulatih: { nama_penuh: string } | null
}

export type Aktiviti = {
  id: string
  nama: string
  kategori: 'Pertandingan' | 'Kem' | 'Mesyuarat' | 'Kelas Personal' | 'Kelas Ganti' | 'Lain-lain'
  tarikh: string
  masa_mula: string | null
  masa_tamat: string | null
  lokasi: string | null
  cawangan_id: string | null
  pelajar_id: string | null
  jurulatih_id: string | null
  penerangan: string | null
  status: 'Aktif' | 'Dibatalkan'
  cawangan: { nama: string } | null
  pelajar: { nama_penuh: string } | null
  jurulatih: { nama_penuh: string } | null
}

const WARNA_KATEGORI: Record<Aktiviti['kategori'], { bg: string; text: string }> = {
  Pertandingan: { bg: '#FEF3C7', text: '#92400E' },
  Kem: { bg: '#D1FAE5', text: '#065F46' },
  Mesyuarat: { bg: '#E0E7FF', text: '#3730A3' },
  'Kelas Personal': { bg: '#DBEAFE', text: '#1E40AF' },
  'Kelas Ganti': { bg: '#FCE7F3', text: '#9D174D' },
  'Lain-lain': { bg: '#F1F5F9', text: '#475569' },
}

const SELECT_SLOT = '*, cawangan:cawangan_id(nama), pelajar:pelajar_id(nama_penuh), jurulatih:jurulatih_id(nama_penuh)'

export function JadualKlient({
  cawanganAwal,
  slotAwal,
  jurulatihAwal,
  aktivitiAwal,
}: {
  cawanganAwal: Cawangan[]
  slotAwal: Slot[]
  jurulatihAwal: JurulatihPilihan[]
  aktivitiAwal: Aktiviti[]
}) {
  const [slot, setSlot] = useState<Slot[]>(slotAwal)
  const [aktiviti, setAktiviti] = useState<Aktiviti[]>(aktivitiAwal)
  const [cawanganTapis, setCawanganTapis] = useState('')
  const [modalSlot, setModalSlot] = useState<{ buka: boolean; edit: Slot | null }>({ buka: false, edit: null })
  const [modalAktiviti, setModalAktiviti] = useState<{ buka: boolean; edit: Aktiviti | null }>({ buka: false, edit: null })

  const hariIni = hariMinggu(tarikhTempatan())

  const muatData = useCallback(async () => {
    const supabase = createClient()
    const [{ data: dataSlot, error: e1 }, { data: dataAktiviti, error: e2 }] = await Promise.all([
      supabase.from('jadual_slot').select(SELECT_SLOT).eq('status', 'Aktif').order('hari_minggu').order('masa_mula'),
      supabase.from('aktiviti').select(SELECT_SLOT).gte('tarikh', tarikhTempatan()).order('tarikh').order('masa_mula').limit(50),
    ])
    if (e1 || e2) {
      toast.error('Gagal muat semula jadual. Cuba refresh page.')
      return
    }
    setSlot((dataSlot ?? []) as unknown as Slot[])
    setAktiviti((dataAktiviti ?? []) as unknown as Aktiviti[])
  }, [])

  // Penapis cawangan menapis slot Kumpulan sahaja — slot Personal sentiasa
  // dipapar kerana pelajar personal boleh hadir di mana-mana cawangan.
  const slotDipapar = cawanganTapis
    ? slot.filter((s) => s.jenis === 'Personal' || s.cawangan_id === cawanganTapis)
    : slot

  const aktivitiDipapar = aktiviti.filter((a) => a.status === 'Aktif')

  const namaSlot = (s: Slot) => (s.jenis === 'Kumpulan' ? s.cawangan?.nama ?? '—' : s.pelajar?.nama_penuh ?? '—')

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: '4px' }}>
            Jadual Kelas
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Kelas mingguan setiap cawangan, kelas personal &amp; aktiviti CFK
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={cawanganTapis}
            onChange={(e) => setCawanganTapis(e.target.value)}
            style={{ padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', color: 'var(--text)', background: 'var(--card)', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}
          >
            <option value="">Semua Cawangan</option>
            {cawanganAwal.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
          </select>
          <button
            onClick={() => setModalSlot({ buka: true, edit: null })}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'var(--accent)', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--accent-text)', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <Plus size={15} /> Tambah Slot
          </button>
        </div>
      </div>

      {/* Grid mingguan */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '20px', marginBottom: '24px', overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(120px, 1fr))', gap: '10px', minWidth: '880px' }}>
          {HARI.map((nama, hari) => {
            const slotHari = slotDipapar.filter((s) => s.hari_minggu === hari)
            const ialahHariIni = hari === hariIni
            return (
              <div key={hari} style={{ borderRadius: '14px', padding: '10px', background: ialahHariIni ? '#F7FEE7' : 'var(--bg)', border: ialahHariIni ? '1.5px solid var(--accent)' : '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: ialahHariIni ? '#3F6212' : 'var(--text-muted)', marginBottom: '10px', textAlign: 'center' }}>
                  {nama}{ialahHariIni ? ' · HARI INI' : ''}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {slotHari.length === 0 ? (
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>—</div>
                  ) : slotHari.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setModalSlot({ buka: true, edit: s })}
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
                        {namaSlot(s)}
                      </div>
                      {(s.jenis === 'Personal' && s.cawangan) && (
                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.cawangan.nama}</div>
                      )}
                      {s.jurulatih && (
                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>J: {s.jurulatih.nama_penuh}</div>
                      )}
                      {s.lokasi && (
                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>📍 {s.lokasi}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '12px' }}>
          Klik mana-mana slot untuk edit atau padam. Masa dipapar ialah masa mula kelas.
        </p>
      </div>

      {/* Aktiviti akan datang */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarDays size={17} style={{ color: 'var(--text-muted)' }} /> Aktiviti Akan Datang
          </h2>
          <button
            onClick={() => setModalAktiviti({ buka: true, edit: null })}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'var(--primary)', border: 'none', borderRadius: '10px', fontSize: '12.5px', fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <Plus size={14} /> Tambah Aktiviti
          </button>
        </div>

        {aktivitiDipapar.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
            Tiada aktiviti akan datang. Klik &quot;Tambah Aktiviti&quot; untuk rekod pertandingan, kem, mesyuarat atau kelas ad-hoc.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {aktivitiDipapar.map((a) => {
              const warna = WARNA_KATEGORI[a.kategori]
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid var(--border)', borderRadius: '14px', padding: '12px 16px', flexWrap: 'wrap' }}>
                  <div style={{ minWidth: '150px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                      {formatTarikh(a.tarikh)}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      {HARI[hariMinggu(a.tarikh)]}
                      {a.masa_mula ? ` · ${formatMasa(a.masa_mula)}${a.masa_tamat ? `–${formatMasa(a.masa_tamat)}` : ''}` : ''}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>{a.nama}</span>
                      <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: warna.bg, color: warna.text }}>
                        {a.kategori}
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {[
                        a.pelajar?.nama_penuh,
                        a.jurulatih ? `J: ${a.jurulatih.nama_penuh}` : null,
                        a.cawangan?.nama,
                        a.lokasi ? `📍 ${a.lokasi}` : null,
                      ].filter(Boolean).join(' · ') || '—'}
                    </div>
                  </div>
                  <button
                    onClick={() => setModalAktiviti({ buka: true, edit: a })}
                    aria-label={`Edit ${a.nama}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '12px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    <Pencil size={13} /> Edit
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {modalSlot.buka && (
        <ModalSlot
          slotEdit={modalSlot.edit}
          semuaSlot={slot}
          cawangan={cawanganAwal}
          jurulatih={jurulatihAwal}
          onTutup={() => setModalSlot({ buka: false, edit: null })}
          onBerjaya={() => { setModalSlot({ buka: false, edit: null }); muatData() }}
        />
      )}
      {modalAktiviti.buka && (
        <ModalAktiviti
          aktivitiEdit={modalAktiviti.edit}
          cawangan={cawanganAwal}
          jurulatih={jurulatihAwal}
          onTutup={() => setModalAktiviti({ buka: false, edit: null })}
          onBerjaya={() => { setModalAktiviti({ buka: false, edit: null }); muatData() }}
        />
      )}
    </div>
  )
}
