'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Wallet, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatRinggit, formatTarikh } from '@/lib/utils'

const KATEGORI = [
  'Sewa',
  'Utiliti',
  'Peralatan Catur',
  'Pengangkutan',
  'Bahan Promosi',
  'Makanan & Minuman',
  'Lain-lain',
]

type Perbelanjaan = {
  id: string
  tarikh: string
  kategori: string
  penerangan: string
  jumlah: number
  cawangan_id: string | null
  cawangan: { id: string; nama: string } | null
}

const gayaInput = {
  padding: '9px 12px',
  border: '1.5px solid var(--border)',
  borderRadius: '10px',
  fontSize: '13.5px',
  color: 'var(--text)',
  background: 'var(--card)',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box' as const,
}

export default function PerbelanjaanPage() {
  const bulanDefault = new Date().toISOString().slice(0, 7)
  const [bulan, setBulan] = useState(bulanDefault)
  const [filterKategori, setFilterKategori] = useState('')
  const [filterCawangan, setFilterCawangan] = useState('')
  const [senarai, setSenarai] = useState<Perbelanjaan[]>([])
  const [cawangan, setCawangan] = useState<{ id: string; nama: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [jumlahTotal, setJumlahTotal] = useState(0)

  const muatData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const [y, m] = bulan.split('-')
    const mula = `${y}-${m}-01`
    const akhir = new Date(+y, +m, 0).toISOString().split('T')[0]

    let q = supabase
      .from('kewangan_perbelanjaan')
      .select('id, tarikh, kategori, penerangan, jumlah, cawangan_id, cawangan:cawangan_id(id, nama)')
      .gte('tarikh', mula)
      .lte('tarikh', akhir)

    if (filterKategori) q = q.eq('kategori', filterKategori)
    if (filterCawangan === '__umum__') q = q.is('cawangan_id', null)
    else if (filterCawangan) q = q.eq('cawangan_id', filterCawangan)

    q = q.order('tarikh', { ascending: false })

    const [{ data }, { data: caw }] = await Promise.all([
      q,
      supabase.from('cawangan').select('id, nama').eq('status', 'Aktif').order('nama'),
    ])

    const hasil = (data ?? []) as unknown as Perbelanjaan[]
    setSenarai(hasil)
    setCawangan(caw ?? [])
    setJumlahTotal(hasil.reduce((s, p) => s + p.jumlah, 0))
    setLoading(false)
  }, [bulan, filterKategori, filterCawangan])

  useEffect(() => {
    muatData()
  }, [muatData])

  const padam = async (id: string) => {
    if (!confirm('Padam rekod perbelanjaan ini?')) return
    await createClient().from('kewangan_perbelanjaan').delete().eq('id', id)
    muatData()
  }

  return (
    <div>
      {/* Filter bar */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          marginBottom: '20px',
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Bulan
          </label>
          <input
            type="month"
            value={bulan}
            onChange={(e) => setBulan(e.target.value)}
            style={gayaInput}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Kategori
          </label>
          <select value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)} style={gayaInput}>
            <option value="">Semua Kategori</option>
            {KATEGORI.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Cawangan
          </label>
          <select value={filterCawangan} onChange={(e) => setFilterCawangan(e.target.value)} style={gayaInput}>
            <option value="">Semua</option>
            <option value="__umum__">Umum (tiada cawangan)</option>
            {cawangan.map((c) => (
              <option key={c.id} value={c.id}>{c.nama}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setModal(true)}
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 16px',
            background: 'var(--accent)',
            border: 'none',
            borderRadius: '12px',
            fontSize: '13.5px',
            fontWeight: 700,
            color: 'var(--accent-text)',
            cursor: 'pointer',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}
        >
          <Plus size={14} /> Tambah Perbelanjaan
        </button>
      </div>

      {/* Jumlah total */}
      {!loading && (
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '12px 18px',
            marginBottom: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{senarai.length} rekod</span>
          <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)' }}>
            Jumlah: {formatRinggit(jumlahTotal)}
          </span>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Memuatkan...</div>
      ) : senarai.length === 0 ? (
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '48px',
            textAlign: 'center',
          }}
        >
          <Wallet size={32} style={{ color: 'var(--border)', margin: '0 auto 12px', display: 'block' }} />
          <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            Tiada rekod perbelanjaan
          </p>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
            Klik "Tambah Perbelanjaan" untuk mula rekod.
          </p>
        </div>
      ) : (
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                {['Tarikh', 'Kategori', 'Penerangan', 'Cawangan', 'Jumlah', ''].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '9px 14px',
                      textAlign: 'left',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {senarai.map((p, i) => (
                <tr
                  key={p.id}
                  style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFBFC' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <td style={{ padding: '10px 14px', fontSize: '12.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {formatTarikh(p.tarikh)}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span
                      style={{
                        fontSize: '11.5px',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontWeight: 600,
                        background: '#F1F5F9',
                        color: '#475569',
                      }}
                    >
                      {p.kategori}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: '13px', color: 'var(--text)' }}>{p.penerangan}</td>
                  <td style={{ padding: '10px 14px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    {p.cawangan?.nama ?? 'Umum'}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
                    {formatRinggit(p.jumlah)}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <button
                      onClick={() => padam(p.id)}
                      title="Padam"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#EF4444',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        opacity: 0.6,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <ModalTambahPerbelanjaan
          cawangan={cawangan}
          onTutup={() => setModal(false)}
          onBerjaya={() => { setModal(false); muatData() }}
        />
      )}
    </div>
  )
}

function ModalTambahPerbelanjaan({
  cawangan,
  onTutup,
  onBerjaya,
}: {
  cawangan: { id: string; nama: string }[]
  onTutup: () => void
  onBerjaya: () => void
}) {
  const [tarikh, setTarikh] = useState(new Date().toISOString().split('T')[0])
  const [kategori, setKategori] = useState(KATEGORI[0])
  const [penerangan, setPenerangan] = useState('')
  const [jumlah, setJumlah] = useState('')
  const [cawanganId, setCawanganId] = useState('')
  const [loading, setLoading] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)

  const simpan = async () => {
    if (!penerangan.trim()) { setRalat('Sila isi penerangan perbelanjaan.'); return }
    if (!jumlah || +jumlah <= 0) { setRalat('Jumlah mesti lebih dari 0.'); return }
    setLoading(true)
    setRalat(null)
    const { error } = await createClient().from('kewangan_perbelanjaan').insert({
      tarikh,
      kategori,
      penerangan: penerangan.trim(),
      jumlah: +jumlah,
      cawangan_id: cawanganId || null,
    })
    if (error) { setRalat('Gagal simpan. Cuba lagi.'); setLoading(false); return }
    onBerjaya()
  }

  const modalInput = {
    ...gayaInput,
    width: '100%',
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onTutup() }}
    >
      <div
        style={{
          background: 'var(--card)',
          borderRadius: '20px',
          padding: '28px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)' }}>Tambah Perbelanjaan</h2>
          <button onClick={onTutup} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                Tarikh
              </label>
              <input type="date" value={tarikh} onChange={(e) => setTarikh(e.target.value)} style={modalInput} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                Kategori
              </label>
              <select value={kategori} onChange={(e) => setKategori(e.target.value)} style={modalInput}>
                {KATEGORI.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
              Penerangan
            </label>
            <input
              value={penerangan}
              onChange={(e) => setPenerangan(e.target.value)}
              placeholder="Cth: Bayaran sewa dewan Buntong"
              style={modalInput}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                Jumlah (RM)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
                placeholder="0.00"
                style={modalInput}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                Cawangan (pilihan)
              </label>
              <select value={cawanganId} onChange={(e) => setCawanganId(e.target.value)} style={modalInput}>
                <option value="">Umum</option>
                {cawangan.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
              </select>
            </div>
          </div>
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
              marginTop: '14px',
            }}
          >
            {ralat}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={onTutup}
            style={{
              flex: 1,
              padding: '11px',
              background: 'var(--bg)',
              border: '1.5px solid var(--border)',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: 600,
              color: 'var(--text)',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Batal
          </button>
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
            {loading ? 'Menyimpan...' : 'Simpan Perbelanjaan'}
          </button>
        </div>
      </div>
    </div>
  )
}
