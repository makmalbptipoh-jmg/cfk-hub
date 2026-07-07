import { formatRinggit } from '@/lib/utils'

const BULAN_SINGKAT = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis']

function CartaBar({
  tajuk,
  data,
  warna,
  jenis,
}: {
  tajuk: string
  data: number[]
  warna: string
  jenis: 'rm' | 'num'
}) {
  const max = Math.max(...data, 1)
  const jumlah = data.reduce((s, v) => s + v, 0)
  const fmt = (v: number) => (jenis === 'rm' ? formatRinggit(v) : String(v))

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{tajuk}</h3>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Jumlah: <strong style={{ color: 'var(--text)' }}>{fmt(jumlah)}</strong></span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', height: '110px' }}>
        {data.map((v, i) => {
          const tinggi = max > 0 ? Math.round((v / max) * 100) : 0
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
              <div
                title={`${BULAN_SINGKAT[i]}: ${fmt(v)}`}
                style={{
                  width: '100%',
                  height: `${Math.max(tinggi, v > 0 ? 4 : 0)}%`,
                  minHeight: v > 0 ? '3px' : '0',
                  background: warna,
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.2s',
                }}
              />
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: '5px', marginTop: '6px' }}>
        {BULAN_SINGKAT.map((b, i) => (
          <span key={i} style={{ flex: 1, textAlign: 'center', fontSize: '9px', color: 'var(--text-muted)' }}>{b[0]}</span>
        ))}
      </div>
    </div>
  )
}

export function CartaTrend({ pendapatan, kehadiran, tahun }: { pendapatan: number[]; kehadiran: number[]; tahun: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
      <CartaBar tajuk={`Pendapatan Bulanan ${tahun}`} data={pendapatan} warna="#84CC16" jenis="rm" />
      <CartaBar tajuk={`Kehadiran Bulanan ${tahun}`} data={kehadiran} warna="#3B82F6" jenis="num" />
    </div>
  )
}
