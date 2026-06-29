# ADR-003: Di mana CFK HUB di-host dan bagaimana ia di-deploy?

## Status
Diputuskan

## Konteks
Memerlukan hosting untuk Next.js (frontend) + Supabase (backend). Bajet RM 1–50/bulan.

## Keputusan
**Vercel** (frontend) + **Supabase** (backend/database) — kedua-dua menggunakan tier percuma

## Butiran Teknikal

### Vercel (Frontend)
| Perkara | Spesifikasi |
|---|---|
| Platform | Vercel (vercel.com) |
| Plan | Hobby (percuma) |
| Domain | `cfkhub.vercel.app` (percuma) atau domain `.my` sendiri |
| Build | Automatik dari GitHub pada setiap push ke `main` |
| Region | iad1 (US East) — sudah mencukupi untuk Malaysia |
| Environment Variables | Simpan `SUPABASE_URL`, `SUPABASE_ANON_KEY` dalam Vercel dashboard |

### Supabase (Backend)
| Perkara | Spesifikasi |
|---|---|
| Platform | Supabase (supabase.com) |
| Plan | Free tier |
| Region | ap-southeast-1 (Singapore) |
| Paused selepas 1 minggu tidak aktif | Ya (tier percuma) — boleh reactive bila perlu |

### Aliran Deploy
```
Push ke GitHub (branch: main)
         ↓
Vercel auto-detect perubahan
         ↓
Vercel build Next.js (npm run build)
         ↓
Deploy ke CDN global Vercel
         ↓
URL baharu aktif dalam ~2 minit
```

## Domain
- **Pilihan 1 (Percuma):** `cfkhub.vercel.app`
- **Pilihan 2 (Berbayar):** Domain `.my` dari Shinjiru/Exabytes (~RM 50–80/tahun)

## Repositori Kod
- Platform: **GitHub** (percuma untuk repositori peribadi)
- Struktur branch: `main` (produksi) + `develop` (pembangunan)

## Sebab
1. Vercel adalah platform rasmi untuk Next.js — zero konfigurasi
2. Deploy automatik dari GitHub — push, siap
3. Kedua-dua percuma dan mencukupi untuk skala CFK (7 pengguna)
4. Tiada konfigurasi server atau DevOps diperlukan

## Kesan
- Pembangun perlu buat akaun: GitHub + Vercel + Supabase (semua percuma)
- Sambungkan repo GitHub ke Vercel untuk auto-deploy
- Simpan semua kunci rahsia sebagai environment variables di Vercel (bukan dalam kod)
