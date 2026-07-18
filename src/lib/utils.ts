import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRinggit(amount: number): string {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatTarikh(dateStr: string): string {
  return new Intl.DateTimeFormat('ms-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function formatTarikhPendek(dateStr: string): string {
  return new Intl.DateTimeFormat('ms-MY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr))
}

// Hari terakhir bulan sebagai 'YYYY-MM-DD' TANPA toISOString —
// toISOString() menukar ke UTC (tolak 8 jam di Malaysia) menyebabkan
// 31 Jan jadi 30 Jan; rekod hari akhir bulan tercicir dari penapis.
export function akhirBulan(tahun: number, bulan1hingga12: number): string {
  const hari = new Date(tahun, bulan1hingga12, 0).getDate()
  return `${tahun}-${String(bulan1hingga12).padStart(2, '0')}-${String(hari).padStart(2, '0')}`
}

// Tarikh HARI INI waktu Malaysia (UTC+8) sebagai 'YYYY-MM-DD'.
// JANGAN guna new Date().toISOString() — di pelayan Vercel (UTC) dan
// antara 12 tengah malam–8 pagi MYT, ia memulangkan tarikh SEMALAM.
// Menambah 8 jam pada instant semasa lalu baca medan UTC = kalendar MYT,
// betul tanpa mengira zon masa pelayan atau browser.
export function tarikhTempatan(d: Date = new Date()): string {
  const myt = new Date(d.getTime() + 8 * 60 * 60 * 1000)
  return myt.toISOString().split('T')[0]
}

// Bulan semasa waktu Malaysia sebagai 'YYYY-MM'.
export function bulanTempatan(d: Date = new Date()): string {
  const myt = new Date(d.getTime() + 8 * 60 * 60 * 1000)
  return myt.toISOString().slice(0, 7)
}

export function getBulanTahun(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('ms-MY', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatNoTelefon(no: string): string {
  const cleaned = no.replace(/\D/g, '')
  if (cleaned.startsWith('60')) {
    return `+${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5)}`
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`
  }
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`
  }
  return no
}

// Nama hari minggu BM — indeks sama dengan getUTCDay() (0=Ahad ... 6=Sabtu).
export const HARI = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu']

// Nama bulan BM — indeks 0 = Januari. Nilai sama dengan yang disimpan dalam
// kolum bulan_bayaran (resit & bayaran_jurulatih).
export const NAMA_BULAN = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
]

// Hari minggu bagi tarikh 'YYYY-MM-DD' — dikira terus dari nombor, bebas zon masa.
export function hariMinggu(tarikh: string): number {
  const [y, m, d] = tarikh.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

// Tambah/tolak n hari pada tarikh 'YYYY-MM-DD' — dikira dari nombor
// (Date.UTC), bebas zon masa pelayan/browser.
export function tambahHari(tarikh: string, n: number): string {
  const [y, m, d] = tarikh.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().split('T')[0]
}

// Format masa Postgres TIME ('15:30:00' atau '15:30') → '3:30 PTG'.
// 12-jam dengan penanda BM: PG (pagi), TGH (tengah hari), PTG (petang), MLM (malam).
export function formatMasa(masa: string): string {
  const [jamStr, minitStr] = masa.split(':')
  const jam = Number(jamStr)
  const minit = minitStr ?? '00'
  const penanda = jam < 12 ? 'PG' : jam < 15 ? 'TGH' : jam < 19 ? 'PTG' : 'MLM'
  const jam12 = jam % 12 === 0 ? 12 : jam % 12
  return `${jam12}:${minit} ${penanda}`
}

export function kirYuranBulanan(jenisKelas: string): number {
  switch (jenisKelas) {
    case 'Kumpulan':
      return 70
    case 'Personal':
      return 150
    case 'Kumpulan+Personal':
      return 220
    default:
      return 70
  }
}
