'use client'

import { useState } from 'react'
import { Award } from 'lucide-react'
import { toast } from '@/lib/stores/toast-store'

type Data = {
  nama_penuh: string
  cawangan: string
  jenis_kelas: string
  total: { hadir: number; tidak_hadir: number; cuti: number }
  bilResit: number
  sudahBayarBulanIni?: boolean
}

export function BtnKadPelajar({ data }: { data: Data }) {
  const [loading, setLoading] = useState(false)

  const unduh = async () => {
    setLoading(true)
    try {
      const { pdf } = await import('@react-pdf/renderer')
      const { KadPelajarPDF } = await import('./KadPelajarPDF')
      const tahun = new Date().getFullYear()
      const blob = await pdf(
        <KadPelajarPDF
          nama_penuh={data.nama_penuh}
          cawangan={data.cawangan}
          jenis_kelas={data.jenis_kelas}
          total={data.total}
          bilResit={data.bilResit}
          tahun={tahun}
        />
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Kad_Pelajar_${data.nama_penuh.replace(/[\\/:*?"<>|]/g, '-')}_${tahun}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Kad Pelajar dimuat turun.')
    } catch (e) {
      console.error(e)
      toast.error('Gagal jana Kad Pelajar. Refresh (Ctrl+Shift+R) dan cuba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={unduh}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '9px 14px',
        background: 'var(--card)', border: '1.5px solid var(--border)',
        borderRadius: '10px', fontSize: '13px', fontWeight: 600,
        color: 'var(--text)', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
      }}
    >
      <Award size={14} />
      {loading ? 'Menjana...' : 'Kad Pelajar'}
    </button>
  )
}
