# ADR-002: Apakah backend & pangkalan data untuk CFK HUB?

## Status
Diputuskan

## Konteks
CFK HUB memerlukan:
- Penyimpanan data berstruktur dan berkaitan (pelajar → resit → kehadiran)
- Query kompleks: "pelajar belum bayar bulan ini dengan ≥4 kehadiran"
- Pengurusan pengguna (Admin + Jurulatih)
- Penyimpanan fail PDF (pilihan)
- Bajet: RM 1–50/bulan

## Keputusan
**Supabase** — PostgreSQL + Auth + Storage + API dalam satu platform

## Butiran Teknikal

| Perkara | Pilihan |
|---|---|
| Pangkalan Data | PostgreSQL (via Supabase) |
| Versi | PostgreSQL 15+ |
| Region | ap-southeast-1 (Singapore) |
| ORM / Query Builder | Supabase JS Client (@supabase/supabase-js) |
| API | Supabase Auto-generated REST + Realtime API |

## Struktur Jadual Utama

```
pelajar
├── id, nama_penuh, tarikh_lahir, nama_ibu_bapa, no_telefon
├── cawangan_daftar, jenis_kelas, yuran_bulanan
├── status (Aktif/Tidak Aktif), tarikh_daftar

kehadiran
├── id, pelajar_id, tarikh, status (Hadir/Tidak Hadir/Cuti)
├── cawangan_daftar, cawangan_sesi  ← (One-Price Policy — PD-006)
├── nota, jurulatih_id, direkod_oleh

resit
├── id, nombor_resit (CFK-YYYY-NNNNN), pelajar_id
├── bulan_bayaran, jenis (Kumpulan/Personal/Pendaftaran)
├── jumlah, kaedah_bayaran, tarikh_bayar
├── status (Aktif/Dibatalkan), sebab_batal

jurulatih  ← (PD-023)
├── id, nama_penuh, no_ic, no_telefon, emel
├── cawangan[], kadar_bayaran, tarikh_mula, status
├── pengalaman_ringkas, kelayakan

kehadiran_jurulatih
├── id, jurulatih_id, tarikh, status, nota

bayaran_jurulatih
├── id, jurulatih_id, bulan_bayaran, bilangan_sesi
├── kadar_per_sesi, jumlah, tarikh_bayar, status, nota

kewangan_perbelanjaan
├── id, tarikh, kategori, penerangan, jumlah
├── cawangan_id (atau null jika Umum), lampiran_url

aset
├── id, nama, kategori, nilai_asal, tarikh_beli
├── cawangan_id, status, nota

cawangan
├── id, nama, alamat, status (Aktif/Tidak Aktif)

pengguna  ← (diurus via Supabase Auth)
├── id (uuid), email, is_admin, nama, cawangan_id
```

## Sebab
1. **PostgreSQL** sesuai untuk data berkaitan CFK — pelajar ada resit, resit ada kehadiran
2. **Tier percuma Supabase** mencukupi: 500MB DB, 1GB storage, unlimited API calls
3. **Row Level Security (RLS)** Supabase memudahkan kawalan akses per-baris tanpa kod backend extra
4. **Dashboard web** Supabase membolehkan Admin lihat dan edit data terus jika perlu
5. **Region Singapore** mengurangkan latency untuk pengguna Malaysia

## Had Tier Percuma Supabase
| Sumber | Had Percuma | Keperluan CFK (anggaran) |
|---|---|---|
| Pangkalan data | 500 MB | ~50 MB (untuk 500 pelajar, 3 tahun data) |
| Storage | 1 GB | ~200 MB (jika simpan PDF) |
| Pengguna Auth | 50,000 | 7 pengguna (1 Admin + 6 Jurulatih) |
| Edge Functions | 500K panggilan/bulan | Sangat mencukupi |

## Kesan
- Tiada backend custom perlu ditulis — Supabase handle CRUD secara automatik
- Row Level Security (RLS) digunakan untuk pastikan Jurulatih hanya boleh akses data mereka
- Semua query melalui `@supabase/supabase-js` dalam Next.js
