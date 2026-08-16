'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trophy, Users, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ciptaPertandingan } from '@/app/actions/pertandingan'
import { toast } from '@/lib/stores/toast-store'

export type CawanganPilihan = { id: string; nama: string }
type Pelajar = { id: string; nama_penuh: string }

const gayaInput: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)',
  borderRadius: '12px', fontSize: '13.5px', color: 'var(--text)',
  background: 'var(--card)', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
}
const gayaLabel: React.CSSProperties = {
  display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)',
  marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em',
}

function tarikhHariIni() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function BorangPertandinganBaharu({ cawangan }: { cawangan: CawanganPilihan[] }) {
  const router = useRouter()
  const [nama, setNama] = useState('')
  const [tarikh, setTarikh] = useState(tarikhHariIni())
  const [cawanganId, setCawanganId] = useState('')
  const [bilPusingan, setBilPusingan] = useState('')
  const [pelajar, setPelajar] = useState<Pelajar[]>([])
  const [dipilih, setDipilih] = useState<Set<string>>(new Set())
  const [memuatPelajar, setMemuatPelajar] = useState(false)
  const [simpan, setSimpan] = useState(false)

  useEffect(() => {
    if (!cawanganId || !tarikh) { setPelajar([]); setDipilih(new Set()); return }
    setMemuatPelajar(true)
    const supabase = createClient()
    // Peserta = pelajar yang HADIR pada tarikh ini di kelas (cawangan sesi) ini sahaja.
    supabase
      .from('kehadiran')
      .select('pelajar:pelajar_id(id, nama_penuh)')
      .eq('cawangan_sesi_id', cawanganId)
      .eq('tarikh', tarikh)
      .eq('status', 'Hadir')
      .then(({ data }) => {
        type Baris = { pelajar: { id: string; nama_penuh: string } | null }
        const senarai = ((data ?? []) as unknown as Baris[])
          .map((r) => r.pelajar)
          .filter((p): p is Pelajar => !!p)
          .sort((a, b) => a.nama_penuh.localeCompare(b.nama_penuh, 'ms'))
        setPelajar(senarai)
        setDipilih(new Set(senarai.map((p) => p.id))) // default: semua dipilih
        setMemuatPelajar(false)
      })
  }, [cawanganId, tarikh])

  const toggle = (id: string) => {
    setDipilih((prev) => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id); else s.add(id)
      return s
    })
  }
  const semua = pelajar.length > 0 && dipilih.size === pelajar.length
  const toggleSemua = () => setDipilih(semua ? new Set() : new Set(pelajar.map((p) => p.id)))

  const hantar = async () => {
    if (nama.trim().length < 3) { toast.warning('Nama pertandingan sekurang-kurangnya 3 aksara.'); return }
    if (dipilih.size < 2) { toast.warning('Pilih sekurang-kurangnya 2 peserta.'); return }
    setSimpan(true)
    const dipilihPelajar = pelajar.filter((p) => dipilih.has(p.id))
    const { ralat, id } = await ciptaPertandingan({
      nama, tarikh, cawangan_id: cawanganId,
      bil_pusingan: bilPusingan ? parseInt(bilPusingan) : null,
      pelajar: dipilihPelajar,
    })
    if (ralat || !id) { toast.error(ralat ?? 'Gagal cipta.'); setSimpan(false); return }
    toast.success('Pertandingan dicipta. Muat turun template pemain di bawah.')
    router.push(`/pertandingan/${id}`)
  }

  return (
    <div style={{ maxWidth: '640px', padding: '0 16px' }}>
      <Link href="/pertandingan" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '16px' }}>
        <ArrowLeft size={15} /> Kembali
      </Link>

      <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Trophy size={20} /> Pertandingan Baharu
      </h1>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '18px', padding: '22px', marginBottom: '18px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={gayaLabel}>Nama Pertandingan</label>
          <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="cth: Pertandingan Mingguan CFK 14/12" style={gayaInput} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
          <div>
            <label style={gayaLabel}>Tarikh</label>
            <input type="date" value={tarikh} onChange={(e) => setTarikh(e.target.value)} style={gayaInput} />
          </div>
          <div>
            <label style={gayaLabel}>Bil. Pusingan <span style={{ textTransform: 'none', fontWeight: 400 }}>(pilihan)</span></label>
            <input type="number" min={1} value={bilPusingan} onChange={(e) => setBilPusingan(e.target.value)} placeholder="cth: 7" style={gayaInput} />
          </div>
        </div>
        <div>
          <label style={gayaLabel}>Cawangan / Kelas</label>
          <select value={cawanganId} onChange={(e) => setCawanganId(e.target.value)} style={gayaInput}>
            <option value="">— Pilih cawangan —</option>
            {cawangan.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
          </select>
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Peserta diambil dari pelajar yang <strong>Hadir</strong> pada tarikh dipilih di kelas ini. Pastikan kehadiran hari itu sudah direkod dahulu.
          </p>
        </div>
      </div>

      {/* Peserta */}
      {cawanganId && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '18px', overflow: 'hidden', marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={15} /> Peserta ({dipilih.size}/{pelajar.length})
            </h2>
            {pelajar.length > 0 && (
              <button onClick={toggleSemua} style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                {semua ? 'Nyahpilih semua' : 'Pilih semua'}
              </button>
            )}
          </div>

          {memuatPelajar ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}><Loader2 size={18} className="animate-spin" style={{ display: 'inline' }} /> Memuatkan pelajar...</div>
          ) : pelajar.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>Tiada pelajar <strong>Hadir</strong> pada tarikh ini di kelas ini. Rekod kehadiran dahulu, kemudian pilih semula tarikh.</div>
          ) : (
            <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
              {pelajar.map((p, i) => (
                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 18px', borderTop: i > 0 ? '1px solid var(--border)' : 'none', cursor: 'pointer', background: dipilih.has(p.id) ? '#F8FAFC' : 'transparent' }}>
                  <input type="checkbox" checked={dipilih.has(p.id)} onChange={() => toggle(p.id)} style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
                  <span style={{ fontSize: '13.5px', color: 'var(--text)', fontWeight: dipilih.has(p.id) ? 600 : 400 }}>{p.nama_penuh}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        onClick={hantar}
        disabled={simpan || dipilih.size < 2}
        style={{
          width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
          background: simpan || dipilih.size < 2 ? '#94A3B8' : 'var(--primary)',
          color: '#FFFFFF', fontSize: '14px', fontWeight: 700,
          cursor: simpan || dipilih.size < 2 ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}
      >
        {simpan ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : `Cipta & Daftar ${dipilih.size} Peserta`}
      </button>
    </div>
  )
}
