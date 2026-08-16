// Parser fail "Ranking List" Swiss-Manager (.xls BIFF8 & .xlsx) guna SheetJS.
// Swiss-Manager export: 1-2 baris tajuk, satu baris header
// (Rank / SNo. / Name / FED / Pts / BH:GP / SB/C1 ...), baris pemain, lalu footer.

import * as XLSX from 'xlsx'

export type BarisRankingMentah = {
  kedudukan: number
  sno: number | null
  nama: string
  fed: string | null
  mata: number
  buchholz: number | null
  sonneborn: number | null
}

export type HasilParse = {
  tajuk: string | null
  baris: BarisRankingMentah[]
}

// Mata catur guna simbol pecahan: "7½" → 7.5, "½" → 0.5, "5" → 5.
export function parseMata(nilai: unknown): number {
  if (typeof nilai === 'number') return nilai
  let s = String(nilai ?? '').trim()
  if (!s) return 0
  s = s.replace(/½/g, '.5').replace(/¼/g, '.25').replace(/¾/g, '.75')
  // "7.5" ok; "7 .5" (jika simbol berasingan) → buang ruang dalam nombor
  s = s.replace(/\s+/g, '')
  const n = parseFloat(s)
  return Number.isFinite(n) ? n : 0
}

function parseNombor(nilai: unknown): number | null {
  if (nilai === null || nilai === undefined || nilai === '') return null
  const n = parseFloat(String(nilai).replace(/\s+/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

function norm(s: unknown): string {
  return String(s ?? '').trim().toLowerCase().replace(/\s+/g, '')
}

function cariLajur(header: unknown[], padanan: (h: string) => boolean): number {
  for (let i = 0; i < header.length; i++) {
    if (padanan(norm(header[i]))) return i
  }
  return -1
}

// Parse workbook mentah (array of rows) → HasilParse. Diasingkan supaya boleh diuji.
export function parseRowsRanking(rows: unknown[][]): HasilParse {
  // Cari baris header: ada 'rank' (atau 'rk') dan 'name'/'nama'.
  let headerIdx = -1
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const r = rows[i] ?? []
    const set = r.map(norm)
    const adaRank = set.some((h) => h === 'rank' || h === 'rk' || h === 'rk.')
    const adaNama = set.some((h) => h === 'name' || h === 'nama')
    if (adaRank && adaNama) { headerIdx = i; break }
  }
  if (headerIdx === -1) {
    throw new Error('Fail tidak dikenali — tiada baris header "Rank … Name". Pastikan ia fail Ranking List dari Swiss-Manager.')
  }

  const header = rows[headerIdx]
  const iKedudukan = cariLajur(header, (h) => h === 'rank' || h === 'rk' || h === 'rk.')
  const iSno = cariLajur(header, (h) => h === 'sno' || h === 'sno.' || h === 's.no' || h === 'startno' || h === 'sn')
  const iNama = cariLajur(header, (h) => h === 'name' || h === 'nama')
  const iFed = cariLajur(header, (h) => h === 'fed' || h === 'nat' || h === 'nation' || h === 'federation')
  const iMata = cariLajur(header, (h) => h === 'pts' || h === 'pts.' || h === 'points' || h === 'mata' || h === 'pkt')
  const iBuchholz = cariLajur(header, (h) => h.includes('bh') || h.includes('buchholz'))
  const iSonneborn = cariLajur(header, (h) => h.startsWith('sb') || h.includes('sonne'))

  if (iNama === -1 || iKedudukan === -1) {
    throw new Error('Format fail tidak lengkap — lajur "Rank" atau "Name" tidak dijumpai.')
  }

  const tajuk = headerIdx > 0 ? String(rows[0]?.[0] ?? '').trim() || null : null

  const baris: BarisRankingMentah[] = []
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i] ?? []
    const kedudukan = parseNombor(r[iKedudukan])
    // Baris footer (teks copyright dll) → kedudukan bukan integer positif → henti.
    if (kedudukan === null || !Number.isInteger(kedudukan) || kedudukan <= 0) continue
    const nama = String(r[iNama] ?? '').trim()
    if (!nama) continue
    baris.push({
      kedudukan,
      sno: iSno >= 0 ? parseNombor(r[iSno]) : null,
      nama,
      fed: iFed >= 0 ? (String(r[iFed] ?? '').trim() || null) : null,
      mata: iMata >= 0 ? parseMata(r[iMata]) : 0,
      buchholz: iBuchholz >= 0 ? parseNombor(r[iBuchholz]) : null,
      sonneborn: iSonneborn >= 0 ? parseNombor(r[iSonneborn]) : null,
    })
  }

  return { tajuk, baris }
}

// Baca buffer fail (.xls / .xlsx) → HasilParse.
export function parseRankingBuffer(buf: ArrayBuffer | Uint8Array): HasilParse {
  const data = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  const wb = XLSX.read(data, { type: 'array' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  if (!ws) throw new Error('Fail kosong — tiada helaian (sheet) dijumpai.')
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, blankrows: false, defval: null })
  return parseRowsRanking(rows)
}
