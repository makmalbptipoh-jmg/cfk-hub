'use client'

import { useState } from 'react'
import { X, Ban, RotateCcw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTutupEscape } from '@/lib/hooks/useTutupEscape'
import { HARI, hariMinggu, formatMasa, formatTarikh, formatTarikhPendek } from '@/lib/utils'
import { toast } from '@/lib/stores/toast-store'
import type { Slot, Batal } from './JadualKlient'

export function ModalBatalSlot({
  slot,
  tarikh,
  batalSediaAda,
  namaJurulatih,
  onTutup,
  onBerjaya,
}: {
  slot: Slot
  tarikh: string // 'YYYY-MM-DD' — kejadian slot yang diklik
  batalSediaAda: Batal | null // jika ada → mod "Aktifkan Semula"
  namaJurulatih: (ids: string[]) => string
  onTutup: () => void
  onBerjaya: () => void
}) {
  const [sebab, setSebab] = useState('')
  const [loading, setLoading] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)
  useTutupEscape(onTutup)

  const namaKelas = slot.jenis === 'Kumpulan' ? slot.cawangan?.nama ?? '—' : slot.pelajar?.nama_penuh ?? '—'
  const kunciNotifikasi = `kelas_dibatalkan:${slot.id}:${tarikh}`

  const batalkan = async () => {
    setLoading(true)
    setRalat(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('jadual_slot_batal').insert({
      slot_id: slot.id,
      tarikh,
      sebab: sebab.trim() || null,
      direkod_oleh: user?.id ?? null,
    })
    if (error) {
      setLoading(false)
      if (error.code === '23505') {
        setRalat('Kelas ini sudah dibatalkan untuk tarikh ini.')
      } else {
        console.error(error)
        setRalat('Gagal batalkan kelas. Cuba lagi.')
      }
      return
    }
    // Notifikasi loceng — dedupe melalui kunci
    await supabase.from('notifikasi').upsert(
      [{
        jenis: 'kelas_dibatalkan',
        tajuk: 'Kelas dibatalkan',
        mesej: `${namaKelas} (${HARI[hariMinggu(tarikh)]}, ${formatTarikhPendek(tarikh)}, ${formatMasa(slot.masa_mula)}) dibatalkan${sebab.trim() ? ` — ${sebab.trim()}` : ''}.`,
        pautan: '/jadual',
        kunci: kunciNotifikasi,
        rujukan_id: slot.id,
      }],
      { onConflict: 'kunci', ignoreDuplicates: true }
    )
    setLoading(false)
    toast.success(`Kelas ${namaKelas} pada ${formatTarikhPendek(tarikh)} dibatalkan.`)
    onBerjaya()
  }

  const aktifkanSemula = async () => {
    if (!batalSediaAda) return
    setLoading(true)
    setRalat(null)
    const supabase = createClient()
    const { error } = await supabase.from('jadual_slot_batal').delete().eq('id', batalSediaAda.id)
    if (error) {
      setLoading(false)
      console.error(error)
      setRalat('Gagal aktifkan semula. Cuba lagi.')
      return
    }
    // Notifikasi pembatalan tidak lagi relevan
    await supabase
      .from('notifikasi')
      .update({ dibaca: true, dibaca_pada: new Date().toISOString() })
      .eq('kunci', kunciNotifikasi)
    setLoading(false)
    toast.success(`Kelas ${namaKelas} pada ${formatTarikhPendek(tarikh)} diaktifkan semula.`)
    onBerjaya()
  }

  const modalInput = {
    padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: '10px',
    fontSize: '13.5px', color: 'var(--text)', background: 'var(--card)', outline: 'none',
    fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' as const,
  }
  const labelStyle = { display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={(e) => { if (e.target === e.currentTarget) onTutup() }}
      role="dialog"
      aria-modal="true"
      aria-label={batalSediaAda ? 'Aktifkan Semula Kelas' : 'Batalkan Kelas'}
    >
      <div style={{ background: 'var(--card)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '460px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)' }}>
            {batalSediaAda ? 'Aktifkan Semula Kelas' : 'Batalkan Kelas Minggu Ini'}
          </h2>
          <button onClick={onTutup} aria-label="Tutup" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Butiran kelas */}
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{namaKelas}</span>
            <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: slot.jenis === 'Kumpulan' ? '#ECFCCB' : '#DBEAFE', color: slot.jenis === 'Kumpulan' ? '#3F6212' : '#1E40AF' }}>
              {slot.jenis}
            </span>
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
            {HARI[hariMinggu(tarikh)]}, {formatTarikh(tarikh)} · {formatMasa(slot.masa_mula)}–{formatMasa(slot.masa_tamat)}
          </div>
          {slot.jurulatih_ids.length > 0 && (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>J: {namaJurulatih(slot.jurulatih_ids)}</div>
          )}
        </div>

        {batalSediaAda ? (
          <>
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '12px 14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>
                Kelas ini dibatalkan untuk tarikh ini
              </div>
              <div style={{ fontSize: '13px', color: '#7F1D1D' }}>
                Sebab: {batalSediaAda.sebab || '—'}
              </div>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Aktifkan semula jika kelas jadi berjalan seperti biasa. Minggu lain tidak terjejas.
            </p>
          </>
        ) : (
          <>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Sebab Pembatalan (pilihan)</label>
              <textarea
                value={sebab}
                onChange={(e) => setSebab(e.target.value)}
                rows={2}
                placeholder="cth. Cuti umum, jurulatih tiada..."
                style={{ ...modalInput, resize: 'vertical' as const }}
              />
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Hanya kelas pada <strong>{formatTarikhPendek(tarikh)}</strong> dibatalkan — minggu lain berjalan seperti biasa. Kelas akan dipapar bergaris dengan label &quot;Dibatalkan&quot;.
            </p>
          </>
        )}

        {ralat && (
          <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#9F1239', marginBottom: '14px' }}>
            {ralat}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={onTutup} style={{ flex: 1, padding: '11px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '12px', fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit' }}>
            Tutup
          </button>
          {batalSediaAda ? (
            <button
              onClick={aktifkanSemula}
              disabled={loading}
              style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '11px', background: loading ? '#94A3B8' : 'var(--accent)', border: 'none', borderRadius: '12px', fontSize: '13.5px', fontWeight: 700, color: 'var(--accent-text)', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', minWidth: '160px' }}
            >
              <RotateCcw size={15} /> {loading ? 'Menyimpan...' : 'Aktifkan Semula'}
            </button>
          ) : (
            <button
              onClick={batalkan}
              disabled={loading}
              style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '11px', background: loading ? '#94A3B8' : '#E11D48', border: 'none', borderRadius: '12px', fontSize: '13.5px', fontWeight: 700, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', minWidth: '160px' }}
            >
              <Ban size={15} /> {loading ? 'Menyimpan...' : 'Batalkan Kelas Ini'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
