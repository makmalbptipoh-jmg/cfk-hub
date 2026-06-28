'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Cawangan = { id: string; nama: string }

const labelInput = {
  display: 'block' as const,
  fontSize: '12px', fontWeight: 600 as const,
  color: 'var(--text-muted)', marginBottom: '6px',
  textTransform: 'uppercase' as const, letterSpacing: '0.05em',
}

const gayaInput = {
  width: '100%', padding: '10px 14px',
  border: '1.5px solid var(--border)', borderRadius: '12px',
  fontSize: '13.5px', color: 'var(--text)',
  background: 'var(--card)', outline: 'none', fontFamily: 'inherit',
}

export default function EditJurulatihPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [cawangan, setCawangan] = useState<Cawangan[]>([])
  const [loading, setLoading] = useState(true)
  const [menyimpan, setMenyimpan] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)

  const [form, setForm] = useState({
    nama_penuh: '',
    no_ic: '',
    no_telefon: '',
    emel: '',
    cawangan_ids: [] as string[],
    kadar_bayaran: '',
    tarikh_mula: '',
    pengalaman_ringkas: '',
    kelayakan: '',
    status: 'Aktif',
  })

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('jurulatih').select('*').eq('id', id).single(),
      supabase.from('cawangan').select('id, nama').eq('status', 'Aktif').order('nama'),
    ]).then(([{ data: j }, { data: c }]) => {
      if (j) {
        setForm({
          nama_penuh: j.nama_penuh ?? '',
          no_ic: j.no_ic ?? '',
          no_telefon: j.no_telefon ?? '',
          emel: j.emel ?? '',
          cawangan_ids: j.cawangan_ids ?? [],
          kadar_bayaran: j.kadar_bayaran ? String(j.kadar_bayaran) : '',
          tarikh_mula: j.tarikh_mula ?? '',
          pengalaman_ringkas: j.pengalaman_ringkas ?? '',
          kelayakan: j.kelayakan ?? '',
          status: j.status ?? 'Aktif',
        })
      }
      setCawangan(c ?? [])
      setLoading(false)
    })
  }, [id])

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }))

  const toggleCawangan = (cid: string) => {
    setForm((f) => ({
      ...f,
      cawangan_ids: f.cawangan_ids.includes(cid)
        ? f.cawangan_ids.filter((c) => c !== cid)
        : [...f.cawangan_ids, cid],
    }))
  }

  const hantar = async () => {
    if (!form.nama_penuh.trim()) { setRalat('Nama penuh wajib diisi.'); return }
    setMenyimpan(true)
    setRalat(null)
    const { error } = await createClient().from('jurulatih').update({
      nama_penuh: form.nama_penuh,
      no_ic: form.no_ic || null,
      no_telefon: form.no_telefon || null,
      emel: form.emel || null,
      cawangan_ids: form.cawangan_ids,
      kadar_bayaran: form.kadar_bayaran ? parseFloat(form.kadar_bayaran) : null,
      tarikh_mula: form.tarikh_mula || null,
      pengalaman_ringkas: form.pengalaman_ringkas || null,
      kelayakan: form.kelayakan || null,
      status: form.status as 'Aktif' | 'Tidak Aktif',
    }).eq('id', id)
    if (error) { setRalat('Gagal simpan. Sila cuba lagi.'); setMenyimpan(false); return }
    router.push(`/jurulatih/${id}`)
    router.refresh()
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '13.5px' }}>
      Memuatkan...
    </div>
  )

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <Link href={`/jurulatih/${id}`} style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>
          ← Kembali ke Profil
        </Link>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>
          Kemaskini Jurulatih
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Maklumat Peribadi */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '18px' }}>Maklumat Peribadi</h2>
          <div style={{ marginBottom: '14px' }}>
            <label style={labelInput}>Nama Penuh *</label>
            <input value={form.nama_penuh} onChange={(e) => set('nama_penuh', e.target.value)} placeholder="Nama penuh jurulatih" style={gayaInput} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={labelInput}>No. IC</label>
              <input value={form.no_ic} onChange={(e) => set('no_ic', e.target.value)} placeholder="XXXXXX-XX-XXXX" style={gayaInput} />
            </div>
            <div>
              <label style={labelInput}>No. Telefon</label>
              <input value={form.no_telefon} onChange={(e) => set('no_telefon', e.target.value)} placeholder="01X-XXXXXXX" style={gayaInput} />
            </div>
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={labelInput}>E-mel</label>
            <input type="email" value={form.emel} onChange={(e) => set('emel', e.target.value)} placeholder="email@contoh.com" style={gayaInput} />
          </div>
          <div>
            <label style={labelInput}>Kelayakan</label>
            <input value={form.kelayakan} onChange={(e) => set('kelayakan', e.target.value)} placeholder="Contoh: FIDE Rating 1800" style={gayaInput} />
          </div>
        </div>

        {/* Cawangan */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '18px' }}>Cawangan</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {cawangan.map((c) => {
              const dipilih = form.cawangan_ids.includes(c.id)
              return (
                <button key={c.id} type="button" onClick={() => toggleCawangan(c.id)}
                  style={{
                    padding: '8px 16px', borderRadius: '20px',
                    border: `2px solid ${dipilih ? 'var(--accent)' : 'var(--border)'}`,
                    background: dipilih ? '#F7FEE7' : 'transparent',
                    color: dipilih ? 'var(--accent-dark)' : 'var(--text-muted)',
                    fontSize: '13px', fontWeight: dipilih ? 700 : 500,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {dipilih ? '✓ ' : ''}{c.nama}
                </button>
              )
            })}
          </div>
        </div>

        {/* Bayaran & Jadual */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '18px' }}>Bayaran & Jadual</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={labelInput}>Kadar / Sesi (RM)</label>
              <input type="number" min="0" step="5" value={form.kadar_bayaran} onChange={(e) => set('kadar_bayaran', e.target.value)} placeholder="Contoh: 50" style={gayaInput} />
            </div>
            <div>
              <label style={labelInput}>Tarikh Mula</label>
              <input type="date" value={form.tarikh_mula} onChange={(e) => set('tarikh_mula', e.target.value)} style={gayaInput} />
            </div>
          </div>
          <div>
            <label style={labelInput}>Pengalaman Ringkas</label>
            <textarea value={form.pengalaman_ringkas} onChange={(e) => set('pengalaman_ringkas', e.target.value)} rows={3} placeholder="Contoh: 5 tahun mengajar catur..." style={{ ...gayaInput, resize: 'vertical' }} />
          </div>
        </div>

        {/* Status */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '18px' }}>Status</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['Aktif', 'Tidak Aktif'].map((s) => {
              const dipilih = form.status === s
              return (
                <button key={s} type="button" onClick={() => set('status', s)}
                  style={{
                    padding: '9px 20px', borderRadius: '12px',
                    border: `2px solid ${dipilih ? (s === 'Aktif' ? 'var(--accent)' : '#EF4444') : 'var(--border)'}`,
                    background: dipilih ? (s === 'Aktif' ? '#F7FEE7' : '#FFF1F2') : 'transparent',
                    color: dipilih ? (s === 'Aktif' ? 'var(--accent-dark)' : '#9F1239') : 'var(--text-muted)',
                    fontSize: '13.5px', fontWeight: dipilih ? 700 : 500,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>

        {ralat && (
          <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#9F1239' }}>
            {ralat}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href={`/jurulatih/${id}`}
            style={{
              flex: 1, padding: '12px', textAlign: 'center',
              background: 'var(--bg)', border: '1.5px solid var(--border)',
              borderRadius: '12px', fontSize: '13.5px', fontWeight: 600,
              color: 'var(--text)', textDecoration: 'none',
            }}
          >
            Batal
          </Link>
          <button onClick={hantar} disabled={menyimpan}
            style={{
              flex: 2, padding: '12px',
              background: menyimpan ? '#94A3B8' : 'var(--accent)',
              border: 'none', borderRadius: '12px',
              fontSize: '13.5px', fontWeight: 700,
              color: 'var(--accent-text)', cursor: menyimpan ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {menyimpan ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  )
}
