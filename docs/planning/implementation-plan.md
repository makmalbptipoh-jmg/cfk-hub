# Pelan Pelaksanaan (Implementation Plan) — CFK HUB

**Versi:** 1.0  
**Tarikh:** 27 Jun 2026  
**Pendekatan:** Ciri-demi-Ciri (Feature-by-Feature)  
**Stack:** Next.js 14 + TypeScript + Supabase + Tailwind CSS + Vercel  

---

## Cara Guna Pelan Ini

Setiap bahagian (Part) adalah satu sesi pembinaan yang boleh diselesaikan dengan bantuan Claude Code.  
Mulakan setiap sesi dengan: *"Bina CFK HUB mengikut implementation plan. Teruskan dari Part [X]."*

Periksa `/docs/planning/implementation-status.md` untuk lihat status terkini.

---

## Gambaran Keseluruhan Bahagian

| Bahagian | Nama | Skrin | Fasa |
|---|---|---|---|
| **Part 0** | Asas Projek | — | Pra-Fasa 1 |
| **Part A** | Log Masuk & Navigasi | S-01 | Fasa 1 |
| **Part B** | Modul Pelajar | S-03, S-04, S-05, S-06, S-09 + M-04, M-05, P-02 | Fasa 1 |
| **Part C** | Modul Kehadiran (Jurulatih) | S-08, S-07, S-23 | Fasa 1 |
| **Part D** | Modul Jurulatih | S-24, S-25, S-26, S-21, S-22 + M-03 | Fasa 1 |
| **Part E** | Dashboard Admin | S-02 | Fasa 1 |
| **Part F** | Modul Bayaran & Resit | S-11, S-12, S-13a + M-01, P-01 | Fasa 2 |
| **Part G** | Laporan & Makluman | S-13, S-16 | Fasa 2 |
| **Part H** | Jurulatih Lanjutan | S-27, S-28 + M-06 | Fasa 2 |
| **Part I** | Kewangan & Aset | S-14, S-15, S-18, S-19 + M-02 | Fasa 3 |
| **Part J** | Kelas Personal & Laporan Kewangan | S-17, S-20 | Fasa 3 |
| **Part K** | PWA, Backup & Pelancaran | — | Fasa 3 |

> **Ciri selepas pelancaran (Sesi 5–7):** Pendapatan Lain/Sumbangan, Log Aktiviti, Notifikasi, Jurulatih self-service, dan **Dokumen Jualan** (Sebut Harga/Invois/Resit, S-30) TIDAK termasuk dalam jadual Part 0–K asal di atas. Ciri-ciri ini dibina selepas pelancaran dan dijejak penuh dalam **`implementation-status.md`** (log ikut sesi).

---

## PART 0 — Asas Projek (Foundation)

**Tujuan:** Sediakan projek kosong yang berfungsi, bersambung ke Supabase, dan boleh di-deploy ke Vercel.

### 0.1 Cipta Projek Next.js

```bash
npx create-next-app@latest cfk-hub \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

### 0.2 Pasang Packages

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install zustand @tanstack/react-query
npm install react-hook-form zod @hookform/resolvers
npm install @react-pdf/renderer
npm install lucide-react
npm install clsx tailwind-merge
npm install next-pwa
```

### 0.3 Konfigurasi Supabase

**Buat projek Supabase:**
1. Pergi ke `supabase.com` → New Project
2. Nama: `cfk-hub`
3. Region: `Southeast Asia (Singapore)`
4. Salin `Project URL` dan `anon public` key

**Buat fail `.env.local`:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 0.4 Setup Supabase Clients

Cipta 3 fail:
- `src/lib/supabase/client.ts` — browser client (untuk komponen 'use client')
- `src/lib/supabase/server.ts` — server client (untuk Server Components)
- `src/lib/supabase/middleware.ts` — untuk `middleware.ts`

### 0.5 Cipta Skema Pangkalan Data

Jalankan SQL berikut dalam **Supabase SQL Editor** (ikut urutan):

1. Jadual `cawangan`
2. Jadual `pengguna_profil` (trigger auto-create apabila user baru daftar)
3. Jadual `pelajar`
4. Jadual `kehadiran`
5. Jadual `resit` + sequence + fungsi `jana_nombor_resit()`
6. Jadual `jurulatih`
7. Jadual `kehadiran_jurulatih`
8. Jadual `bayaran_jurulatih`
9. Jadual `kewangan_perbelanjaan`
10. Jadual `aset`
11. Jadual `import_antrian` + trigger `detect_import_pendua()`
12. Aktifkan Row Level Security + semua policies

### 0.6 Seed Data Awal

Masukkan data permulaan dalam Supabase:

```sql
-- 4 cawangan CFK
INSERT INTO cawangan (nama, alamat) VALUES
  ('Klebang', 'Klebang, Ipoh, Perak'),
  ('Buntong', 'Buntong, Ipoh, Perak'),
  ('Sri Iskandar', 'Sri Iskandar, Perak'),
  ('SMK Star', 'SMK Star, Ipoh, Perak');

-- Akaun Admin (buat dahulu melalui Supabase Auth Dashboard)
-- Kemudian update is_admin = true dalam pengguna_profil
```

### 0.7 Setup Middleware Auth

Cipta `src/middleware.ts` — lindungi semua halaman kecuali `/login`

### 0.8 Konfigurasi PWA

Konfigurasi `next.config.js` dengan `next-pwa` dan cipta `public/manifest.json`

### 0.9 Setup Vercel

1. Tolak kod ke GitHub (repositori peribadi)
2. Import repositori dalam `vercel.com`
3. Tambah environment variables dalam Vercel dashboard
4. Deploy!

**✅ Pengesahan Part 0 Selesai:**
- [ ] `npm run dev` berjalan tanpa ralat
- [ ] Sambungan Supabase berfungsi
- [ ] Semua jadual wujud dalam Supabase
- [ ] Vercel deployment berjaya
- [ ] URL `https://cfkhub.vercel.app` boleh diakses

---

## PART A — Log Masuk & Navigasi

**Skrin:** S-01  
**Merujuk:** ADR-004 (Auth), DD-001, DD-004, DD-005, DRD Seksyen 5.7-5.8

### A.1 Halaman Log Masuk (S-01)

**Route:** `/login`

Komponen yang perlu dibina:
- Borang e-mel + kata laluan
- Validasi menggunakan `react-hook-form` + `zod`
- Panggil `supabase.auth.signInWithPassword()`
- Selepas berjaya: semak `is_admin` dari `pengguna_profil`
  - `is_admin = true` → redirect `/dashboard`
  - `is_admin = false` → redirect `/kehadiran`
- Paparan ralat jika kelayakan salah

**UI yang perlu dibina:**
- Kad log masuk berpusat di skrin
- Logo CFK HUB (ikon ♟ + nama)
- Input e-mel dan kata laluan
- Butang "Log Masuk"
- Teks kecil: "Terlupa kata laluan? Hubungi Admin."

### A.2 Layout Admin (Sidebar)

**Fail:** `src/app/(admin)/layout.tsx`

Komponen `<Sidebar>`:
- Lebar: 220px, latar `#1E293B`, `border-radius: 0 24px 24px 0` (Moden)
- Logo CFK HUB di atas
- 9 modul navigasi dengan ikon Lucide
- Footer: avatar pengguna + nama + role
- Item aktif: latar `#84CC16`, teks `#1E293B`
- Item hover: `rgba(255,255,255,0.06)`

### A.3 Layout Jurulatih (Bottom Tab Bar)

**Fail:** `src/app/(jurulatih)/layout.tsx`

Komponen `<BottomTabBar>`:
- 4 tab: Kehadiran, Pelajar, Makluman, Dashboard
- Latar `#1E293B`
- Tab aktif: warna `#84CC16`
- `max-width: 390px`, berpusat

### A.4 Log Keluar

- Butang "Log Keluar" dalam sidebar footer
- Panggil `supabase.auth.signOut()` → redirect `/login`

**✅ Pengesahan Part A Selesai:**
- [ ] Log masuk Admin → redirect ke `/dashboard`
- [ ] Log masuk Jurulatih → redirect ke `/kehadiran`
- [ ] Log masuk dengan kelayakan salah → paparan mesej ralat
- [ ] Akses `/dashboard` tanpa log masuk → redirect ke `/login`
- [ ] Sidebar dipaparkan dengan betul
- [ ] Bottom Tab Bar dipaparkan pada skrin ≤390px

---

## PART B — Modul Pelajar

**Skrin:** S-03, S-04, S-05, S-06, S-09 + M-04, M-05, P-02  
**Merujuk:** PD-003, PD-006, PD-016, PD-021, DD-006, DD-008, DRD Seksyen 5.5

### B.1 Senarai Pelajar (S-03) — Admin

**Route:** `/pelajar`

- Jadual dengan kolum: Nama, Cawangan, Jenis, Yuran, Ibu Bapa, Status, Tindakan
- Carian: nama atau nombor telefon
- Penapis: Cawangan (dropdown) + Status (Aktif/Tidak Aktif)
- Butang: `[+ Tambah Pelajar]` → S-05, `[↓ Import Google Forms]` → S-09
- Penomboran halaman (10 rekod per halaman)
- Keadaan kosong jika tiada pelajar

### B.2 Tambah Pelajar — Stepper 3 Langkah (S-05)

**Route:** `/pelajar/baharu`

**Langkah 1: Maklumat Pelajar**
- `nama_penuh` (wajib)
- `tarikh_lahir` (pilihan)
- `jenis_kelas`: Kumpulan / Personal / Kumpulan+Personal

**Langkah 2: Maklumat Ibu Bapa & Cawangan**
- `nama_ibu_bapa` (wajib)
- `no_telefon` (wajib, format 01X-XXXXXXX)
- `emel_ibu_bapa` (pilihan)
- `cawangan_daftar_id` (dropdown, wajib)
- `yuran_bulanan` (dikira automatik berdasarkan jenis)

**Langkah 3: Semak & Sahkan**
- Paparan semua maklumat untuk disemak
- Butang `[← Kembali Edit]` dan `[Daftar Pelajar]`

### B.3 Profil Pelajar (S-04)

**Route:** `/pelajar/[id]`

- Maklumat peribadi pelajar
- Statistik kehadiran: jumlah hadir/tidak hadir/cuti bulan ini
- Status yuran bulan ini (berdasarkan DR-036: ≥4 kelas = perlu bayar)
- Tab: Kehadiran | Bayaran
- Butang: `[Edit]`, `[Nyahaktifkan]` → M-04

### B.4 Edit Pelajar (S-06)

**Route:** `/pelajar/[id]/edit`

- Borang tunggal (bukan stepper — edit, bukan tambah baru)
- Semua medan boleh dikemas kini
- Butang `[Batal]` dan `[Simpan Perubahan]`

### B.5 Modal Nyahaktifkan Pelajar (M-04)

- Mesej: "Pelajar ini tidak akan muncul dalam senarai semasa. Rekod kekal dalam sistem."
- Butang `[Batal]` dan `[Nyahaktifkan]`
- Selepas nyahaktif: status → `Tidak Aktif`, redirect ke S-03

### B.6 Import Google Forms (S-09)

**Route:** `/pelajar/import`

- Senarai rekod dalam `import_antrian` dengan status `Menunggu`
- Rekod pendua (`adalah_pendua = true`) ditandakan merah
- Checkbox untuk pilih rekod yang hendak diimport
- Butang `[Sahkan Import (X rekod)]` → M-05

### B.7 Modal Sahkan Import (M-05)

- Paparan ringkas: "X rekod akan diimport, Y rekod akan dilangkau"
- Butang `[Batal]` dan `[Sahkan Import]`
- Selepas import: data masuk ke jadual `pelajar`, status dalam `import_antrian` → `Diimport`

### B.8 Panel Carian Pelajar (P-02)

- Komponen yang boleh digunakan dalam pelbagai halaman
- Input carian (minimum 2 aksara untuk trigger)
- Papar cadangan: nama + cawangan + status
- Digunakan dalam: S-12 (pilih pelajar untuk rekod bayaran)

**✅ Pengesahan Part B Selesai:**
- [ ] Senarai pelajar dipapar dengan penomboran
- [ ] Carian dan penapis berfungsi
- [ ] Stepper tambah pelajar (3 langkah) berfungsi
- [ ] Data berjaya disimpan dalam Supabase
- [ ] Profil pelajar memapar statistik kehadiran
- [ ] Nyahaktifkan pelajar berfungsi (dan boleh diaktifkan semula)
- [ ] Import dari antrian Google Forms berfungsi

---

## PART C — Modul Kehadiran

**Skrin:** S-08, S-07, S-23  
**Merujuk:** PD-004, PD-005, PD-006, DR-036, DD-005

### C.1 Rekod Kehadiran — Jurulatih (S-08)

**Route:** `/kehadiran` (Jurulatih)

- Header topbar: "Rekod Kehadiran" + tarikh semasa
- Penapis chip: Semua Cawangan / Klebang / Buntong / Sri Iskandar / SMK Star
- Senarai SEMUA pelajar aktif (bukan hanya cawangan daftar — PD-006)
- Setiap pelajar: nama, cawangan daftar, 3 butang toggle (Hadir / Tidak Hadir / Cuti)
- "Save Bar" di bahagian bawah: `[Simpan Rekod Kehadiran]`
- Selepas simpan: mesej berjaya, reset toggle

**Logik penting:**
- `cawangan_daftar_id` = cawangan pendaftaran pelajar
- `cawangan_sesi_id` = cawangan yang dipilih dalam penapis chip (One-Price Policy)
- Rekod kehadiran disimpan dengan KEDUA-DUA nilai

### C.2 Semak Kehadiran — Admin (S-07)

**Route:** `/kehadiran` (Admin)

- Pilih tarikh (date picker)
- Pilih cawangan
- Papar senarai rekod kehadiran pada tarikh tersebut
- Admin boleh edit rekod dalam 7 hari lepas (PD-004)
- Admin boleh edit rekod bila-bila masa (tiada had)

### C.3 Dashboard Jurulatih (S-23)

**Route:** `/dashboard` (Jurulatih)

- Kad statistik: kehadiran hari ini, minggu ini
- Senarai pelajar yang BELUM ditandakan kehadiran hari ini
- Butang pintasan ke halaman Rekod Kehadiran

**✅ Pengesahan Part C Selesai:**
- [ ] Jurulatih boleh lihat SEMUA pelajar aktif (termasuk cawangan lain)
- [ ] Toggle Hadir/Tidak Hadir/Cuti berfungsi
- [ ] Rekod disimpan dengan kedua-dua cawangan_daftar + cawangan_sesi
- [ ] Admin boleh semak dan edit rekod kehadiran
- [ ] Dashboard Jurulatih papar statistik ringkas

---

## PART D — Modul Jurulatih

**Skrin:** S-24, S-25, S-26, S-21, S-22 + M-03  
**Merujuk:** PD-002, PD-020, PD-023

### D.1 Senarai Jurulatih (S-24)

**Route:** `/jurulatih`

- Jadual: Nama, Cawangan, Kadar/Sesi, Tarikh Mula, Status, Tindakan
- Butang: `[+ Tambah Jurulatih]`
- Badge status: Aktif / Tidak Aktif

### D.2 Tambah / Edit Jurulatih (S-26)

**Route:** `/jurulatih/baharu` atau `/jurulatih/[id]/edit`

Borang tunggal (bukan stepper — kurang 10 medan):
- `nama_penuh`, `no_ic`, `no_telefon`, `emel`
- `cawangan_ids` (multi-select checkbox)
- `kadar_bayaran` (RM per sesi)
- `tarikh_mula`
- `pengalaman_ringkas` (textarea)
- `kelayakan`

### D.3 Profil Jurulatih (S-25)

**Route:** `/jurulatih/[id]`

- Maklumat peribadi + pengalaman ringkas
- Statistik 3 bulan terkini: bilangan sesi hadir
- Status bayaran bulan semasa
- Tab navigasi: Profil | Kehadiran | Bayaran

### D.4 Pengurusan Pengguna (S-21)

**Route:** `/tetapan/pengguna`

- Senarai akaun sistem (Admin + Jurulatih)
- Butang `[+ Tambah Akaun]` — cipta akaun Supabase Auth baharu
- Butang `[Reset Kata Laluan]` → M-03
- Toggle status Aktif/Tidak Aktif

### D.5 Modal Reset Kata Laluan (M-03)

- Input kata laluan baharu (Admin taip)
- Guna Supabase Admin API: `supabase.auth.admin.updateUserById()`
- Nota: Admin maklumkan kata laluan baharu kepada Jurulatih secara lisan/WhatsApp

### D.6 Pengurusan Cawangan (S-22)

**Route:** `/tetapan/cawangan`

- Senarai cawangan: nama, alamat, status
- Butang `[+ Tambah Cawangan]`
- Butang `[Edit]` dan `[Nyahaktifkan]`

**✅ Pengesahan Part D Selesai:**
- [ ] Profil Jurulatih boleh ditambah dengan semua medan
- [ ] Cawangan boleh ditambah dan diurus dinamik
- [ ] Reset kata laluan Jurulatih berfungsi
- [ ] Senarai pengguna sistem dipapar dengan betul

---

## PART E — Dashboard Admin

**Skrin:** S-02  
**Merujuk:** PD-009, DR-036, DRD Seksyen 5.11

### E.1 Dashboard Admin (S-02)

**Route:** `/dashboard`

**4 Widget:**

1. **Pelajar Belum Bayar** — kiraan pelajar dengan ≥4 kehadiran bulan ini tapi tiada resit aktif
   ```sql
   -- Query: pelajar dengan ≥4 kehadiran bulan semasa tapi tiada resit
   SELECT p.* FROM pelajar p
   WHERE p.status = 'Aktif'
   AND (SELECT COUNT(*) FROM kehadiran k
        WHERE k.pelajar_id = p.id
        AND DATE_TRUNC('month', k.tarikh) = DATE_TRUNC('month', CURRENT_DATE)
        AND k.status = 'Hadir') >= 4
   AND NOT EXISTS (
     SELECT 1 FROM resit r
     WHERE r.pelajar_id = p.id
     AND r.bulan_bayaran = TO_CHAR(CURRENT_DATE, 'Mon YYYY')
     AND r.status = 'Aktif'
   )
   ```

2. **Hadir Hari Ini** — kiraan rekod kehadiran `Hadir` pada tarikh semasa

3. **Pendapatan Bulan Ini** — jumlah semua resit aktif bulan semasa

4. **Jumlah Pelajar Aktif** — kiraan pelajar dengan `status = 'Aktif'`

**2 Jadual:**
- Kehadiran hari ini per cawangan (Hadir / Tidak Hadir / %)
- Senarai pelajar belum bayar (5 teratas dengan butang WA)

**Resit Terkini:**
- 10 resit paling baru dengan status

**✅ Pengesahan Part E Selesai:**
- [ ] Semua 4 widget memapar data sebenar dari Supabase
- [ ] Logik "belum bayar" (≥4 kehadiran + tiada resit) berfungsi
- [ ] Jadual kehadiran per cawangan dipapar
- [ ] Resit terkini dipapar

---

## PART F — Modul Bayaran & Resit

**Skrin:** S-11, S-12, S-13a + M-01, P-01  
**Merujuk:** PD-007, PD-008, DR-036, ADR-005

### F.1 Rekod Bayaran — Stepper 2 Langkah (S-12)

**Route:** `/bayaran/baharu`

**Langkah 1: Pilih Pelajar & Jenis**
- Carian pelajar (P-02)
- Jenis bayaran: Kumpulan / Personal / Pendaftaran
- Bulan bayaran (month picker)
- Jumlah (dikira automatik berdasarkan jenis + pakej adik-beradik)
- Kaedah bayaran: Tunai / Transfer
- Tarikh bayar (default: hari ini)

**Langkah 2: Pratonton & Sahkan**
- P-01: pratonton resit PDF sebelum jana
- Nombor resit dijana automatik (`CFK-YYYY-NNNNN`)
- Butang `[← Kembali Edit]` dan `[Jana Resit]`

### F.2 Setup @react-pdf/renderer

Komponen `<ResitPDF>` dalam `src/components/pdf/ResitPDF.tsx`:
- Header: Logo CFK + "RESIT RASMI"
- Nombor resit, nama pelajar, cawangan
- Jenis bayaran, bulan, jumlah
- Kaedah bayaran, tarikh bayar
- Footer: akaun bank Maybank CFK + "Terima kasih"
- Tanda air "DIBATALKAN" jika status = Dibatalkan

### F.3 Senarai Resit (S-11)

**Route:** `/bayaran`

- Jadual: No. Resit, Pelajar, Jenis, Jumlah, Tarikh, Status, Tindakan
- Carian: nombor resit atau nama pelajar
- Penapis: Bulan, Jenis, Status
- Butang `[↓ PDF]` pada setiap baris → jana dan muat turun PDF
- Butang `[Batal Resit]` → M-01

### F.4 Modal Batal Resit (M-01)

- Papar nombor resit + nama pelajar + jumlah
- Kotak amaran oren: "Resit akan ditandakan Dibatalkan. Rekod kekal."
- Medan sebab pembatalan (textarea, wajib)
- Butang `[Kembali]` dan `[Batalkan Resit]`

### F.5 Pratonton Resit PDF (P-01)

- Panel/drawer yang terbuka dari kanan
- Papar pratonton resit sebelum jana
- Butang `[← Kembali Edit]` dan `[Simpan & Jana Resit]`

**✅ Pengesahan Part F Selesai:**
- [ ] Stepper rekod bayaran (2 langkah) berfungsi
- [ ] Nombor resit dijana automatik dengan format betul
- [ ] PDF resit dijana dengan semua maklumat betul
- [ ] Senarai resit dengan carian dan penapis berfungsi
- [ ] Batal resit (dengan sebab wajib) berfungsi
- [ ] Resit dibatalkan muncul tanda air "DIBATALKAN" dalam PDF

---

## PART G — Laporan & Makluman

**Skrin:** S-13, S-16  
**Merujuk:** PD-010, PD-011, PD-019, DR-035

### G.1 Laporan Kehadiran (S-13)

**Route:** `/laporan`

- Pilih pelajar (carian P-02)
- Pilih bulan dan tahun
- Jana laporan:
  - Senarai setiap sesi: tarikh, status (Hadir/Tidak Hadir/Cuti), nota
  - Peratus kehadiran bulan tersebut
  - Status yuran (berdasarkan DR-036: ≥4 kelas)
- Butang `[↓ Muat Turun Laporan PDF]`
- PDF laporan dalam Bahasa Melayu (PD-010)

### G.2 Makluman WhatsApp (S-16)

**Route:** `/makluman`

**Tab-tab makluman:**
- **Yuran** — teks untuk ibu bapa yang belum bayar
- **Kelas** — teks untuk maklumkan jadual/perubahan kelas
- **Pertandingan** — teks untuk maklumkan pertandingan
- **Pembatalan** — teks untuk maklumkan pembatalan kelas

**Untuk setiap jenis makluman:**
- Teks templat (boleh edit Admin)
- Butang `[Salin Teks]` — untuk hantar ke kumpulan WhatsApp
- Butang `[WA Link]` per pelajar — buka `wa.me/60XXXXXXXXX?text=...`

**✅ Pengesahan Part G Selesai:**
- [ ] Laporan kehadiran dipapar dengan tepat
- [ ] PDF laporan dijana dalam Bahasa Melayu
- [ ] Butang salin teks WhatsApp berfungsi
- [ ] WA link terbuka dengan teks praisi

---

## PART H — Jurulatih Lanjutan (Kehadiran & Bayaran)

**Skrin:** S-27, S-28 + M-06  
**Merujuk:** PD-023

### H.1 Kehadiran Jurulatih per Bulan (S-27)

**Route:** `/jurulatih/[id]/kehadiran`

- Pilih bulan dan tahun
- Senarai sesi dengan toggle status (Hadir/Tidak Hadir/Cuti)
- Ringkasan: X sesi hadir daripada Y sesi dalam bulan ini
- Nota: bilangan sesi hadir = asas pengiraan bayaran

### H.2 Bayaran Jurulatih (S-28)

**Route:** `/jurulatih/[id]/bayaran`

- Senarai rekod bayaran mengikut bulan
- Setiap baris: Bulan, Bil. Sesi, Kadar/Sesi, Jumlah, Status, Tarikh Bayar
- Butang `[+ Rekod Bayaran Bulan Ini]` → M-06

### H.3 Modal Rekod Bayaran Jurulatih (M-06)

- Paparan automatik: nama Jurulatih, bulan, bilangan sesi hadir (dari S-27), kadar
- Pengiraan: `X sesi × RM Y = RM Z`
- Input: tarikh bayar, nota (pilihan)
- Butang `[Batal]` dan `[Rekod Bayaran]`

**✅ Pengesahan Part H Selesai:**
- [ ] Rekod kehadiran Jurulatih per sesi berfungsi
- [ ] Pengiraan bayaran automatik (sesi × kadar) betul
- [ ] Rekod bayaran disimpan dengan status yang betul

---

## PART I — Kewangan & Aset

**Skrin:** S-14, S-15, S-18, S-19 + M-02  
**Merujuk:** PD-012, PD-013

### I.1 Rekod Perbelanjaan (S-14)

**Route:** `/kewangan/perbelanjaan`

- Senarai perbelanjaan: tarikh, kategori, penerangan, jumlah, cawangan
- Butang `[+ Tambah Perbelanjaan]`
- Borang: tarikh, kategori, penerangan, jumlah, cawangan (atau "Umum")
- Penapis: bulan, cawangan, kategori

### I.2 Ringkasan Kewangan (S-15)

**Route:** `/kewangan`

- Pendapatan bulan ini (jumlah resit aktif)
- Perbelanjaan bulan ini
- Keuntungan bersih
- Pecahan per cawangan
- Carta ringkas (pilihan — gunakan div dengan lebar berkadar)

### I.3 Senarai Aset (S-18)

**Route:** `/aset`

- Jadual aset: nama, kategori, nilai, cawangan, tarikh beli, status
- Butang `[+ Tambah Aset]` → S-19
- Butang `[Lupus]` → M-02

### I.4 Tambah / Edit Aset (S-19)

**Route:** `/aset/baharu` atau `/aset/[id]/edit`

- Borang: nama, kategori, nilai, tarikh beli, cawangan, nota
- Butang `[Batal]` dan `[Simpan Aset]`

### I.5 Modal Lupus Aset (M-02)

- Nama aset + nilai
- Medan sebab pelupusan (wajib, PD-012)
- Butang `[Kembali]` dan `[Lupus Aset]`

**✅ Pengesahan Part I Selesai:**
- [ ] Rekod perbelanjaan boleh ditambah dan disukat per bulan/cawangan
- [ ] Ringkasan kewangan memapar pendapatan vs perbelanjaan
- [ ] Senarai aset berfungsi
- [ ] Pelupusan aset dengan sebab wajib berfungsi

---

## PART J — Kelas Personal & Laporan Kewangan

**Skrin:** S-17, S-20  
**Merujuk:** DR-037, PD-022

### J.1 Rekod Kelas Personal (S-17)

**Route:** `/pelajar/[id]/personal` atau `/bayaran/personal/baharu`

Borang tunggal (rekod satu sesi sekaligus — PD-022):
- Pilih pelajar
- Tarikh sesi
- Kaedah: Online / Face-to-face
- Lokasi/jarak (untuk kelas F2F)
- Jumlah bayaran: RM 80–150 (Admin taip manual)
- Status kehadiran sesi tersebut: Hadir / Tidak Hadir

Resit kelas personal dijana sama seperti kelas kumpulan.

### J.2 Laporan Kewangan (S-20)

**Route:** `/laporan/kewangan`

- Pilih tempoh: bulan tunggal atau julat tarikh
- Pilih cawangan (atau semua)
- Papar:
  - Jumlah pendapatan (Kumpulan + Personal + Pendaftaran)
  - Jumlah perbelanjaan (per kategori)
  - Keuntungan bersih
  - Senarai transaksi terperinci
- Butang `[↓ Eksport CSV]`

**✅ Pengesahan Part J Selesai:**
- [ ] Rekod kelas personal dengan bayaran berfungsi
- [ ] Laporan kewangan dengan julat tarikh berfungsi
- [ ] Eksport CSV berfungsi

---

## PART K — PWA, Backup & Pelancaran

**Merujuk:** ADR-007, ADR-009

### K.1 Penyiapan PWA

- Cipta ikon 192×192 dan 512×512 (logo CFK ♟ dengan latar hijau limau `#84CC16`)
- Konfigurasi `manifest.json` dengan warna `#1E293B`
- `start_url: /kehadiran` (untuk Jurulatih yang pasang PWA)
- Ujian pasang PWA pada Android (Chrome) dan iOS (Safari)
- Arahan kepada Jurulatih cara pasang PWA

### K.2 Setup Backup Automatik

Cipta `.github/workflows/backup.yml`:
- Jadual: setiap Ahad 10:00 PG MYT
- pg_dump dari Supabase
- Simpan sebagai GitHub Actions Artifact (90 hari)

### K.3 Ujian Keseluruhan

Berdasarkan DRD Seksyen 14 — Senarai Semak Pembangunan:
- [ ] Semua halaman ada keadaan kosong (empty state)
- [ ] Semua borang ada validasi
- [ ] Semua modal tindakan berbahaya ada sebab wajib
- [ ] Sistem berfungsi pada mobile (390px) dan desktop (1440px)
- [ ] Jurulatih tidak boleh akses halaman Admin
- [ ] Admin boleh akses semua halaman

### K.4 Pelancaran

1. Kemas kini `NEXT_PUBLIC_APP_URL` dalam Vercel ke domain sebenar
2. (Pilihan) Sambungkan domain `.my` dalam Vercel dashboard
3. Buat akaun Admin dan 6 akaun Jurulatih dalam Supabase
4. Masukkan data 4 cawangan
5. Uji aliran penuh: daftar pelajar → rekod kehadiran → jana resit
6. Latih Jurulatih cara pasang dan guna PWA

**✅ Pengesahan Part K Selesai:**
- [ ] PWA boleh dipasang pada telefon Android dan iOS
- [ ] Backup automatik berjalan pada Ahad pertama
- [ ] Semua 7 pengguna boleh log masuk
- [ ] Aliran penuh (pelajar → kehadiran → resit) berjalan tanpa ralat
- [ ] Sistem digunakan dalam operasi sebenar CFK

---

## Anggaran Masa (Per Sesi Claude Code)

| Bahagian | Anggaran Sesi | Keutamaan |
|---|---|---|
| Part 0: Asas | 2–3 sesi | Kritikal |
| Part A: Log Masuk + Nav | 1–2 sesi | Kritikal |
| Part B: Pelajar | 2–3 sesi | Kritikal |
| Part C: Kehadiran | 1–2 sesi | Kritikal |
| Part D: Jurulatih Asas | 2 sesi | Kritikal |
| Part E: Dashboard Admin | 1 sesi | Kritikal |
| Part F: Bayaran & Resit | 2–3 sesi | Penting |
| Part G: Laporan & Makluman | 1–2 sesi | Penting |
| Part H: Jurulatih Lanjutan | 1 sesi | Penting |
| Part I: Kewangan & Aset | 2 sesi | Tambahan |
| Part J: Kelas Personal | 1 sesi | Tambahan |
| Part K: PWA & Pelancaran | 1–2 sesi | Kritikal |
| **Jumlah** | **~20 sesi** | |

> **1 sesi** = 1 perbualan Claude Code (biasanya 45–90 minit kerja aktif)
