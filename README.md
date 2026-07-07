# ♟ CFK HUB — Sistem Pengurusan Catur Untuk Kanak-Kanak

Sistem pengurusan dalaman untuk pusat latihan catur CFK (Catur Untuk Kanak-Kanak). Menguruskan pelajar, kehadiran, bayaran, jurulatih, kewangan, dan aset.

## Ciri Utama

- **Pelajar** — daftar/edit/import Google Forms; highlight tunggakan berperingkat (kuning→oren→merah); **sistem rating** (1 kehadiran = 1 bintang = 10 point, level catur) + **Kad Pelajar PDF** untuk ibu bapa
- **Kehadiran** — rekod harian (Hadir/Cuti/Tak Aktif), self-service jurulatih, semak/edit admin
- **Bayaran & Resit** — resit PDF, batal, edit; **resit pendapatan luar** (jualan peralatan/khidmat kursus)
- **Jurulatih** — profil, gaji ikut kehadiran (point/star), slip gaji PDF
- **Kewangan** — perbelanjaan, **pendapatan lain/sumbangan**, ringkasan, Laporan LHDN Excel (5 sheet), Laporan Tunggakan
- **Laporan Kehadiran** — per pelajar & **per kelas** (PDF + Excel)
- **Dashboard** — penapis Cawangan/Bulan/Tahun, **carta trend** bulanan
- **Notifikasi** — loceng amaran operasi + **log aktiviti/audit** (siapa cipta/edit/padam + log masuk)
- **Keselamatan** — RLS penuh, auto-logout 30 min, login tanpa autofill, pemantauan ralat Sentry

## Tech Stack

- **Frontend/Backend:** Next.js 16 + TypeScript + React 19
- **Database:** Supabase (PostgreSQL + Auth + Row Level Security)
- **Styling:** CSS Variables (inline styles)
- **PDF:** @react-pdf/renderer (lazy-loaded) · **Excel:** exceljs (lazy-loaded)
- **Deploy:** Vercel · **PWA:** @ducanh2912/next-pwa
- **Ujian:** Vitest · **CI:** GitHub Actions (typecheck + test + build)
- **Pemantauan ralat:** Sentry (@sentry/nextjs)

---

## Persediaan Awal

### 1. Clone & Pasang Pakej

```bash
git clone <repo-url>
cd cfk-hub
npm install
```

### 2. Konfigurasi Supabase

1. Buat projek baharu di [supabase.com](https://supabase.com)
   - Nama: `cfk-hub`
   - Region: `Southeast Asia (Singapore)`

2. Pergi ke **Settings → API** dan salin:
   - `Project URL`
   - `anon public` key
   - `service_role` key (rahsia)

3. Pergi ke **Settings → Database** dan salin:
   - `Connection string` (Direct connection, bukan pooler) — untuk backup

### 3. Fail `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SENTRY_DSN=            # pilihan — pemantauan ralat
```

### 4. Setup Skema Database

> **Nota:** Skema asas ada dalam `supabase/schema.sql`. Selepas itu, jalankan **SEMUA**
> migration dalam `scripts/sql/` dalam **Supabase → SQL Editor** (setiap fail selamat
> dijalankan berulang kali / idempotent). Urutan disyorkan:
>
> 1. `tambah-alamat-pelajar.sql` — kolum alamat pelajar
> 2. `tambah-kuantiti-aset.sql` — kuantiti × harga aset
> 3. `tambah-keluarga-pelajar.sql` — pakej adik-beradik (keluarga_id)
> 4. `indexes.sql` — 15 index prestasi
> 5. `tambah-bukti-perbelanjaan.sql` — kolum bukti + bucket `bukti-perbelanjaan`
> 6. `tambah-gambar-jurulatih.sql` — gambar profil + bucket `gambar-jurulatih`
> 7. `jurulatih-self-service.sql` — RLS kehadiran jurulatih (self-service)
> 8. `kehadiran-jurulatih-cawangan.sql` — cawangan + jenis kelas pada sesi jurulatih
> 9. `makluman-histori.sql` — sejarah makluman WA
> 10. `notifikasi.sql` — loceng amaran operasi
> 11. `log-aktiviti.sql` — log audit (trigger 10 jadual)
> 12. `pendapatan-lain.sql` — pendapatan lain/sumbangan + bucket `bukti-pendapatan`
> 13. `resit-pendapatan.sql` — nombor resit auto untuk pendapatan luar

Jalankan SQL berikut dalam **Supabase → SQL Editor** mengikut urutan:

```sql
-- 1. Jadual cawangan
CREATE TABLE cawangan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  alamat TEXT,
  status TEXT NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Tidak Aktif')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profil pengguna + trigger auto-buat
CREATE TABLE pengguna_profil (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  cawangan_id UUID REFERENCES cawangan(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO pengguna_profil (id, nama)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nama', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. Jadual pelajar
CREATE TABLE pelajar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_penuh TEXT NOT NULL,
  tarikh_lahir DATE,
  nama_ibu_bapa TEXT NOT NULL,
  no_telefon TEXT NOT NULL,
  emel_ibu_bapa TEXT,
  cawangan_daftar_id UUID NOT NULL REFERENCES cawangan(id),
  jenis_kelas TEXT NOT NULL DEFAULT 'Kumpulan' CHECK (jenis_kelas IN ('Kumpulan', 'Personal', 'Kumpulan+Personal')),
  yuran_bulanan NUMERIC(10,2) NOT NULL DEFAULT 70,
  status TEXT NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Tidak Aktif')),
  tarikh_daftar DATE NOT NULL DEFAULT CURRENT_DATE,
  sumber_daftar TEXT NOT NULL DEFAULT 'Manual' CHECK (sumber_daftar IN ('GoogleForms', 'Manual')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Jadual kehadiran
CREATE TABLE kehadiran (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pelajar_id UUID NOT NULL REFERENCES pelajar(id),
  tarikh DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Hadir', 'Tidak Hadir', 'Cuti')),
  nota TEXT,
  cawangan_daftar_id UUID NOT NULL REFERENCES cawangan(id),
  cawangan_sesi_id UUID NOT NULL REFERENCES cawangan(id),
  jurulatih_id UUID REFERENCES auth.users(id),
  direkod_oleh UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pelajar_id, tarikh)
);

-- 5. Jadual resit + nombor resit auto
CREATE SEQUENCE resit_seq START 1;

CREATE OR REPLACE FUNCTION jana_nombor_resit()
RETURNS TEXT AS $$
BEGIN
  RETURN 'CFK-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(nextval('resit_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

CREATE TABLE resit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombor_resit TEXT NOT NULL DEFAULT jana_nombor_resit() UNIQUE,
  pelajar_id UUID NOT NULL REFERENCES pelajar(id),
  bulan_bayaran TEXT NOT NULL,
  tahun_bayaran INTEGER NOT NULL,
  jenis TEXT NOT NULL CHECK (jenis IN ('Kumpulan', 'Personal', 'Pendaftaran')),
  jumlah NUMERIC(10,2) NOT NULL,
  kaedah_bayaran TEXT CHECK (kaedah_bayaran IN ('Tunai', 'Transfer')),
  tarikh_bayar DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Dibatalkan')),
  sebab_batal TEXT,
  tarikh_batal DATE,
  dibatal_oleh UUID REFERENCES auth.users(id),
  direkod_oleh UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Jadual jurulatih
CREATE TABLE jurulatih (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pengguna_id UUID REFERENCES auth.users(id),
  nama_penuh TEXT NOT NULL,
  no_ic TEXT,
  no_telefon TEXT,
  emel TEXT,
  cawangan_ids UUID[] NOT NULL DEFAULT '{}',
  kadar_bayaran NUMERIC(10,2),
  tarikh_mula DATE,
  pengalaman_ringkas TEXT,
  kelayakan TEXT,
  status TEXT NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Tidak Aktif')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Kehadiran jurulatih
CREATE TABLE kehadiran_jurulatih (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurulatih_id UUID NOT NULL REFERENCES jurulatih(id) ON DELETE CASCADE,
  tarikh DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Hadir', 'Tidak Hadir', 'Cuti')),
  nota TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(jurulatih_id, tarikh)
);

-- 8. Bayaran jurulatih
CREATE TABLE bayaran_jurulatih (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurulatih_id UUID NOT NULL REFERENCES jurulatih(id) ON DELETE CASCADE,
  bulan_bayaran TEXT NOT NULL,
  tahun_bayaran INTEGER NOT NULL,
  bilangan_sesi INTEGER NOT NULL DEFAULT 0,
  kadar_per_sesi NUMERIC(10,2) NOT NULL DEFAULT 0,
  jumlah NUMERIC(10,2) NOT NULL DEFAULT 0,
  tarikh_bayar DATE,
  status TEXT NOT NULL DEFAULT 'Belum Bayar' CHECK (status IN ('Sudah Bayar', 'Belum Bayar')),
  nota TEXT,
  direkod_oleh UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Perbelanjaan kewangan
CREATE TABLE kewangan_perbelanjaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tarikh DATE NOT NULL,
  kategori TEXT NOT NULL,
  penerangan TEXT NOT NULL,
  jumlah NUMERIC(10,2) NOT NULL,
  cawangan_id UUID REFERENCES cawangan(id),
  direkod_oleh UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Aset
CREATE TABLE aset (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  kategori TEXT,
  nilai_asal NUMERIC(10,2),
  tarikh_beli DATE,
  cawangan_id UUID REFERENCES cawangan(id),
  status TEXT NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Lupus')),
  sebab_lupus TEXT,
  tarikh_lupus DATE,
  nota TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Import antrian Google Forms
CREATE TABLE import_antrian (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_penuh TEXT NOT NULL,
  tarikh_lahir DATE,
  nama_ibu_bapa TEXT,
  no_telefon TEXT,
  cawangan_pilihan TEXT,
  adalah_pendua BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'Menunggu' CHECK (status IN ('Menunggu', 'Diimport', 'Ditolak')),
  tarikh_submit TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Fungsi semak admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT is_admin FROM pengguna_profil WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- 13. Row Level Security
ALTER TABLE cawangan ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengguna_profil ENABLE ROW LEVEL SECURITY;
ALTER TABLE pelajar ENABLE ROW LEVEL SECURITY;
ALTER TABLE kehadiran ENABLE ROW LEVEL SECURITY;
ALTER TABLE resit ENABLE ROW LEVEL SECURITY;
ALTER TABLE jurulatih ENABLE ROW LEVEL SECURITY;
ALTER TABLE kehadiran_jurulatih ENABLE ROW LEVEL SECURITY;
ALTER TABLE bayaran_jurulatih ENABLE ROW LEVEL SECURITY;
ALTER TABLE kewangan_perbelanjaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE aset ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_antrian ENABLE ROW LEVEL SECURITY;

-- Policies: pengguna log masuk boleh baca/tulis semua
CREATE POLICY "auth" ON cawangan FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth" ON pelajar FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth" ON kehadiran FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth" ON resit FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth" ON jurulatih FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth" ON kehadiran_jurulatih FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth" ON bayaran_jurulatih FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth" ON kewangan_perbelanjaan FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth" ON aset FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth" ON import_antrian FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "profil" ON pengguna_profil FOR ALL USING (auth.uid() = id OR is_admin(auth.uid()));
```

### 5. Data Awal (Seed)

```sql
INSERT INTO cawangan (nama, alamat) VALUES
  ('Klebang', 'Klebang, Ipoh, Perak'),
  ('Buntong', 'Buntong, Ipoh, Perak'),
  ('Sri Iskandar', 'Sri Iskandar, Perak'),
  ('SMK Star', 'SMK Star, Ipoh, Perak');
```

Kemudian buat akaun Admin melalui **Supabase → Authentication → Users → Add user**, dan update:
```sql
UPDATE pengguna_profil SET is_admin = TRUE, nama = 'Admin CFK' WHERE id = '[user-id]';
```

---

## Jalankan Pembangunan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## Deploy ke Vercel

1. Tolak kod ke GitHub
2. Import di [vercel.com](https://vercel.com) → New Project
3. Tambah environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   NEXT_PUBLIC_APP_URL=https://[nama].vercel.app
   NEXT_PUBLIC_SENTRY_DSN   # pilihan — pemantauan ralat (lihat bawah)
   ```
4. Deploy!

---

## Ujian & CI

```bash
npm test          # jalankan ujian unit (vitest) sekali
npm run test:watch  # mod tonton
```

Ujian meliputi logik tarikh waktu Malaysia (`tarikhTempatan`/`akhirBulan` —
kelas bug zon masa), format wang, dan sistem rating pelajar. GitHub Actions
(`.github/workflows/ci.yml`) jalankan typecheck + test + build pada setiap push/PR.

---

## Pemantauan Ralat (Sentry) — pilihan

1. Daftar percuma di [sentry.io](https://sentry.io) → cipta projek **Next.js**
2. Salin **DSN** (Settings → Client Keys) — DSN ialah kunci awam, selamat dikongsi
3. Tambah env `NEXT_PUBLIC_SENTRY_DSN` di Vercel (Production) + `.env.local`
4. Redeploy — ralat production (client/server/render) kini dilaporkan ke Sentry + amaran e-mel

Tanpa DSN, Sentry duduk diam (tiada kesan pada app). Kod: `src/instrumentation.ts`,
`src/instrumentation-client.ts`, `src/app/global-error.tsx`.

---

## Jana Ikon PWA

1. Buka `scripts/generate-icons.html` dalam Chrome
2. Klik **Muat Turun icon-512.png** dan **Muat Turun icon-192.png**
3. Salin kedua-dua fail ke folder `public/`
4. Deploy semula ke Vercel

---

## Cara Pasang PWA (untuk Jurulatih)

**Android (Chrome):** Menu ⋮ → "Pasang aplikasi" atau "Add to Home screen"

**iOS (Safari):** Ikon Share ⬆️ → "Add to Home Screen"

---

## Setup Backup Automatik

1. **GitHub → Repo → Settings → Secrets → Actions**
2. Tambah secret `DATABASE_URL` dengan nilai connection string Supabase Direct
   - Format: `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`
3. Backup berjalan automatik setiap Ahad 10:00 PG MYT
4. Backup manual: **Actions → Backup Database Mingguan → Run workflow**

---

## Akaun & Akses

| Role | Akses | Redirect selepas login |
|---|---|---|
| Admin | Semua skrin | `/dashboard` |
| Jurulatih | Kehadiran, Sesi Saya, Makluman, Dashboard, Log Keluar | `/kehadiran` |

---

## Yuran (DR-036)

| Jenis | Yuran |
|---|---|
| Kumpulan | RM 70/bulan |
| Personal | RM 150/bulan |
| Kumpulan + Personal | RM 220/bulan |

Pelajar yang hadir **≥ 4 sesi sebulan** dianggap wajib bayar yuran.
