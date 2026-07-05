'use client'

import { useState, useEffect, useCallback } from 'react'
import { CalendarCheck, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { akhirBulan, formatTarikh } from '@/lib/utils'
import { toast } from '@/lib/stores/toast-store'

type Sesi = {
  id: string
  tarikh: string
  status: 'Hadir' | 'Tidak Hadir' | 'Cuti'
  nota: string | null
}

const STATUS: Sesi['status'][] = ['Hadir', 'Tidak Hadir', 'Cuti']

const WARNA: Record<string, { bg: string; text: string; border: string }> = {
  Hadir: { bg: 'var(--hadir-bg)', text: 'var(--hadir-text)', border: '#BBF7D0' },
  'Tidak Hadir': { bg: 'var(--tidak-hadir-bg)', text: 'var(--tidak-hadir-text)', border: '#FECDD3' },
  Cuti: { bg: 'var(--cuti-bg)', text: 'var(--cuti-text)', border: '#FDE68A' },
}

// Tarikh tempatan (Malaysia) — bukan UTC, supaya rekod jatuh pada hari yang betul
function tarikhTempatan(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function bulanSemasa() {
  return tarikhTempatan().slice(0, 7)
}

function julatBulan(bm: string) {
  const [yr, mo] = bm.split('-')
  return { mula: `${yr}-${mo}-01`, akhir: akhirBulan(+yr, +mo) }
}

export function KehadiranSayaKlient({
  jurulatihId,
  nama,
  kadarBayaran,
}: {
  jurulatihId: string
  nama: string
  kadarBayaran: number | null
}) {
  const [bulan, setBulan] = useState(bulanSemasa())
  const [sesi, setSesi] = useState<Sesi[]>([])
  const [loading, setLoading] = useState(true)
  const [menyimpan, setMenyimpan] = useState(false)

  const hariIni = tarikhTempatan()
  const rekodHariIni = sesi.find((s) => s.tarikh === hariIni)

  const muatData = useCallback(async () => {
    setLoading(true)
    const { mula, akhir } = julatBulan(bulan)
    const { data } = await createClient()
      .from('kehadiran_jurulatih')
      .select('id, tarikh, status, nota')
      .eq('jurulatih_id', jurulatihId)
      .gte('tarikh', mula)
      .lte('tarikh', akhir)
      .order('tarikh', { ascending: false })
    setSesi(data ?? [])
    setLoading(false)
  }, [bulan, jurulatihId])

  useEffect(() => {
    muatData()
  }, [muatData])

  const rekodHariIniStatus = async (status: Sesi['status']) => {
    setMenyimpan(true)
    const { error } = await createClient()
      .from('kehadiran_jurulatih')
      .upsert(
        { jurulatih_id: jurulatihId, tarikh: hariIni, status },
        { onConflict: 'jurulatih_id,tarikh' }
      )
    setMenyimpan(false)
    if (error) {
      toast.error('Gagal rekod kehadiran. Cuba lagi.')
      return
    }
    toast.success(`Kehadiran hari ini direkod: ${status}.`)
    if (bulan !== hariIni.slice(0, 7)) setBulan(hariIni.slice(0, 7))
    else muatData()
  }

  const bilHadir = sesi.filter((s) => s.status === 'Hadir').length
  const bilTidakHadir = sesi.filter((s) => s.status === 'Tidak Hadir').length
  const bilCuti = sesi.filter((s) => s.status === 'Cuti').length

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: '2px' }}>
        Kehadiran Saya
      </h1>
      <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '18px' }}>{nama}</p>

      {/* Kad hari ini */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '18px',
          marginBottom: '18px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <CalendarCheck size={15} style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Sesi Hari Ini
          </span>
        </div>
        <p style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text)', marginBottom: '14px' }}>
          {formatTarikh(hariIni)}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          {STATUS.map((st) => {
            const aktif = rekodHariIni?.status === st
            const w = WARNA[st]
            return (
              <button
                key={st}
                onClick={() => rekodHariIniStatus(st)}
                disabled={menyimpan}
                style={{
                  padding: '12px 4px',
                  borderRadius: '12px',
                  border: aktif ? `2px solid ${w.border}` : '1.5px solid var(--border)',
                  background: aktif ? w.bg : 'var(--bg)',
                  color: aktif ? w.text : 'var(--text-muted)',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: menyimpan ? 'wait' : 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {aktif && <Check size={14} />}
                {st}
              </button>
            )
          })}
        </div>

        <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '12px' }}>
          {rekodHariIni
            ? 'Tekan status lain untuk ubah — hanya hari ini boleh diubah.'
            : 'Tekan satu status untuk rekod sesi hari ini.'}
        </p>
      </div>

      {/* Penapis bulan + ringkasan */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Sejarah Sesi
        </span>
        <input
          type="month"
          value={bulan}
          onChange={(e) => setBulan(e.target.value)}
          style={{
            padding: '7px 10px',
            border: '1.5px solid var(--border)',
            borderRadius: '10px',
            fontSize: '12.5px',
            color: 'var(--text)',
            background: 'var(--card)',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
        {[
          { label: 'Hadir', nilai: bilHadir, warna: WARNA.Hadir },
          { label: 'Tidak Hadir', nilai: bilTidakHadir, warna: WARNA['Tidak Hadir'] },
          { label: 'Cuti', nilai: bilCuti, warna: WARNA.Cuti },
        ].map((k) => (
          <div
            key={k.label}
            style={{
              background: k.warna.bg,
              border: `1px solid ${k.warna.border}`,
              borderRadius: '12px',
              padding: '10px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 800, color: k.warna.text }}>{k.nilai}</div>
            <div style={{ fontSize: '10.5px', fontWeight: 600, color: k.warna.text }}>{k.label}</div>
          </div>
        ))}
      </div>

      {kadarBayaran != null && kadarBayaran > 0 && (
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '10px 14px',
            marginBottom: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Anggaran bayaran ({bilHadir} sesi × RM{kadarBayaran.toFixed(2)})
          </span>
          <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)' }}>
            RM {(bilHadir * kadarBayaran).toFixed(2)}
          </span>
        </div>
      )}

      {/* Senarai sesi */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '13px' }}>
          Memuatkan...
        </div>
      ) : sesi.length === 0 ? (
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '30px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
            Tiada sesi bulan ini
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Rekod sesi pertama anda dengan butang di atas.
          </p>
        </div>
      ) : (
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            overflow: 'hidden',
          }}
        >
          {sesi.map((s, i) => {
            const w = WARNA[s.status]
            return (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '11px 14px',
                  borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                    {formatTarikh(s.tarikh)}
                    {s.tarikh === hariIni && (
                      <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--accent)', marginLeft: '6px' }}>
                        HARI INI
                      </span>
                    )}
                  </div>
                  {s.nota && (
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.nota}</div>
                  )}
                </div>
                <span
                  style={{
                    fontSize: '11.5px',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontWeight: 700,
                    background: w.bg,
                    color: w.text,
                    border: `1px solid ${w.border}`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.status}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
