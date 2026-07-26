'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit2, Check, X, Trash2, Tag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/stores/toast-store'

type Kategori = {
  id: string
  nama: string
  susunan: number
  status: 'Aktif' | 'Tidak Aktif'
}

const gayaInput = {
  padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: '10px',
  fontSize: '13px', color: 'var(--text)', background: 'var(--card)', outline: 'none',
  fontFamily: 'inherit',
}

export default function KategoriTopikPage() {
  const [senarai, setSenarai] = useState<Kategori[]>([])
  const [kiraan, setKiraan] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [edit, setEdit] = useState<string | null>(null)
  const [editVal, setEditVal] = useState<Partial<Kategori>>({})
  const [tambah, setTambah] = useState(false)
  const [namaBaharu, setNamaBaharu] = useState('')
  const [menyimpan, setMenyimpan] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)
  const [sahPadam, setSahPadam] = useState<string | null>(null)

  const muatData = async () => {
    const supabase = createClient()
    const [{ data, error }, { data: topik }] = await Promise.all([
      supabase.from('topik_kategori').select('id, nama, susunan, status').order('susunan').order('nama'),
      supabase.from('pelajar_topik').select('kategori_id'),
    ])
    if (error) {
      console.error(error)
      toast.error('Gagal muat kategori. Jalankan migrasi SQL progres-pelajar.sql jika belum.')
    }
    // Bilangan topik per kategori — untuk halang padam kategori yang sedang digunakan.
    const kira: Record<string, number> = {}
    for (const t of topik ?? []) {
      if (t.kategori_id) kira[t.kategori_id] = (kira[t.kategori_id] ?? 0) + 1
    }
    setKiraan(kira)
    setSenarai((data ?? []) as Kategori[])
    setLoading(false)
  }

  useEffect(() => { muatData() }, [])

  const mulaEdit = (k: Kategori) => {
    setEdit(k.id)
    setEditVal({ nama: k.nama, susunan: k.susunan, status: k.status })
    setTambah(false)
    setSahPadam(null)
  }

  const simpanEdit = async (id: string) => {
    if (!editVal.nama?.trim()) { setRalat('Nama kategori wajib diisi.'); return }
    setMenyimpan(true)
    const { error } = await createClient().from('topik_kategori').update({
      nama: editVal.nama.trim(),
      susunan: Number(editVal.susunan) || 100,
      status: editVal.status,
    }).eq('id', id)
    setMenyimpan(false)
    if (error) {
      toast.error(error.code === '23505' ? 'Nama kategori itu sudah wujud.' : 'Gagal simpan. Cuba lagi.')
      return
    }
    setEdit(null)
    setEditVal({})
    toast.success('Kategori dikemaskini.')
    muatData()
  }

  const simpanBaharu = async () => {
    if (!namaBaharu.trim()) { setRalat('Nama kategori wajib diisi.'); return }
    setMenyimpan(true)
    // Letak di hujung senarai secara automatik
    const susunanAkhir = senarai.reduce((m, k) => Math.max(m, k.susunan), 0) + 10
    const { error } = await createClient()
      .from('topik_kategori')
      .insert({ nama: namaBaharu.trim(), susunan: susunanAkhir, status: 'Aktif' })
    setMenyimpan(false)
    if (error) {
      toast.error(error.code === '23505' ? 'Nama kategori itu sudah wujud.' : 'Gagal simpan. Cuba lagi.')
      return
    }
    setTambah(false)
    setNamaBaharu('')
    setRalat(null)
    toast.success('Kategori baharu ditambah.')
    muatData()
  }

  const padam = async (k: Kategori) => {
    const guna = kiraan[k.id] ?? 0
    if (guna > 0) {
      setRalat(`"${k.nama}" digunakan oleh ${guna} topik pelajar — tidak boleh dipadam. Tukar status kepada "Tidak Aktif" jika mahu sembunyikan dari senarai pilihan.`)
      setSahPadam(null)
      return
    }
    if (sahPadam !== k.id) { setSahPadam(k.id); return }
    setMenyimpan(true)
    const { error } = await createClient().from('topik_kategori').delete().eq('id', k.id)
    setMenyimpan(false)
    setSahPadam(null)
    if (error) { toast.error('Gagal padam. Cuba lagi.'); return }
    toast.success('Kategori dipadam.')
    muatData()
  }

  return (
    <div style={{ maxWidth: '760px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '460px' }}>
          Kategori tajuk untuk Progress Pembelajaran pelajar (Opening, Middlegame, Endgame, Strategy…).
          Boleh tambah sendiri. Nombor susunan kecil muncul dahulu.
        </p>
        <button onClick={() => { setTambah(true); setEdit(null); setRalat(null) }}
          disabled={tambah}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px',
            background: tambah ? '#94A3B8' : 'var(--accent)', border: 'none', borderRadius: '10px',
            fontSize: '13px', fontWeight: 700, color: 'var(--accent-text)',
            cursor: tambah ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          }}>
          <Plus size={14} /> Tambah Kategori
        </button>
      </div>

      {ralat && (
        <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '12px', padding: '12px 16px', fontSize: '13px', color: '#9F1239', marginBottom: '16px' }}>
          {ralat}
          <button onClick={() => setRalat(null)} style={{ marginLeft: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#9F1239' }}>×</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {tambah && (
          <div style={{ background: '#F7FEE7', border: '2px solid var(--accent)', borderRadius: '14px', padding: '18px 20px' }}>
            <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--accent-dark)', marginBottom: '12px' }}>Kategori Baharu</h3>
            <input
              value={namaBaharu}
              onChange={(e) => setNamaBaharu(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') simpanBaharu() }}
              placeholder="Contoh: Blitz / Rapid, Sejarah Catur"
              autoFocus
              style={{ ...gayaInput, width: '100%', marginBottom: '12px' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { setTambah(false); setNamaBaharu(''); setRalat(null) }}
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
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13.5px' }}>Memuatkan...</div>
        ) : senarai.length === 0 ? (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '48px', textAlign: 'center' }}>
            <Tag size={30} style={{ color: 'var(--border)', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
              Tiada kategori. Jika ini kali pertama, jalankan migrasi <code style={{ textTransform: 'none' }}>scripts/sql/progres-pelajar.sql</code> dalam Supabase — 11 kategori asas akan diisi automatik.
            </p>
          </div>
        ) : (
          senarai.map((k) => (
            <div key={k.id} style={{
              background: 'var(--card)', border: `1px solid ${edit === k.id ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: '14px', padding: '14px 18px',
            }}>
              {edit === k.id ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' as const }}>Nama *</label>
                      <input value={editVal.nama ?? ''} onChange={(e) => setEditVal((v) => ({ ...v, nama: e.target.value }))} style={{ ...gayaInput, width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' as const }}>Susunan</label>
                      <input type="number" value={editVal.susunan ?? 100} onChange={(e) => setEditVal((v) => ({ ...v, susunan: Number(e.target.value) }))} style={{ ...gayaInput, width: '100%' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const }}>Status:</span>
                    {(['Aktif', 'Tidak Aktif'] as const).map((s) => {
                      const aktif = editVal.status === s
                      return (
                        <button key={s} type="button" onClick={() => setEditVal((v) => ({ ...v, status: s }))}
                          style={{
                            padding: '5px 14px', borderRadius: '20px',
                            border: `2px solid ${aktif ? (s === 'Aktif' ? 'var(--accent)' : '#EF4444') : 'var(--border)'}`,
                            background: aktif ? (s === 'Aktif' ? '#F7FEE7' : '#FFF1F2') : 'transparent',
                            color: aktif ? (s === 'Aktif' ? 'var(--accent-dark)' : '#9F1239') : 'var(--text-muted)',
                            fontSize: '12.5px', fontWeight: aktif ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit',
                          }}>
                          {s}
                        </button>
                      )
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { setEdit(null); setEditVal({}) }}
                      style={{ padding: '8px 14px', background: 'none', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit' }}>
                      <X size={13} style={{ display: 'inline', marginRight: '4px' }} />Batal
                    </button>
                    <button onClick={() => simpanEdit(k.id)} disabled={menyimpan}
                      style={{ padding: '8px 16px', background: menyimpan ? '#94A3B8' : 'var(--accent)', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--accent-text)', cursor: menyimpan ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                      <Check size={13} style={{ display: 'inline', marginRight: '4px' }} />Simpan
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', minWidth: '26px' }}>{k.susunan}</span>
                    <span style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text)' }}>{k.nama}</span>
                    {k.status !== 'Aktif' && (
                      <span style={{ fontSize: '11px', padding: '2px 10px', borderRadius: '20px', fontWeight: 600, background: '#F1F5F9', color: 'var(--text-muted)' }}>
                        Tidak Aktif
                      </span>
                    )}
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {kiraan[k.id] ? `${kiraan[k.id]} topik` : 'belum digunakan'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => mulaEdit(k)}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '9px', fontSize: '12.5px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit' }}>
                      <Edit2 size={12} /> Edit
                    </button>
                    <button onClick={() => padam(k)} disabled={menyimpan}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: sahPadam === k.id ? '#E11D48' : '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '9px', fontSize: '12.5px', fontWeight: 700, color: sahPadam === k.id ? '#fff' : '#9F1239', cursor: 'pointer', fontFamily: 'inherit' }}>
                      <Trash2 size={12} /> {sahPadam === k.id ? 'Sah Padam?' : 'Padam'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
