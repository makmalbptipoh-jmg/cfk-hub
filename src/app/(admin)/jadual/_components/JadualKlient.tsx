'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarDays, Plus, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { HARI, hariMinggu, formatMasa, formatTarikh, tarikhTempatan, bulanTempatan, tambahHari, akhirBulan } from '@/lib/utils'
import { toast } from '@/lib/stores/toast-store'
import { ModalSlot } from './ModalSlot'
import { ModalAktiviti } from './ModalAktiviti'
import { PandanganHarian } from './PandanganHarian'
import { PandanganMingguan } from './PandanganMingguan'
import { PandanganBulanan } from './PandanganBulanan'

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
  jurulatih_ids: string[]
  lokasi: string | null
  nota: string | null
  status: 'Aktif' | 'Tidak Aktif'
  cawangan: { nama: string } | null
  pelajar: { nama_penuh: string } | null
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
  jurulatih_ids: string[]
  penerangan: string | null
  status: 'Aktif' | 'Dibatalkan'
  cawangan: { nama: string } | null
  pelajar: { nama_penuh: string } | null
}

export const WARNA_KATEGORI: Record<Aktiviti['kategori'], { bg: string; text: string }> = {
  Pertandingan: { bg: '#FEF3C7', text: '#92400E' },
  Kem: { bg: '#D1FAE5', text: '#065F46' },
  Mesyuarat: { bg: '#E0E7FF', text: '#3730A3' },
  'Kelas Personal': { bg: '#DBEAFE', text: '#1E40AF' },
  'Kelas Ganti': { bg: '#FCE7F3', text: '#9D174D' },
  'Lain-lain': { bg: '#F1F5F9', text: '#475569' },
}

const SELECT_SLOT = '*, cawangan:cawangan_id(nama), pelajar:pelajar_id(nama_penuh)'

type Pandangan = 'harian' | 'mingguan' | 'bulanan'

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
  const hariIni = tarikhTempatan()

  const [slot, setSlot] = useState<Slot[]>(slotAwal)
  const [aktiviti, setAktiviti] = useState<Aktiviti[]>(aktivitiAwal) // senarai akan datang (bawah)
  const [aktivitiTempoh, setAktivitiTempoh] = useState<Aktiviti[]>([]) // aktiviti dalam julat view semasa
  const [cawanganTapis, setCawanganTapis] = useState('')
  const [pandangan, setPandangan] = useState<Pandangan>('mingguan')
  const [tarikhPilih, setTarikhPilih] = useState(hariIni)
  const [mingguMula, setMingguMula] = useState(tambahHari(hariIni, -hariMinggu(hariIni)))
  const [bulanPilih, setBulanPilih] = useState(bulanTempatan())
  const [versi, setVersi] = useState(0) // naik selepas simpan/padam — trigger muat semula aktiviti tempoh
  const [modalSlot, setModalSlot] = useState<{ buka: boolean; edit: Slot | null }>({ buka: false, edit: null })
  const [modalAktiviti, setModalAktiviti] = useState<{ buka: boolean; edit: Aktiviti | null }>({ buka: false, edit: null })

  const namaJurulatih = useCallback(
    (ids: string[]) =>
      ids
        .map((id) => jurulatihAwal.find((j) => j.id === id)?.nama_penuh)
        .filter(Boolean)
        .join(', '),
    [jurulatihAwal]
  )

  // Julat tarikh aktiviti yang perlu dimuat untuk view semasa
  const julat = useMemo(() => {
    if (pandangan === 'harian') return { mula: tarikhPilih, tamat: tarikhPilih }
    if (pandangan === 'mingguan') return { mula: mingguMula, tamat: tambahHari(mingguMula, 6) }
    const [y, m] = bulanPilih.split('-').map(Number)
    return { mula: `${bulanPilih}-01`, tamat: akhirBulan(y, m) }
  }, [pandangan, tarikhPilih, mingguMula, bulanPilih])

  useEffect(() => {
    createClient()
      .from('aktiviti')
      .select(SELECT_SLOT)
      .eq('status', 'Aktif')
      .gte('tarikh', julat.mula)
      .lte('tarikh', julat.tamat)
      .order('tarikh')
      .order('masa_mula')
      .then(({ data, error }) => {
        if (error) {
          console.error(error)
          return
        }
        setAktivitiTempoh((data ?? []) as unknown as Aktiviti[])
      })
  }, [julat, versi])

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
    setVersi((v) => v + 1)
  }, [])

  // Penapis cawangan menapis slot Kumpulan sahaja — slot Personal sentiasa
  // dipapar kerana pelajar personal boleh hadir di mana-mana cawangan.
  const slotDipapar = cawanganTapis
    ? slot.filter((s) => s.jenis === 'Personal' || s.cawangan_id === cawanganTapis)
    : slot

  const aktivitiDipapar = aktiviti.filter((a) => a.status === 'Aktif')

  const bukaEditSlot = (s: Slot) => setModalSlot({ buka: true, edit: s })
  const bukaEditAktiviti = (a: Aktiviti) => setModalAktiviti({ buka: true, edit: a })

  const togolPandangan = (p: Pandangan, label: string) => (
    <button
      key={p}
      onClick={() => setPandangan(p)}
      style={{
        padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
        background: pandangan === p ? 'var(--primary)' : 'transparent',
        color: pandangan === p ? '#fff' : 'var(--text-muted)',
        border: 'none',
      }}
    >
      {label}
    </button>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
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
          <button
            onClick={() => setModalAktiviti({ buka: true, edit: null })}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'var(--primary)', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <Plus size={15} /> Tambah Aktiviti
          </button>
        </div>
      </div>

      {/* Togol pandangan */}
      <div style={{ display: 'inline-flex', gap: '4px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '4px', marginBottom: '16px' }}>
        {togolPandangan('harian', 'Harian')}
        {togolPandangan('mingguan', 'Mingguan')}
        {togolPandangan('bulanan', 'Bulanan')}
      </div>

      {pandangan === 'harian' && (
        <PandanganHarian
          tarikh={tarikhPilih}
          onUbahTarikh={setTarikhPilih}
          slot={slotDipapar}
          aktiviti={aktivitiTempoh}
          namaJurulatih={namaJurulatih}
          onEditSlot={bukaEditSlot}
          onEditAktiviti={bukaEditAktiviti}
        />
      )}
      {pandangan === 'mingguan' && (
        <PandanganMingguan
          mingguMula={mingguMula}
          onUbahMinggu={setMingguMula}
          slot={slotDipapar}
          aktiviti={aktivitiTempoh}
          namaJurulatih={namaJurulatih}
          onEditSlot={bukaEditSlot}
          onEditAktiviti={bukaEditAktiviti}
        />
      )}
      {pandangan === 'bulanan' && (
        <PandanganBulanan
          bulan={bulanPilih}
          onUbahBulan={setBulanPilih}
          slot={slotDipapar}
          aktiviti={aktivitiTempoh}
          onPilihTarikh={(t) => {
            setTarikhPilih(t)
            setPandangan('harian')
          }}
        />
      )}

      {/* Aktiviti akan datang */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarDays size={17} style={{ color: 'var(--text-muted)' }} /> Aktiviti Akan Datang
          </h2>
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
                        a.jurulatih_ids.length > 0 ? `J: ${namaJurulatih(a.jurulatih_ids)}` : null,
                        a.cawangan?.nama,
                        a.lokasi ? `📍 ${a.lokasi}` : null,
                      ].filter(Boolean).join(' · ') || '—'}
                    </div>
                  </div>
                  <button
                    onClick={() => bukaEditAktiviti(a)}
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
