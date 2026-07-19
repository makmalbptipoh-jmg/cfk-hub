import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { urlBayar, toyyibpayMode } from '@/lib/toyyibpay'
import { PermintaanKlient } from './_components/PermintaanKlient'

export const dynamic = 'force-dynamic'

export default async function PermintaanBayaranPage() {
  const supabase = await createClient()

  const { data: raw } = await supabase
    .from('permintaan_bayaran')
    .select('id, bill_code, nama_pelajar, no_telefon, jenis, bulan_bayaran, tahun_bayaran, jumlah, status, resit_id, created_at, dibayar_pada')
    .order('created_at', { ascending: false })
    .limit(200)

  const senarai = (raw ?? []).map((r) => ({
    ...r,
    url: urlBayar(r.bill_code),
  }))

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link href="/bayaran" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>
          ← Senarai Resit
        </Link>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>
          Permintaan Bayaran Online
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Link bayaran ToyyibPay yang dijana. Resit auto-dijana bila ibu bapa selesai bayar.
          {toyyibpayMode === 'sandbox' && (
            <span style={{ color: '#CA8A04', fontWeight: 600 }}> · MOD UJIAN (Sandbox)</span>
          )}
        </p>
      </div>

      <PermintaanKlient senarai={senarai} />
    </div>
  )
}
