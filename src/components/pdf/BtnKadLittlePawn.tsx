'use client'

import { useState } from 'react'
import { FileDown, Award } from 'lucide-react'
import { toast } from '@/lib/stores/toast-store'
import { namaFail } from '@/lib/grading'
import type { ItemLP, FokusLP } from './KadLittlePawnPDF'

export type PropsKadLP = {
  nama: string
  cawangan: string | null
  kitaranNama: string
  bintang: number
  items: ItemLP[]
  notaCoach: string | null
  fokus: FokusLP[]
  graduasi: boolean
}

export function BtnKadLittlePawn({ data }: { data: PropsKadLP }) {
  const [loadingR, setLoadingR] = useState(false)
  const [loadingS, setLoadingS] = useState(false)

  const unduhReport = async () => {
    setLoadingR(true)
    try {
      const { pdf } = await import('@react-pdf/renderer')
      const { KadLittlePawnPDF } = await import('./KadLittlePawnPDF')
      const blob = await pdf(
        <KadLittlePawnPDF
          nama={data.nama} cawangan={data.cawangan} kitaranNama={data.kitaranNama}
          bintang={data.bintang} items={data.items} notaCoach={data.notaCoach} fokus={data.fokus}
        />
      ).toBlob()
      turun(blob, `${namaFail('CFK_LittlePawn', data.nama, data.kitaranNama)}.pdf`)
      toast.success('Report dimuat turun.')
    } catch (e) { console.error(e); toast.error('Gagal jana report. Cuba lagi.') } finally { setLoadingR(false) }
  }

  const unduhSijil = async () => {
    setLoadingS(true)
    try {
      const { pdf } = await import('@react-pdf/renderer')
      const { SijilPawnPDF } = await import('./SijilPawnPDF')
      const blob = await pdf(<SijilPawnPDF nama={data.nama} cawangan={data.cawangan} kitaranNama={data.kitaranNama} />).toBlob()
      turun(blob, `${namaFail('CFK_Sijil_PawnPromotion', data.nama)}.pdf`)
      toast.success('Sijil dimuat turun.')
    } catch (e) { console.error(e); toast.error('Gagal jana sijil. Cuba lagi.') } finally { setLoadingS(false) }
  }

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <button onClick={unduhReport} disabled={loadingR} style={btn(false)}>
        <FileDown size={15} /> {loadingR ? 'Menjana…' : 'Muat Turun Report'}
      </button>
      {data.graduasi && (
        <button onClick={unduhSijil} disabled={loadingS} style={btn(true)}>
          <Award size={15} /> {loadingS ? 'Menjana…' : 'Muat Turun Sijil'}
        </button>
      )}
    </div>
  )
}

function turun(blob: Blob, nama: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nama
  a.click()
  URL.revokeObjectURL(url)
}

function btn(utama: boolean): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px',
    background: utama ? '#F5C400' : 'var(--primary)', border: 'none', borderRadius: '11px',
    fontSize: '13px', fontWeight: 700, color: utama ? '#5C4700' : '#FFFFFF', cursor: 'pointer', fontFamily: 'inherit',
  }
}
