'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'
import { toast } from '@/lib/stores/toast-store'
import type { SlipGajiData } from './SlipGajiPDF'

interface Props {
  data: SlipGajiData
}

export function BtnSlipGaji({ data }: Props) {
  const [loading, setLoading] = useState(false)

  const unduh = async () => {
    setLoading(true)
    try {
      const { pdf } = await import('@react-pdf/renderer')
      const { SlipGajiPDF } = await import('./SlipGajiPDF')
      const blob = await pdf(<SlipGajiPDF {...data} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const namaBersih = data.nama_jurulatih.replace(/[\\/:*?"<>|]/g, '-')
      a.download = `Slip_Gaji_${namaBersih}_${data.bulan_bayaran} ${data.tahun_bayaran}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Slip gaji ${data.bulan_bayaran} ${data.tahun_bayaran} dimuat turun — semak folder Downloads.`)
    } catch (e) {
      console.error(e)
      toast.error('Gagal jana PDF. Sila refresh halaman (Ctrl+Shift+R) dan cuba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={unduh}
      disabled={loading}
      title="Muat turun slip gaji PDF"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '5px 10px',
        background: 'var(--bg)', border: '1px solid var(--border)',
        borderRadius: '8px',
        fontSize: '12px', fontWeight: 600,
        color: 'var(--text)', cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit', opacity: loading ? 0.6 : 1,
      }}
    >
      <FileText size={12} />
      {loading ? 'Jana...' : 'Slip'}
    </button>
  )
}
