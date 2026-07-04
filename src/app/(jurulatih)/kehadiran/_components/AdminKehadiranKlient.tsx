'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatTarikhPendek } from '@/lib/utils'
import { toast } from '@/lib/stores/toast-store'

type Cawangan = { id: string; nama: string }

type RekodKehadiran = {
  id: string
  pelajar_id: string
  pelajar_nama: string
  cawangan_daftar_nama: string
  cawangan_sesi_nama: string
  status: 'Hadir' | 'Tidak Hadir' | 'Cuti'
  nota: string | null
}

interface Props {
  cawangan: Cawangan[]
  tarikhAwal: string
}

const warnaStatus: Record<string, { bg: string; text: string }> = {
  Hadir: { bg: 'var(--hadir-bg)', text: 'var(--hadir-text)' },
  'Tidak Hadir': { bg: 'var(--tidak-hadir-bg)', text: 'var(--tidak-hadir-text)' },
  Cuti: { bg: 'var(--cuti-bg)', text: 'var(--cuti-text)' },
}

export function AdminKehadiranKlient({ cawangan, tarikhAwal }: Props) {
  const [tarikh, setTarikh] = useState(tarikhAwal)
  const [filterCawangan, setFilterCawangan] = useState('')
  const [rekod, setRekod] = useState<RekodKehadiran[]>([])
  const [loading, setLoading] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState<string>('')
  const [simpanLoading, setSimpanLoading] = useState(false)

  const muatRekod = useCallback(async () => {
    if (!tarikh) return
    setLoading(true)
    const supabase = createClient()

    let query = supabase
      .from('kehadiran')
      .select('id, pelajar_id, status, nota, cawangan_daftar_id, cawangan_sesi_id, pelajar:pelajar_id(nama_penuh), cawangan_daftar:cawangan_daftar_id(nama), cawangan_sesi:cawangan_sesi_id(nama)')
      .eq('tarikh', tarikh)
      .order('pelajar_id')

    if (filterCawangan) {
      query = query.eq('cawangan_sesi_id', filterCawangan)
    }

    const { data } = await query

    const mapped: RekodKehadiran[] = (data ?? []).map((r: any) => ({
      id: r.id,
      pelajar_id: r.pelajar_id,
      pelajar_nama: r.pelajar?.nama_penuh ?? '—',
      cawangan_daftar_nama: r.cawangan_daftar?.nama ?? '—',
      cawangan_sesi_nama: r.cawangan_sesi?.nama ?? '—',
      status: r.status,
      nota: r.nota,
    }))

    setRekod(mapped)
    setLoading(false)
  }, [tarikh, filterCawangan])

  useEffect(() => { muatRekod() }, [muatRekod])

  const mulaEdit = (r: RekodKehadiran) => {
    setEditId(r.id)
    setEditStatus(r.status)
  }

  const simpanEdit = async () => {
    if (!editId) return
    setSimpanLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('kehadiran')
      .update({ status: editStatus as 'Hadir' | 'Tidak Hadir' | 'Cuti' })
      .eq('id', editId)

    if (!error) {
      setRekod((prev) => prev.map((r) => r.id === editId ? { ...r, status: editStatus as any } : r))
      toast.success('Rekod berjaya dikemaskini.')
    } else {
      toast.error('Gagal kemaskini rekod. Cuba lagi.')
    }
    setEditId(null)
    setSimpanLoading(false)
  }

  const inputStyle = {
    padding: '9px 12px', border: '1.5px solid var(--border)',
    borderRadius: '10px', fontSize: '13px',
    color: 'var(--text)', background: 'var(--card)',
    outline: 'none', fontFamily: 'inherit',
  }

  const jumlahHadir = rekod.filter((r) => r.status === 'Hadir').length
  const jumlahTidakHadir = rekod.filter((r) => r.status === 'Tidak Hadir').length
  const jumlahCuti = rekod.filter((r) => r.status === 'Cuti').length

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>
          Semak Kehadiran
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
          Lihat dan kemaskini rekod kehadiran pelajar
        </p>
      </div>

      {/* Filter */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: '14px', padding: '16px 20px',
        display: 'flex', gap: '12px', alignItems: 'center',
        marginBottom: '16px',
      }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            Tarikh
          </label>
          <input
            type="date"
            value={tarikh}
            onChange={(e) => setTarikh(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            Cawangan Sesi
          </label>
          <select value={filterCawangan} onChange={(e) => setFilterCawangan(e.target.value)} style={inputStyle}>
            <option value="">Semua Cawangan</option>
            {cawangan.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
          </select>
        </div>
      </div>

      {/* Stat Ringkas */}
      {rekod.length > 0 && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          {[
            { label: 'Hadir', nilai: jumlahHadir, bg: 'var(--hadir-bg)', text: 'var(--hadir-text)' },
            { label: 'Tidak Hadir', nilai: jumlahTidakHadir, bg: 'var(--tidak-hadir-bg)', text: 'var(--tidak-hadir-text)' },
            { label: 'Cuti', nilai: jumlahCuti, bg: 'var(--cuti-bg)', text: 'var(--cuti-text)' },
          ].map((s) => (
            <div key={s.label} style={{
              flex: 1, background: s.bg, borderRadius: '12px',
              padding: '12px 16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: s.text }}>{s.nilai}</div>
              <div style={{ fontSize: '12px', color: s.text, marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Jadual */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            Memuatkan...
          </div>
        ) : rekod.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📅</div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
              Tiada rekod kehadiran
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Tiada rekod pada {formatTarikhPendek(tarikh)}{filterCawangan ? ' untuk cawangan dipilih' : ''}.
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                {['Pelajar', 'Cawangan Daftar', 'Cawangan Sesi', 'Status', 'Tindakan'].map((h) => (
                  <th key={h} style={{
                    padding: '10px 16px', textAlign: 'left',
                    fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rekod.map((r, i) => {
                const sedangEdit = editId === r.id
                const w = warnaStatus[r.status] ?? { bg: '#F1F5F9', text: 'var(--text-muted)' }
                return (
                  <tr key={r.id} style={{ borderBottom: i < rekod.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '11px 16px', fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>
                      {r.pelajar_nama}
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      {r.cawangan_daftar_nama}
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      {r.cawangan_sesi_nama}
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      {sedangEdit ? (
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          style={{ padding: '5px 10px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '12.5px', fontFamily: 'inherit' }}
                        >
                          <option>Hadir</option>
                          <option>Tidak Hadir</option>
                          <option>Cuti</option>
                        </select>
                      ) : (
                        <span style={{
                          fontSize: '12px', padding: '3px 10px',
                          borderRadius: '20px', fontWeight: 600,
                          background: w.bg, color: w.text,
                        }}>
                          {r.status}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      {sedangEdit ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={simpanEdit}
                            disabled={simpanLoading}
                            style={{
                              padding: '5px 12px', background: 'var(--accent)',
                              border: 'none', borderRadius: '7px',
                              fontSize: '12px', fontWeight: 700,
                              color: 'var(--accent-text)', cursor: 'pointer', fontFamily: 'inherit',
                            }}
                          >
                            {simpanLoading ? '...' : 'Simpan'}
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            style={{
                              padding: '5px 10px', background: 'var(--bg)',
                              border: '1px solid var(--border)', borderRadius: '7px',
                              fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit',
                            }}
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => mulaEdit(r)}
                          style={{
                            padding: '5px 12px', background: 'var(--bg)',
                            border: '1px solid var(--border)', borderRadius: '7px',
                            fontSize: '12px', fontWeight: 600,
                            color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit',
                          }}
                        >
                          Edit
                        </button>
                      )}
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
