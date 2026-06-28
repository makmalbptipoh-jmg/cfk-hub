'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Cawangan = {
  id: string
  nama: string
  alamat: string | null
  no_telefon: string | null
  status: string
}

const gayaInput = {
  padding: '8px 12px',
  border: '1.5px solid var(--border)', borderRadius: '10px',
  fontSize: '13px', color: 'var(--text)',
  background: 'var(--card)', outline: 'none', fontFamily: 'inherit',
}

export default function CawanganTetapanPage() {
  const [senarai, setSenarai] = useState<Cawangan[]>([])
  const [loading, setLoading] = useState(true)
  const [edit, setEdit] = useState<string | null>(null)
  const [editVal, setEditVal] = useState<Partial<Cawangan>>({})
  const [tambah, setTambah] = useState(false)
  const [formBaharu, setFormBaharu] = useState({ nama: '', alamat: '', no_telefon: '' })
  const [menyimpan, setMenyimpan] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)
  const [pesanBerjaya, setPesanBerjaya] = useState<string | null>(null)

  const muatData = async () => {
    const { data } = await createClient().from('cawangan').select('id, nama, alamat, no_telefon, status').order('nama')
    setSenarai(data ?? [])
    setLoading(false)
  }

  useEffect(() => { muatData() }, [])

  const tunjukPesan = (msg: string) => {
    setPesanBerjaya(msg)
    setTimeout(() => setPesanBerjaya(null), 3000)
  }

  const mulaEdit = (c: Cawangan) => {
    setEdit(c.id)
    setEditVal({ nama: c.nama, alamat: c.alamat ?? '', no_telefon: c.no_telefon ?? '', status: c.status })
    setTambah(false)
  }

  const batalEdit = () => { setEdit(null); setEditVal({}) }

  const simpanEdit = async (id: string) => {
    if (!editVal.nama?.trim()) { setRalat('Nama cawangan wajib diisi.'); return }
    setMenyimpan(true)
    const { error } = await createClient().from('cawangan').update({
      nama: editVal.nama,
      alamat: editVal.alamat || null,
      no_telefon: editVal.no_telefon || null,
      status: editVal.status,
    }).eq('id', id)
    setMenyimpan(false)
    if (error) { setRalat('Gagal simpan. Cuba lagi.'); return }
    setEdit(null)
    setEditVal({})
    tunjukPesan('Cawangan berjaya dikemaskini.')
    muatData()
  }

  const simpanBaharu = async () => {
    if (!formBaharu.nama.trim()) { setRalat('Nama cawangan wajib diisi.'); return }
    setMenyimpan(true)
    const { error } = await createClient().from('cawangan').insert({
      nama: formBaharu.nama,
      alamat: formBaharu.alamat || null,
      no_telefon: formBaharu.no_telefon || null,
      status: 'Aktif',
    })
    setMenyimpan(false)
    if (error) { setRalat('Gagal simpan. Cuba lagi.'); return }
    setTambah(false)
    setFormBaharu({ nama: '', alamat: '', no_telefon: '' })
    tunjukPesan('Cawangan baharu berjaya ditambah.')
    muatData()
  }

  return (
    <div style={{ maxWidth: '760px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {senarai.length} cawangan berdaftar
          </p>
        </div>
        <button onClick={() => { setTambah(true); setEdit(null) }}
          disabled={tambah}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '9px 16px',
            background: tambah ? '#94A3B8' : 'var(--accent)',
            border: 'none', borderRadius: '10px',
            fontSize: '13px', fontWeight: 700,
            color: 'var(--accent-text)', cursor: tambah ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <Plus size={14} />
          Tambah Cawangan
        </button>
      </div>

      {/* Toast */}
      {pesanBerjaya && (
        <div style={{
          background: 'var(--hadir-bg)', border: '1px solid #BBF7D0',
          borderRadius: '12px', padding: '12px 16px',
          fontSize: '13.5px', color: 'var(--hadir-text)', fontWeight: 600,
          marginBottom: '16px',
        }}>
          ✓ {pesanBerjaya}
        </div>
      )}
      {ralat && (
        <div style={{
          background: '#FFF1F2', border: '1px solid #FECDD3',
          borderRadius: '12px', padding: '12px 16px',
          fontSize: '13px', color: '#9F1239', marginBottom: '16px',
        }}>
          {ralat}
          <button onClick={() => setRalat(null)} style={{ marginLeft: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#9F1239' }}>×</button>
        </div>
      )}

      {/* Senarai */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Form Tambah Baharu */}
        {tambah && (
          <div style={{
            background: '#F7FEE7', border: '2px solid var(--accent)',
            borderRadius: '14px', padding: '18px 20px',
          }}>
            <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--accent-dark)', marginBottom: '14px' }}>
              Cawangan Baharu
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' as const }}>Nama *</label>
                <input value={formBaharu.nama} onChange={(e) => setFormBaharu((f) => ({ ...f, nama: e.target.value }))} placeholder="Contoh: Cawangan Cheras" style={{ ...gayaInput, width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' as const }}>No. Telefon</label>
                <input value={formBaharu.no_telefon} onChange={(e) => setFormBaharu((f) => ({ ...f, no_telefon: e.target.value }))} placeholder="03-XXXXXXXX" style={{ ...gayaInput, width: '100%' }} />
              </div>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' as const }}>Alamat</label>
              <input value={formBaharu.alamat} onChange={(e) => setFormBaharu((f) => ({ ...f, alamat: e.target.value }))} placeholder="Alamat cawangan" style={{ ...gayaInput, width: '100%' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { setTambah(false); setFormBaharu({ nama: '', alamat: '', no_telefon: '' }); setRalat(null) }}
                style={{ padding: '8px 14px', background: 'none', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit' }}>
                <X size={13} style={{ display: 'inline', marginRight: '4px' }} />Batal
              </button>
              <button onClick={simpanBaharu} disabled={menyimpan}
                style={{ padding: '8px 16px', background: menyimpan ? '#94A3B8' : 'var(--accent)', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--accent-text)', cursor: menyimpan ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                <Check size={13} style={{ display: 'inline', marginRight: '4px' }} />Simpan
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13.5px' }}>
            Memuatkan...
          </div>
        ) : senarai.length === 0 ? (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '60px', textAlign: 'center' }}>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>Tiada cawangan lagi. Klik "Tambah Cawangan" untuk bermula.</p>
          </div>
        ) : (
          senarai.map((c) => (
            <div key={c.id} style={{
              background: 'var(--card)', border: `1px solid ${edit === c.id ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: '14px', padding: '18px 20px',
              transition: 'border-color 0.15s',
            }}>
              {edit === c.id ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' as const }}>Nama *</label>
                      <input value={editVal.nama ?? ''} onChange={(e) => setEditVal((v) => ({ ...v, nama: e.target.value }))} style={{ ...gayaInput, width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' as const }}>No. Telefon</label>
                      <input value={editVal.no_telefon ?? ''} onChange={(e) => setEditVal((v) => ({ ...v, no_telefon: e.target.value }))} style={{ ...gayaInput, width: '100%' }} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' as const }}>Alamat</label>
                    <input value={editVal.alamat ?? ''} onChange={(e) => setEditVal((v) => ({ ...v, alamat: e.target.value }))} style={{ ...gayaInput, width: '100%' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const }}>Status:</span>
                    {['Aktif', 'Tidak Aktif'].map((s) => {
                      const aktif = editVal.status === s
                      return (
                        <button key={s} type="button" onClick={() => setEditVal((v) => ({ ...v, status: s }))}
                          style={{
                            padding: '5px 14px', borderRadius: '20px',
                            border: `2px solid ${aktif ? (s === 'Aktif' ? 'var(--accent)' : '#EF4444') : 'var(--border)'}`,
                            background: aktif ? (s === 'Aktif' ? '#F7FEE7' : '#FFF1F2') : 'transparent',
                            color: aktif ? (s === 'Aktif' ? 'var(--accent-dark)' : '#9F1239') : 'var(--text-muted)',
                            fontSize: '12.5px', fontWeight: aktif ? 700 : 500,
                            cursor: 'pointer', fontFamily: 'inherit',
                          }}>
                          {s}
                        </button>
                      )
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={batalEdit}
                      style={{ padding: '8px 14px', background: 'none', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit' }}>
                      <X size={13} style={{ display: 'inline', marginRight: '4px' }} />Batal
                    </button>
                    <button onClick={() => simpanEdit(c.id)} disabled={menyimpan}
                      style={{ padding: '8px 16px', background: menyimpan ? '#94A3B8' : 'var(--accent)', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--accent-text)', cursor: menyimpan ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                      <Check size={13} style={{ display: 'inline', marginRight: '4px' }} />Simpan
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>{c.nama}</span>
                      <span style={{
                        fontSize: '11.5px', padding: '2px 10px', borderRadius: '20px', fontWeight: 600,
                        background: c.status === 'Aktif' ? 'var(--hadir-bg)' : '#F1F5F9',
                        color: c.status === 'Aktif' ? 'var(--hadir-text)' : 'var(--text-muted)',
                      }}>
                        {c.status}
                      </span>
                    </div>
                    {c.alamat && <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '2px' }}>{c.alamat}</p>}
                    {c.no_telefon && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{c.no_telefon}</p>}
                  </div>
                  <button onClick={() => mulaEdit(c)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '7px 12px',
                      background: 'var(--bg)', border: '1px solid var(--border)',
                      borderRadius: '9px', fontSize: '12.5px', fontWeight: 600,
                      color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                    <Edit2 size={12} />
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
