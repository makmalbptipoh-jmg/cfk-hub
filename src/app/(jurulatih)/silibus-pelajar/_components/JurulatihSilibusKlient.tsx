'use client'

import { useCallback, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Search, Check, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { tarikhTempatan } from '@/lib/utils'
import { toast } from '@/lib/stores/toast-store'
import {
  STATUS_PROGRES, WARNA_PROGRES, petaProgresPelajar, statusSubtajuk, kiraProgresCawangan,
  type TajukBesar, type Subtajuk, type ProgresPelajarBaris, type StatusProgres,
} from '@/lib/silibus'

type Cawangan = { id: string; nama: string }
type PelajarRingkas = { id: string; nama_penuh: string; cawangan_daftar_id: string; jenis_kelas: string }

const warnaBar = (p: number) => (p < 34 ? '#EF4444' : p < 67 ? '#F59E0B' : '#10B981')

export function JurulatihSilibusKlient({
  cawangan,
  cawanganSaya,
  tajukWajib,
  subtajuk,
  pelajar,
  progressAwal,
}: {
  cawangan: Cawangan[]
  cawanganSaya: string[]
  tajukWajib: TajukBesar[]
  subtajuk: Subtajuk[]
  pelajar: PelajarRingkas[]
  progressAwal: ProgresPelajarBaris[]
}) {
  const [progress, setProgress] = useState<ProgresPelajarBaris[]>(progressAwal)
  const [cawanganPilih, setCawanganPilih] = useState<string>(cawanganSaya.length ? 'saya' : '')
  const [carian, setCarian] = useState('')
  const [pelajarPilih, setPelajarPilih] = useState<string | null>(null)
  const [sibuk, setSibuk] = useState(false)

  const muatData = useCallback(async () => {
    const { data } = await createClient()
      .from('silibus_progress_pelajar')
      .select('id, subtajuk_id, pelajar_id, status')
    if (data) setProgress(data as ProgresPelajarBaris[])
  }, [])

  const petaCawangan = useMemo(() => new Map(cawangan.map((c) => [c.id, c.nama])), [cawangan])
  const peta = useMemo(() => petaProgresPelajar(progress), [progress])
  const setCawSaya = useMemo(() => new Set(cawanganSaya), [cawanganSaya])

  const subIkutTajuk = useMemo(() => {
    const m = new Map<string, Subtajuk[]>()
    for (const s of subtajuk) {
      if (!m.has(s.tajuk_id)) m.set(s.tajuk_id, [])
      m.get(s.tajuk_id)!.push(s)
    }
    for (const arr of m.values()) arr.sort((a, b) => a.susunan - b.susunan)
    return m
  }, [subtajuk])
  const subWajib = useMemo(() => tajukWajib.flatMap((t) => subIkutTajuk.get(t.id) ?? []), [tajukWajib, subIkutTajuk])

  const pelajarTapis = useMemo(() => {
    const q = carian.trim().toLowerCase()
    return pelajar
      .filter((p) => {
        const padanCawangan = cawanganPilih === 'saya' ? setCawSaya.has(p.cawangan_daftar_id) : !cawanganPilih || p.cawangan_daftar_id === cawanganPilih
        return padanCawangan && (!q || p.nama_penuh.toLowerCase().includes(q))
      })
      .map((p) => ({ p, ringkas: kiraProgresCawangan(subWajib, peta, p.id) }))
      .sort((a, b) => a.ringkas.peratus - b.ringkas.peratus || a.p.nama_penuh.localeCompare(b.p.nama_penuh))
  }, [pelajar, cawanganPilih, carian, setCawSaya, subWajib, peta])

  const pelajarAktif = pelajarPilih ? pelajar.find((p) => p.id === pelajarPilih) ?? null : null

  const tulisProgress = async (baris: { subtajuk_id: string; status: StatusProgres }[]) => {
    if (!pelajarPilih) return
    setSibuk(true)
    setProgress((prev) => {
      const kunci = new Set(baris.map((b) => b.subtajuk_id))
      const lain = prev.filter((p) => !(p.pelajar_id === pelajarPilih && kunci.has(p.subtajuk_id)))
      return [...lain, ...baris.map((b) => ({ id: 'temp-' + b.subtajuk_id, subtajuk_id: b.subtajuk_id, pelajar_id: pelajarPilih, status: b.status }))]
    })
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const hariIni = tarikhTempatan()
    const rekod = baris.map((b) => ({
      subtajuk_id: b.subtajuk_id,
      pelajar_id: pelajarPilih,
      status: b.status,
      tarikh_selesai: b.status === 'Selesai' ? hariIni : null,
      dikemaskini_oleh: user?.id ?? null,
      dikemaskini_pada: new Date().toISOString(),
    }))
    const { error } = await supabase.from('silibus_progress_pelajar').upsert(rekod, { onConflict: 'subtajuk_id,pelajar_id' })
    setSibuk(false)
    if (error) {
      console.error(error)
      toast.error('Gagal simpan. Cuba lagi.')
      muatData()
    }
  }

  const tandaHinggaSini = (tajukId: string, sub: Subtajuk) => {
    const subs = subIkutTajuk.get(tajukId) ?? []
    const baris = subs.filter((s) => s.susunan <= sub.susunan).map((s) => ({ subtajuk_id: s.id, status: 'Selesai' as StatusProgres }))
    if (baris.length) tulisProgress(baris)
  }

  // ---- Tiada tajuk wajib ----
  if (tajukWajib.length === 0) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
        <BookOpen size={34} style={{ color: 'var(--border)', margin: '0 auto 12px', display: 'block' }} />
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
          Belum ada silibus wajib. Admin perlu tanda satu Tajuk Besar sebagai <strong>Wajib</strong> dahulu.
        </p>
      </div>
    )
  }

  // ---- Detail pelajar ----
  if (pelajarAktif) {
    const ringkas = kiraProgresCawangan(subWajib, peta, pelajarAktif.id)
    return (
      <div style={{ padding: '4px 16px 20px' }}>
        <button onClick={() => setPelajarPilih(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '8px 12px', background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '14px' }}>
          <ChevronLeft size={15} /> Kembali
        </button>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px', marginBottom: '14px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>{pelajarAktif.nama_penuh}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 10px' }}>{petaCawangan.get(pelajarAktif.cawangan_daftar_id) ?? '—'}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 700, marginBottom: '5px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Progress</span>
            <span style={{ color: 'var(--text)' }}>{ringkas.selesai}/{ringkas.jumlah} ({ringkas.peratus}%)</span>
          </div>
          <div style={{ height: '9px', background: '#E2E8F0', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${ringkas.peratus}%`, background: warnaBar(ringkas.peratus), borderRadius: '99px' }} />
          </div>
        </div>

        {tajukWajib.map((t) => {
          const subs = subIkutTajuk.get(t.id) ?? []
          return (
            <div key={t.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', marginBottom: '12px' }}>
              <div style={{ padding: '12px 14px', background: '#F8FAFC', borderBottom: '1px solid var(--border)', fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>{t.nama}</div>
              {subs.map((s, i) => {
                const st = statusSubtajuk(peta, s.id, pelajarAktif.id)
                return (
                  <div key={s.id} style={{ padding: '11px 14px', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{s.nama}</span>
                      {s.nota && <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '6px', background: '#FEFCE8', color: '#854D0E', border: '1px solid #FEF08A' }}>{s.nota}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'stretch' }}>
                      {STATUS_PROGRES.map((stx) => {
                        const aktif = st === stx
                        const w = WARNA_PROGRES[stx]
                        return (
                          <button
                            key={stx}
                            onClick={() => tulisProgress([{ subtajuk_id: s.id, status: stx }])}
                            disabled={sibuk}
                            style={{ flex: 1, padding: '9px 4px', borderRadius: '9px', fontSize: '12px', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', background: aktif ? w.bg : 'transparent', color: aktif ? w.text : 'var(--text-muted)', border: `1.5px solid ${aktif ? w.border : 'var(--border)'}` }}
                          >
                            {stx}
                          </button>
                        )
                      })}
                      <button
                        onClick={() => tandaHinggaSini(t.id, s)}
                        disabled={sibuk}
                        title="Tanda semua bab hingga sini sebagai Selesai"
                        aria-label="Tanda hingga sini Selesai"
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '3px', padding: '9px 10px', borderRadius: '9px', fontSize: '11px', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--text)', whiteSpace: 'nowrap' }}
                      >
                        <Check size={13} />≤
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px' }}>
          Butang <strong>✓≤</strong> = tanda semua bab sehingga bab itu sebagai Selesai sekaligus.
        </p>
      </div>
    )
  }

  // ---- Overview senarai pelajar ----
  return (
    <div style={{ padding: '4px 16px 20px' }}>
      <div style={{ marginBottom: '12px' }}>
        <select
          value={cawanganPilih}
          onChange={(e) => setCawanganPilih(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13.5px', color: 'var(--text)', background: 'var(--card)', outline: 'none', fontFamily: 'inherit', cursor: 'pointer', marginBottom: '8px' }}
        >
          {cawanganSaya.length > 0 && <option value="saya">Cawangan Saya</option>}
          {cawangan.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
        </select>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={carian} onChange={(e) => setCarian(e.target.value)} placeholder="Cari nama pelajar..." style={{ width: '100%', padding: '10px 12px 10px 34px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13.5px', color: 'var(--text)', background: 'var(--card)', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
        </div>
      </div>

      <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '10px' }}>
        {pelajarTapis.length} pelajar · silibus wajib {subWajib.length} bab · <strong>tertinggal dahulu</strong>. Tap untuk kemas kini.
      </p>

      {pelajarTapis.length === 0 ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '32px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
          Tiada pelajar.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {pelajarTapis.map(({ p, ringkas }) => (
            <button
              key={p.id}
              onClick={() => setPelajarPilih(p.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', width: '100%' }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nama_penuh}</div>
                <div style={{ height: '7px', background: '#E2E8F0', borderRadius: '99px', overflow: 'hidden', marginTop: '6px' }}>
                  <div style={{ height: '100%', width: `${ringkas.peratus}%`, background: warnaBar(ringkas.peratus), borderRadius: '99px' }} />
                </div>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: ringkas.peratus === 0 ? 'var(--text-muted)' : 'var(--text)', minWidth: '52px', textAlign: 'right' }}>
                {ringkas.peratus === 0 ? 'Belum' : `${ringkas.selesai}/${ringkas.jumlah}`}
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
