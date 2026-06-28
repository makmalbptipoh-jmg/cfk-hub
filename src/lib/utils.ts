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
