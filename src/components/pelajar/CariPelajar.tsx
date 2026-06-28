'use client'

import { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export type PelajarCarian = {
  id: string
  nama_penuh: string
  no_telefon: string
  status: string
  cawangan_nama?: string
}

interface CariPelajarProps {
  onPilih: (pelajar: PelajarCarian) => void
  placeholder?: string
  nilaiAwal?: string
}

export function CariPelajar({ onPilih, placeholder = 'Cari nama atau telefon pelajar...', nilaiAwal = '' }: CariPelajarProps) {
  const [query, setQuery] = useState(nilaiAwal)
  const [results, setResults] = useState<PelajarCarian[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('pelajar')
        .select('id, nama_penuh, no_telefon, status, cawangan:cawangan_daftar_id(nama)')
        .or(`nama_penuh.ilike.%${query}%,no_telefon.ilike.%${query}%`)
        .limit(8)

      const mapped: PelajarCarian[] = (data ?? []).map((p: any) => ({
        id: p.id,
        nama_penuh: p.nama_penuh,
        no_telefon: p.no_telefon,
        status: p.status,
        cawangan_nama: p.cawangan?.nama,
      }))
      setResults(mapped)
      setOpen(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <Search size={15} style={{
          position: 'absolute', left: '12px', top: '50%',
          transform: 'translateY(-50%)', color: 'var(--text-muted)',
        }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '10px 14px 10px 36px',
            border: '1.5px solid var(--border)',
            borderRadius: '10px',
            fontSize: '13.5px',
            color: 'var(--text)',
            background: 'var(--card)',
            outline: 'none',
          }}
        />
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)',
          left: 0, right: 0, zIndex: 50,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}>
          {results.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
              Tiada pelajar dijumpai
            </div>
          ) : results.map((p) => (
            <button key={p.id}
              onClick={() => { onPilih(p); setQuery(p.nama_penuh); setOpen(false) }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'transparent', border: 'none',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>{p.nama_penuh}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {p.no_telefon}{p.cawangan_nama ? ` · ${p.cawangan_nama}` : ''}
                </div>
              </div>
              <span style={{
                fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: 600,
                background: p.status === 'Aktif' ? 'var(--hadir-bg)' : '#F1F5F9',
                color: p.status === 'Aktif' ? 'var(--hadir-text)' : 'var(--text-muted)',
              }}>
                {p.status}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
