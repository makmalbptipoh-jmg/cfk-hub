/**
 * Pembantu ToyyibPay (server-only — JANGAN import dalam komponen 'use client').
 *
 * Env yang diperlukan:
 *   TOYYIBPAY_SECRET_KEY    — Secret Key dari User Profile ToyyibPay
 *   TOYYIBPAY_CATEGORY_CODE — Kod kategori (cipta di menu Category ToyyibPay)
 *   TOYYIBPAY_MODE          — 'production' untuk akaun sebenar; selain itu = sandbox (dev.toyyibpay.com)
 *
 * Dokumentasi: https://toyyibpay.com/apireference/
 */

const MODE = process.env.TOYYIBPAY_MODE === 'production' ? 'production' : 'sandbox'

export const toyyibpayBase =
  MODE === 'production' ? 'https://toyyibpay.com' : 'https://dev.toyyibpay.com'

export const toyyibpayMode = MODE

/** URL yang pembayar (ibu bapa) buka untuk bayar. */
export function urlBayar(billCode: string) {
  return `${toyyibpayBase}/${billCode}`
}

type CiptaBilInput = {
  namaBil: string          // billName ≤30 aksara (alfanumerik/ruang/underscore)
  penerangan: string       // billDescription ≤100 aksara
  jumlahSen: number        // billAmount dalam SEN (RM60 = 6000)
  rujukanLuar: string      // billExternalReferenceNo (ID permintaan kita)
  namaPembayar?: string
  emelPembayar?: string
  telefonPembayar?: string
  urlCallback: string      // server-to-server
  urlReturn: string        // browser pembayar selepas bayar
}

/**
 * Cipta satu bil ToyyibPay. Pulangkan billCode atau ralat.
 * Membersihkan aksara tak sah dari namaBil/penerangan (ToyyibPay hanya
 * terima alfanumerik + ruang + underscore).
 */
export async function ciptaBil(
  input: CiptaBilInput
): Promise<{ billCode?: string; ralat?: string }> {
  const secret = process.env.TOYYIBPAY_SECRET_KEY
  const category = process.env.TOYYIBPAY_CATEGORY_CODE
  if (!secret || !category) {
    return { ralat: 'ToyyibPay belum disetkan (secret key / category code tiada dalam env).' }
  }

  const bersih = (s: string, had: number) =>
    s.replace(/[^a-zA-Z0-9 _]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, had)

  const form = new URLSearchParams({
    userSecretKey: secret,
    categoryCode: category,
    billName: bersih(input.namaBil, 30) || 'Yuran CFK',
    billDescription: bersih(input.penerangan, 100) || 'Bayaran yuran CFK',
    billPriceSetting: '1',                 // 1 = harga tetap
    billPayorInfo: '0',                    // 0 = tak wajib maklumat pembayar (elak emel jadi mandatori)
    billAmount: String(Math.round(input.jumlahSen)),
    billReturnUrl: input.urlReturn,
    billCallbackUrl: input.urlCallback,
    billExternalReferenceNo: input.rujukanLuar,
    billTo: input.namaPembayar ?? '',
    billEmail: input.emelPembayar ?? '',
    billPhone: input.telefonPembayar ?? '',
    billPaymentChannel: '2',               // 0=FPX, 1=Kad, 2=kedua-dua
  })

  let data: unknown
  try {
    const res = await fetch(`${toyyibpayBase}/index.php/api/createBill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
      cache: 'no-store',
    })
    data = await res.json()
  } catch {
    return { ralat: 'Gagal hubungi ToyyibPay. Cuba lagi.' }
  }

  // Respons berjaya: [{ "BillCode": "xxxxxxxx" }]
  const billCode = Array.isArray(data) ? (data[0]?.BillCode as string | undefined) : undefined
  if (!billCode) {
    return { ralat: 'ToyyibPay tolak permintaan. Semak secret key / category code.' }
  }
  return { billCode }
}

export type StatusBil = 'Selesai' | 'Menunggu' | 'Gagal' | 'unknown'

/**
 * Ambil senarai transaksi bil. ToyyibPay balas teks "No data found!"
 * (BUKAN JSON) bila tiada transaksi lagi — kita baca sebagai teks dahulu
 * dan parse dengan selamat. Pulangkan [] jika tiada / ralat.
 */
async function ambilTransaksi(billCode: string): Promise<Array<Record<string, unknown>>> {
  const secret = process.env.TOYYIBPAY_SECRET_KEY
  if (!secret) return []
  const form = new URLSearchParams({ userSecretKey: secret, billCode })
  try {
    const res = await fetch(`${toyyibpayBase}/index.php/api/getBillTransactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
      cache: 'no-store',
    })
    const txt = await res.text()
    const data = JSON.parse(txt)
    return Array.isArray(data) ? data : []
  } catch {
    return [] // "No data found!" atau ralat rangkaian → dianggap tiada transaksi
  }
}

/**
 * Semak status pembayaran sebenar dari ToyyibPay (jangan bergantung pada
 * callback semata — ini pengesahan muktamad).
 * billpaymentStatus: '1'=berjaya, '2'/'4'=menunggu, '3'=gagal.
 */
export async function statusBil(billCode: string): Promise<StatusBil> {
  const data = await ambilTransaksi(billCode)
  if (data.length === 0) return 'Menunggu'
  if (data.some((t) => String(t?.billpaymentStatus) === '1')) return 'Selesai'
  if (data.some((t) => String(t?.billpaymentStatus) === '3')) return 'Gagal'
  return 'Menunggu'
}

/** No rujukan transaksi berjaya (untuk simpan dalam resit/permintaan). */
export async function rujukanTransaksi(billCode: string): Promise<string | null> {
  const data = await ambilTransaksi(billCode)
  const berjaya = data.find((t) => String(t?.billpaymentStatus) === '1')
  return (berjaya?.billpaymentInvoiceNo as string | undefined) ?? null
}
