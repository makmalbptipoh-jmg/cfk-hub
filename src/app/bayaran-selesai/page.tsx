import { selesaikanPermintaanBayaran } from '@/lib/bayaran-online-server'

export const dynamic = 'force-dynamic'

/**
 * Halaman AWAM tempat ibu bapa mendarat selepas bayar (billReturnUrl).
 * ToyyibPay hantar: status_id (1=berjaya, 2=menunggu, 3=gagal), billcode, order_id.
 * Kita cuba lengkapkan resit di sini juga (backup jika callback lambat) —
 * operasi idempoten + disahkan semula dengan ToyyibPay.
 */
export default async function BayaranSelesaiPage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const statusId = String(sp.status_id ?? sp.status ?? '')
  const billCode = String(sp.billcode ?? '')

  if (billCode && statusId === '1') {
    try {
      await selesaikanPermintaanBayaran(billCode)
    } catch {}
  }

  const berjaya = statusId === '1'
  const gagal = statusId === '3'
  const menunggu = !berjaya && !gagal

  const warna = berjaya ? '#16A34A' : gagal ? '#DC2626' : '#CA8A04'
  const latar = berjaya ? '#DCFCE7' : gagal ? '#FEE2E2' : '#FEF9C3'
  const ikon = berjaya ? '✓' : gagal ? '✕' : '⏳'
  const tajuk = berjaya
    ? 'Pembayaran Berjaya!'
    : gagal
      ? 'Pembayaran Tidak Berjaya'
      : 'Pembayaran Sedang Diproses'
  const mesej = berjaya
    ? 'Terima kasih. Bayaran yuran catur CFK telah kami terima. Resit rasmi akan diuruskan oleh pihak CFK.'
    : gagal
      ? 'Bayaran tidak dapat diselesaikan atau dibatalkan. Sila cuba semula atau hubungi pihak CFK.'
      : 'Bayaran anda sedang disahkan oleh bank. Ini mungkin mengambil sedikit masa. Anda boleh tutup halaman ini.'

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: '#F1F5F9',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '420px',
          width: '100%',
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '36px 28px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '24px',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-cfk.png" alt="Logo CFK" style={{ height: '34px', width: 'auto' }} />
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B' }}>CFK HUB</span>
        </div>

        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: latar,
            color: warna,
            fontSize: '34px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          {ikon}
        </div>

        <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#1E293B', marginBottom: '10px' }}>
          {tajuk}
        </h1>
        <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#64748B', margin: 0 }}>{mesej}</p>

        {menunggu && (
          <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '16px' }}>
            Rujukan bil: {billCode || '—'}
          </p>
        )}
      </div>
    </div>
  )
}
