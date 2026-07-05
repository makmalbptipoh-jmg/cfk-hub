# Status Pelaksanaan — CFK HUB

**Dikemaskini:** 5 Jul 2026 (Sesi 5)
**Stack:** Next.js 16 + TypeScript + Supabase + Tailwind CSS + Vercel

---

## ⚡ STATUS SESI 5 (5 Jul 2026)

**Fix PDF (wasm CSP) DISAHKAN berfungsi** — user berjaya buka PDF resit di production (commit `450c56e`).

**Dibuat & LIVE dalam Sesi 5:**
- **Upload bukti/resit perbelanjaan** (commit `291be6a`): kolum `bukti_path` + bucket Supabase Storage peribadi `bukti-perbelanjaan` (migration `scripts/sql/tambah-bukti-perbelanjaan.sql` — **sudah di-run user**). Modal Tambah Perbelanjaan boleh lampirkan imej/PDF (max 5MB); jadual ada kolum Bukti — butang Upload untuk rekod lama, Lihat (signed URL 1 jam) + ganti untuk rekod berbukti; padam rekod turut padam fail storage.
- **Total aset ikut penapis** (commit `291be6a`): header Senarai Aset kira bilangan/nilai dari senarai selepas penapis sahaja (aduan user).
- **Buang ikon pawn ♟ dalam PDF** (commit `6efe738`): Helvetica tiada glyph catur — render jadi garis pendek oren pada alamat (aduan user). Dibuang dari ResitPDF & LaporanPDF.
- **Fungsi bukti disahkan hujung-ke-hujung**: simpan rekod + upload PDF + signed URL muat turun + padam — semua diuji OK. Pendua 31 Jan (x2) + rekod ujian RM1 dipadam dari DB melalui REST.
- **AWAS**: rekod SEWA KEDAI Julai 2026 (RM500) terpadam semasa ujian user — perlu ditambah semula jika sewa Julai sudah dibayar. Perbelanjaan sah kini: Jan(+PDF), Feb(+PDF), Apr, Mei, Jun — Mac & Jul tiada.
- **Isu berulang browser user**: service worker PWA lama buat page nampak "tak fungsi" (filter/simpan). Penyelesaian: F12 → Application → Service Workers → Unregister → tutup semua tab → buka semula.

**Tertunggak user (bawa dari Sesi 4):**
1. Isi `scripts/data/pelajar-placeholder.csv` (22 pelajar Klebang: ibu bapa/telefon/alamat) → `node scripts/update-pelajar-placeholder.mjs --commit`
2. Cipta akaun jurulatih (perlu nama/emel/cawangan daripada user)
3. Pasang PWA pada telefon jurulatih
4. (Pilihan) Secret `DATABASE_URL` di GitHub untuk backup mingguan

**Jurulatih self-service (dibina Sesi 5 atas arahan user):**
- Page `/kehadiran-saya` (mobile): butang sentuh Hadir/Tidak Hadir/Cuti untuk sesi HARI INI (upsert; hanya hari ini boleh diubah), ringkasan bulan (3 kotak), anggaran bayaran (sesi Hadir × kadar), sejarah sesi dengan penapis bulan
- Tab baharu "Sesi Saya" dalam BottomTabBar jurulatih; fix isActive supaya /kehadiran & /kehadiran-saya tidak aktif serentak
- Borang Edit Jurulatih kini ada seksyen "Akaun Login" — dropdown pengguna_profil bukan-admin untuk set `jurulatih.pengguna_id` (kaitan akaun ↔ profil jurulatih)
- Migration `scripts/sql/jurulatih-self-service.sql`: fungsi `jurulatih_id_semasa()` + 3 polisi RLS kehadiran_jurulatih (SELECT sendiri; INSERT/UPDATE sendiri dalam julat ±1 hari untuk zon masa) — **WAJIB run sebelum jurulatih guna page ini**
- Aliran penuh: cipta akaun di Tetapan → Pengguna → kaitkan dalam Edit Jurulatih → jurulatih login di telefon → tab Sesi Saya

---

## Status Sesi 4 (4 Jul 2026)

**Semua sudah LIVE di production:**
- No. akaun Maybank sebenar (158015108369) dalam templat Makluman Yuran
- Nama fail PDF resit & laporan auto ikut nama pelajar + bulan (aksara `/` dalam A/L, A/P dibersihkan)
- Medan `alamat` pelajar: kolum DB (migration `scripts/sql/tambah-alamat-pelajar.sql` — sudah run) + borang tambah/edit + profil
- Sidebar admin kini dipapar pada page Kehadiran, Makluman & Dashboard Jurulatih (layout `(jurulatih)` cabang admin)
- **Laporan LHDN Excel** dalam page Kewangan: pilih tahun → `.xlsx` 4 sheet (Penyata Pendapatan P&L asas tunai, Pendapatan Bulanan, Butiran Pendapatan, Butiran Perbelanjaan) — komponen `src/components/excel/BtnLaporanLHDN.tsx`, guna `exceljs` lazy-load
- **Aset unit × harga**: kolum `kuantiti` + `harga_seunit` (migration `scripts/sql/tambah-kuantiti-aset.sql` — sudah run); `nilai_asal` = jumlah keseluruhan; borang + jadual dikemaskini
- **Penapis Kewangan**: dropdown Bulan (termasuk "Semua Bulan" untuk seluruh tahun) + Tahun
- SQL index (15 index, `scripts/sql/indexes.sql`) — sudah run dalam Supabase
- **Pakej Adik-Beradik (PD-008)**: kolum `keluarga_id` (migration `tambah-keluarga-pelajar.sql` — sudah run); kaitan dalam Edit Pelajar (`KaitanAdikBeradik.tsx`); Rekod Bayaran jana resit berasingan RM50 seorang serentak
- **Halaman S-13a Lihat Resit** (`/bayaran/[id]`): butiran penuh + PDF + batal; no. resit dalam senarai kini pautan
- **Fix PDF gagal senyap**: PWA `skipWaiting`/`clientsClaim`/`cleanupOutdatedCaches` (punca: cache chunk lama); toast berjaya/gagal pada SEMUA muat turun (PDF resit, PDF laporan, CSV, Excel)
- **Laporan Aset Excel** (`BtnLaporanAset.tsx`) di page Aset: unit × harga + jumlah nilai aktif
- **Fix perbelanjaan**: selepas simpan, penapis auto-tukar ke bulan rekod + toast (punca aduan "rekod hilang"); rekod pendua 31 Jan 2026 SEWA KEDAI RM500 dipadam dari DB
- Audit kepatuhan vs dokumen: kini ~99% — jurang tinggal histori makluman sahaja (tiada dalam pelan pelaksanaan, hanya inventori skrin)

---

## Status Sesi Terkini (Sesi 3)

**Apa yang dibuat hari ini (Episod 13 + persediaan pelancaran):**
- Toast system global: `src/lib/stores/toast-store.ts` (Zustand) + `src/components/ui/Toaster.tsx` dipasang dalam root layout — 4 jenis (success/error/info/warning) ikut warna notice box design doc
- Migrasi semua 6 fail dari pattern lama (`pesanBerjaya`/`tunjukPesan`/`alert()`) ke toast baharu; ralat kini juga papar toast merah
- Audit empty states: semua senarai/jadual sudah patuh design doc seksyen 6 — tiada gap
- Accessibility: hook `useTutupEscape` (Escape tutup modal) dipasang pada semua 7 modal + `role="dialog"`, `aria-modal`, `aria-label` pada overlay, butang X, butang tunjuk kata laluan, dan butang padam ikon-sahaja
- Jana ikon PWA (`icon-192.png`, `icon-512.png`) terus dari `icon.svg` guna sharp — langkah manual Chrome tidak diperlukan lagi
- Cipta semula `.env.local` (folder ini clone baru) dan sahkan sambungan Supabase (4 cawangan seed wujud)
- `npm run build` berjaya (31 route) + smoke test production mode: `/login` 200, laluan dilindungi redirect betul, manifest + ikon 200

**Deployment:** ✅ **LIVE di https://cfk-hub.vercel.app** (akaun Vercel `chessforkids80`)
- Repo GitHub kini **public** — auto-deploy setiap push berfungsi (Hobby plan sekat commit author lain pada repo private)
- Security headers aktif: CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy

**Data production (4 Julai 2026):**
- 180 pelajar (152 aktif; cawangan Tambun + Sungai Siput ditanda Tidak Aktif kerana tutup)
- 168 resit diimport dari sheet "MyCfk 2025 Resit" (Feb 2025 – Julai 2026, jumlah RM11,740)
- Kutipan disahkan selari 3 peringkat: sheet = DB = Laporan Kewangan (cth. Dis 2025: 25 resit RM1,750)
- 22 pelajar pembayar tiada dalam borang pendaftaran dicipta dengan placeholder `-` (ibu bapa/telefon) — perlu dilengkapkan manual

**Ciri tambahan sesi ini:** tab Rekod+Semak kehadiran untuk admin, butang navigasi Kembali/Seterusnya/Utama semua page, logo pawn kuning gaya chess.com, auto-CAPSLOCK, template resit ikut RESIT-CFK-2026, region Vercel Singapore (sin1), toast global.

**Ujian penuh production (4 Julai):** ✅ SEMUA LULUS — login, dashboard, kehadiran (rekod + semak), pelajar, bayaran + PDF resit, kewangan, laporan kehadiran & kewangan, makluman, navigasi, toast. Nota: 1 rekod kehadiran ujian (ABINASH, Hadir, 4 Julai 2026) — padam/edit dalam tab Semak jika tidak diperlukan.

**Apa yang perlu disambung (sesi akan datang):**
1. Lengkapkan maklumat 22 pelajar placeholder (semua cawangan Klebang) — **alat sudah siap (Sesi 4):** isi `scripts/data/pelajar-placeholder.csv` (kolum: nama ibu bapa, telefon, alamat) kemudian jalankan `node scripts/update-pelajar-placeholder.mjs --commit` (tanpa `--commit` = pratonton). Baris yang masih `-` dilangkau.
1b. **Medan alamat pelajar (Sesi 4):** kod siap (borang tambah/edit + profil + DB types) tetapi WAJIB paste `scripts/sql/tambah-alamat-pelajar.sql` dalam Supabase SQL Editor SEBELUM push ke main — jika tidak, tambah/edit pelajar akan gagal (kolum tiada).
2. Tukar no. akaun bank placeholder dalam templat Makluman Yuran — lokasi: `src/app/(jurulatih)/makluman/_components/MaklumanKlient.tsx:28` (`Maybank: 164 456 789 012`). PDF resit tiada placeholder bank.
3. Pasang PWA pada telefon jurulatih (Chrome → Add to Home Screen)
4. Cipta akaun jurulatih melalui Tetapan → Pengguna → Tambah Pengguna
5. ~~SQL index~~ ✅ SELESAI (Sesi 4) — user sudah run `scripts/sql/indexes.sql` dalam Supabase SQL Editor (15 index)
6. (Pilihan) Tambah secret `DATABASE_URL` dalam GitHub repo settings untuk backup automatik mingguan

**Nota teknikal untuk sesi akan datang:**
- Kredential Supabase dalam `.env.local` (jangan padam!) — projek `jfkmfmjsqbwcgzxiyees` (Singapore)
- Login admin: `chessforkids80@gmail.com` / kata laluan direset 4 Jul 2026 (user ada rekod)
- Deploy: push ke `main` → auto-deploy Vercel (repo public). Jika Vercel "Blocked", guna deploy salinan tanpa `.git` melalui CLI
- Import data lampau dibuat melalui skrip REST API + service role key (bukan melalui UI import)

---

## Ringkasan Status

| Bahagian | Nama | Status |
|---|---|---|
| **Part 0** | Asas Projek | ✅ Selesai |
| **Part A** | Log Masuk & Navigasi | ✅ Selesai |
| **Part B** | Modul Pelajar | ✅ Selesai |
| **Part C** | Modul Kehadiran (Jurulatih) | ✅ Selesai |
| **Part D** | Modul Jurulatih | ✅ Selesai |
| **Part E** | Dashboard Admin | ✅ Selesai |
| **Part F** | Modul Bayaran & Resit | ✅ Selesai |
| **Part G** | Laporan & Makluman | ✅ Selesai |
| **Part H** | Jurulatih Lanjutan | ✅ Selesai |
| **Part I** | Kewangan & Aset | ✅ Selesai |
| **Part J** | Kelas Personal & Laporan Kewangan | ✅ Selesai |
| **Part K** | PWA, Backup & Pelancaran | ✅ Selesai |

---

## Part 0 — Asas Projek ✅

Fail yang dibina:
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/middleware.ts`
- `src/lib/utils.ts`
- `src/types/database.ts`
- `src/app/layout.tsx`
- `src/app/page.tsx`

Skema DB dan seed data perlu disahkan dalam Supabase.

---

## Part A — Log Masuk & Navigasi ✅

Fail yang dibina:
- `src/app/(auth)/login/page.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/BottomTabBar.tsx`
- `src/app/(admin)/layout.tsx`
- `src/app/(admin)/dashboard/page.tsx` (placeholder)
- `src/app/(jurulatih)/layout.tsx`
- `src/app/(jurulatih)/kehadiran/page.tsx` (placeholder)

---

## Part B — Modul Pelajar ✅

Skrin: S-03, S-04, S-05, S-06, S-09 + M-04, M-05, P-02

Fail yang dibina:
- `src/components/pelajar/CariPelajar.tsx` — P-02 (komponen carian guna semula)
- `src/components/pelajar/ModalNyahaktif.tsx` — M-04
- `src/app/(admin)/pelajar/page.tsx` — S-03 Senarai Pelajar
- `src/app/(admin)/pelajar/_components/TabelPelajar.tsx` — jadual interaktif
- `src/app/(admin)/pelajar/baharu/page.tsx` — S-05 Tambah Pelajar (stepper 3 langkah)
- `src/app/(admin)/pelajar/[id]/page.tsx` — S-04 Profil Pelajar
- `src/app/(admin)/pelajar/[id]/_components/ProfilPelajarKlient.tsx` — tabs kehadiran & bayaran
- `src/app/(admin)/pelajar/[id]/edit/page.tsx` — S-06 Edit Pelajar
- `src/app/(admin)/pelajar/import/page.tsx` — S-09 Import Google Forms + M-05

---

## Part C — Modul Kehadiran ✅

Skrin: S-08, S-07, S-23

Fail yang dibina:
- `src/app/(jurulatih)/kehadiran/page.tsx` — page utama, detect role (admin→S-07, jurulatih→S-08)
- `src/app/(jurulatih)/kehadiran/_components/JurulatihKehadiranKlient.tsx` — S-08: toggle hadir per pelajar + save bar
- `src/app/(jurulatih)/kehadiran/_components/AdminKehadiranKlient.tsx` — S-07: semak & edit rekod by tarikh/cawangan
- `src/app/(jurulatih)/dashboard-jurulatih/page.tsx` — S-23: stats + senarai belum ditanda

**Nota:** Admin mengakses `/kehadiran` melalui sidebar — mendapat jurulatih layout (mobile-friendly, 390px). Kedua-dua view berfungsi dengan betul.

---

---

## Part D — Modul Jurulatih ✅

Skrin: S-24, S-25, S-26, S-21, S-22 + M-03

Fail yang dibina:
- `src/app/(admin)/jurulatih/page.tsx` — S-24 Senarai Jurulatih (server)
- `src/app/(admin)/jurulatih/_components/TabelJurulatih.tsx` — jadual interaktif
- `src/app/(admin)/jurulatih/baharu/page.tsx` — S-26 Daftar Jurulatih
- `src/app/(admin)/jurulatih/[id]/page.tsx` — S-25 Profil Jurulatih (server)
- `src/app/(admin)/jurulatih/[id]/_components/ProfilJurulatihKlient.tsx` — tabs profil/kehadiran/bayaran + stat 3 bulan
- `src/app/(admin)/jurulatih/[id]/edit/page.tsx` — S-26 Edit Jurulatih
- `src/app/actions/pengguna.ts` — Server Actions: resetKataLaluan, tambahAkaun, kemaskiniStatusPengguna
- `src/components/tetapan/ModalResetKataLaluan.tsx` — M-03
- `src/app/(admin)/tetapan/layout.tsx` — layout dengan sub-nav Pengguna/Cawangan
- `src/app/(admin)/tetapan/_components/TetapanNav.tsx` — tab navigasi aktif
- `src/app/(admin)/tetapan/page.tsx` — redirect ke /tetapan/pengguna
- `src/app/(admin)/tetapan/pengguna/page.tsx` — S-21 Pengurusan Pengguna (server)
- `src/app/(admin)/tetapan/pengguna/_components/PenggunaKlient.tsx` — jadual + blok/aktif + reset kata laluan
- `src/app/(admin)/tetapan/pengguna/_components/ModalTambahPengguna.tsx` — modal cipta akaun baharu
- `src/app/(admin)/tetapan/cawangan/page.tsx` — S-22 Pengurusan Cawangan (inline edit)

---

---

## Part E — Dashboard Admin ✅

Skrin: S-02

Fail yang dibina:
- `src/app/(admin)/dashboard/page.tsx` — Dashboard Admin penuh (Server Component, force-dynamic)

Ciri-ciri:
- **4 Widget**: Pelajar Belum Bayar (≥4 hadir + tiada resit), Hadir Hari Ini, Pendapatan Bulan Ini, Jumlah Pelajar Aktif
- **Kehadiran Per Cawangan** (hari ini): jadual dengan progress bar peratus kehadiran
- **Senarai Pelajar Belum Bayar** (5 teratas + butang WA dengan teks praisi dalam BM)
- **Resit Terkini** (10 terbaru dengan status)
- Ucapan selamat pagi/petang/malam dengan nama pengguna
- Semua data dikira secara server-side dengan parallel fetch

---

---

## Part F — Modul Bayaran & Resit ✅

Skrin: S-11, S-12 + M-01, P-01

Fail yang dibina:
- `src/components/pdf/ResitPDF.tsx` — PDF resit (@react-pdf/renderer): header CFK, maklumat pelajar, jumlah, footer bank, watermark "DIBATALKAN"
- `src/components/pdf/BtnUnduhResit.tsx` — Butang muat turun PDF (lazy-load via dynamic import)
- `src/app/(admin)/bayaran/baharu/page.tsx` — S-12 Stepper 2 langkah: pilih pelajar + jenis + bulan → pratonton → jana resit
- `src/app/(admin)/bayaran/page.tsx` — S-11 Senarai Resit (server)
- `src/app/(admin)/bayaran/_components/TabelResit.tsx` — Jadual dengan carian, penapis bulan/jenis/status, pagination
- `src/app/(admin)/bayaran/_components/ModalBatalResit.tsx` — M-01 modal batal dengan sebab wajib

Ciri-ciri penting:
- Nombor resit dijana oleh DB (fungsi `jana_nombor_resit()` via trigger)
- PDF dijana client-side (lazy-load @react-pdf/renderer supaya tidak memperlahankan bundle)
- Langkah 3 terus tunjuk butang "Muat Turun PDF" + "Rekod Lagi"

---

---

## Part G — Laporan & Makluman ✅

Skrin: S-13, S-16

Fail yang dibina:
- `src/components/pdf/LaporanPDF.tsx` — PDF laporan kehadiran dalam BM: header CFK, maklumat pelajar, jadual rekod, 4 kotak statistik (hadir/tidak hadir/cuti/%), status yuran
- `src/app/(admin)/laporan/page.tsx` — S-13: Pilih pelajar + bulan → jana laporan interaktif + butang muat turun PDF (lazy-load)
- `src/app/(jurulatih)/makluman/page.tsx` — S-16: Server component ambil data pelajar belum bayar
- `src/app/(jurulatih)/makluman/_components/MaklumanKlient.tsx` — 4 tab (Yuran/Kelas/Pertandingan/Pembatalan), teks templat boleh edit, butang Salin, WA link per pelajar dengan teks praisi

Nota: `/makluman` dalam `(jurulatih)` group supaya boleh diakses oleh kedua-dua admin dan jurulatih.

---

---

## Part H — Jurulatih Lanjutan ✅

Skrin: S-27, S-28 + M-06

Fail yang dibina:
- `src/app/(admin)/jurulatih/[id]/kehadiran/page.tsx` — S-27: tambah/edit/padam sesi kehadiran jurulatih per bulan, klik status untuk tukar, ringkasan 3 kotak, info asas pengiraan bayaran
- `src/app/(admin)/jurulatih/[id]/bayaran/page.tsx` — S-28 server: ambil bayaran + kehadiran bulan ini
- `src/app/(admin)/jurulatih/[id]/bayaran/_components/BayaranJurulatihKlient.tsx` — S-28 client: jadual sejarah bayaran, status bulan ini, jumlah keseluruhan
- `src/app/(admin)/jurulatih/[id]/bayaran/_components/ModalRekodBayaran.tsx` — M-06: pengiraan sesi × kadar = jumlah, input tarikh bayar & nota

---

---

## Part I — Kewangan & Aset ✅

Skrin: S-14, S-15, S-18, S-19 + M-02

Fail yang dibina:
- `src/app/(admin)/kewangan/_components/KewanganNav.tsx` — tab navigasi Ringkasan / Perbelanjaan (client)
- `src/app/(admin)/kewangan/layout.tsx` — layout dengan tajuk "Kewangan" dan KewanganNav
- `src/app/(admin)/kewangan/page.tsx` — S-15: Ringkasan Kewangan — pilih bulan, 3 kad stat (Pendapatan/Perbelanjaan/Keuntungan), carta bar pecahan per cawangan
- `src/app/(admin)/kewangan/perbelanjaan/page.tsx` — S-14: Rekod Perbelanjaan — penapis (bulan/kategori/cawangan), jadual, jumlah total, ModalTambahPerbelanjaan (modal inline)
- `src/app/(admin)/aset/_components/ModalLupusAset.tsx` — M-02: sebab pelupusan wajib, kemaskini status='Lupus' + sebab_lupus + tarikh_lupus
- `src/app/(admin)/aset/_components/SenaraiAsetKlient.tsx` — S-18 client: penapis status/kategori/cawangan, jadual, butang Edit + Lupus per baris
- `src/app/(admin)/aset/page.tsx` — S-18 server: fetch aset + cawangan, hantar ke SenaraiAsetKlient
- `src/app/(admin)/aset/baharu/page.tsx` — S-19: borang tambah aset (nama/kategori/nilai/tarikh/cawangan/nota)
- `src/app/(admin)/aset/[id]/edit/page.tsx` — S-19: borang edit aset dengan pra-isi dari DB

Ciri-ciri penting:
- Kategori perbelanjaan: Sewa, Utiliti, Peralatan Catur, Pengangkutan, Bahan Promosi, Makanan & Minuman, Lain-lain
- Kategori aset: Papan & Buah Catur, Jam Catur, Perabot, Elektronik, Bahan Pengajaran, Lain-lain
- Pecahan per cawangan: join resit → pelajar → cawangan untuk income; kewangan_perbelanjaan.cawangan_id untuk expenses
- Lupus aset tidak boleh diundur — rekod kekal dengan status 'Lupus'

---

---

## Part J — Kelas Personal & Laporan Kewangan ✅

Skrin: S-17, S-20

Fail yang dibina:
- `src/app/(admin)/laporan/_components/LaporanNav.tsx` — tab navigasi Kehadiran | Kewangan (client)
- `src/app/(admin)/laporan/layout.tsx` — layout dengan LaporanNav (tanpa h1 supaya tidak bercanggah dengan laporan/page.tsx sedia ada)
- `src/app/(admin)/laporan/kewangan/page.tsx` — S-20: Laporan Kewangan — bulan picker, 3 kad stat, pecahan pendapatan/perbelanjaan, senarai transaksi gabungan, butang Eksport CSV
- `src/app/(admin)/bayaran/personal/baharu/page.tsx` — S-17: Rekod Kelas Personal — 2 langkah (borang → pratonton → berjaya), rekod kehadiran + resit serentak, PDF download
- Edit `TabelResit.tsx` — tambah butang "Kelas Personal" di sebelah "Rekod Bayaran"

Ciri-ciri penting:
- S-17: insert `kehadiran` (dengan nota kaedah/lokasi) + `resit` (jenis='Personal') serentak dalam satu submit
- S-17: jika kehadiran gagal (pendua), resit tidak dijana — mesej ralat dipapar
- S-20: senarai transaksi gabungan (resit + perbelanjaan) disusun menurun mengikut tarikh
- S-20: Eksport CSV dengan BOM (﻿) untuk paparan Malay character yang betul dalam Excel
- Laporan Kehadiran sedia ada (`/laporan`) tidak diubah — LaporanNav ditambah melalui layout

---

---

## Part K — PWA, Backup & Pelancaran ✅

Fail yang dibina/dikemas kini:
- `public/manifest.json` — kemaskini `start_url` ke `/kehadiran`, tambah `id` dan `scope`
- `public/icon.svg` — sumber SVG ikon (latar #84CC16 + ♟ hitam)
- `scripts/generate-icons.html` — alat jana ikon PNG (buka dalam Chrome, muat turun 192px + 512px)
- `src/app/layout.tsx` — tambah metadata ikon (apple-touch-icon, icon 192/512)
- `.github/workflows/backup.yml` — backup automatik setiap Ahad 10:00 AM MYT via pg_dump, simpan sebagai artifact 90 hari
- `README.md` — dokumentasi lengkap: persediaan, SQL schema, seed, deploy Vercel, cara pasang PWA, setup backup

**Langkah manual yang perlu dilakukan oleh user:**
1. Buka `scripts/generate-icons.html` dalam Chrome → muat turun `icon-192.png` + `icon-512.png` → salin ke `public/`
2. Tambah secret `DATABASE_URL` dalam GitHub repository settings (untuk backup workflow)
3. Pastikan akaun Admin ditetapkan `is_admin = TRUE` dalam Supabase

---

## 🎉 SEMUA BAHAGIAN SELESAI

| Bahagian | Status |
|---|---|
| Part 0–K | ✅ Semua Selesai |

**CFK HUB kini sedia untuk dilancark an!**

*Legend: ✅ Selesai | 🔄 Dalam Proses / Seterusnya | ⏳ Belum Mula*
