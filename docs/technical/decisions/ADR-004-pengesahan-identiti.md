# ADR-004: Bagaimana pengesahan identiti (authentication) pengguna dilakukan?

## Status
Diputuskan

## Konteks
CFK HUB mempunyai dua jenis pengguna:
- **Admin** (`is_admin: true`) — akses penuh
- **Jurulatih** (`is_admin: false`) — akses terhad (kehadiran, pelajar, makluman)

Selepas log masuk, sistem perlu halakan ke halaman yang betul berdasarkan peranan.

## Keputusan
**Supabase Auth** — e-mel + kata laluan

## Butiran Teknikal

### Aliran Log Masuk
```
Pengguna masukkan e-mel + kata laluan
         ↓
Supabase Auth sahkan kelayakan
         ↓
JWT token dijana + disimpan dalam cookie selamat
         ↓
Middleware Next.js semak token + is_admin flag
         ↓
is_admin=true → redirect /dashboard (Admin)
is_admin=false → redirect /kehadiran (Jurulatih)
```

### Pengurusan Sesi
| Perkara | Spesifikasi |
|---|---|
| Token jenis | JWT (diurus Supabase) |
| Tempoh sesi | 1 minggu (boleh konfigurasi) |
| Penyimpanan | httpOnly cookie (selamat) |
| Refresh token | Automatik via `@supabase/ssr` |

### Kawalan Akses (Row Level Security)
Supabase RLS policies digunakan untuk sekat akses data di peringkat pangkalan data:

```sql
-- Contoh: Jurulatih hanya boleh INSERT kehadiran untuk cawangan mereka
CREATE POLICY "jurulatih_insert_kehadiran" ON kehadiran
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = jurulatih_id);

-- Admin boleh buat apa sahaja
CREATE POLICY "admin_all" ON kehadiran
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()));
```

### Reset Kata Laluan (PD-002)
- Admin reset kata laluan Jurulatih terus melalui Supabase dashboard atau fungsi admin API
- Tiada aliran reset e-mel untuk Jurulatih (keputusan PD-002: Admin buat terus)

### Jadual Pengguna (profil)
```sql
CREATE TABLE pengguna_profil (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  nama TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  cawangan_id UUID REFERENCES cawangan(id),
  PRIMARY KEY (id)
);
```

## Sebab
1. Supabase Auth sudah terintegrasi dengan pangkalan data Supabase
2. RLS memastikan Jurulatih tidak boleh akses data yang bukan milik mereka walaupun jika ada bug dalam kod
3. Tidak perlu tulis backend auth dari awal
4. `@supabase/ssr` memudahkan integrasi dengan Next.js App Router

## Kesan
- Guna `@supabase/ssr` bukan `@supabase/auth-helpers-nextjs` (yang sudah deprecated)
- Middleware Next.js (`middleware.ts`) semak sesi pada setiap request
- Halaman `/login` adalah satu-satunya halaman awam
