'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CariPelajar, type PelajarCarian } from './CariPelajar'
import { toast } from '@/lib/stores/toast-store'

type Adik = {
  id: string
  nama_penuh: string
  status: string
}

interface Props {
  pelajarId: string
}

// Kaitan adik-beradik (PD-008): pelajar berkongsi keluarga_id yang sama.
// Perubahan disimpan TERUS ke DB (bukan semasa butang Simpan borang).
export function KaitanAdikBeradik({ pelajarId }: Props) {
  const [keluargaId, setKeluargaId] = useState<string | null>(null)
  const [adik, setAdik] = useState<Adik[]>([])
  const [loading, setLoading] = useState(true)

  const muat = useCallback(async () => {
    const supabase = createClient()
    const { data: sendiri } = await supabase
      .from('pelajar')
      .select('keluarga_id')
      .eq('id', pelajarId)
      .single()
    const kid = sendiri?.keluarga_id ?? null
    setKeluargaId(kid)
    if (kid) {
      const { data } = await supabase
        .from('pelajar')
        .select('id, nama_penuh, status')
        .eq('keluarga_id', kid)
        .neq('id', pelajarId)
        .order('nama_penuh')
      setAdik(data ?? [])
    } else {
      setAdik([])
    }
    setLoading(false)
  }, [pelajarId])

  useEffect(() => {
    muat()
  }, [muat])

  const tambah = async (p: PelajarCarian) => {
    if (p.id === pelajarId) {
      toast.warning('Tidak boleh kaitkan pelajar dengan dirinya sendiri.')
      return
    }
    if (adik.some((a) => a.id === p.id)) {
      toast.info('Pelajar ini sudah dikaitkan.')
      return
    }
    const supabase = createClient()
    let kid = keluargaId
    if (!kid) {
      kid = crypto.randomUUID()
      const { error } = await supabase.from('pelajar').update({ keluarga_id: kid }).eq('id', pelajarId)
      if (error) { toast.error('Gagal kaitkan adik-beradik.'); return }
    }
    const { error } = await supabase.from('pelajar').update({ keluarga_id: kid }).eq('id', p.id)
    if (error) { toast.error('Gagal kaitkan adik-beradik.'); return }
    toast.success(`${p.nama_penuh} dikaitkan sebagai adik-beradik.`)
    setKeluargaId(kid)
    muat()
  }

  const keluarkan = async (a: Adik) => {
    const supabase = createClient()
    const { error } = await supabase.from('pelajar').update({ keluarga_id: null }).eq('id', a.id)
    if (error) { toast.error('Gagal keluarkan kaitan.'); return }
    // Jika tiada adik-beradik lagi, buang keluarga_id sendiri juga
    if (adik.length <= 1) {
      await supabase.from('pelajar').update({ keluarga_id: null }).eq('id', pelajarId)
      setKeluargaId(null)
    }
    toast.success(`${a.nama_penuh} dikeluarkan daripada kaitan.`)
    muat()
  }

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <Users size={15} style={{ color: 'var(--text-muted)' }} />
        <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>Adik-Beradik (Pakej)</h2>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Pelajar yang dikaitkan layak kadar pakej RM50 seorang semasa rekod bayaran. Kaitan disimpan serta-merta.
      </p>

      {loading ? (
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Memuatkan...</p>
      ) : (
        <>
          {adik.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
              {adik.map((a) => (
                <span
                  key={a.id}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: '#F7FEE7', border: '1px solid #D9F99D',
                    borderRadius: '20px', padding: '5px 6px 5px 12px',
                    fontSize: '12.5px', fontWeight: 600, color: 'var(--text)',
                  }}
                >
                  {a.nama_penuh}
                  <button
                    onClick={() => keluarkan(a)}
                    title="Keluarkan kaitan"
                    aria-label={`Keluarkan ${a.nama_penuh}`}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: 'var(--card)', border: '1px solid var(--border)',
                      cursor: 'pointer', color: 'var(--text-muted)', padding: 0,
                    }}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <CariPelajar onPilih={tambah} placeholder="Cari pelajar untuk dikaitkan..." />
        </>
      )}
    </div>
  )
}
