'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Plus, Trash2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Sesi = {
  id: string
  tarikh: string
  status: 'Hadir' | 'Tidak Hadir' | 'Cuti'
  nota: string | null
}

function bulanSemasa() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function mulaBulanDari(bm: string) {
  const [yr, mo] = bm.split('-')
  return { mula: `${yr}-${mo}-01`, akhir: new Date(+yr, +mo, 0).toISOString().split('T')[0] }
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
  const [loading, setLoading] = useState(true)
  const [tambahMode, setTambahMode] = useState(false)
  const [formBaru, setFormBaru] = useState({ tarikh: '', status: 'Hadir' as Sesi['status'], nota: '' })
  const [menyimpan, setMenyimpan] = useState(false)
  const [pesanBerjaya, setPesanBerjaya] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState<Sesi['status']>('Hadir')

  const muatData = async () => {
    setLoading(true)
    const supabase = createClient()
    const { mula, akhir } = mulaBulanDari(bulan)
    const [{ data: j }, { data: k }] = await Promise.all([
      supabase.from('jurulatih').select('nama_penuh').eq('id', id).single(),
      supabase.from('kehadiran_jurulatih').select('id, tarikh, status, nota').eq('jurulatih_id', id).gte('tarikh', mula).lte('tarikh', akhir).order('tarikh'),
    ])
    setNamaJurulatih((j as any)?.nama_penuh ?? '')
    setSesi(k ?? [])
    setLoading(false)
  }

  useEffect(() => { muatData() }, [id, bulan])

  const tunjukPesan = (msg: string) => { setPesanBerjaya(msg); setTimeout(() => setPesanBerjaya(null), 2500) }

  const simpanBaru = async () => {
    if (!formBaru.tarikh) return
    setMenyimpan(true)
    const { error } = await createClient().from('kehadiran_jurulatih').upsert({
      jurulatih_id: id, tarikh: formBaru.tarikh, status: formBaru.status, nota: formBaru.nota || null,
    }, { onConflict: 'jurulatih_id,tarikh' })
    if (!error) { tunjukPesan('Sesi berjaya ditambah.'); setTambahMode(false); setFormBaru({ tarikh: '', status: 'Hadir', nota: '' }); muatData() }
    setMenyimpan(false)
  }

  const simpanEdit = async (sesiId: string) => {
    setMenyimpan(true)
    await createClient().from('kehadiran_jurulatih').update({ status: editStatus }).eq('id', sesiId)
    tunjukPesan('Status dikemaskini.')
    setEditId(null)
    muatData()
    setMenyimpan(false)
  }

  const padam = async (sesiId: string) => {
    if (!confirm('Padam rekod sesi ini?')) return
    await createClient().from('kehadiran_jurulatih').delete().eq('id', sesiId)
    tunjukPesan('Rekod dipadam.')
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
        <button onClick={() => { setTambahMode(true); setFormBaru({ tarikh: '', status: 'Hadir', nota: '' }) }}
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

      {pesanBerjaya && (
        <div style={{
          background: 'var(--hadir-bg)', border: '1px solid #BBF7D0',
          borderRadius: '10px', padding: '10px 14px', marginBottom: '12px',
          fontSize: '13px', color: 'var(--hadir-text)', fontWeight: 600,
        }}>
          ✓ {pesanBerjaya}
        </div>
      )}

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
                {['Tarikh', 'Hari', 'Status', 'Nota', ''].map((h) => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sesi.map((s, i) => {
                const d = new Date(s.tarikh)
                const hari = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'][d.getDay()]
                const w = WARNA[s.status]
                const sedangEdit = editId === s.id
                return (
                  <tr key={s.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '10px 14px', fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>
                      {d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: '12.5px', color: 'var(--text-muted)' }}>{hari}</td>
                    <td style={{ padding: '10px 14px' }}>
                      {sedangEdit ? (
                        <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as Sesi['status'])}
                          style={{ padding: '5px 10px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '12.5px', color: 'var(--text)', background: 'var(--card)', fontFamily: 'inherit', cursor: 'pointer' }}>
                          <option>Hadir</option><option>Tidak Hadir</option><option>Cuti</option>
                        </select>
                      ) : (
                        <span
                          onClick={() => { setEditId(s.id); setEditStatus(s.status) }}
                          title="Klik untuk tukar status"
                          style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600, background: w.bg, color: w.text, cursor: 'pointer' }}>
                          {s.status}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: '12.5px', color: 'var(--text-muted)' }}>{s.nota || '—'}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        {sedangEdit && (
                          <>
                            <button onClick={() => simpanEdit(s.id)} disabled={menyimpan}
                              style={{ padding: '5px 10px', background: 'var(--accent)', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--accent-text)', cursor: 'pointer', fontFamily: 'inherit' }}>
                              <Check size={12} />
                            </button>
                            <button onClick={() => setEditId(null)}
                              style={{ padding: '5px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit' }}>
                              ×
                            </button>
                          </>
                        )}
                        <button onClick={() => padam(s.id)} title="Padam"
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
    </div>
  )
}
