'use client'

import { useState } from 'react'
import { FileDown } from 'lucide-react'
import { toast } from '@/lib/stores/toast-store'
import { namaFail } from '@/lib/grading'
import type { KomponenGred } from './KadGredPDF'

export type PropsKadGred = {
  nama: string
  umur: number | null
  levelNama: string
  cawangan: string | null
  kitaranNama: string
  komponen: KomponenGred[]
  bonus: number
  skorAkhir: number
  gred: 'A' | 'B' | 'C' | 'D' | 'E'
  labelGred: string
  naikLevel: boolean
  levelBaru: string
  ratingMula: number | null
  ratingTamat: number | null
  komenCoach: string | null
  fokus: string
}

export function BtnKadGredPDF({ data }: { data: PropsKadGred }) {
  const [loading, setLoading] = useState(false)

  const unduh = async () => {
    setLoading(true)
    try {
      const { pdf } = await import('@react-pdf/renderer')
      const { KadGredPDF } = await import('./KadGredPDF')
      const blob = await pdf(<KadGredPDF {...data} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${namaFail('CFK_Report', data.nama, data.kitaranNama)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Laporan dimuat turun.')
    } catch (e) {
      console.error(e)
      toast.error('Gagal jana laporan. Refresh (Ctrl+Shift+R) dan cuba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={unduh}
      disabled={loading}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px',
        background: 'var(--primary)', border: 'none', borderRadius: '11px',
        fontSize: '13px', fontWeight: 700, color: '#FFFFFF', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
      }}
    >
      <FileDown size={15} />
      {loading ? 'Menjana…' : 'Muat Turun PDF'}
    </button>
  )
}
