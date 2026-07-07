'use client'

import { useRouter } from 'next/navigation'
import { Filter } from 'lucide-react'

const NAMA_BULAN = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
]

type Cawangan = { id: string; nama: string }

export function DashboardFilter({
  cawangan,
  cawId,
  bulanNum,
  tahun,
  tahunSemasa,
}: {
  cawangan: Cawangan[]
  cawId: string
  bulanNum: number
  tahun: number
  tahunSemasa: number
}) {
  const router = useRouter()

  const kemasKini = (key: string, val: string) => {
    const params = new URLSearchParams()
    const nilai: Record<string, string> = { cawangan: cawId, bulan: String(bulanNum), tahun: String(tahun) }
    nilai[key] = val
    if (nilai.cawangan) params.set('cawangan', nilai.cawangan)
    params.set('bulan', nilai.bulan)
    params.set('tahun', nilai.tahun)
    router.push(`/dashboard?${params.toString()}`)
  }

  const gaya: React.CSSProperties = {
    padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: '10px',
    fontSize: '13px', color: 'var(--text)', background: 'var(--card)', outline: 'none',
    fontFamily: 'inherit', cursor: 'pointer',
  }

  const senaraiTahun = Array.from({ length: Math.max(1, tahunSemasa - 2024) }, (_, i) => 2025 + i)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '22px' }}>
      <Filter size={15} style={{ color: 'var(--text-muted)' }} />
      <select value={cawId} onChange={(e) => kemasKini('cawangan', e.target.value)} style={gaya}>
        <option value="">Semua Cawangan</option>
        {cawangan.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
      </select>
      <select value={bulanNum} onChange={(e) => kemasKini('bulan', e.target.value)} style={gaya}>
        {NAMA_BULAN.map((nama, i) => <option key={nama} value={i + 1}>{nama}</option>)}
      </select>
      <select value={tahun} onChange={(e) => kemasKini('tahun', e.target.value)} style={gaya}>
        {senaraiTahun.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
    </div>
  )
}
