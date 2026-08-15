import { JWT } from 'google-auth-library'

// ============================================================
// Pembaca Google Sheet — respons Google Form pendaftaran pelajar.
//
// Guna Service Account (baca sahaja). Sheet PRIVATE, jadi kredential
// diperlukan. Setup sekali: enable Google Sheets API, cipta service
// account + JSON key, dan SHARE spreadsheet ke email service account
// (akses Viewer).
//
// Env diperlukan:
//   GOOGLE_SERVICE_ACCOUNT_EMAIL
//   GOOGLE_PRIVATE_KEY            (literal '\n' ditukar ke newline)
//   GOOGLE_SHEET_ID
//   GOOGLE_SHEET_GID             (gid tab respons borang)
// ============================================================

export type BarisPendaftaran = {
  timestamp: string        // 'DD/MM/YYYY HH:MM:SS' mentah dari sheet
  cawanganPilihan: string  // BRANCH
  nama: string             // STUDENT'S NAME
  umur: string             // STUDENT'S AGE (tidak disimpan buat masa ini)
  alamat: string           // ADDRESS
  sekolah: string          // SCHOOL (tidak disimpan buat masa ini)
  namaIbuBapa: string      // PARENT NAME
  telefon: string          // PHONE NUMBER
}

const SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly'

function envWajib(nama: string): string {
  const nilai = process.env[nama]
  if (!nilai) {
    throw new Error(
      `Konfigurasi Google Sheet tidak lengkap: ${nama} tiada. ` +
        `Sila set env var GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, ` +
        `GOOGLE_SHEET_ID, GOOGLE_SHEET_GID.`
    )
  }
  return nilai
}

async function dapatToken(): Promise<string> {
  const email = envWajib('GOOGLE_SERVICE_ACCOUNT_EMAIL')
  // Vercel/.env simpan private key sebaris dgn '\n' literal — tukar balik.
  const key = envWajib('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n')

  const client = new JWT({ email, key, scopes: [SCOPE] })
  const { token } = await client.getAccessToken()
  if (!token) throw new Error('Gagal mendapatkan token Google (service account).')
  return token
}

// Cari tajuk tab yang sepadan dgn GOOGLE_SHEET_GID (spreadsheet ada
// banyak tab — kita hanya mahu tab respons borang).
async function dapatTajukTab(sheetId: string, token: string): Promise<string> {
  const gid = Number(envWajib('GOOGLE_SHEET_GID'))
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}` +
    `?fields=sheets(properties(sheetId,title))`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(
      `Gagal baca metadata Google Sheet (${res.status}). ` +
        `Pastikan Sheets API enabled & sheet dikongsi ke service account.`
    )
  }
  const data = (await res.json()) as {
    sheets?: { properties?: { sheetId?: number; title?: string } }[]
  }
  const tab = data.sheets?.find((s) => s.properties?.sheetId === gid)
  const tajuk = tab?.properties?.title
  if (!tajuk) {
    throw new Error(`Tab dgn gid ${gid} tidak dijumpai dalam spreadsheet.`)
  }
  return tajuk
}

function sel(row: string[], i: number): string {
  return (row[i] ?? '').toString().trim()
}

export async function bacaPendaftaranSheet(): Promise<BarisPendaftaran[]> {
  const sheetId = envWajib('GOOGLE_SHEET_ID')
  const token = await dapatToken()
  const tajuk = await dapatTajukTab(sheetId, token)

  // Lajur A:H = Timestamp..PHONE NUMBER (abai consent & spacer).
  const julat = encodeURIComponent(`${tajuk}!A:H`)
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${julat}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`Gagal baca nilai Google Sheet (${res.status}).`)
  }
  const data = (await res.json()) as { values?: string[][] }
  const semua = data.values ?? []

  // Baris pertama = header borang. Langkau + baris tanpa nama/timestamp.
  return semua
    .slice(1)
    .map((row) => ({
      timestamp: sel(row, 0),
      cawanganPilihan: sel(row, 1),
      nama: sel(row, 2),
      umur: sel(row, 3),
      alamat: sel(row, 4),
      sekolah: sel(row, 5),
      namaIbuBapa: sel(row, 6),
      telefon: sel(row, 7),
    }))
    .filter((b) => b.nama || b.timestamp)
}
