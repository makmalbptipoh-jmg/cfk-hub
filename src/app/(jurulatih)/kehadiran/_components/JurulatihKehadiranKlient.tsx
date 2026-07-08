'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, UserMinus } from 'lucide-react'
import { toast } from '@/lib/stores/toast-store'

type Pelajar = {
  id: string
  nama_penuh: string
  cawangan_daftar_id: string
  cawangan_nama: string
  jenis_kelas: 'Kumpulan' | 'Personal' | 'Kumpulan+Personal'
}

type Cawangan = {
  id: string
  nama: string
}

type ToggleStatus = 'Hadir' | 'Tidak Hadir' | 'Cuti'

// Butang tanda kehadiran harian (jurulatih) — 'Tidak Hadir' dibuang untuk
// rekod ringkas; pelajar yang berhenti ditanda Tak Aktif dan disembunyikan.
const BUTANG_STATUS: ToggleStatus[] = ['Hadir', 'Cuti']

// Nilai chip khas untuk penapis pelajar kelas Personal (bukan id cawangan)
const CHIP_PERSONAL = '__personal__'

interface Props {
  pelajar: Pelajar[]
  cawangan: Cawangan[]
  userId: string
  tarikhHariIni: string
  rekodSedia: Record<string, ToggleStatus>
}

export function JurulatihKehadiranKlient({ pelajar, cawangan, userId, tarikhHariIni, rekodSedia }: Props) {
  const [cawanganChip, setCawanganChip] = useState<string>('')
  const [senarai, setSenarai] = useState<Pelajar[]>(pelajar)
  const [toggles, setToggles] = useState<Record<string, ToggleStatus | null>>(rekodSedia)
  const [loading, setLoading] = useState(false)
  const [berjaya, setBerjaya] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)
  const [menyahaktif, setMenyahaktif] = useState<string | null>(null)

  const tarikhPapar = new Date(tarikhHariIni + 'T00:00:00').toLocaleDateString('ms-MY', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  // Pelajar kumpulan ikut penapis cawangan; pelajar Personal boleh hadir di semua cawangan.
  // Chip khas "Personal" papar HANYA pelajar personal (semua cawangan).
  const { senaraiKumpulan, senaraiPersonal } = useMemo(() => {
    if (cawanganChip === CHIP_PERSONAL) {
      return {
        senaraiKumpulan: [] as Pelajar[],
        senaraiPersonal: senarai.filter((p) => p.jenis_kelas !== 'Kumpulan'),
      }
    }
    const kumpulan = senarai.filter(
      (p) => p.jenis_kelas !== 'Personal' && (!cawanganChip || p.cawangan_daftar_id === cawanganChip)
    )
    const dalamKumpulan = new Set(kumpulan.map((p) => p.id))
    const personal = senarai.filter(
      (p) => p.jenis_kelas !== 'Kumpulan' && !dalamKumpulan.has(p.id)
    )
    return { senaraiKumpulan: kumpulan, senaraiPersonal: personal }
  }, [senarai, cawanganChip])

  const takAktif = async (p: Pelajar) => {
    if (!confirm(`Tandai ${p.nama_penuh} sebagai TIDAK AKTIF? Pelajar ini akan hilang dari senarai kehadiran. (Boleh diaktifkan semula di tab Pelajar.)`)) return
    setMenyahaktif(p.id)
    const { error } = await createClient()
      .from('pelajar')
      .update({ status: 'Tidak Aktif' })
      .eq('id', p.id)
    setMenyahaktif(null)
    if (error) { toast.error('Gagal tandai tidak aktif. Cuba lagi.'); return }
    setSenarai((prev) => prev.filter((x) => x.id !== p.id))
    setToggles((prev) => { const n = { ...prev }; delete n[p.id]; return n })
    toast.success(`${p.nama_penuh} ditandai tidak aktif.`)
  }

  const senaraiFiltred = useMemo(
    () => [...senaraiKumpulan, ...senaraiPersonal],
    [senaraiKumpulan, senaraiPersonal]
  )

  const toggle = (pelajarId: string, status: ToggleStatus) => {
    setToggles((prev) => ({
      ...prev,
      [pelajarId]: prev[pelajarId] === status ? null : status,
    }))
    setBerjaya(false)
  }

  const simpan = async () => {
    setLoading(true)
    setRalat(null)
    setBerjaya(false)

    const supabase = createClient()
    // Chip Personal bukan cawangan sebenar — guna cawangan daftar pelajar
    const cawanganSesiId = cawanganChip && cawanganChip !== CHIP_PERSONAL ? cawanganChip : null

    const records = senaraiFiltred
      .filter((p) => toggles[p.id] != null)
      .map((p) => ({
        pelajar_id: p.id,
        tarikh: tarikhHariIni,
        status: toggles[p.id]!,
        cawangan_daftar_id: p.cawangan_daftar_id,
        cawangan_sesi_id: cawanganSesiId ?? p.cawangan_daftar_id,
        direkod_oleh: userId,
      }))

    if (records.length === 0) {
      setRalat('Tiada rekod dipilih. Sila tandakan sekurang-kurangnya seorang pelajar.')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('kehadiran')
      .upsert(records, { onConflict: 'pelajar_id,tarikh', ignoreDuplicates: false })

    if (error) {
      setRalat('Gagal simpan rekod. Sila cuba lagi.')
      setLoading(false)
      return
    }

    setBerjaya(true)
    setLoading(false)
  }

  const jumlahDitanda = senaraiFiltred.filter((p) => toggles[p.id] != null).length
  const jumlahHadir = senaraiFiltred.filter((p) => toggles[p.id] === 'Hadir').length

  const warnaToggle = {
    Hadir: { aktif: { bg: 'var(--hadir-bg)', border: 'var(--hadir-text)', color: 'var(--hadir-text)' }, pasif: {} },
    'Tidak Hadir': { aktif: { bg: 'var(--tidak-hadir-bg)', border: 'var(--tidak-hadir-text)', color: 'var(--tidak-hadir-text)' }, pasif: {} },
    Cuti: { aktif: { bg: 'var(--cuti-bg)', border: 'var(--cuti-text)', color: 'var(--cuti-text)' }, pasif: {} },
  }

  const kadPelajar = (p: Pelajar) => {
    const status = toggles[p.id] ?? null
    return (
      <div key={p.id} style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: '14px', padding: '12px 14px',
      }}>
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{p.nama_penuh}</span>
            {p.jenis_kelas !== 'Kumpulan' && (
              <span style={{
                fontSize: '10px', fontWeight: 700,
                padding: '2px 7px', borderRadius: '10px',
                background: 'var(--cuti-bg)', color: 'var(--cuti-text)',
              }}>
                Personal
              </span>
            )}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '1px' }}>{p.cawangan_nama}</div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {BUTANG_STATUS.map((s) => {
            const aktif = status === s
            const w = warnaToggle[s]
            return (
              <button key={s}
                onClick={() => toggle(p.id, s)}
                style={{
                  flex: 1, padding: '7px 4px',
                  borderRadius: '8px',
                  border: `1.5px solid ${aktif ? w.aktif.border : 'var(--border)'}`,
                  background: aktif ? w.aktif.bg : 'transparent',
                  color: aktif ? w.aktif.color : 'var(--text-muted)',
                  fontSize: '12px', fontWeight: aktif ? 700 : 500,
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.1s',
                }}
              >
                {s}
              </button>
            )
          })}
          <button
            onClick={() => takAktif(p)}
            disabled={menyahaktif === p.id}
            title="Tandai pelajar tidak aktif"
            aria-label={`Tandai ${p.nama_penuh} tidak aktif`}
            style={{
              flex: 1, padding: '7px 4px',
              borderRadius: '8px',
              border: '1.5px solid var(--border)',
              background: 'transparent',
              color: '#9F1239',
              fontSize: '12px', fontWeight: 600,
              cursor: menyahaktif === p.id ? 'wait' : 'pointer', fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
              transition: 'all 0.1s',
            }}
          >
            <UserMinus size={13} /> Tak Aktif
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '2px' }}>
          Rekod Kehadiran
        </h1>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{tarikhPapar}</p>
      </div>

      {/* Chip Cawangan */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '4px' }}>
        {[{ id: '', nama: 'Semua' }, ...cawangan, { id: CHIP_PERSONAL, nama: 'Personal' }].map((c) => {
          const aktif = cawanganChip === c.id
          return (
            <button key={c.id}
              onClick={() => setCawanganChip(c.id)}
              style={{
                padding: '7px 14px', whiteSpace: 'nowrap',
                borderRadius: '20px', border: `1.5px solid ${aktif ? 'var(--primary)' : 'var(--border)'}`,
                background: aktif ? 'var(--primary)' : 'var(--card)',
                color: aktif ? '#FFFFFF' : 'var(--text-muted)',
                fontSize: '12.5px', fontWeight: aktif ? 700 : 500,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {c.nama}
            </button>
          )
        })}
      </div>

      {/* Ringkasan */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: '12px', padding: '12px 16px',
        display: 'flex', justifyContent: 'space-between',
        marginBottom: '12px', fontSize: '12.5px',
      }}>
        <span style={{ color: 'var(--text-muted)' }}>{senaraiFiltred.length} pelajar</span>
        <span style={{ color: 'var(--hadir-text)', fontWeight: 700 }}>{jumlahHadir} hadir</span>
        <span style={{ color: 'var(--text-muted)' }}>{jumlahDitanda}/{senaraiFiltred.length} ditanda</span>
      </div>

      {/* Senarai Pelajar */}
      {senaraiFiltred.length === 0 ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {cawanganChip === CHIP_PERSONAL ? 'Tiada pelajar kelas personal' : 'Tiada pelajar untuk cawangan ini'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {senaraiKumpulan.map(kadPelajar)}

          {/* Section Kelas Personal — pelajar personal boleh hadir di semua cawangan */}
          {senaraiPersonal.length > 0 && (
            <>
              <div style={{ marginTop: senaraiKumpulan.length > 0 ? '12px' : 0 }}>
                <h2 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                  Kelas Personal
                </h2>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
                  Boleh hadir kelas di semua cawangan
                </p>
              </div>
              {senaraiPersonal.map(kadPelajar)}
            </>
          )}
        </div>
      )}

      {/* Save Bar */}
      <div style={{
        position: 'fixed', bottom: '70px', left: '50%',
        transform: 'translateX(-50%)',
        width: '100%', maxWidth: '390px',
        padding: '12px 16px',
        background: 'var(--bg)',
        borderTop: '1px solid var(--border)',
        zIndex: 90,
      }}>
        {berjaya && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--hadir-bg)', borderRadius: '10px',
            padding: '10px 14px', marginBottom: '10px',
            fontSize: '13px', color: 'var(--hadir-text)', fontWeight: 600,
          }}>
            <CheckCircle2 size={15} />
            Rekod kehadiran berjaya disimpan!
          </div>
        )}
        {ralat && (
          <div style={{
            background: '#FFF1F2', borderRadius: '10px',
            padding: '10px 14px', marginBottom: '10px',
            fontSize: '13px', color: '#9F1239',
          }}>
            {ralat}
          </div>
        )}
        <button
          onClick={simpan}
          disabled={loading || jumlahDitanda === 0}
          style={{
            width: '100%', padding: '13px',
            background: loading || jumlahDitanda === 0 ? '#94A3B8' : 'var(--accent)',
            border: 'none', borderRadius: '12px',
            fontSize: '14px', fontWeight: 700,
            color: 'var(--accent-text)',
            cursor: loading || jumlahDitanda === 0 ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {loading ? 'Menyimpan...' : `Simpan Rekod Kehadiran (${jumlahDitanda})`}
        </button>
      </div>
    </div>
  )
}
