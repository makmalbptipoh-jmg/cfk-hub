'use client'

import { useState, useEffect } from 'react'
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

export default function TambahAsetPage() {
  const router = useRouter()
  const [cawangan, setCawangan] = useState<{ id: string; nama: string }[]>([])

  const [nama, setNama] = useState('')
  const [kategori, setKategori] = useState(KATEGORI_ASET[0])
  const [nilaiAsal, setNilaiAsal] = useState('')
  const [tarikhBeli, setTarikhBeli] = useState('')
  const [cawanganId, setCawanganId] = useState('')
  const [nota, setNota] = useState('')
  const [loading, setLoading] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)

  useEffect(() => {
    createClient()
      .from('cawangan')
      .select('id, nama')
      .eq('status', 'Aktif')
      .order('nama')
      .then(({ data }) => setCawangan(data ?? []))
  }, [])

  const simpan = async () => {
    if (!nama.trim()) { setRalat('Sila isi nama aset.'); return }
    setLoading(true)
    setRalat(null)
    const { error } = await createClient().from('aset').insert({
      nama: nama.trim(),
      kategori: kategori || null,
      nilai_asal: nilaiAsal ? +nilaiAsal : null,
      tarikh_beli: tarikhBeli || null,
      cawangan_id: cawanganId || null,
      nota: nota.trim() || null,
      status: 'Aktif',
    })
    if (error) { setRalat('Gagal simpan. Cuba lagi.'); setLoading(false); return }
    router.push('/aset')
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
        Tambah Aset Baharu
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
            placeholder="Cth: Papan Catur Magnetik #1"
            style={gayaInput}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={gayaLabel}>Kategori</label>
            <select value={kategori} onChange={(e) => setKategori(e.target.value)} style={gayaInput}>
              {KATEGORI_ASET.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <label style={gayaLabel}>Nilai Asal (RM)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={nilaiAsal}
              onChange={(e) => setNilaiAsal(e.target.value)}
              placeholder="0.00"
              style={gayaInput}
            />
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
            placeholder="Cth: Dibeli untuk cawangan Klebang, warna hitam-putih"
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
            {loading ? 'Menyimpan...' : 'Simpan Aset'}
          </button>
        </div>
      </div>
    </div>
  )
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
