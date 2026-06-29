# ADR-001: Apakah stack frontend untuk CFK HUB?

## Status
Diputuskan

## Konteks
CFK HUB memerlukan satu codebase yang menyokong dua platform:
- **Web (Desktop)** — Antara muka Admin dengan sidebar navigasi
- **PWA (Mobile)** — Antara muka Jurulatih dengan bottom tab bar

Pembangun adalah individu yang belajar sambil membina, dengan sokongan Claude Code.

## Keputusan
**Next.js 14+ (App Router) + TypeScript**

## Butiran Teknikal

| Perkara | Pilihan |
|---|---|
| Framework | Next.js 14+ |
| Bahasa | TypeScript |
| Styling | Tailwind CSS |
| Pengurusan Keadaan | Zustand (state global) + TanStack Query (data fetching) |
| Pengesahan Borang | React Hook Form + Zod |
| Ikon | Lucide React |

## Sebab
1. Next.js adalah framework React paling popular — banyak tutorial Bahasa Melayu dan Inggeris
2. Integrasi terbaik dengan Vercel (platform hosting yang dipilih)
3. Claude Code paling mahir dengan Next.js — pembinaan AI lebih berkesan
4. App Router menyokong rendering fleksibel (SSR + CSR)
5. TypeScript mengurangkan bug dan memudahkan AI faham struktur data
6. Tailwind CSS mempercepatkan pembinaan UI tanpa tulis CSS dari awal

## Kesan
- Semua kod frontend dalam folder `/src/app/` (App Router)
- Komponen boleh guna semula dalam folder `/src/components/`
- Jenis data TypeScript dalam folder `/src/types/`
- API calls melalui Supabase JS client
