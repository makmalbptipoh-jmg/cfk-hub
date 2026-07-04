'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { toast } from '@/lib/stores/toast-store'

type ResitData = {
  nombor_resit: string
  nama_pelajar: string
  cawangan: string
  jenis: string
  bulan_bayaran: string
  tahun_bayaran: number
  jumlah: number
  kaedah_bayaran: string | null
  tarikh_bayar: string
  status: 'Aktif' | 'Dibatalkan'
  sebab_batal?: string | null
}

interface Props {
  data: ResitData
  kecil?: boolean
}

export function BtnUnduhResit({ data, kecil }: Props) {
  const [loading, setLoading] = useState(false)

  const unduh = async () => {
    setLoading(true)
    try {
      const { pdf } = await import('@react-pdf/renderer')
      const { ResitPDF } = await import('./ResitPDF')
      const blob = await pdf(<ResitPDF {...data} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const namaBersih = data.nama_pelajar.replace(/[\\/:*?"<>|]/g, '-')
      a.download = `Resit_${namaBersih}_${data.bulan_bayaran} ${data.tahun_bayaran}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`PDF resit ${data.nombor_resit} dimuat turun — semak folder Downloads.`)
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
      title="Muat turun PDF"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: kecil ? '4px' : '6px',
        padding: kecil ? '5px 10px' : '8px 14px',
        background: 'var(--bg)', border: '1px solid var(--border)',
        borderRadius: kecil ? '8px' : '10px',
        fontSize: kecil ? '12px' : '13px', fontWeight: 600,
        color: 'var(--text)', cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit', opacity: loading ? 0.6 : 1,
      }}
    >
      <Download size={kecil ? 12 : 14} />
      {loading ? 'Jana...' : 'PDF'}
    </button>
  )
}
