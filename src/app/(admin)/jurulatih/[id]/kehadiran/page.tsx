'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Plus, Trash2, Check, Edit2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { akhirBulan } from '@/lib/utils'
import { useTutupEscape } from '@/lib/hooks/useTutupEscape'
import { toast } from '@/lib/stores/toast-store'

type Sesi = {
  id: string
  tarikh: string
  status: 'Hadir' | 'Tidak Hadir' | 'Cuti'
  cawangan_id: string | null
  jenis_kelas: 'Kumpulan' | 'Personal'
  nota: string | null
  cawangan: { nama: string } | null
}

type Cawangan = { id: string; nama: string }

function bulanSemasa() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function mulaBulanDari(bm: string) {
  const [yr, mo] = bm.split('-')
  return { mula: `${yr}-${mo}-01`, akhir: akhirBulan(+yr, +mo) }
}

const WARNA: Record<string, { bg: string; text: string; border: string }> = {
  Hadir: { bg: 'var(--hadir-bg)', text: 'var(--hadir-text)', border: '#BBF7D0' },
  'Tidak Hadir': { bg: 'var(--tidak-hadir-bg)', text: 'var(--tidak-hadir-text)', border: '#FECDD3' },
  Cuti: { bg: 'var(--cuti-bg)', text: 'var(--cuti-text)', border: '#FDE68A' },
}

export default function KehadiranJurulatihPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [bulan, setBulan] = useState(bulanSemasa())
  const [sesi, setSesi] = useState<Sesi[]>([])
  const [namaJurulatih, setNamaJurulatih] = useState('')
  const [cawangan, setCawangan] = useState<Cawangan[]>([])
  const [loading, setLoading] = useState(true)
  const [tambahMode, setTambahMode] = useState(false)
  const formKosong = { tarikh: '', status: 'Hadir' as Sesi['status'], cawangan_id: '', jenis_kelas: 'Kumpulan' as Sesi['jenis_kelas'], nota: '' }
  const [formBaru, setFormBaru] = useState(formKosong)
  const [menyimpan, setMenyimpan] = useState(false)
  const [editSesi, setEditSesi] = useState<Sesi | null>(null)

  const muatData = async () => {
    setLoading(true)
    const supabase = createClient()
    const { mula, akhir } = mulaBulanDari(bulan)
    const [{ data: j }, { data: k }, { data: c }] = await Promise.all([
      supabase.from('jurulatih').select('nama_penuh, cawangan_ids').eq('id', id).single(),
      supabase.from('kehadiran_jurulatih').select('id, tarikh, status, cawangan_id, jenis_kelas, nota, cawangan:cawangan_id(nama)').eq('jurulatih_id', id).gte('tarikh', mula).lte('tarikh', akhir).order('tarikh'),
      supabase.from('cawangan').select('id, nama').eq('status', 'Aktif').order('nama'),
    ])
    setNamaJurulatih((j as any)?.nama_penuh ?? '')
    setSesi((k ?? []) as unknown as Sesi[])
    const senaraiCaw = c ?? []
    // Utamakan cawangan jurulatih sendiri di atas senarai
    const milikJurulatih = new Set(((j as any)?.cawangan_ids ?? []) as string[])
    senaraiCaw.sort((a, b) => Number(milikJurulatih.has(b.id)) - Number(milikJurulatih.has(a.id)))
    setCawangan(senaraiCaw)
    // Default cawangan: cawangan pertama jurulatih (jika belum dipilih)
    setFormBaru((f) => f.cawangan_id ? f : { ...f, cawangan_id: senaraiCaw.find((x) => milikJurulatih.has(x.id))?.id ?? '' })
    setLoading(false)
  }

  useEffect(() => { muatData() }, [id, bulan])

  const simpanBaru = async () => {
    if (!formBaru.tarikh) return
    if (!formBaru.cawangan_id) { toast.error('Sila pilih cawangan.'); return }
    setMenyimpan(true)
    const { error } = await createClient().from('kehadiran_jurulatih').upsert({
      jurulatih_id: id,
      tarikh: formBaru.tarikh,
      status: formBaru.status,
      cawangan_id: formBaru.cawangan_id,
      jenis_kelas: formBaru.jenis_kelas,
      nota: formBaru.nota || null,
    }, { onConflict: 'jurulatih_id,tarikh,cawangan_id,jenis_kelas' })
    if (!error) { toast.success('Sesi berjaya ditambah.'); setTambahMode(false); setFormBaru({ ...formKosong, cawangan_id: formBaru.cawangan_id }); muatData() }
    else { toast.error('Gagal tambah sesi. Cuba lagi.') }
    setMenyimpan(false)
  }

  const padam = async (sesiId: string) => {
    if (!confirm('Padam rekod sesi ini?')) return
    const { error } = await createClient().from('kehadiran_jurulatih').delete().eq('id', sesiId)
    if (error) toast.error('Gagal padam rekod.')
    else toast.success('Rekod dipadam.')
    muatData()
  }

  const jumlahHadir = sesi.filter((s) => s.status === 'Hadir').length
  const namaBulan = new Date(bulan + '-01').toLocaleString('ms-MY', { month: 'long', year: 'numeric' })

  const gayaInput = {
    padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: '10px',
    fontSize: '13px', color: 'var(--text)', background: 'var(--card)',
    outline: 'none', fontFamily: 'inherit',
  }

  return (
    <div style={{ maxWidth: '640px' }}>
      {/* Breadcrumb */}
      <Link href={`/jurulatih/${id}`} style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>
        ← {namaJurulatih || 'Profil Jurulatih'}
      </Link>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: '20px' }}>
        Kehadiran Jurulatih
      </h1>

      {/* Kawalan: Bulan + Tambah */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <input type="month" value={bulan} onChange={(e) => setBulan(e.target.value)} style={gayaInput} />
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>{namaBulan}</p>
        </div>
        <button onClick={() => { setTambahMode(true); setFormBaru((f) => ({ ...formKosong, cawangan_id: f.cawangan_id })) }}
          disabled={tambahMode}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px',
            background: 'var(--accent)', border: 'none', borderRadius: '10px',
            fontSize: '13px', fontWeight: 700, color: 'var(--accent-text)',
            cursor: tambahMode ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            opacity: tambahMode ? 0.5 : 1,
          }}>
          <Plus size={14} /> Tambah Sesi
        </button>
      </div>

      {/* Statistik Ringkas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
        {[
          { label: 'Hadir', nilai: sesi.filter((s) => s.status === 'Hadir').length, ...WARNA['Hadir'] },
          { label: 'Tidak Hadir', nilai: sesi.filter((s) => s.status === 'Tidak Hadir').length, ...WARNA['Tidak Hadir'] },
          { label: 'Cuti', nilai: sesi.filter((s) => s.status === 'Cuti').length, ...WARNA['Cuti'] },
        ].map((s) => (
          <div key={s.label} style={{
            background: s.bg, border: `1px solid ${s.border}`,
            borderRadius: '12px', padding: '12px 16px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '24px', fontWeight: 800, color: s.text }}>{s.nilai}</div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: s.text, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Info Bayaran */}
      <div style={{
        background: '#F7FEE7', border: '1px solid #D9F99D',
        borderRadius: '12px', padding: '12px 16px', marginBottom: '16px',
        fontSize: '13px', color: 'var(--accent-dark)', fontWeight: 600,
      }}>
        {sesi.length} sesi direkod · <strong>{jumlahHadir} sesi hadir</strong> = asas pengiraan bayaran bulan ini
      </div>

      {/* Form Tambah Sesi */}
      {tambahMode && (
        <div style={{
          background: '#F7FEE7', border: '2px solid var(--accent)',
          borderRadius: '14px', padding: '16px 18px', marginBottom: '14px',
        }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-dark)', marginBottom: '12px' }}>Tambah Sesi Baharu</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' as const }}>Tarikh *</label>
              <input type="date" value={formBaru.tarikh} onChange={(e) => setFormBaru((f) => ({ ...f, tarikh: e.target.value }))} style={{ ...gayaInput, width: '100%', boxSizing: 'border-box' as const }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' as const }}>Status</label>
              <select value={formBaru.status} onChange={(e) => setFormBaru((f) => ({ ...f, status: e.target.value as Sesi['status'] }))}
                style={{ ...gayaInput, width: '100%', boxSizing: 'border-box' as const, cursor: 'pointer' }}>
                <option>Hadir</option>
                <option>Tidak Hadir</option>
                <option>Cuti</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' as const }}>Cawangan *</label>
              <select value={formBaru.cawangan_id} onChange={(e) => setFormBaru((f) => ({ ...f, cawangan_id: e.target.value }))}
                style={{ ...gayaInput, width: '100%', boxSizing: 'border-box' as const, cursor: 'pointer' }}>
                <option value="">— Pilih cawangan —</option>
                {cawangan.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' as const }}>Jenis Kelas</label>
              <select value={formBaru.jenis_kelas} onChange={(e) => setFormBaru((f) => ({ ...f, jenis_kelas: e.target.value as Sesi['jenis_kelas'] }))}
                style={{ ...gayaInput, width: '100%', boxSizing: 'border-box' as const, cursor: 'pointer' }}>
                <option>Kumpulan</option>
                <option>Personal</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' as const }}>Nota (pilihan)</label>
            <input value={formBaru.nota} onChange={(e) => setFormBaru((f) => ({ ...f, nota: e.target.value }))} placeholder="Contoh: Cuti sakit" style={{ ...gayaInput, width: '100%', boxSizing: 'border-box' as const }} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setTambahMode(false)}
              style={{ padding: '8px 14px', background: 'none', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit' }}>
              Batal
            </button>
            <button onClick={simpanBaru} disabled={!formBaru.tarikh || menyimpan}
              style={{ padding: '8px 16px', background: 'var(--accent)', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--accent-text)', cursor: menyimpan ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              <Check size={13} style={{ display: 'inline', marginRight: '4px' }} />Simpan
            </button>
          </div>
        </div>
      )}

      {/* Senarai Sesi */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13.5px' }}>Memuatkan...</div>
        ) : sesi.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>Tiada rekod kehadiran untuk {namaBulan}.</p>
            <button onClick={() => setTambahMode(true)} style={{
              padding: '8px 18px', background: 'var(--accent)', border: 'none', borderRadius: '10px',
              fontSize: '13px', fontWeight: 700, color: 'var(--accent-text)', cursor: 'pointer', fontFamily: 'inherit',
            }}>
              + Tambah Sesi Pertama
            </button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                {['Tarikh', 'Hari', 'Cawangan', 'Kelas', 'Status', 'Nota', ''].map((h) => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sesi.map((s, i) => {
                const d = new Date(s.tarikh)
                const hari = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'][d.getDay()]
                const w = WARNA[s.status]
                return (
                  <tr key={s.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '10px 14px', fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>
                      {d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: '12.5px', color: 'var(--text-muted)' }}>{hari}</td>
                    <td style={{ padding: '10px 14px', fontSize: '12.5px', color: 'var(--text)' }}>{s.cawangan?.nama ?? '—'}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: 600,
                        background: s.jenis_kelas === 'Personal' ? '#F3E8FF' : '#DBEAFE',
                        color: s.jenis_kelas === 'Personal' ? '#6B21A8' : '#1E40AF',
                      }}>
                        {s.jenis_kelas}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600, background: w.bg, color: w.text }}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: '12.5px', color: 'var(--text-muted)' }}>{s.nota || '—'}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => setEditSesi(s)} title="Edit" aria-label="Edit sesi"
                          style={{ padding: '5px 8px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', cursor: 'pointer', color: '#1E40AF', fontFamily: 'inherit' }}>
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => padam(s.id)} title="Padam" aria-label="Padam sesi"
                          style={{ padding: '5px 8px', background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '8px', cursor: 'pointer', color: '#9F1239', fontFamily: 'inherit' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {editSesi && (
        <ModalEditSesi
          sesi={editSesi}
          cawangan={cawangan}
          onTutup={() => setEditSesi(null)}
          onBerjaya={() => { setEditSesi(null); muatData() }}
        />
      )}
    </div>
  )
}

function ModalEditSesi({
  sesi,
  cawangan,
  onTutup,
  onBerjaya,
}: {
  sesi: Sesi
  cawangan: Cawangan[]
  onTutup: () => void
  onBerjaya: () => void
}) {
  const [tarikh, setTarikh] = useState(sesi.tarikh)
  const [status, setStatus] = useState<Sesi['status']>(sesi.status)
  const [cawanganId, setCawanganId] = useState(sesi.cawangan_id ?? '')
  const [jenisKelas, setJenisKelas] = useState<Sesi['jenis_kelas']>(sesi.jenis_kelas)
  const [nota, setNota] = useState(sesi.nota ?? '')
  const [menyimpan, setMenyimpan] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)
  useTutupEscape(onTutup)

  const simpan = async () => {
    if (!tarikh) { setRalat('Sila isi tarikh.'); return }
    if (!cawanganId) { setRalat('Sila pilih cawangan.'); return }
    setMenyimpan(true)
    setRalat(null)
    const { error } = await createClient()
      .from('kehadiran_jurulatih')
      .update({ tarikh, status, cawangan_id: cawanganId, jenis_kelas: jenisKelas, nota: nota.trim() || null })
      .eq('id', sesi.id)
    setMenyimpan(false)
    if (error) {
      if (error.code === '23505') {
        setRalat('Sudah ada sesi lain dengan tarikh, cawangan & jenis kelas yang sama.')
      } else {
        setRalat('Gagal simpan perubahan. Cuba lagi.')
      }
      return
    }
    toast.success('Sesi dikemaskini.')
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
      aria-label="Edit Sesi Kehadiran Jurulatih"
    >
      <div style={{ background: 'var(--card)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '460px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)' }}>Edit Sesi</h2>
          <button onClick={onTutup} aria-label="Tutup" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Tarikh</label>
              <input type="date" value={tarikh} onChange={(e) => setTarikh(e.target.value)} style={modalInput} />
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as Sesi['status'])} style={{ ...modalInput, cursor: 'pointer' }}>
                <option>Hadir</option><option>Tidak Hadir</option><option>Cuti</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Cawangan</label>
              <select value={cawanganId} onChange={(e) => setCawanganId(e.target.value)} style={{ ...modalInput, cursor: 'pointer' }}>
                <option value="">— Pilih cawangan —</option>
                {cawangan.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Jenis Kelas</label>
              <select value={jenisKelas} onChange={(e) => setJenisKelas(e.target.value as Sesi['jenis_kelas'])} style={{ ...modalInput, cursor: 'pointer' }}>
                <option>Kumpulan</option><option>Personal</option>
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Nota (pilihan)</label>
            <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Contoh: Cuti sakit" style={modalInput} />
          </div>
        </div>

        {ralat && (
          <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#9F1239', marginTop: '14px' }}>
            {ralat}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={onTutup} style={{ flex: 1, padding: '11px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '12px', fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit' }}>
            Batal
          </button>
          <button onClick={simpan} disabled={menyimpan} style={{ flex: 2, padding: '11px', background: menyimpan ? '#94A3B8' : 'var(--accent)', border: 'none', borderRadius: '12px', fontSize: '13.5px', fontWeight: 700, color: 'var(--accent-text)', cursor: menyimpan ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {menyimpan ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  )
}
