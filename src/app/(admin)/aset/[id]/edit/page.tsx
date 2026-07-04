'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const KATEGORI_ASET = [
  'Papan & Buah Catur',
  'Jam Catur',
  'Perabot',
  'Elektronik',
  'Bahan Pengajaran',
  'Lain-lain',
]

const gayaInput = {
  width: '100%',
  padding: '10px 12px',
  border: '1.5px solid var(--border)',
  borderRadius: '10px',
  fontSize: '13.5px',
  color: 'var(--text)',
  background: 'var(--card)',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box' as const,
}

const gayaLabel: React.CSSProperties = {
  display: 'block',
  fontSize: '11.5px',
  fontWeight: 700,
  color: 'var(--text-muted)',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

export default function EditAsetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [cawangan, setCawangan] = useState<{ id: string; nama: string }[]>([])
  const [muatLoad, setMuatLoad] = useState(true)
  const [nama, setNama] = useState('')
  const [kategori, setKategori] = useState(KATEGORI_ASET[0])
  const [kuantiti, setKuantiti] = useState('1')
  const [hargaSeunit, setHargaSeunit] = useState('')
  const [tarikhBeli, setTarikhBeli] = useState('')
  const [cawanganId, setCawanganId] = useState('')
  const [nota, setNota] = useState('')
  const [loading, setLoading] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('aset').select('*').eq('id', id).single(),
      supabase.from('cawangan').select('id, nama').eq('status', 'Aktif').order('nama'),
    ]).then(([{ data: a }, { data: caw }]) => {
      if (a) {
        setNama(a.nama)
        setKategori(a.kategori ?? KATEGORI_ASET[0])
        setKuantiti(String(a.kuantiti ?? 1))
        setHargaSeunit(a.harga_seunit != null ? String(a.harga_seunit) : (a.nilai_asal != null ? String(a.nilai_asal) : ''))
        setTarikhBeli(a.tarikh_beli ?? '')
        setCawanganId(a.cawangan_id ?? '')
        setNota(a.nota ?? '')
      }
      setCawangan(caw ?? [])
      setMuatLoad(false)
    })
  }, [id])

  const unit = Math.max(1, Math.floor(+kuantiti || 1))
  const jumlahNilai = hargaSeunit ? unit * +hargaSeunit : null

  const simpan = async () => {
    if (!nama.trim()) { setRalat('Sila isi nama aset.'); return }
    setLoading(true)
    setRalat(null)
    const { error } = await createClient()
      .from('aset')
      .update({
        nama: nama.trim(),
        kategori: kategori || null,
        kuantiti: unit,
        harga_seunit: hargaSeunit ? +hargaSeunit : null,
        nilai_asal: jumlahNilai,
        tarikh_beli: tarikhBeli || null,
        cawangan_id: cawanganId || null,
        nota: nota.trim() || null,
      })
      .eq('id', id)
    if (error) { setRalat('Gagal simpan. Cuba lagi.'); setLoading(false); return }
    router.push('/aset')
  }

  if (muatLoad) {
    return (
      <div style={{ maxWidth: '560px', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
        Memuatkan...
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '560px' }}>
      <Link
        href="/aset"
        style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', display: 'block', marginBottom: '8px' }}
      >
        ← Senarai Aset
      </Link>
      <h1
        style={{
          fontSize: '22px',
          fontWeight: 700,
          color: 'var(--text)',
          letterSpacing: '-0.3px',
          marginBottom: '24px',
        }}
      >
        Edit Aset
      </h1>

      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div>
          <label style={gayaLabel}>Nama Aset <span style={{ color: '#EF4444' }}>*</span></label>
          <input
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            style={gayaInput}
          />
        </div>

        <div>
          <label style={gayaLabel}>Kategori</label>
          <select value={kategori} onChange={(e) => setKategori(e.target.value)} style={gayaInput}>
            {KATEGORI_ASET.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
          <div>
            <label style={gayaLabel}>Kuantiti (Unit)</label>
            <input
              type="number"
              min="1"
              step="1"
              value={kuantiti}
              onChange={(e) => setKuantiti(e.target.value)}
              style={gayaInput}
            />
          </div>
          <div>
            <label style={gayaLabel}>Harga Seunit (RM)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={hargaSeunit}
              onChange={(e) => setHargaSeunit(e.target.value)}
              placeholder="0.00"
              style={gayaInput}
            />
          </div>
          <div>
            <label style={gayaLabel}>Jumlah Nilai (RM)</label>
            <div
              style={{
                ...gayaInput,
                background: 'var(--bg)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {jumlahNilai != null ? jumlahNilai.toFixed(2) : '—'}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={gayaLabel}>Tarikh Beli</label>
            <input
              type="date"
              value={tarikhBeli}
              onChange={(e) => setTarikhBeli(e.target.value)}
              style={gayaInput}
            />
          </div>
          <div>
            <label style={gayaLabel}>Cawangan (pilihan)</label>
            <select value={cawanganId} onChange={(e) => setCawanganId(e.target.value)} style={gayaInput}>
              <option value="">Umum</option>
              {cawangan.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label style={gayaLabel}>Nota (pilihan)</label>
          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            rows={2}
            style={{ ...gayaInput, resize: 'vertical' }}
          />
        </div>

        {ralat && (
          <div
            style={{
              background: '#FFF1F2',
              border: '1px solid #FECDD3',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '13px',
              color: '#9F1239',
            }}
          >
            {ralat}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
          <Link
            href="/aset"
            style={{
              flex: 1,
              padding: '11px',
              background: 'var(--bg)',
              border: '1.5px solid var(--border)',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: 600,
              color: 'var(--text)',
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            Batal
          </Link>
          <button
            onClick={simpan}
            disabled={loading}
            style={{
              flex: 2,
              padding: '11px',
              background: loading ? '#94A3B8' : 'var(--accent)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: 700,
              color: 'var(--accent-text)',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  )
}
