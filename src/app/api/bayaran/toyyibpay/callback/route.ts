import { NextResponse } from 'next/server'
import { selesaikanPermintaanBayaran } from '@/lib/bayaran-online-server'

/**
 * Callback server-ke-server dari ToyyibPay (POST, form-encoded) apabila
 * status bayaran berubah. Kita SENTIASA sahkan semula dengan ToyyibPay
 * dalam selesaikanPermintaanBayaran() — tidak percaya kandungan POST ini
 * membuta (elak resit palsu dari permintaan yang dipalsukan).
 *
 * Route ini awam (di-whitelist dalam proxy.ts) — ToyyibPay tiada sesi login.
 */
export async function POST(request: Request) {
  let billCode = ''
  let status = ''
  try {
    const form = await request.formData()
    billCode = String(form.get('billcode') ?? '')
    status = String(form.get('status') ?? '')
  } catch {
    return new NextResponse('BAD REQUEST', { status: 400 })
  }

  // status '1' = berjaya. Untuk selamat kita tetap sahkan via API ToyyibPay.
  if (billCode && status === '1') {
    try {
      await selesaikanPermintaanBayaran(billCode)
    } catch {
      // Jangan pulangkan ralat — ToyyibPay akan cuba semula & admin boleh
      // "Semak Status" manual. Sentiasa balas OK supaya tidak berulang tanpa henti.
    }
  }

  return new NextResponse('OK', { status: 200 })
}

// Sesetengah konfigurasi ToyyibPay memanggil return/callback via GET juga.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const billCode = searchParams.get('billcode') ?? ''
  const status = searchParams.get('status_id') ?? searchParams.get('status') ?? ''
  if (billCode && status === '1') {
    try {
      await selesaikanPermintaanBayaran(billCode)
    } catch {}
  }
  return new NextResponse('OK', { status: 200 })
}
