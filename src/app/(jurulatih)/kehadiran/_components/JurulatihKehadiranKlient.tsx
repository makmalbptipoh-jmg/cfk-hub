'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2 } from 'lucide-react'

type Pelajar = {
  id: string
  nama_penuh: string
  cawangan_daftar_id: string
  cawangan_nama: string
}

type Cawangan = {
  id: string
  nama: string
}

type ToggleStatus = 'Hadir' | 'Tidak Hadir' | 'Cuti'

interface Props {
  pelajar: Pelajar[]
  cawangan: Cawangan[]
  userId: string
  tarikhHariIni: string
  rekodSedia: Record<string, ToggleStatus>
}

export function JurulatihKehadiranKlient({ pelajar, cawangan, userId, tarikhHariIni, rekodSedia }: Props) {
  const [cawanganChip, setCawanganChip] = useState<string>('')
  const [toggles, setToggles] = useState<Record<string, ToggleStatus | null>>(rekodSedia)
  const [loading, setLoading] = useState(false)
  const [berjaya, setBerjaya] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)

  const tarikhPapar = new Date(tarikhHariIni + 'T00:00:00').toLocaleDateString('ms-MY', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const senaraiFiltred = useMemo(() => {
    if (!cawanganChip) return pelajar
    return pelajar.filter((p) => p.cawangan_daftar_id === cawanganChip)
  }, [pelajar, cawanganChip])

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
    const cawanganSesiId = cawanganChip || null

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
        {[{ id: '', nama: 'Semua' }, ...cawangan].map((c) => {
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
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Tiada pelajar untuk cawangan ini</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {senaraiFiltred.map((p) => {
            const status = toggles[p.id] ?? null
            return (
              <div key={p.id} style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: '14px', padding: '12px 14px',
              }}>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{p.nama_penuh}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '1px' }}>{p.cawangan_nama}</div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(['Hadir', 'Tidak Hadir', 'Cuti'] as ToggleStatus[]).map((s) => {
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
                          fontSize: '11.5px', fontWeight: aktif ? 700 : 500,
                          cursor: 'pointer', fontFamily: 'inherit',
                          transition: 'all 0.1s',
                        }}
                      >
                        {s === 'Tidak Hadir' ? 'X Hadir' : s}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
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
