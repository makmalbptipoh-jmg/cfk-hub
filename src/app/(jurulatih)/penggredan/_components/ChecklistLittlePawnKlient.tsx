'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, AlertTriangle, Loader2, Save, Star, HelpCircle, X } from 'lucide-react'
import {
  ITEM_CHECKLIST, KUNCI_ITEM, LABEL_NILAI, WARNA_NILAI, kiraLittlePawn, bilDahBoleh,
  aktivitiUntukItem, type KumpulanItem,
} from '@/lib/gradingLittlePawn'
import { simpanLittlePawn } from '@/app/actions/penggredan'
import type { Database } from '@/types/database'

type Sedia = Database['public']['Tables']['gred_little_pawn']['Row']
type Kitaran = { id: string; nama: string; tarikh_mula: string; tarikh_tamat: string; status: 'Dibuka' | 'Ditutup' }

type Props = {
  pelajar: { id: string; nama_penuh: string; cawangan_daftar_id: string }
  kitaran: Kitaran
  hadirAuto: number
  jumlahAuto: number
  sedia: Sedia | null
}

const KUMPULAN: { nama: KumpulanItem; label: string }[] = [
  { nama: 'Kenal', label: 'Kenal' },
  { nama: 'Gerak', label: 'Gerak' },
  { nama: 'Main', label: 'Main' },
]

export function ChecklistLittlePawnKlient({ pelajar, kitaran, hadirAuto, jumlahAuto, sedia }: Props) {
  const router = useRouter()
  const dikunci = kitaran.status === 'Ditutup'

  const [items, setItems] = useState<number[]>(() =>
    KUNCI_ITEM.map((k) => (sedia ? (sedia[k as keyof Sedia] as number) ?? 0 : 0)),
  )
  const [sesiHadir, setSesiHadir] = useState(String(sedia?.sesi_hadir ?? hadirAuto))
  const [sesiJumlah, setSesiJumlah] = useState(String(sedia?.sesi_jumlah ?? jumlahAuto))
  const [skorSikap, setSkorSikap] = useState(sedia?.skor_sikap ?? 0)
  const [minigame, setMinigame] = useState(sedia?.minigame_selesai ?? false)
  const [notaCoach, setNotaCoach] = useState(sedia?.nota_coach ?? '')
  const [popup, setPopup] = useState<string | null>(null)

  const [simpanStatus, setSimpanStatus] = useState<'idle' | 'menyimpan' | 'tersimpan' | 'ralat'>('idle')
  const [ralat, setRalat] = useState<string | null>(null)
  const [selesaiLoading, setSelesaiLoading] = useState(false)

  const num = (v: string) => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : 0 }
  const hasil = kiraLittlePawn({ items, sesiHadir: num(sesiHadir), sesiJumlah: num(sesiJumlah), skorSikapMentah: skorSikap, minigameSelesai: minigame })
  const dahBoleh = bilDahBoleh(items)

  function bina(status: 'Draf' | 'Selesai') {
    return {
      pelajar_id: pelajar.id,
      kitaran_id: kitaran.id,
      cawangan_id: pelajar.cawangan_daftar_id,
      items,
      sesi_hadir: num(sesiHadir),
      sesi_jumlah: num(sesiJumlah),
      skor_sikap: skorSikap,
      minigame_selesai: minigame,
      nota_coach: notaCoach.trim() || null,
      status,
    }
  }

  const pertamaKali = useRef(true)
  const snapshot = JSON.stringify(bina('Draf'))
  useEffect(() => {
    if (dikunci) return
    if (pertamaKali.current) { pertamaKali.current = false; return }
    setSimpanStatus('menyimpan')
    const t = setTimeout(async () => {
      const r = await simpanLittlePawn(bina('Draf'))
      if (r.ralat) { setSimpanStatus('ralat'); setRalat(r.ralat) }
      else { setSimpanStatus('tersimpan'); setRalat(null) }
    }, 900)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot, dikunci])

  async function simpanSelesai() {
    setSelesaiLoading(true)
    const r = await simpanLittlePawn(bina('Selesai'))
    setSelesaiLoading(false)
    if (r.ralat) { setRalat(r.ralat); return }
    router.push('/penggredan')
  }

  function setItem(idx: number, nilai: number) {
    setItems((prev) => prev.map((v, i) => (i === idx ? nilai : v)))
  }

  const bintang = hasil.peringkat === 'graduated' ? 3 : hasil.peringkat

  return (
    <div style={{ maxWidth: '640px', padding: '0 16px', paddingBottom: '40px', margin: '0 auto' }}>
      <Link href="/penggredan" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '14px' }}>
        <ArrowLeft size={15} /> Penggredan
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
        <div>
          <h1 style={{ fontSize: '21px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>{pelajar.nama_penuh}</h1>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '3px' }}>{kitaran.nama} · Little Pawn (Level 0)</p>
        </div>
        <IndikatorSimpan status={simpanStatus} dikunci={dikunci} />
      </div>

      {/* Progress bar + bintang */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 16px', margin: '12px 0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{dahBoleh}/12 Dah Boleh</span>
          <span style={{ display: 'inline-flex', gap: '2px' }}>
            {[1, 2, 3].map((s) => <Star key={s} size={16} fill={s <= bintang ? '#F5C400' : 'none'} color={s <= bintang ? '#F5C400' : 'var(--border)'} />)}
          </span>
        </div>
        <div style={{ height: '9px', background: 'var(--bg)', borderRadius: '5px', overflow: 'hidden' }}>
          <div style={{ width: `${(dahBoleh / 12) * 100}%`, height: '100%', background: '#84CC16', borderRadius: '5px', transition: 'width 0.2s' }} />
        </div>
        {hasil.graduasi && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--hadir-text)', background: 'var(--hadir-bg)', padding: '8px 12px', borderRadius: '10px' }}>
            <CheckCircle2 size={15} /> Sedia untuk naik Pawn! 🎉
          </div>
        )}
      </div>

      {dikunci && (
        <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', marginBottom: '14px', background: '#F1F5F9', color: 'var(--text-muted)' }}>
          Kitaran <strong>Ditutup</strong> — baca sahaja.
        </div>
      )}

      <fieldset disabled={dikunci} style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Checklist ikut kumpulan */}
        {KUMPULAN.map((grp) => (
          <div key={grp.nama} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>{grp.label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {ITEM_CHECKLIST.map((it, idx) => {
                if (it.kumpulan !== grp.nama) return null
                const nilai = items[idx]
                return (
                  <div key={it.key}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13.5px', color: 'var(--text)', flex: 1 }}>{it.label}</span>
                      <button type="button" onClick={() => setPopup(it.key)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }} aria-label="Aktiviti latihan">
                        <HelpCircle size={15} />
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                      {[0, 1, 2].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setItem(idx, n)}
                          style={{
                            padding: '9px 4px', borderRadius: '9px', border: '1.5px solid',
                            borderColor: nilai === n ? WARNA_NILAI[n as 0 | 1 | 2] : 'var(--border)',
                            background: nilai === n ? WARNA_NILAI[n as 0 | 1 | 2] : 'var(--card)',
                            color: nilai === n ? (n === 1 ? '#7A5C00' : '#FFF') : 'var(--text-muted)',
                            fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                          }}
                        >
                          {LABEL_NILAI[n as 0 | 1 | 2]}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Kehadiran + sikap + minigame */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px,1fr))', gap: '10px' }}>
            <label style={labelKol}><span style={labelTeks}>Sesi hadir</span><input value={sesiHadir} onChange={(e) => setSesiHadir(e.target.value)} inputMode="numeric" style={gayaInput} /></label>
            <label style={labelKol}><span style={labelTeks}>Sesi jumlah</span><input value={sesiJumlah} onChange={(e) => setSesiJumlah(e.target.value)} inputMode="numeric" style={gayaInput} /></label>
          </div>
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: 0 }}>Auto dari kehadiran ({hadirAuto}/{jumlahAuto}) — boleh betulkan.</p>
          <div>
            <span style={labelTeks}>Skor sikap (1-5)</span>
            <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setSkorSikap(n)} style={{ width: '34px', height: '34px', borderRadius: '9px', border: '1px solid var(--border)', background: skorSikap === n ? 'var(--primary)' : 'var(--card)', color: skorSikap === n ? '#FFF' : 'var(--text-muted)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{n}</button>
              ))}
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '9px', cursor: 'pointer' }}>
            <input type="checkbox" checked={minigame} onChange={(e) => setMinigame(e.target.checked)} style={{ width: '18px', height: '18px' }} />
            <span style={{ fontSize: '13.5px', color: 'var(--text)' }}>Mini game selesai</span>
          </label>
          <label style={labelKol}><span style={labelTeks}>Nota coach</span><textarea value={notaCoach} onChange={(e) => setNotaCoach(e.target.value)} rows={2} style={{ ...gayaInput, resize: 'vertical' }} /></label>
        </div>
      </fieldset>

      {ralat && <div style={{ border: '1px solid #FECACA', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', margin: '14px 0 0', background: 'var(--tidak-hadir-bg)', color: 'var(--tidak-hadir-text)' }}>{ralat}</div>}

      {!dikunci && (
        <button onClick={simpanSelesai} disabled={selesaiLoading} style={{ marginTop: '16px', width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: '12px', background: 'var(--accent)', color: 'var(--accent-text)', border: 'none', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          {selesaiLoading ? <Loader2 size={16} /> : <CheckCircle2 size={16} />} Tandakan Selesai
        </button>
      )}

      {/* Popup aktiviti */}
      {popup && <PopupAktiviti itemKey={popup} onClose={() => setPopup(null)} />}
    </div>
  )
}

function PopupAktiviti({ itemKey, onClose }: { itemKey: string; onClose: () => void }) {
  const item = ITEM_CHECKLIST.find((i) => i.key === itemKey)
  const aktiviti = aktivitiUntukItem(itemKey)
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--card)', borderRadius: '16px', padding: '20px', maxWidth: '380px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>Aktiviti untuk latih ini</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={18} /></button>
        </div>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>{item?.label}</p>
        {aktiviti.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Tiada aktiviti khusus — assess semasa Free Play.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {aktiviti.map((a) => (
              <div key={a.id} style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 12px' }}>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>{a.id} · {a.nama}</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>{a.durasiMin} minit · {a.bahan}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function IndikatorSimpan({ status, dikunci }: { status: 'idle' | 'menyimpan' | 'tersimpan' | 'ralat'; dikunci: boolean }) {
  if (dikunci) return null
  const peta = {
    idle: { ikon: <Save size={13} />, teks: 'Draf auto-simpan', warna: 'var(--text-muted)' },
    menyimpan: { ikon: <Loader2 size={13} />, teks: 'Menyimpan…', warna: 'var(--text-muted)' },
    tersimpan: { ikon: <CheckCircle2 size={13} />, teks: 'Tersimpan', warna: 'var(--hadir-text)' },
    ralat: { ikon: <AlertTriangle size={13} />, teks: 'Gagal', warna: 'var(--tidak-hadir-text)' },
  }[status]
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, color: peta.warna }}>{peta.ikon}{peta.teks}</span>
}

const labelKol: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '5px' }
const labelTeks: React.CSSProperties = { fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }
const gayaInput: React.CSSProperties = {
  width: '100%', padding: '9px 11px', borderRadius: '9px', border: '1px solid var(--border)',
  background: 'var(--card)', color: 'var(--text)', fontSize: '13.5px', fontFamily: 'inherit',
}
