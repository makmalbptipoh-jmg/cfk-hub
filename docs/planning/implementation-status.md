# Status Pelaksanaan — CFK HUB

**Dikemaskini:** 16 Ogos 2026 (Sesi 21)

## ⚡ SESI 21 (16 Ogos 2026)

### Silibus Personal — template silibus khas pelajar Personal (typecheck+lint+build LULUS; BELUM diuji browser)
Keperluan user: dalam bahagian Silibus, bina **template silibus khas untuk semua pelajar Personal**, sama macam kelas biasa. Keputusan user (via soalan): (1) **kurikulum berasingan** khas Personal (Tajuk Besar → Subtajuk sendiri, berbeza dari CFK STEP BY STEP kumpulan); (2) dijejak **per pelajar** (individu — kelas 1-ke-1); (3) **tab baru "Silibus Personal"** dalam /silibus.
- ⚠️ **WAJIB run `scripts/sql/silibus-personal.sql` SEBELUM deploy** — `ALTER silibus_tajuk ADD COLUMN jenis TEXT NOT NULL DEFAULT 'Kumpulan'` + CHECK `jenis IN ('Kumpulan','Personal')` (idempotent via `pg_constraint`) + `idx_silibus_tajuk_jenis`. **TIADA jadual baharu** — progress guna semula `silibus_progress_pelajar` (subtajuk_id+pelajar_id, sudah generik). **TIADA RLS baharu** — tulis admin (silibus_tajuk/subtajuk) + admin/jurulatih (progress_pelajar) dikekalkan. Ada ROLLBACK. Rekod sedia ada kekal 'Kumpulan'.
- **Tab ke-4 `/silibus` "Silibus Personal"** (`SilibusPersonalKlient.tsx` BARU, ikon `UserCog`): gabungan urus kurikulum + jejak per pelajar. **Overview:** tapis cawangan + carian; senarai pelajar Personal (`jenis_kelas` mengandungi 'Personal') + bar % siap terhadap subtajuk Personal (susun tertinggal dahulu), klik → detail; bawah senarai = seksyen **"Template Kurikulum Personal"** (akordion Tajuk Besar → Subtajuk, +Tambah Tajuk Besar/+Subtajuk/Edit + bahan FEN/PGN/nota/pautan, tiada togol progress). **Detail pelajar:** kad ringkasan % + akordion togol 3-status setiap subtajuk (upsert `silibus_progress_pelajar`, optimistik) + "Hingga sini". PDF + Excel guna semula `LaporanSilibusPelajarPDF` (mode pelajar/senarai).
- **Diubah:** `database.ts` (+`jenis` pada silibus_tajuk Row/Insert/Update), `lib/silibus.ts` (+`jenis` pada TajukBesar), select `silibus_tajuk` di 3 tempat (+`jenis`: admin page, SilibusIndukKlient muatData, jurulatih silibus-pelajar page). **SilibusIndukKlient kini tapis `jenis !== 'Personal'`** (Induk = Kumpulan sahaja). **ModalTajuk** +prop `jenisBaru` (insert `jenis`; sorok togol Wajib + chip "Personal" bila konteks Personal). Guna semula ModalSubtajuk tanpa perubahan. SilibusKlient +tab. **Silibus Pelajar (wajib) kekal** — Personal tajuk default bukan wajib jadi tak bertindih.
- **Ujian klik-lalu (selepas run SQL, di Vercel preview — dev tempatan blocked):** /silibus → tab Silibus Personal → Tambah Tajuk Besar (chip Personal, tiada togol Wajib) → +Subtajuk (Satu/Tambah Pukal) + FEN/PGN/nota; senarai pelajar Personal muncul (Kumpulan sahaja tak muncul); klik pelajar → togol Selesai + "Hingga sini" → % naik, refresh kekal; PDF/Excel pelajar & senarai; sahkan tab Silibus Induk TIDAK papar tajuk Personal & sebaliknya. Padam data ujian.

## ⚡ SESI 20 (16 Ogos 2026)

### Modul Pertandingan — integrasi Swiss-Manager (typecheck+lint+build LULUS; 32 ujian unit lulus; BELUM diuji browser)
Keperluan user: setiap kelas/cawangan buat pertandingan catur dalaman guna **Swiss-Manager**, tapi terpaksa taip manual semua pemain. Nak: (1) **jana template pendaftaran** yang boleh terus di-import ke Swiss-Manager; (2) **proses fail result** (Ranking List) yang di-export balik → rekod pencapaian → jadi **rating + pingat** dalam Laporan Pelajar. Keputusan user: peserta **ikut cawangan**; terima fail **.xls terus**; laporan papar **ringkasan+pingat DAN rating berangka**; akses **admin+jurulatih**.
- ⚠️ **WAJIB run `scripts/sql/pertandingan.sql` SEBELUM deploy** — 3 jadual baharu: `pertandingan`, `pertandingan_peserta` (`nama_ekspot` = kunci padanan), `pertandingan_keputusan` (kedudukan/mata/buchholz/sonneborn/pingat, `pelajar_id` nullable untuk baris tak padan). RLS: baca terbuka; tulis admin ATAU jurulatih berpaut (`jurulatih_id_semasa()`). Idempotent + ROLLBACK.
- **Dependency baharu:** `xlsx` (SheetJS, dari CDN rasmi) — baca `.xls` BIFF8 **dan** `.xlsx` (exceljs tak baca `.xls`). exceljs dikekal untuk **jana** template.
- **Lib baharu:** `src/lib/pertandingan.ts` (markah prestasi, pingat Emas/Perak/Gangsa, rating terkumpul gaya-Elo `1000 + 4·Σ(markah−50)` komutatif + taraf catur; `formatMata` 7½), `pertandingan-parse.ts` (parser SheetJS — kesan header Rank/Name, langkau tajuk+footer, tukar simbol ½), `pertandingan-template.ts` (exceljs, `LAJUR_TEMPLATE` mudah ditala). Ujian: `pertandingan.test.ts` + `pertandingan-parse.test.ts` (guna fail sebenar `__fixtures__/ranking-141225.xls`, 27 pemain).
- **Route baharu `(jurulatih)/pertandingan`** (admin+jurulatih, path `/pertandingan`): senarai, `/baharu` (pilih cawangan → auto-senarai pelajar Aktif + checkbox → cipta+peserta via action), `/[id]` (muat turun template, muat naik result, standings, padan manual nama tak padan, padam). Action `src/app/actions/pertandingan.ts`. API `src/app/api/pertandingan/[id]/result/route.ts` (nodejs runtime: parse→padan `nama_ekspot`→simpan→status Selesai).
- **Integrasi:** `/laporan/page.tsx` + `LaporanPDF.tsx` — kad/seksyen "Pencapaian Pertandingan" (rating+taraf, ringkasan, pingat, senarai). `pelajar/[id]` profil — kad "Rating Pertandingan". Nav: Sidebar admin (+Pertandingan) & BottomTabBar jurulatih (+Tanding).
- **Tertunggak user:** (1) beri contoh **template pendaftaran** Swiss-Manager → selaras `LAJUR_TEMPLATE`; (2) beri contoh **template laporan** → selaras susun atur + tala formula rating. Vitest kini guna `vitest.config.ts` tempatan (elak "walk up" ke vite.config luar projek).
- **Ujian (di Vercel preview — dev tempatan blocked):** run SQL → cipta pertandingan/pilih cawangan/jana template → import SM/export ranking/muat naik → standings padan + status Selesai → Laporan Pelajar peserta papar kad+PDF; profil papar kad rating.

## ⚡ SESI 19 (15 Ogos 2026)

### Progress Silibus dalam Laporan Pelajar (typecheck+lint+build LULUS; BELUM diuji browser — TIADA SQL)
Keperluan user: dalam Laporan Per Pelajar (`/laporan`, bahagian bawah), sertakan juga **progress silibus** pelajar itu. Guna semula data sedia ada — tiada migrasi.
- **`/laporan/page.tsx`** — fungsi `jana()` kini juga tarik silibus **wajib** (`silibus_tajuk` `wajib=true`+`status=Aktif`) + subtajuknya + `silibus_progress_pelajar` bagi `pelajar.id`. Kira ringkasan keseluruhan (selesai/sedang/belum/%) + pecahan per Tajuk Besar. Guna semula helper `petaProgresPelajar`/`statusSubtajuk` dari `src/lib/silibus.ts`. Kad baharu "Progress Silibus (Wajib)" selepas jadual kehadiran: bar % keseluruhan + senarai setiap Tajuk Besar × subtajuk dengan pill status berwarna. Empty state bila tiada tajuk wajib.
- **`src/components/pdf/LaporanPDF.tsx`** — prop baharu `silibus?` (opsional); bahagian "Progress Silibus (Wajib)" sebelum footer: ringkasan + jadual per Tajuk Besar (subtajuk + status berwarna, zebra). Boleh pecah antara halaman (tiada `wrap={false}` pada kontena besar).
- **Ujian klik-lalu (di Vercel preview — dev tempatan blocked):** /laporan → pilih pelajar + bulan → Jana → kad Progress Silibus papar % + senarai bab ikut status; Muat Turun PDF → bahagian silibus muncul. Pelajar tanpa progress → semua "Belum" / "Belum mula". Jika tiada tajuk Wajib → empty state.

### RINGKASAN SESI 19 — Modul Silibus lengkap + perf login (SEMUA LIVE PRODUCTION)
Fokus sesi: bina modul **Silibus** penuh dari log-harian rata → sistem kurikulum berstruktur, + optimize prestasi. Semua di-deploy ke production (10 PR merged ke `main`, akhir `a39b198`). SQL semua sudah di-run user di Supabase.
1. **Silibus Induk** — Tajuk Besar → Subtajuk (mod Tambah Pukal), progress **per cawangan**, bahan PGN(fail/teks)/FEN/nota/pautan, pautan pada Tajuk Besar. Jadual: `silibus_tajuk`, `silibus_subtajuk`, `silibus_progress` (`scripts/sql/silibus-struktur.sql`).
2. **Seed CFK STEP BY STEP** — 42 bab (`scripts/sql/seed-cfk-step-by-step.sql`), ditanda **Wajib**.
3. **Silibus Pelajar** (admin) — progress **per pelajar** terhadap tajuk Wajib; overview % (tertinggal dahulu) + butang "Hingga sini". Jadual `silibus_progress_pelajar` (`scripts/sql/silibus-pelajar.sql`).
4. **PDF + Excel** untuk ketiga-tiga tab (Induk/Pelajar/Log Harian).
5. **Jurulatih update dari telefon** — tab ke-5 "Silibus" + RLS jurulatih (`scripts/sql/silibus-jurulatih.sql`).
6. **Perf /login mobile** — LCP 3.9s → **skor PageSpeed 92**: middleware skip `getUser()` laluan awam + lazy-load Supabase/rhf/zod + `/login` prerender Static.
7. **Fix**: butang Edit terpotong (flexWrap); **Pendaftaran Baharu** (Sesi 17) akhirnya di-commit + deploy (⚠️ perlu env `GOOGLE_*` di Vercel untuk berfungsi).
- **Tertunggak user:** set env `GOOGLE_*` di Vercel untuk aktifkan `/pelajar/import`. Branch `feat/silibus-struktur` boleh dipadam (semua merged).

### Jurulatih update Silibus Pelajar dari telefon (LIVE production; SQL sudah run)
Keperluan user: jurulatih (yang mengajar) boleh update status silibus wajib pelajar dari telefon. Keputusan user: (1) lalai **cawangan jurulatih sendiri** (tapis boleh tukar); (2) **tab ke-5 "Silibus"** dalam bottom bar jurulatih.
- ⚠️ **WAJIB run `scripts/sql/silibus-jurulatih.sql` SEBELUM deploy** — 2 polisi RLS baharu pada `silibus_progress_pelajar`: `jurulatih_insert_*` + `jurulatih_update_*` dengan `jurulatih_id_semasa() IS NOT NULL` (INSERT+UPDATE sahaja; polisi admin FOR ALL dikekalkan; jurulatih tak boleh DELETE). Guna semula `jurulatih_id_semasa()`. Idempotent + ROLLBACK. **Tiada jadual baharu** — jadual `silibus_progress_pelajar` dikongsi admin & jurulatih (satu sumber kebenaran).
- **Route baharu `/silibus-pelajar`** (route group `(jurulatih)` — path BERBEZA dari `/silibus` admin untuk elak langgar): `page.tsx` (server: paut `jurulatih` via `pengguna_id`, empty state jika tak dipaut; fetch cawangan+tajuk wajib+subtajuk+pelajar Aktif+progress) + `_components/JurulatihSilibusKlient.tsx` (mobile ~390px: dropdown "Cawangan Saya"/cawangan lain + carian; overview pelajar + bar % susun tertinggal dahulu; tap → detail togol 3-status + butang "✓≤" Hingga sini; upsert `dikemaskini_oleh=user.id`). Guna semula helper `src/lib/silibus.ts`. Tiada PDF/Excel (ringan telefon).
- **Diubah:** `BottomTabBar.tsx` (+tab "Silibus" ke-5, kecikkan lebar item supaya muat 6 item). Update jurulatih terus nampak di tab admin Silibus Pelajar.
- **Ujian (selepas SQL, preview auth jurulatih):** log masuk akaun jurulatih → tab Silibus → pelajar cawangan dia + bar %; tukar dropdown; tap pelajar → tanda Selesai + "✓≤" → % naik, refresh kekal; sahkan admin `/silibus` nampak sama; jurulatih tak dipaut → empty state. Padam data ujian.


### Prestasi mobile /login — LCP/TTFB (build LULUS; PERLU uji login di preview — auth-kritikal)
Keperluan user: PageSpeed mobile lapor **LCP 3.9s** pada `/login` (satu-satunya halaman awam; app sebenar di sebalik auth, PSI tak ukur). PSI API 429 (tiada key) → analisis kod.
- **Punca:** (1) `middleware.ts` panggil `supabase.auth.getUser()` (round-trip rangkaian) pada SETIAP request sebelum semakan laluan → TTFB; (2) `/login` (client component) import Supabase + react-hook-form + zod secara statik → JS awal besar (TBT).
- **Fix:** (1) `middleware.ts` — laluan awam (`/auth`, `/api/bayaran`, `/bayaran-selesai`) & `/login` tanpa cookie auth `sb-*-auth-token` pulang SEGERA tanpa cipta klien/`getUser()` (semantik keselamatan dikekalkan: protected routes tetap perlu user; `/login` dengan cookie tetap disahkan+redirect). (2) `/login` — **lazy-load Supabase** (dynamic import dalam handler), **borang kata laluan diasingkan** ke `BorangKataLaluan.tsx` + `next/dynamic ssr:false` (rhf+zod keluar bundle awal). Kesan: `/login` kini **prerender Static (○)** — HTML dari CDN.
- ⚠️ **Uji di preview dahulu (auth):** login Google + login kata laluan + logout + akses halaman dilindungi tanpa login (redirect ke /login) + pengguna log masuk buka /login (redirect dashboard). Google OAuth mungkin gagal di preview (redirect URL tak whitelist) — uji password di preview, Google di production selepas merge.


### Silibus Pelajar — progress silibus per pelajar (typecheck+lint+build LULUS; BELUM diuji browser)
Keperluan user: ada pelajar tertinggal kelas, jadi progress per cawangan tak cukup — nak jejak progress silibus SETIAP pelajar; CFK STEP BY STEP wajib semua pelajar. Keputusan user (via soalan): (1) hanya Tajuk Besar ditanda **Wajib** muncul untuk setiap pelajar; (2) paparan **senarai + bar % siap** (kesan tertinggal) → klik untuk rekod; (3) **semua pelajar Aktif** (tapis cawangan).
- ⚠️ **WAJIB run `scripts/sql/silibus-pelajar.sql` SEBELUM deploy** — `ALTER silibus_tajuk ADD COLUMN wajib BOOLEAN DEFAULT false` + `UPDATE ... SET wajib=true WHERE nama='CFK STEP BY STEP'`; jadual baharu **`silibus_progress_pelajar`** (subtajuk_id CASCADE, pelajar_id CASCADE, status Belum/Sedang/Selesai, tarikh_selesai, **UNIQUE(subtajuk_id,pelajar_id)**) + index + RLS (baca authenticated, tulis admin). Sparse (tiada baris = Belum). Idempotent + ROLLBACK.
- **Tab ketiga `/silibus` "Silibus Pelajar"** (`SilibusPelajarKlient.tsx` BARU): tapis cawangan + carian nama; **overview** senarai pelajar Aktif + bar % siap terhadap subtajuk wajib (susun % menaik — tertinggal dahulu; warna merah/kuning/hijau; "Belum mula" bila 0%); klik pelajar → **detail** akordion Tajuk Besar wajib → togol 3-status setiap subtajuk (upsert `silibus_progress_pelajar`, optimistik) + butang **"Hingga sini"** (tandakan semua bab susunan≤ini sebagai Selesai — untuk pelajar yang sampai bab N).
- **Diubah:** `database.ts` (+`wajib`, +blok `silibus_progress_pelajar`), `silibus.ts` (+`wajib` pada TajukBesar, +`ProgresPelajarBaris`/`petaProgresPelajar`; guna semula `statusSubtajuk`/`kiraProgresCawangan` generik pada pelajar_id), `page.tsx` (+fetch pelajar Aktif + progress pelajar + `wajib`), `SilibusKlient.tsx` (tab ketiga), `ModalTajuk.tsx` (togol **Wajib**), `SilibusIndukKlient.tsx` (chip "Wajib" + select `wajib`). Jadual `pelajar_topik` (progress bebas) kekal berasingan.
- **Ujian klik-lalu (selepas run SQL):** /silibus → tab Silibus Pelajar → pilih cawangan → senarai + bar (semua 0% mula-mula, tertinggal dahulu); klik pelajar → CFK STEP BY STEP 42 bab → tanda Selesai + "Hingga sini" → % naik; refresh kekal; Silibus Induk chip "Wajib"; ModalTajuk togol Wajib. Padam data ujian.
- **Susulan SIAP — PDF + Excel Silibus Pelajar** (`src/components/pdf/LaporanSilibusPelajarPDF.tsx` + butang dalam `SilibusPelajarKlient`): sedar-konteks — **overview** (senarai pelajar + Selesai/Jumlah + %, susun tertinggal dahulu) & **detail pelajar** (Tajuk Besar × subtajuk + MS + status berwarna + ringkasan %). PDF (react-pdf) + Excel (exceljs) corak dynamic import. Tiada SQL. typecheck+lint+build LULUS.

### Silibus Berstruktur — Tajuk Besar → Subtajuk + progress per cawangan (typecheck+lint+build LULUS; BELUM diuji browser)
Keperluan user: modul `/silibus` dulu log harian rata; user nak kurikulum catur berstruktur — **Tajuk Besar** (cth *"Short & Sweet: Aman Hambleton's London System"*) mengandungi **~20 subtajuk** (bab), trace progress setiap subtajuk **ikut cawangan** (kelas selalu tak habis), + lampiran **PGN (fail/teks), FEN, nota, pautan URL** setiap subtajuk. Keputusan user (via soalan): (1) progress **ikut cawangan** (silibus induk dikongsi, matrix subtajuk × cawangan); (2) **ganti** paparan `/silibus` — log harian lama kekal sebagai **tab kedua**; (3) PGN **upload fail ATAU tampal teks**.
- ⚠️ **WAJIB run `scripts/sql/silibus-struktur.sql` SEBELUM deploy** — 3 jadual (jadual `silibus` log harian lama KEKAL): `silibus_tajuk` (nama/susunan/nota/status Aktif-Tidak Aktif/dicipta_oleh), `silibus_subtajuk` (tajuk_id CASCADE, nama, susunan, fen, pgn_teks, pgn_path/pgn_nama/pgn_saiz, nota, pautan), `silibus_progress` (subtajuk_id CASCADE, cawangan_id CASCADE, status Belum/Sedang/Selesai, tarikh_selesai, **UNIQUE(subtajuk_id,cawangan_id)** untuk upsert) + index + RLS (baca authenticated, tulis admin `is_admin`). Guna semula bucket **`bahan-pengajaran`** sedia ada untuk fail PGN (path `silibus-pgn/{id}.pgn`) — tiada bucket/polisi baharu. Ada blok ROLLBACK. Progress **sparse**: tiada baris = 'Belum'.
- **Halaman `/silibus`** kini shell bertab: **Silibus Induk** (default) | **Log Harian**.
  - `SilibusIndukKlient.tsx` (BARU): dropdown cawangan (`Semua Cawangan (ringkasan)` / spesifik) + akordion Tajuk Besar (bar progress per cawangan). Baris subtajuk: chip petunjuk (FEN/PGN/Pautan/Nota) + kawalan progress (cawangan spesifik → togol 3-status upsert; Semua → bulatan status per-cawangan) + butang Bahan (kembang: FEN salin, PGN Buka Fail signed-URL/Salin teks, nota, pautan klik) + Edit.
  - `ModalTajuk.tsx` (BARU): CRUD Tajuk Besar (nama/susunan/status/nota, padam 2-klik CASCADE amaran).
  - `ModalSubtajuk.tsx` (BARU): mod **Satu** (nama/susunan/FEN/PGN togol upload↔teks/nota/pautan) & mod **Tambah Pukal** (tampal senarai — satu baris satu subtajuk → insert banyak sekaligus, susunan auto-berturut; untuk kes 20 bab). Upload guna corak `BahanKlient` + `sahkanFailPgn` (had 2MB, .pgn/.txt).
- **Diubah:** `src/types/database.ts` (3 blok jenis), `page.tsx` (fetch cawangan+tajuk+subtajuk+progress), `SilibusKlient.tsx` (jadi shell bertab), log harian lama dipindah ke `LogHarianKlient.tsx` (kekal eksport jenis `Cawangan`/`Silibus`; import dalam `ModalSilibus.tsx` dikemaskini). Helper baharu `src/lib/silibus.ts` (STATUS_PROGRES, WARNA_PROGRES, sahkanFailPgn/pathPgn/saizFail, petaProgres/statusSubtajuk/kiraProgresCawangan). Sidebar tiada perubahan (route `/silibus` kekal).
- **Ujian klik-lalu diperlukan (selepas run SQL):** /silibus → tab Silibus Induk default; Log Harian masih papar rekod lama + PDF. Tambah Tajuk Besar → Tambah Pukal 20 baris → 20 subtajuk ikut urutan; Edit satu subtajuk isi FEN + upload .pgn/tampal teks + pautan + nota. Pilih Klebang → tanda Selesai; Buntong kekal Belum; tukar dropdown sahkan beza per cawangan; refresh kekal. Semua Cawangan → bulatan status + % betul. Detail: Salin FEN, Buka Fail PGN, klik pautan. Padam subtajuk (fail PGN hilang), padam Tajuk Besar (CASCADE). Padam data ujian selepas.
- **Susulan — medan Pautan URL pada Tajuk Besar** (bukan subtajuk sahaja): ⚠️ run `ALTER TABLE silibus_tajuk ADD COLUMN IF NOT EXISTS pautan TEXT;` (sudah dalam `silibus-struktur.sql`). ModalTajuk +input pautan; header Tajuk Besar papar butang "Pautan" (buka tab baru); `page.tsx` + `SilibusIndukKlient` select tambah `pautan`; jenis `database.ts`/`silibus.ts` dikemaskini.
- **Fix kekemasan UI (butang Edit terpotong):** header Tajuk Besar dulu `display:flex` tanpa `flexWrap` + butang aksi tiada `flexShrink:0` → bila nama panjang/skrin sempit, butang kanan (Edit) kena potong oleh `overflow:hidden` kad. Fix: `btnKecil` +`flexShrink:0`/`whiteSpace:nowrap`; header +`flexWrap`; butang aksi (Pautan/Subtajuk/Edit) dikumpul dalam bekas `flexShrink:0` `marginLeft:auto`; butang Edit kini berlabel "Edit" (bukan ikon-sahaja) di tajuk & subtajuk; togol status +`flexShrink:0`.
- **Susulan SIAP — export Excel (.xlsx)** untuk kedua-dua tab: Silibus Induk (butang PDF + **Excel** — sheet Tajuk Besar × Subtajuk × cawangan, sel status berwarna) & Log Harian (butang PDF + **Excel** — sheet Tarikh/Hari/Cawangan-Pelajar/Jenis/Tajuk/Muka Surat/Nota). Guna `exceljs` dynamic import (corak sama laporan/pendapatan). Tiada SQL. typecheck+lint+build LULUS.
- **Susulan SIAP — PDF kurikulum + progress per cawangan** (`src/components/pdf/LaporanSilibusIndukPDF.tsx` + butang "Muat Turun PDF" dalam `SilibusIndukKlient`): dua mod ikut penapis cawangan — **portrait** (cawangan spesifik: seksyen per Tajuk Besar + ringkasan X/N selesai % + jadual subtajuk dengan lajur Status berwarna) & **landscape matrix** (Semua Cawangan: subtajuk × cawangan, kod S=Selesai/P=Sedang/kosong=Belum berwarna + legenda). Corak dynamic import `pdf(...).toBlob()` sama LaporanSilibusPDF; header/logo CFK; footer fixed. typecheck+lint+build LULUS.

## ⚡ SESI 18 (8 Ogos 2026)

### Laporan Pendapatan per Cawangan & Personal + PDF/Excel (typecheck+lint+build LULUS; BELUM diuji browser)
Keperluan user: penapis untuk tengok pendapatan setiap cawangan dan Personal, boleh muat turun PDF & Excel. Keputusan user (via soalan): (1) Personal dipapar sebagai **kategori/jumlah** (lajur berasingan + baris "Tiada Cawangan"), bukan pecahan per pelajar; (2) tapis **ikut bulan** (macam laporan lain).
- **Tab baharu "Pendapatan"** dalam `/laporan` (kedua, selepas Kehadiran) — `LaporanNav.tsx` diubah.
- **Fail baharu:** `laporan/pendapatan/page.tsx` (klien, penapis bulan + cawangan, 3 kad ringkasan Jumlah/Kumpulan/Personal, jadual Cawangan × Kumpulan/Personal/Pendaftaran/Jumlah + baris JUMLAH, butang PDF + Excel), `src/components/pdf/LaporanPendapatanPDF.tsx` (A4 portrait, header CFK, 3 kad + jadual 5 lajur).
- **Model kiraan:** pendapatan = `resit` status Aktif, diikat pada **bulan yuran** (`bulan_bayaran`/`tahun_bayaran`) — konsisten dgn widget Pendapatan dashboard & Laporan Kewangan. Cawangan ikut `pelajar.cawangan_daftar_id`; resit tanpa cawangan → baris "Tiada Cawangan". Lajur ikut `resit.jenis` (Kumpulan/Personal/Pendaftaran; jenis lain masuk Kumpulan supaya jumlah tepat).
- **Export:** PDF guna corak dynamic import `@react-pdf/renderer` `pdf(...).toBlob()`; Excel guna `exceljs` (`(await import('exceljs')).default`) — sama corak LaporanKelasKlient/BtnLaporanLHDN. TIADA SQL.
- **Ujian klik-lalu diperlukan:** /laporan → tab Pendapatan → pilih bulan berdata → jadual per cawangan + baris Personal + JUMLAH betul; tapis cawangan tunggal; Muat Turun PDF + Excel buka betul; bulan kosong → empty state.

### Prestasi mudah alih (PageSpeed): fon self-host via next/font (build LULUS; BELUM diuji PSI semula)
Keperluan user: analisis laporan PageSpeed (mobile) & betulkan. Nota: API PSI kembalikan 429 (had kadar tanpa API key) — tak dapat angka langsung; analisis dibuat pada kod.
- **Punca terbesar dikenal pasti:** `app/layout.tsx` muat fon Google sebagai `<link rel="stylesheet">` pihak ketiga dalam `<head>` = **render-blocking request** + 2× `preconnect` + risiko CLS. Ini bendera klasik PSI mudah alih.
- **Fix:** migrasi ke `next/font/google` (`Plus_Jakarta_Sans`, weight 400–700, display swap, variable `--font-jakarta`) — Next muat turun fon masa build & sajikan dari origin sama. Buang `<link>` + preconnect. `globals.css` guna `font-family: var(--font-jakarta), ...`.
- **CSP diketatkan** (`next.config.ts`): buang `fonts.googleapis.com`/`fonts.gstatic.com` dari `style-src`/`font-src`/`connect-src` — tak lagi perlu sebab self-host. Disahkan tiada komponen runtime lain rujuk hos itu.
- **Kesan dijangka:** hapus permintaan CSS menyekat-render pihak ketiga + 2 sambungan origin → FCP/LCP mudah alih lebih baik, CLS lebih stabil (metrik fon sandaran next/font).
- **Susulan dicadang (belum dibuat, perlu data PSI sebenar):** semak saiz bundle JS admin (banyak halaman `force-dynamic`), lazy-load `@react-pdf/renderer`/`exceljs` sudah dynamic (baik). Uji semula di https://pagespeed.web.dev selepas deploy.

## ⚡ SESI 17 (1 Ogos 2026)

### Page "Pendaftaran Baharu" — tarik TERUS dari Google Sheet + pilih cawangan (typecheck+build LULUS; BELUM diuji browser — perlu env service account)
Keperluan user: page baharu untuk pelajar yang baru daftar di Google Form; tarik semua entry setiap kali dibuka + pilihan cawangan semasa daftar. Keputusan user: (1) akses sheet guna **Google Service Account** (selamat — data kanak-kanak); (2) **ganti/naik taraf** page "Import Google Forms" sedia ada (`/pelajar/import`); (3) default **Kumpulan / RM70**, abai AGE & SCHOOL.
- **Latar:** reka asal (ADR-006) = Apps Script tolak ke `import_antrian`, tapi tiada apa isi jadual itu dalam repo + page import lama set `cawangan_daftar_id=null`. Page baru ini tarik terus dari sheet (bukan `import_antrian`).
- **Sheet (gid 1225745916, ~179 baris):** lajur `Timestamp|BRANCH|STUDENT'S NAME|AGE|ADDRESS|SCHOOL|PARENT NAME|PHONE|consent`. BRANCH: KLEBANG/BUNTONG/TAMBUN/SUNGAI SIPUT/SRI ISKANDAR (+ 1 "Online") — padan nama `cawangan` DB. Spreadsheet ada tab lain (murid/yuran/resit) → kod baca tab gid ini SAHAJA.
- **Fail baharu:** `src/lib/google-sheets.ts` (JWT service account → Sheets REST readonly; resolusi tab ikut gid; parse A:H), `src/app/api/pendaftaran/sync/route.ts` (`runtime='nodejs'`+`force-dynamic`; GET tarik sheet + anotasi `sudahDaftar` dgn padan nama+8-digit-telefon vs `pelajar`), `src/app/actions/pendaftaran.ts` (`daftarPelajarSheet` — server client cookie admin, RLS `tambah_admin`; insert Kumpulan/RM70/sumber GoogleForms), `import/_components/PendaftaranKlient.tsx` (jadual + dropdown cawangan prefill ikut BRANCH + checkbox + modal + Muat Semula).
- **Diubah:** `import/page.tsx` (server, fetch cawangan Aktif), `utils.ts` (+`parseTimestampSheet` client-safe), `TabelPelajar.tsx` (label butang "Import Google Forms" → "Pendaftaran Baharu"; route kekal `/pelajar/import`), `package.json` (+`google-auth-library`).
- **Idempotensi tanpa migrasi:** baris ditanda "Sudah Didaftar" (hijau, checkbox lumpuh) bila `pelajar` sedia ada padan nama (uppercase) + 8 digit akhir telefon. Tiada lajur/jadual baharu.
- ⚠️ **TERTUNGGAK USER (setup sekali) sebelum boleh uji:** (1) Google Cloud projek "CFK HUB" → **Enable Google Sheets API**; (2) cipta **Service Account** + JSON key (semak commit d197a23 "akaun perkhidmatan sudah disahkan" — mungkin sudah ada); (3) **share** spreadsheet ke email SA (Viewer); (4) isi env `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID=18wOTckf0aBxCuto8aD4m2Dsk-cmMTgQLi7Wu2q-K8gA`, `GOOGLE_SHEET_GID=1225745916` dalam `.env.local` + **Vercel** → redeploy.
- **Ujian klik-lalu diperlukan (selepas env):** `/pelajar/import` → ±179 baris muncul, dropdown prefill ikut BRANCH (baris "Online" kosong), Tarikh Submit betul; pilih 1 baris ujian → Sahkan Daftar → muncul di `/pelajar` (GoogleForms/Kumpulan/RM70); Muat Semula → baris jadi "Sudah Didaftar"; buang 1 env → mesej ralat BM (bukan crash). Padam pelajar ujian selepas.

## ⚡ SESI 16 (28 Jul 2026)

### Fix: `/silibus` crash ke global-error bila pilih cawangan (Klebang) — production (typecheck+lint+build LULUS)
Gejala user: buka `https://cfk-hub.vercel.app/silibus`, pilih cawangan Klebang → seluruh app tukar ke halaman "Maaf, sesuatu tidak kena" (global-error.tsx). Punca yang disyaki: satu baris silibus Klebang ada `tarikh` rosak/tak boleh dihurai → `formatTarikh()` panggil `Intl.DateTimeFormat.format(new Date(invalid))` yang **melempar `RangeError: Invalid time value`**; kerana TIADA `error.tsx` di mana-mana segmen, ralat naik terus ke `global-error.tsx` (meletupkan seluruh app).
- **Fix 1 (punca):** `src/lib/utils.ts` — `formatTarikh`/`formatTarikhPendek` kini semak `Number.isNaN(d.getTime())` → pulang nilai mentah/'—' (tak lagi throw). `hariMinggu` pulang -1 utk tarikh rosak (HARI[-1]=undefined, papar kosong).
- **Fix 2 (jaring keselamatan + diagnostik):** `src/app/(admin)/error.tsx` baharu — sempadan ralat peringkat kumpulan admin: crash render mana-mana halaman admin kekalkan sidebar, papar "Cuba Lagi" (reset) + kod digest Sentry, bukan lagi lompat ke global-error.
- **Nota:** fix berasaskan suspek terkuat (belum sahkan error console). Jika crash berulang, error.tsx kini papar kod digest — guna utk cari di Sentry. Susulan dicadang: sahkan baris tarikh rosak dalam DB Klebang & betulkan datanya.

## ⚡ SESI 15 (26 Jul 2026)

### Progress Pembelajaran per pelajar (kelas Personal) + Bahan & Buku (typecheck+lint+build LULUS; BELUM diuji browser)
Keperluan user: rekod apa yang diajar kepada setiap pelajar (opening, middlegame, endgame, strategy…) supaya boleh pantau perkembangan mereka; banyak tajuk + butiran. Keputusan user: (1) **pelajar Personal sahaja**; (2) kategori **boleh tambah sendiri**; (3) **3 tahap penguasaan** (Baru Diajar → Sedang Latih → Sudah Kuasai); (4) PDF per pelajar + ringkasan + auto-tarik dari Silibus + **boleh upload buku yang digunakan**.
- ⚠️ **WAJIB run `scripts/sql/progres-pelajar.sql` SEBELUM deploy** — 3 jadual + 1 bucket: `topik_kategori` (nama UNIQUE, susunan, status; **seed 11 kategori**: Asas & Peraturan, Opening, Middlegame, Endgame, Strategy, Tactics, Checkmate Pattern, Puzzle/Latihan, Analisis Permainan, Persediaan Pertandingan, Lain-lain), `buku_rujukan` (nama, pengarang, fail_path/nama/saiz, nota), `pelajar_topik` (pelajar_id CASCADE, kategori_id, tajuk, butiran, tahap CHECK 3 nilai, tarikh, tarikh_kuasai, buku_id SET NULL, muka_surat) + 5 index + RLS (baca authenticated, tulis admin) + bucket **`bahan-pengajaran`** (peribadi) + 4 polisi storage. Ada blok ROLLBACK.
- **Tab baharu "Progress Pembelajaran" dalam profil pelajar** (`/pelajar/[id]`) — muncul HANYA bila `jenis_kelas` mengandungi 'Personal' (helper `adaKelasPersonal`). Kandungan: 4 kad ringkasan (jumlah/baru/sedang/kuasai), bar % dikuasai + tajuk terakhir diajar, butang Tambah Topik / Muat Turun PDF / Bahan & Buku, chip tapis ikut tahap, senarai topik **dikumpul ikut kategori** (kad: tajuk + pill tahap + tarikh + buku·muka surat + butiran; butang Edit + **butang pantas tukar tahap** "→ Sedang Latih" dll).
- **Auto-tarik Silibus:** seksyen "Dari Rekod Silibus Kelas" (baca sahaja) papar rekod `silibus` yang `pelajar_id` = pelajar ini; tajuk yang belum masuk progress ada butang **"Jadikan Topik"** (pra-isi tajuk/tarikh/muka surat/nota dalam modal), yang sudah ada ditanda "✓ Dalam progress".
- **Fail baharu:** `src/lib/progresPelajar.ts` (TAHAP, WARNA_TAHAP, `kiraRingkasan`, `kumpulIkutKategori`, helper fail buku), `pelajar/[id]/_components/ProgresPelajarTab.tsx` + `ModalTopik.tsx` (kategori dropdown + **"+ Baharu"** tambah kategori terus dari modal, tajuk, 3 togol tahap, tarikh, buku, muka surat, butiran textarea; padam 2-klik), `src/components/pdf/LaporanProgresPDF.tsx` (A4, header CFK, 4 kad ringkasan, jadual per kategori dengan butiran), page `/bahan` + `_components/BahanKlient.tsx`, page `/tetapan/kategori`.
- **Menu "Bahan & Buku" (`/bahan`)** dalam sidebar selepas Silibus Kelas (ikon `Library`): muat naik buku/modul (PDF atau imej, **maks 25MB**) ke bucket `bahan-pengajaran`, senarai kad + Buka Fail (signed URL 1 jam) + Edit (boleh ganti fail) + Padam 2-klik (fail storage turut dipadam; topik yang merujuk kekal, buku_id → NULL).
- **Tab "Kategori Topik" dalam Tetapan** (`/tetapan/kategori`, ketiga): senarai + tambah + edit (nama/susunan/status) + padam. Padam **disekat** jika kategori sedang digunakan topik (papar bilangan) — cadang tukar 'Tidak Aktif'.
- **Diubah:** `src/types/database.ts` (3 blok jenis baharu), `supabase/schema.sql` (3 jadual + index + RLS + bucket, sync 2026-07-26), `Sidebar.tsx` (+Bahan & Buku), `TetapanNav.tsx` (+Kategori Topik), `pelajar/[id]/page.tsx` (fetch topik/kategori/buku/silibus), `ProfilPelajarKlient.tsx` (tab ketiga bersyarat + kiraan pada label), `pelajar/personal/page.tsx` (butang "Progress" per baris).
- **Ujian klik-lalu diperlukan (selepas run SQL):** /bahan → Tambah Buku + upload PDF → Buka Fail; /tetapan/kategori → 11 kategori terisi, tambah/edit/padam; profil pelajar Personal → tab Progress → Tambah Topik (kategori + tahap + buku + butiran) → kad muncul ikut kategori → butang pantas tukar tahap → ringkasan & bar % berubah → Muat Turun PDF; pelajar Kumpulan sahaja → tab TIDAK muncul; rekod Silibus pelajar itu → "Jadikan Topik". Padam data ujian selepas.

## ⚡ SESI 14 (25 Jul 2026)

### Halaman "Perkhidmatan Luar" dalam Tetapan (typecheck+lint+build LULUS; TIADA SQL)
Keperluan user: app guna beberapa perkhidmatan luar — perlu satu tempat senaraikan semua app terlibat, akaun/username, dan tatacara selenggara.
- **Tab baharu `/tetapan/perkhidmatan`** ("Perkhidmatan Luar", ketiga dalam `TetapanNav`). Halaman rujukan statik — **tiada migrasi SQL, tiada kata laluan disimpan**.
- **Fail baharu:** `tetapan/perkhidmatan/page.tsx` (klien, kad boleh kembang/kuncup) + `_data/perkhidmatan.ts` (semua kandungan; senang kemas kini tanpa sentuh UI).
- **8 perkhidmatan didokumen**, setiap satu: untuk apa · akaun/username · butiran (ID projek/repo/mod) · pautan papan pemuka · kos/pelan · "kalau ini mati apa jadi" · env var berkaitan · tatacara selenggara langkah-demi-langkah. Ditanda tahap **Kritikal** (Vercel, Supabase) / **Penting** (GitHub, Google Cloud OAuth) / **Sokongan** (ToyyibPay, Sentry, WhatsApp wa.me, Google Fonts).
- **Seksyen tambahan:** Checklist Selenggara (automatik / bila e-mel Sentry / bulanan / beberapa bulan), "Bila Berlaku Masalah" (app down, data kosong, data terpadam, syak akaun dimasuki), jadual 8 env var (nama + guna + tahap rahsia — nilai TIDAK dipapar), senarai kredensial jangan-kongsi.
- Sumber kandungan: `docs/PANDUAN-SELENGGARA.md` + status sesi lampau + `.env.local.example` + `backup.yml`.
- **Akaun (disahkan user 25 Jul):** Vercel, Supabase, Google Cloud Console, ToyyibPay & Sentry SEMUA guna `chessforkids80@gmail.com` (username Vercel `chessforkids80-3573`). GitHub: repo milik `makmalbptipoh-jmg`, commit ditolak sebagai `khatib-sketch`.
- Nota: `lucide-react` v1 **tiada ikon jenama** (`Github`/`Chrome` dibuang) — guna `GitBranch`/`LogIn`.

## ⚡ SESI 13 (23 Jul 2026)

## ⚡ SESI 13 (23 Jul 2026)

### Rekod Silibus / Tajuk Kelas + Laporan PDF (build+typecheck LULUS; BELUM diuji browser)
Keperluan user: satu tempat rekod silibus / tajuk yang diajar setiap kelas & cawangan, boleh muat turun PDF. Keputusan user: (1) **admin sahaja** rekod; (2) **log ikut tarikh** (satu baris = satu tajuk pada satu tarikh); (3) pilih **cawangan + tarikh** (tak terikat jadual). Medan yang diminta: **tajuk, tarikh, page (muka surat)**.
- ⚠️ **WAJIB run `scripts/sql/silibus.sql` SEBELUM deploy** — jadual `silibus` (tarikh, cawangan_id pilihan, jenis Kumpulan/Personal, tajuk, muka_surat TEXT, nota, direkod_oleh) + 2 index + RLS (`baca_silibus` terbuka, `tulis_admin_silibus` admin sahaja). Ada blok ROLLBACK.
- **Page baharu `/silibus`** (sidebar "Silibus Kelas", ikon BookOpen, selepas Jadual Kelas): `page.tsx` (server, fetch cawangan) + `_components/SilibusKlient.tsx` (penapis bulan+cawangan, jadual Tarikh/Hari/Cawangan/Jenis/Tajuk/Muka Surat, butang Muat Turun PDF) + `_components/ModalSilibus.tsx` (borang tambah/edit: tarikh default hari ini, cawangan, togol jenis, tajuk wajib, page, nota; padam 2-klik). CRUD terus ke Supabase (RLS), corak sama ModalSlot/ModalBatalSlot.
- **PDF** `src/components/pdf/LaporanSilibusPDF.tsx` (A4 portrait, header CFK, jadual 6 lajur, zebra) — corak dynamic import `pdf(...).toBlob()` sama bilangan-kelas.
- **Diubah:** `src/types/database.ts` (blok `silibus`), `supabase/schema.sql` (jadual + index + RLS, sync 2026-07-23), `src/components/layout/Sidebar.tsx` (link).
- **Diuji penuh di production (23 Jul):** tambah rekod (Klebang/Khamis/tajuk/page) ✅, banyak topik satu kelas ✅, PDF ✅, edit prapopulasi ✅, padam 2-klik ✅. Data ujian dipadam.
- **Susulan (23 Jul): medan Nama Pelajar untuk kelas Personal** — trace kelas siapa. SQL `silibus.sql` di-run semula user (tambah `pelajar_id` + index; idempotent). ModalSilibus tunjuk `CariPelajar` bila Personal (simpan `pelajar_id`, null bila Kumpulan). Senarai + PDF: lajur "Cawangan / Pelajar" tunjuk nama pelajar untuk Personal (helper `labelKelas`). Commit `e3b21f6`.
- **DIUJI PENUH di production (23 Jul, commit e3b21f6):** Personal → medan pelajar muncul ✅, carian pelajar (taip "har" → senarai sebenar) ✅, pilih HARITH KAMIL → simpan ✅, lajur "Cawangan / Pelajar" (Kumpulan=cawangan, Personal=nama pelajar tebal) ✅, edit Personal prapopulasi ✅, PDF ✅, padam data ujian ✅. **Ciri Silibus Kelas LENGKAP & LIVE.** User dah mula guna (rekod sebenar: Sri Iskandar · Chapter 3).

## ⚡ SESI 12 (19 Jul 2026)

### Bayaran Online (ToyyibPay) — admin jana link → resit auto (build+typecheck LULUS; BELUM diuji ToyyibPay sebenar)
Keperluan user: kurangkan kerja key-in resit manual. Research: e-Invois LHDN CFK DIKECUALIKAN (bawah RM1j — pengecualian kekal 6 Dis 2025). Gateway pilihan user: **ToyyibPay** (FPX RM1, ada sandbox). Aliran pilihan user: **admin hantar link** (bukan ibu bapa self-serve — tak perlu Pautan Ibu Bapa dulu).
- ⚠️ **WAJIB run `scripts/sql/bayaran-online.sql` SEBELUM deploy** — jadual `permintaan_bayaran` (bill_code UNIQUE, pelajar, jenis/bulan/tahun, jumlah, bil_kelas, status Menunggu/Selesai/Gagal, resit_id, payment_ref, dibuat_oleh) + RLS (baca authenticated, tulis admin) + tukar constraint `resit_kaedah_bayaran_check` tambah `'Online'`. Ada blok ROLLBACK.
- **Aliran:** admin buka Rekod Bayaran → pilih kaedah **Online** → "Jana Link Bayaran" (server action `ciptaPermintaanBayaran`) → ToyyibPay bill dijana → panel link + Salin + butang WhatsApp (pra-isi mesej). Ibu bapa bayar FPX/DuitNow → callback server-ke-server → **resit auto-jana** (kaedah 'Online').
- **Fail baharu:** `src/lib/toyyibpay.ts` (ciptaBil/statusBil/rujukanTransaksi, sandbox↔prod ikut `TOYYIBPAY_MODE`), `src/lib/bayaran-online-server.ts` (selesaikanPermintaanBayaran — service-role, sahkan semula dgn ToyyibPay, **claim atomik elak resit pendua**, cipta resit + log), `src/app/actions/bayaran-online.ts` (`ciptaPermintaanBayaran` + `semakStatusPermintaan` manual + `statusRingkas`; URL asas dari `headers()` betul di Vercel), route `src/app/api/bayaran/toyyibpay/callback/route.ts` (POST+GET, sentiasa balas OK), page awam `src/app/bayaran-selesai/page.tsx` (ibu bapa mendarat selepas bayar — juga cetus reconcile backup), page `/bayaran/permintaan` + `PermintaanKlient` (senarai + penapis + Semak Status manual + resend WA/Salin).
- **Diubah:** `BorangYuran.tsx` (kaedah 'Online' + divert jana + panel link step-3; pakej adik-beradik dimatikan bila Online — 1 bil/seorang), `proxy.ts`→middleware whitelist `/api/bayaran` + `/bayaran-selesai` (awam), `database.ts` (jenis `permintaan_bayaran` + 'Online' pada resit.kaedah_bayaran), TabelResit header butang "Permintaan Online", `.env.local.example` (+3 env).
- **NOTA Next 16:** middleware = **`src/proxy.ts`** (bukan middleware.ts); matcher TIDAK exclude /api jadi whitelist perlu dalam `updateSession`.
- **TERTUNGGAK user (setup ToyyibPay):** (1) daftar ToyyibPay ✅ SUDAH; (2) ambil **Secret Key** (User Profile) + cipta **Category** "Yuran CFK" → salin Category Code; (3) isi `.env.local` (TOYYIBPAY_SECRET_KEY/CATEGORY_CODE/MODE=sandbox) + set sama di **Vercel** env; (4) run SQL migration; (5) deploy → uji di production (callback perlu URL awam, bukan localhost): jana link → bayar guna bank simulator sandbox → sahkan resit auto-jana + status jadi Selesai. Bila ok → daftar akaun **production** toyyibpay.com + tukar keys + MODE=production.
- **BELUM diuji:** end-to-end dengan ToyyibPay sebenar (perlu keys user + deploy). Kod build+typecheck LULUS sahaja.

## ⚡ SESI 11 (19 Jul 2026)

### Kehadiran silang-cawangan (semua pelajar) + jurulatih daftar pelajar dari telefon (build+typecheck+19 ujian LULUS; BELUM diuji browser)
Keperluan user: polisi semua pelajar CFK (bukan hanya Personal) boleh hadir di cawangan lain — cadang cara ambil kedatangan; + jurulatih boleh daftar pelajar baru dari telefon. Keputusan user: (A) cara **cari nama → tambah** pelajar melawat; (B) pelajar baru **terus masuk** (tiada sahkan admin) + notifikasi loceng admin.

- **Ciri A (tiada SQL — guna `cawangan_sesi_id` sedia ada):** `JurulatihKehadiranKlient.tsx` — tambah `senaraiMelawat` (useMemo): muncul HANYA bila chip cawangan spesifik dipilih + ada carian, isi = pelajar Aktif sepadan nama yang BUKAN dalam senarai kumpulan/personal cawangan itu. Section baru **"Pelajar Dari Cawangan Lain"** (guna semula `kadPelajar`, papar cawangan asal) + hint di bawah kotak carian. Dimasukkan dalam `senaraiFiltred` → save tulis `cawangan_daftar_id`=asal, `cawangan_sesi_id`=cawangan hos (chip). Laporan Per Kelas (guna `cawangan_sesi_id`) auto tunjuk pelajar melawat dalam kelas hos.
- **Ciri B:**
  - ⚠️ **WAJIB run `scripts/sql/jurulatih-daftar-pelajar.sql` SEBELUM deploy** — RLS INSERT `pelajar` ganti `tambah_admin` → `tambah_admin_atau_jurulatih` (`is_admin OR jurulatih_id_semasa() IS NOT NULL`) + tambah enum `sumber_daftar 'Jurulatih'` (drop/add constraint `pelajar_sumber_daftar_check`). Ada blok ROLLBACK.
  - `src/types/database.ts`: union `sumber_daftar` + `'Jurulatih'` (Row/Insert/Update).
  - Route mobile baru **`/pelajar-baharu`** (`(jurulatih)/pelajar-baharu/page.tsx` + `_components/BorangPelajarKlient.tsx`): borang 1-skrin gaya rumah jurulatih, pra-isi cawangan dari `jurulatih.cawangan_ids[0]`, amaran pendua nama (debounce ilike), insert `sumber_daftar:'Jurulatih'` + nama HURUF BESAR + `yuran_bulanan:kirYuranBulanan()`. Empty state jika akaun tak dipaut. Butang **"Daftar Pelajar"** (UserPlus) di header page /kehadiran.
  - `notifikasi.ts`: jenis baru `pelajar_baharu_jurulatih` (kunci `pelajar_jurulatih:{id}`) — imbas pelajar sumber Jurulatih 30 hari lepas, upsert makluman (admin tandai dibaca sendiri; tiada auto-selesai).
- **Ujian klik-lalu diperlukan (selepas run SQL):** (A) login jurulatih → /kehadiran → pilih cawangan spesifik + taip nama pelajar cawangan lain → section "Pelajar Dari Cawangan Lain" → Hadir → Simpan → sahkan Laporan Kehadiran Harian cawangan hos + DB (`cawangan_sesi_id`=hos, `cawangan_daftar_id`=asal). (B) butang Daftar Pelajar → borang → hantar → toast + muncul senarai + amaran pendua ("CHUA") + loceng admin. Uji akaun jurulatih TAK berpaut → empty state / RLS tolak. Padam data ujian selepas.

## ⚡ SESI 10 (18 Jul 2026)

### A. Batal kelas untuk minggu tertentu (build LULUS; BELUM diuji browser)
Keperluan user: kadang-kadang kelas minggu tertentu dibatalkan (cuti umum dll) — slot mingguan berulang tiada cara tanda batal per-tarikh. Keputusan user: papar strikethrough + label merah "Dibatalkan" (bukan hilang).
- ⚠️ **WAJIB run `scripts/sql/batal-kelas.sql` dalam Supabase SQL Editor SEBELUM deploy** — jadual baharu `jadual_slot_batal` (slot_id CASCADE, tarikh, sebab, direkod_oleh, UNIQUE(slot_id,tarikh)) + RLS (baca authenticated, tulis admin).
- **UI**: butang "Batal minggu ini" pada kad slot (view Mingguan & Harian) → `ModalBatalSlot` (butiran kelas + sebab pilihan → insert + notifikasi loceng `kelas_dibatalkan:{slot}:{tarikh}`); slot dibatal papar strikethrough + pill merah, klik → mod "Aktifkan Semula" (delete row + notifikasi ditanda dibaca). View Bulanan: kiraan "N kelas" tolak batal + chip "M batal". Kad slot ditukar `<button>` → `<div role="button">` (elak butang bersarang).
- **Ripple**: widget dashboard "Jadual Hari Ini" papar batal (strikethrough); `notifikasi.ts` tolak slot batal dari kiraan `jadual_hari_ini` + auto-selesai `kelas_dibatalkan` bila tarikh berlalu; **PDF mingguan** kini khusus-minggu (tarikh pada header kolum, slot batal bergaris + "DIBATALKAN").

### B. Laporan Bilangan Kelas per cawangan + PDF
- Tab baharu **"Bil. Kelas"** bawah /laporan (`laporan/bilangan-kelas/page.tsx`): pilih bulan → jadual per cawangan: Kumpulan | Personal | Kelas Ganti | Dibatalkan | **Jumlah** + jumlah besar + baris "Personal (tiada cawangan)".
- Kiraan BERJADUAL: loop tarikh bulan (util bebas zon masa), slot Aktif padan hari − `jadual_slot_batal` + aktiviti 'Kelas Ganti' Aktif. Nota pada UI: "kiraan berdasarkan jadual semasa" (slot dipadam/dinyahaktif tidak dikira utk bulan lampau — had diketahui).
- PDF: `src/components/pdf/LaporanBilKelasPDF.tsx` (A4 portrait, logo CFK, jadual + jumlah besar), corak dynamic import sama.

### C. Gaji jurulatih "macam syarikat sebenar" — angka TERHUTANG + payroll bulanan
Keperluan user: tiada total gaji yang perlu dibayar (bil kelas × rate). Penemuan: check-in jurulatih & kadar dah wujud; yang hilang angka terhutang.
- **Senarai jurulatih**: kolum baharu "Belum Bayar" (merah jika > 0, "RM0.00 ✓" hijau jika selesai) + kad stat "Gaji Belum Dibayar {bulan}" (formula: sesi Hadir bulan ini × kadar_bayaran − Σ dibayar bulan ini, clamp ≥ 0) + butang "Gaji Bulanan" → page baharu. Bulan kini ikut waktu Malaysia (bukan zon pelayan).
- **Page payroll baharu `/jurulatih/gaji`**: pilih bulan → jadual semua jurulatih Aktif: Sesi (pecahan K/P) | Kadar | Patut Dibayar | Baki Advance | Sudah Dibayar | **Baki** | status (Selesai/Sebahagian/Belum Bayar/Tiada Sesi) | link Rekod Bayaran (guna ModalRekodBayaran sedia ada). 3 kad ringkasan + baris JUMLAH + **panel Tunggakan** (imbas 3 bulan sebelum: sesi hadir tapi tiada rekod bayaran).
- **Dashboard**: kiraan gaji kini ambil kira **bayaran separa** (baki = anggaran − dibayar, bukan boolean ada-rekod).
- Refactor: `NAMA_BULAN` dipromosi ke `src/lib/utils.ts` (duplikasi dibuang dari notifikasi.ts, dashboard, pelajar, laporan/tunggakan).

### D. Penambahbaikan CEO (audit keseluruhan app — pilihan user: semua 3 bundle)
- **D1 Quick wins**: `Topbar.tsx` mati DIPADAM; `loading.tsx` skeleton (komponen kongsi `SkeletonPage`) pada dashboard/pelajar/jurulatih/bayaran/jadual/laporan/kewangan; link **Notifikasi** ditambah dalam Sidebar; **`supabase/schema.sql` ditulis semula penuh** (21 jadual + RLS + trigger + bucket, selari dengan DB sebenar; nota: rujukan penuh, migrasi tambahan di scripts/sql/).
- **D3 Logik tunggakan disatukan**: `src/lib/tunggakan.ts` (rule: ≥4 hadir tanpa resit aktif — `MIN_HADIR_TUNGGAKAN`, `perluBayarBulan`, `kiraHadirPerBulan`, `setResitDibayar`, `bulanTertunggak`); 5 pengguna direfactor (dashboard, pelajar, laporan/tunggakan, notifikasi, makluman) — kelakuan SAMA.
- **D2 Borang bayaran disatukan**: `/bayaran/baharu` kini hub dengan togol **"Yuran Bulanan" | "Sesi Kelas Personal"** (`BorangHub` + `BorangYuran` + `BorangSesiPersonal`, gaya kongsi `src/components/ui/borang.ts`); `/bayaran/personal/baharu` → redirect `/bayaran/baharu?jenis=personal` (link lama tak putus); link TabelResit dikemaskini.
- **Cadangan CEO ditangguh** (pusingan depan): role granular (kewangan/pengurus cawangan), kemas naming 3 laluan kehadiran, admin UI responsive mobile, laporan berjadual/email, backup automatik.

**Typecheck + build LULUS (42 route).** SQL `batal-kelas.sql` sudah di-run user; deploy production READY (7c7c6b0). User uji batal kelas ✅.

### Pantauan Pakej Kelas Personal (prabayar 4 kelas) — permintaan user
Masalah: pelajar personal bayar TERUS untuk 4 kelas, tiada cara tahu bila dah cukup 4 (masa kutip bayaran baru). Keputusan user: pakej default 4 (boleh ubah), kiraan dari kehadiran direkod, pantau di page khas + widget dashboard + notifikasi.
- ⚠️ **WAJIB run `scripts/sql/pakej-personal.sql`** — kolum `resit.bil_kelas SMALLINT` (bilangan kelas dibeli, resit Personal sahaja; NULL = resit lama).
- **Model**: kredit = Σ bil_kelas resit Personal Aktif; digunakan = kehadiran Hadir sesi personal SEJAK resit berpakej pertama (anchor — sejarah lama tak dikira); baki = kredit − digunakan. Pelajar 'Kumpulan+Personal': hanya kehadiran bernota "Kelas Personal..." ditolak. Helper kongsi `src/lib/pakejPersonal.ts`.
- **Borang**: BorangYuran jenis Personal ada input "Bilangan Kelas (pakej)" default 4 → simpan bil_kelas; BorangSesiPersonal (bayar-per-sesi) auto bil_kelas=1 (kredit 1 + guna 1 = seimbang).
- **Page baharu `/pelajar/personal`** (butang "Pantauan Personal" di page Pelajar): senarai pelajar personal — Dibeli | Digunakan | Baki (progress bar) | Sesi Terakhir | Status (CUKUP merah / Tinggal 1 kuning / OK hijau / Belum ada pakej kelabu), susunan Cukup dahulu, butang WA peringatan + Rekod Bayaran.
- **Widget dashboard** "Pakej Kelas Personal Habis" (hanya bila ada) + **notifikasi loceng** jenis `pakej_personal` (kunci `pakej_personal:{id}:{kredit}` — topup ubah kredit → notifikasi lama auto-selesai).

### Susulan (maklum balas ujian user): kelas dibatalkan mesti DITOLAK dari jumlah
- **Gaji jurulatih**: helper baharu `src/lib/gajiSesi.ts` (`tapisSesiDibatalkan`) — check-in `kehadiran_jurulatih` pada tarikh+cawangan+jenis yang SEMUA slot sepadannya dibatalkan → TIDAK dikira gaji (kelas ad-hoc tanpa slot dikekalkan). Diterapkan di 5 tempat: `/jurulatih/gaji` (+ nota merah "−N sesi kelas dibatalkan"), senarai jurulatih, dashboard, notifikasi gaji, page bayaran jurulatih (auto-isi bilSesi modal — cap bilSesi turut turun).
- **Laporan Bil. Kelas**: penolakan memang sudah berlaku (disahkan dengan simulasi data production) tetapi tak kelihatan — kini kolum Dibatalkan papar "−N" dan kolum Jumlah papar subteks "X dijadual − N batal" (skrin + PDF); nota diperjelas.
- **View Bulanan**: chip "−N dibatalkan" (sebelum ini "N batal"); nota kaki jelaskan kiraan sudah ditolak.

## ⚡ SESI 9 (18 Jul 2026)

### Gaji Jurulatih: hari gaji 30hb + Advance + TNG eWallet + kutipan terkini (build LULUS; BELUM diuji browser)
Keperluan user: gaji dibayar 30hb setiap bulan, papar kutipan gaji terkini dalam senarai jurulatih, tab Advance (ambil gaji awal), dan cara transfer ke TNG eWallet. Keputusan user: advance ditolak AUTOMATIK dari gaji; simpan no TNG + gambar QR; peringatan loceng + widget dashboard.
- ⚠️ **WAJIB run `scripts/sql/gaji-advance-tng.sql` dalam Supabase SQL Editor SEBELUM deploy** — kolum `no_tng`+`tng_qr_path` (jurulatih), `potongan_advance`+`kaedah_bayaran` (bayaran_jurulatih), table baharu `advance_jurulatih` (jumlah/baki/tarikh/kaedah/status Belum Selesai→Selesai/bayaran_id) + RLS admin.
- **Keputusan reka bentuk:** kolum GENERATED `jumlah` TIDAK disentuh (kekal kasar); bersih = jumlah − potongan_advance dikira dalam app/PDF. **Perakaunan tanpa kira dua kali:** advance pos belanja penuh masa direkod; gaji pos BERSIH sahaja (skip jika RM0) → jumlah belanja = kasar. Advance > gaji → baki dibawa ke bulan depan (FIFO, paling lama dulu).
- **Tab "Advance"** (ke-4) dalam profil jurulatih: kad Baki Belum Selesai (oren jika > 0), jadual, `ModalRekodAdvance` (jumlah/tarikh/kaedah pil Tunai/TNG/Bank/nota; panel TNG papar no boleh salin + QR). Label tab papar baki cth "Advance (RM100.00)".
- **ModalRekodBayaran**: potongan advance auto (default penuh, boleh edit, had min(baki, kasar)), paparan Kasar − Potongan = **Bersih**, pemilih kaedah bayaran, panel TNG (salin no + QR + jumlah bersih untuk transfer). Selepas insert bayaran → agih potongan FIFO ke baris advance (baki=0 → 'Selesai' + bayaran_id). Jadual sejarah: kolum Kasar/Potongan/Bersih/Kaedah (Nota dibuang).
- **TNG eWallet** (TNG tiada API — transfer manual DuitNow/scan QR guna app bank): borang Edit jurulatih ada kad "TNG eWallet" (no telefon + upload QR ke bucket `gambar-jurulatih` path `tng-qr/{id}`, max 2MB); borang baharu ada input no sahaja (QR via Edit). Tab Profil papar No. TNG.
- **Slip Gaji PDF**: baris Gaji Kasar + "Tolak: Advance Gaji (RM…)" bila potongan > 0; JUMLAH GAJI BERSIH = bersih; baris Kaedah Bayaran. Rekod lama (potongan 0/NULL) tak berubah.
- **Senarai jurulatih**: kolum baharu "Bayaran Terkini" (bulan tahun · jumlah + tarikh; ikut tarikh_bayar desc fallback created_at).
- **Notifikasi loceng** jenis `gaji_jurulatih` (kunci `gaji_jurulatih:{id}:{YYYY-MM}`): dari **27hb** hingga akhir bulan, satu per jurulatih Aktif dengan sesi Hadir > 0 tetapi belum 'Sudah Bayar' bulan itu; mesej anggaran sesi×kadar + "Bayar sebelum 30hb" (Feb: hari akhir bulan). Auto-selesai bila dibayar / bulan berlalu.
- **Widget dashboard "Gaji Jurulatih"** (bawah grid 2-kolum): Perlu Dibayar (oren bila ≥27hb) + Sudah Dibayar + senarai belum bayar dengan butang "Bayar Gaji" → page bayaran. Ikut penapis bulan/tahun dashboard.
- `src/types/database.ts` dikemaskini (advance_jurulatih + kolum baharu). Build + TypeScript LULUS.
- **Ujian klik-lalu diperlukan** (selepas run SQL): rekod advance RM100 → Kewangan +RM100; bayar gaji 6×RM50 → modal Kasar RM300/Potongan RM100/Bersih RM200 → advance 'Selesai', Kewangan +RM200 (jumlah RM300, tiada double-count); slip PDF; kes advance > gaji (baki dibawa); notifikasi (uji: tukar sementara `>= 27` → `>= 1` dalam notifikasi.ts).

### Page Jadual Kelas + Aktiviti + Notifikasi Jadual (BELUM commit — build+typecheck+17 ujian LULUS; DIUJI PENUH browser localhost)
Keperluan user: satu tempat rujuk jadual supaya tak lupa — kelas kumpulan per cawangan, kelas personal (dikaitkan pelajar), aktiviti lain CFK. Keputusan user: loceng+widget (tiada push), akses admin sahaja, personal = slot mingguan DAN ad-hoc.
- ⚠️ **WAJIB run `scripts/sql/jadual-kelas.sql` dalam Supabase SQL Editor SEBELUM deploy/uji** — 2 jadual baharu: `jadual_slot` (kelas berulang mingguan: jenis Kumpulan/Personal, hari_minggu 0-6, masa, cawangan/pelajar/jurulatih, CHECK Kumpulan wajib cawangan & Personal wajib pelajar) + `aktiviti` (acara bertarikh: kategori Pertandingan/Kem/Mesyuarat/Kelas Personal/Kelas Ganti/Lain-lain, status Aktif/Dibatalkan). RLS: baca semua authenticated (sedia utk jurulatih kelak), tulis admin. Kod merosot anggun jika jadual tiada (page/widget kosong, tiada crash).
- **Page `/jadual`** (admin, sidebar "Jadual Kelas" ikon CalendarDays): grid mingguan Ahad–Sabtu (kolum hari ini highlight hijau) + senarai Aktiviti Akan Datang. Penapis cawangan (slot Personal sentiasa dipapar — pelajar personal boleh hadir mana-mana cawangan). Klik slot → edit.
- `ModalSlot`: toggle Kumpulan/Personal, CariPelajar utk Personal, hari+masa, jurulatih/lokasi/nota pilihan; **amaran pertindihan lembut** (hari sama + masa bertindih + jurulatih/cawangan sama → amaran kuning + butang "Simpan Juga"); padam 2-klik ("Sah Padam?"). `ModalAktiviti`: nama/kategori/tarikh/masa/lokasi/penerangan; kategori Kelas Personal wajib pelajar; butang Batalkan (status) + Padam.
- **Notifikasi loceng** (`notifikasi.ts`): jenis baharu `jadual_hari_ini` (1 agregat/hari, kunci `jadual_hari_ini:<tarikh>`) + `aktiviti_esok` (1 per aktiviti, kunci `aktiviti_esok:<id>`); auto-selesai bila hari berlalu / aktiviti dibatal. Tarikh esok dikira Date.UTC (bebas zon masa).
- **Widget dashboard "Jadual Hari Ini"** (bawah carta trend): slot hari ini + aktiviti hari ini, susun ikut masa, pautan ke /jadual; SENTIASA hari semasa (tak ikut penapis bulan/cawangan dashboard).
- Utils baharu dikongsi: `HARI`, `hariMinggu()` (dipromosi dari LaporanKelasKlient), `formatMasa()` ('15:30:00'→'3:30 PTG') + 5 ujian baharu (17 semua). HARI duplikat dibuang dari LaporanKelasKlient & laporan/page.
- **SQL sudah di-run user (18 Jul) + DIUJI PENUH dalam browser localhost (login Google chessforkids80)**: tambah slot Kumpulan (Klebang Ahad 10-12 + jurulatih) → kolum betul ✅; slot Personal via CariPelajar (CHUA, Sabtu 3-4ptg, lokasi) → kolum Sabtu ✅; amaran pertindihan kuning + "Simpan Juga" oren ✅; aktiviti esok (Pertandingan 19 Jul) → senarai ✅; loceng badge 2: "Aktiviti esok" + "Jadual hari ini: Sabtu ini 1 kelas personal" ✅; widget dashboard papar slot personal hari ini ✅; edit modal prapopulasi ✅; padam 2-klik "Sah Padam?" ✅; auto-selesai aktiviti_esok selepas aktiviti dipadam ✅; tiada console error. Semua data ujian dipadam selepas ujian (jadual kini kosong — user isi jadual sebenar).
- Lint: +2 `any` dalam dashboard (ikut gaya sedia ada fail itu; CI tak semak lint).

### Susulan 3: PDF Jadual Mingguan — cetak & tampal di cawangan (arahan user)
- `src/components/pdf/JadualMingguPDF.tsx` (BARU): poster A4 **landscape** — header logo CFK + "JADUAL KELAS MINGGUAN" + nama cawangan; 7 kolum Ahad–Sabtu, kotak slot (masa mula-tamat, nama cawangan/pelajar, jenis, jurulatih, lokasi; Personal berlatar biru); footer nota "jadual berulang setiap minggu" + tarikh jana. Jadual evergreen — TIADA aktiviti bertarikh (poster kekal relevan).
- Butang **"Cetak PDF"** dalam view Mingguan (sebelah Minggu Depan) — corak dynamic import `@react-pdf/renderer` sama LaporanKelasKlient; ikut penapis cawangan semasa (nama fail `Jadual_Mingguan_<CAWANGAN>.pdf`); slot Personal ikut peraturan penapis sedia ada (sentiasa dipapar).
- Typecheck + build LULUS. **Ujian klik butang dalam browser TIDAK sempat** (sesi login tab automasi tamat; user arah "DEPLOY SEMUA") — sahkan sekali di production: view Mingguan → Cetak PDF → fail turun & buka.

### Susulan 2: View Harian / Mingguan / Bulanan (arahan user)
- Toggle `[Harian | Mingguan | Bulanan]` di page /jadual (default Mingguan). Tiada SQL baru.
- **Harian** (`PandanganHarian.tsx`): pilih tarikh + Semalam/Esok/Hari Ini; senarai ikut masa (slot hari itu + aktiviti tarikh itu) dengan butiran penuh; klik → edit.
- **Mingguan** (`PandanganMingguan.tsx`): grid 7 hari kini **ikut tarikh sebenar** (header hari + tarikh, navigasi Minggu Lepas/Depan/Ini); aktiviti minggu itu muncul dalam kolum hari (kad berwarna ikut kategori).
- **Bulanan** (`PandanganBulanan.tsx`): kalendar penuh (offset 1hb betul), chip "N kelas" per hari + hingga 2 aktiviti per tarikh (+N lagi); klik tarikh → lompat view Harian.
- `JadualKlient` refactor: state pandangan/tarikh/minggu/bulan; aktiviti di-fetch ikut julat view (useEffect pada julat+versi); butang Tambah Aktiviti naik ke header. Util baharu `tambahHari()` + 2 ujian (19 semua).
- Diuji browser localhost: ketiga-tiga view + navigasi + klik kalendar→harian ✅ (data sebenar user: Klebang Ahad/Sabtu, Buntong Sabtu malam, personal HARRSHAN ONLINE). Typecheck+build LULUS.

### Susulan: jurulatih RAMAI per slot/aktiviti (arahan user — "kelas ada ramai coach")
- ⚠️ `scripts/sql/jadual-jurulatih-ramai.sql` **sudah di-run user (18 Jul)**: kolum `jurulatih_id` tunggal → `jurulatih_ids UUID[]` pada `jadual_slot` + `aktiviti` (data lama dipindah automatik, idempotent DO block).
- UI: dropdown jurulatih diganti **butang toggle pil multi-pilih** (✓ hijau, corak sama `cawangan_ids` borang jurulatih) dalam ModalSlot + ModalAktiviti; paparan "J: NAMA1, NAMA2" di grid, senarai aktiviti & widget dashboard (peta id→nama, dashboard fetch senarai jurulatih).
- Amaran pertindihan kira bertindih jika **mana-mana** jurulatih berkongsi (`.some/.includes`).
- Diuji browser localhost: pilih 2 jurulatih → simpan → papar 2 nama ✅; edit prapopulasi 2 ✓ ✅; padam ✅. Typecheck+17 ujian+build LULUS.

### Log Masuk dengan Google (OAuth) — LIVE
User minta cara login "moden" (asalnya tanya magic link; keputusan akhir Google OAuth macam SPDMI — pilih e-mel terus masuk, tiada e-mel dihantar, tiada Resend/SMTP diperlukan).
- **Hibrid:** butang "Log Masuk dengan Google" jadi cara UTAMA di `/login`; borang kata laluan kekal sebagai sandaran (tersembunyi di sebalik toggle "Log masuk dengan kata laluan").
- Fail: `src/app/auth/callback/route.ts` (BAHARU — exchangeCodeForSession, semakan profil, audit log, redirect ikut peranan), `src/lib/supabase/middleware.ts` (whitelist `/auth` awam), `src/app/(auth)/login/page.tsx` (butang Google + Suspense/useSearchParams untuk mesej ralat callback).
- **Keselamatan (PENTING):** Supabase "Allow new users to sign up" = **OFF** (di-set user 18 Jul). Tanpa ini sesiapa dengan akaun Google boleh jadi authenticated dan baca data (RLS baca terbuka). Pertahanan kedua dalam callback: tiada `pengguna_profil` → signOut + `/login?ralat=tiada_akaun`.
- Setup manual siap (user, 18 Jul): Google Cloud Console projek "CFK HUB" (OAuth client, redirect URI Supabase, consent screen production, scope asas sahaja) + Supabase provider Google + URL Configuration (site URL + redirect production & localhost).
- **Diuji localhost (18 Jul):** login Google chessforkids80 → auto-LINK pada user sedia ada (providers `email, google`, TIADA user pendua — gelagat GoTrue semasa betul walau signups OFF) → `/dashboard` ✅; audit "Log Masuk" direkod ✅; mesej BM `tiada_akaun` & `google_gagal` dipapar betul ✅; toggle borang kata laluan ✅; logout → `/dashboard` disekat ✅. Typecheck + 12 ujian + build LULUS.
- Nota mesin: laptop ini perlu `npm install` + cipta semula `.env.local` (dibuat 18 Jul).
- **Belum diuji (buat di production):** login Google akaun jurulatih sebenar → `/kehadiran`; PWA Android; penolakan akaun Google asing hujung-ke-hujung (di localhost hanya disimulasi via parameter ralat callback); sandaran kata laluan login sebenar.
- E-mel akaun mesti = akaun Google sebenar pengguna. Berdaftar kini: khatib@jmg.gov.my, nurfar.2007, aisyahkhatib1234, syahmairah6, saniharussani54, maisarahkhatibcfk, chessforkids80.

## ⚡ SESI 8 (14 Jul 2026)

### Laporan Per Kelas — mod Harian + Bulanan (Laporan → Kehadiran)
- **Definisi kelas (arahan user):** kelas = **cawangan + hari** (cth. KLEBANG · Ahad = 1 kelas). Sebelum ini laporan cawangan hanya boleh dijana **sebulan sekali** — jurulatih tak boleh dapat senarai kelas pada satu tarikh.
- `LaporanKelasKlient.tsx` kini ada **toggle mod**:
  - **Harian** — pilih cawangan + 1 tarikh → senarai nama + status (Hadir/Tidak Hadir/Cuti) + nota untuk kelas hari itu; tajuk papar nama hari.
  - **Bulanan** — pilih cawangan + bulan + **penapis Hari** (Semua/Ahad…Sabtu) → grid **tarikh × nama** (H/T/C/-) + jumlah H/T/C/% per pelajar.
- Sumber data: `kehadiran.cawangan_sesi_id` (bukan `cawangan_daftar_id`) — jadi pelajar Personal yang hadir di cawangan lain ikut masuk kelas yang betul. Baris = pelajar yang ada rekod pada tempoh itu.
- `LaporanKelasPDF.tsx` ditulis semula: props `{cawangan, tempoh, mod, tarikhKolum, baris}`; PDF bulanan auto-**landscape** bila > 5 sesi. Excel juga ikut mod (harian: Status+Nota; bulanan: grid tarikh).
- **Diuji dalam browser (data sebenar)**: Harian Klebang 5 Jul 2026 (Ahad) → 52 pelajar + status ✅, PDF turun 29KB ✅; Bulanan Klebang Julai + hari Ahad → grid 1 sesi (5 Jul) × 52 nama ✅. Nota: **12 Jul (Ahad lepas) TIADA rekod kehadiran langsung** dalam DB — jurulatih belum tanda; laporan 0 pelajar itu betul.
- Fix sampingan `next.config.ts`: `'unsafe-eval'` ditambah pada `script-src` **dalam dev sahaja** (React dev mode perlukan eval → console error). CSP production kekal ketat.
- Typecheck + build LULUS.

## ⚡ MULA SINI SESI 8

**Penting: Sesi 7 dibuat di DUA mesin** (desktop + laptop) — SENTIASA `git pull --rebase` sebelum mula kerja; laptop pernah konflik rebase pada `JurulatihKehadiranKlient.tsx` sebab desktop push dulu. Selepas pull, jalankan `npm install` (desktop tambah dependency `@sentry/nextjs` + `vitest`).

**Penghujung Sesi 7 (laptop):** semua ciri kehadiran personal LIVE — section Kelas Personal, chip Personal, sorok UPLINK, carian nama (lihat butiran Sesi 7 di bawah). Build + typecheck lulus, deploy auto berjalan.

**Semak/tertunggak Sesi 8:**
1. Cawangan baharu **UPLINK** didaftar user (8 Jul) — belum ada pelajar. Section personal disorok untuk UPLINK **ikut nama cawangan**; jika user tukar nama cawangan itu, peraturan lupus.
2. Dari Sesi 6: sahkan akaun jurulatih masih boleh rekod kehadiran selepas RLS ketat (`rls-ketat.sql`) — belum diuji end-to-end.
3. Tertunggak lama user: kaitkan akaun HARUSSANI; 22 pelajar placeholder; sewa Mac/Julai + bukti Apr–Jun.

---

## ⚡ SESI 7 (8 Jul 2026)

### Section Kelas Personal dalam Rekod Kehadiran (`88e1ce7`)
- Page Rekod Kehadiran (S-08) kini ada **section "Kelas Personal"** di bawah senarai biasa: pelajar `jenis_kelas` Personal muncul pada SEMUA penapis cawangan (mereka boleh hadir kelas di mana-mana cawangan — arahan user).
- Pelajar `Kumpulan+Personal`: dalam senarai biasa bila chip padan cawangan daftar; masuk section Personal bila chip cawangan lain dipilih. Badge "Personal" pada kad.
- Simpan guna logik sedia ada — `cawangan_sesi_id` = chip dipilih (atau cawangan daftar bila "Semua"); view Semak admin sudah tapis ikut `cawangan_sesi_id`, tiada ubah.
- Digabung (rebase) dengan kerja desktop Sesi 7 — kad pelajar kekalkan butang Hadir/Cuti + Tak Aktif baharu.
- Susulan arahan user: chip penapis **"Personal"** di hujung barisan chip (`bc36bcb`); section personal DISOROK untuk chip UPLINK sahaja — dipadan ikut nama cawangan (`fafb27b`); **kotak carian nama** di atas ringkasan — tapis paparan sahaja, tanda yang tersembunyi tetap disimpan (`5f11312`).

### Kemas & pembetulan
- Seluruh sistem paparan **HURUF BESAR** konsisten (`globals.css` — `body { text-transform: uppercase }`); e-mel paparan dikecualikan (senarai pengguna, profil jurulatih/pelajar, pengesahan daftar).
- **Laporan Kehadiran PDF**: buang simbol `ℹ ⚠ ✓ ≥` yang tak disokong font Helvetica (punca teks bertindih pada "Bilangan…"). Semua PDF lain disemak — bersih.

### Modul BAHARU: Dokumen Jualan (Sebut Harga / Invois / Resit Rasmi)
Untuk jualan peralatan & perkhidmatan kepada sekolah/organisasi — dengan **alamat pembeli** + senarai item berperingkat.
- **`scripts/sql/dokumen-jualan.sql`** ✅ sudah run di Supabase (LIVE).
- Jadual `dokumen_jualan` + `dokumen_item`; nombor auto `YYYY-NNNNN` (prefix SH/INV/RS pada PDF).
- Satu dokumen → cetak 3 jenis PDF (kongsi butiran pembeli & item). Komponen `src/components/pdf/DokumenJualanPDF.tsx` (1 komponen, 3 mod).
- Page `/kewangan/dokumen` + tab "Dokumen Jualan" dalam KewanganNav; borang butiran pembeli (nama/alamat/PIC/tel/e-mel) + item dinamik (kuantiti × harga) + akaun bank manual/tunai.
- Bila peringkat = **Resit**, jumlah auto-direkod ke `pendapatan_lain` (kolum baharu `dokumen_id`, FK ON DELETE CASCADE) → masuk Laporan Kewangan/LHDN.
- Validasi `src/lib/validation/dokumen.ts`. Typecheck + 12 ujian LULUS.

### Logo rasmi CFK jadi logo utama (LIVE)
Logo CFK (knight + "CHESS FOR KIDS") ganti lambang pawn emas `♟︎` di seluruh sistem.
- Aset dijana guna **`scripts/generate-logo-assets.mjs`** (sharp): `public/logo-cfk.png` (web), `src/components/pdf/logoCfk.ts` (base64 ~17KB dikongsi PDF), `public/icon-192.png`/`icon-512.png` (logo atas kotak #1E293B untuk ikon app/favicon). Jalankan semula skrip bila tukar logo.
- **Web header**: Sidebar (logo 42px latar gelap + badge biru "Panel Admin"), Login (logo 88px), pratonton resit `/bayaran/baharu` — kekal teks "CFK HUB".
- **7 PDF** (Resit, Resit Pendapatan, Dokumen Jualan, Slip Gaji, Laporan, Laporan Kelas, Kad Pelajar): logo di header (42px, ~30% lebih besar) — kekal nama syarikat + alamat.
- **Ikon app telefon (PWA)**: perlu buang & pasang semula sekali untuk ikon baharu keluar (OS cache). ✅ disahkan berjaya.

## ⚡ SESI 6 (7 Jul 2026)

### Ringkasan penuh Sesi 6 (semua LIVE di production)
Ciri baharu dibina & deploy sepanjang sesi (ikut turutan commit):
- Fix zon masa tarikh "hari ini" (util `tarikhTempatan`/`bulanTempatan`)
- Loceng notifikasi 🔔 amaran operasi + auto-logout 30 min → **`notifikasi.sql`** ✅ run
- Log Aktiviti/Audit (trigger DB 10 jadual) → **`log-aktiviti.sql`** ✅ run
- Modul Pendapatan Lain/Sumbangan → **`pendapatan-lain.sql`** ✅ run
- Butang Edit rekod (kehadiran jurulatih penuh, perbelanjaan, pendapatan, kehadiran pelajar nota, resit)
- Penapis Dashboard (Cawangan/Bulan/Tahun) + highlight tunggakan **berperingkat** (kuning→oren→merah, aging)
- Rekod kehadiran ringkas (Hadir/Cuti/Tak Aktif) + logout jurulatih + buang tab Pelajar jurulatih
- Login tanpa autofill (keselamatan selepas auto-logout)
- Laporan Kehadiran **Per Kelas** (PDF+Excel) + Laporan **Tunggakan** (aging)
- **Resit pendapatan luar** (jualan peralatan/khidmat kursus) → **`resit-pendapatan.sql`** ✅ run
- **Sistem Rating Pelajar** (1 kehadiran = 1 bintang = 10 point; level catur English Pawn→Knight→Bishop→Rook→Queen→King) + **Kad Pelajar PDF** (`src/lib/rating.ts`)
- **Carta trend dashboard** (pendapatan + kehadiran bulanan)
- **Ujian vitest** (12 ujian: tarikh/wang/rating) + **CI GitHub Actions** (`.github/workflows/ci.yml`, hijau)
- **Validasi zod** borang kewangan (`src/lib/validation/kewangan.ts`)
- **Sentry** pemantauan ralat (`src/instrumentation*.ts`, `global-error.tsx`) — baca `NEXT_PUBLIC_SENTRY_DSN`; inert tanpa DSN

### Tindakan USER — SELESAI (7 Jul 2026)
- ✅ **Sentry AKTIF** — user set `NEXT_PUBLIC_SENTRY_DSN` di Vercel + redeploy; disahkan ralat sampai ke Sentry Issues
- ✅ **Backup mingguan BERJAYA** — user set GitHub secret `DATABASE_URL` (Session pooler URI); run manual berjaya, artifact ~38KB dihasilkan. Backup auto setiap Ahad 10 pagi MYT.

### Keselamatan RLS diketatkan (7 Jul 2026) ✅
- `scripts/sql/rls-ketat.sql` **sudah di-run user**. Ganti polisi "auth" permisif (mana-mana login boleh tulis) dengan model peranan: BACA kekal terbuka; TULIS admin sahaja untuk resit/kewangan_perbelanjaan/aset/jurulatih/bayaran_jurulatih/cawangan/import_antrian. Kekal boleh tulis jurulatih: `kehadiran` (insert/update) + `pelajar` UPDATE (Tak Aktif). Ada blok ROLLBACK dalam fail. **Nota: perlu sahkan akaun jurulatih masih boleh rekod kehadiran (belum diuji end-to-end).**

### Tweak lanjut (7 Jul 2026, hujung sesi)
- Fix penjajaran butang "Tambah Sesi" dgn kotak bulan (S-27) — buang label bulan berlebihan
- Level rating tukar nama Melayu → **English** (Pawn/Knight/Bishop/Rook/Queen/King) — terjemahan BM janggal
- Panduan selenggara diberi kepada user: app "managed" (Vercel+Supabase), tiada selenggara harian; cuma pantau e-mel Sentry + semak backup hijau bulanan + update library beberapa bulan sekali

### Tindakan USER masih tertunggak (data, tidak kritikal)
- Rekod sewa Mac/Julai; kaitkan akaun jurulatih harussani/aisyah; isi 22 pelajar placeholder

### Tidak dibuat (keputusan user: "cukup setakat ini")
- Cron peringatan yuran bulanan + e-mel Resend (item ke-5 pakej penambahbaikan)



**Audit & polish — bug zon masa tarikh "hari ini" (belum commit, build+typecheck LULUS):**
- Punca: baki `new Date().toISOString().split('T')[0]` beri tarikh UTC → antara 12 tgh malam–8 pagi MYT ia pulang SEMALAM (borang bayaran/perbelanjaan/sesi default tarikh salah; widget "Hadir Hari Ini" & dashboard salah hari).
- Util baharu dalam `src/lib/utils.ts`: `tarikhTempatan()` + `bulanTempatan()` (kira UTC+8, betul di pelayan Vercel UTC & browser). Ganti di dashboard admin+jurulatih, kehadiran, 6 borang, 2 penapis bulan.
- Baiki penapis Histori Makluman (sempadan bulan +08:00 konsisten — rekod awal pagi 1hb tak tercicir).
- DRY: buang helper `tarikhTempatan` duplikat dalam KehadiranSayaKlient → guna util kongsi.

**Notifikasi loceng 🔔 + sejarah + auto-logout (belum commit, build+typecheck LULUS):**
- ⚠️ **WAJIB run `scripts/sql/notifikasi.sql` dalam Supabase SQL Editor** sebelum ciri berfungsi (kod merosot anggun jika jadual tiada — loceng kosong, tiada crash).
- Jadual `notifikasi` (jenis/tajuk/mesej/pautan/kunci UNIQUE/rujukan_id/dibaca) + RLS `is_admin`.
- Server actions `src/app/actions/notifikasi.ts`: `janaDanMuatNotifikasi` (jana amaran "pelajar belum bayar" ≥4 hadir tiada resit, dedup ikut kunci per pelajar/bulan, AUTO-SELESAI bila sudah bayar), `tandaDibaca`, `tandaSemuaDibaca`.
- Loceng `LocengNotifikasi.tsx` dalam `NavigasiAtas` (admin sahaja): badge merah, panel dropdown, refresh tiap 5 min, tandai dibaca, pautan tindakan.
- Page sejarah `/notifikasi` (admin): penapis Semua/Belum dibaca, tandai satu/semua.
- **Auto-logout** `AutoLogout.tsx` (SEMUA pengguna, dipasang di kedua-dua layout): 30 min tidak aktif → modal amaran kiraan 60s → log keluar. Butang "Kekal Log Masuk" reset.
- Nota: hanya jenis amaran `belum_bayar` dihantar buat masa ini (paling jelas/bernilai). Jenis lain (kehadiran belum ditanda, aset) perlu kriteria jadual kelas dahulu — boleh tambah kemudian; seni bina sudah generik.
- **BELUM diuji dalam browser** (perlu migration di-run + login admin). Tawaran: uji via Chrome extension selepas user run SQL.

**Dashboard penapis + highlight belum bayar (commit `777de2b`, LIVE & diuji browser):**
- Dashboard: bar penapis Cawangan/Bulan/Tahun (URL searchParams, `_components/DashboardFilter.tsx`); widget & jadual ikut tempoh+cawangan. Widget "hari ini" ditukar ikut bulan supaya konsisten. Diuji: Mei vs Julai papar angka berbeza ✅.
- Senarai Pelajar: baris belum bayar (≥4 hadir, tiada resit bulan semasa) highlight MERAH + badge + kiraan + penapis "Belum Bayar". (Julai 2026 = 0 belum bayar, jadi tiada merah buat masa ini.)

**Butang Edit untuk betulkan rekod (commit `63b3722`, LIVE):**
- Kehadiran Jurulatih S-27: modal edit PENUH (tarikh/status/cawangan/jenis/nota) + tangani ralat unique 23505; ganti edit-status inline.
- Perbelanjaan & Pendapatan Lain: modal edit (guna semula modal tambah, prop `rekodEdit`).
- Kehadiran pelajar (admin semak): edit nota + kolum Nota.
- Resit: `ModalEditResit` (tarikh/kaedah/bulan/tahun/jenis/jumlah); no. resit & pelajar kekal (audit); hanya resit Aktif. Ikon `Edit2` biru konsisten semua lokasi.

**Log Aktiviti / Audit (belum commit → akan commit, build+typecheck LULUS):**
- ⚠️ **WAJIB run `scripts/sql/log-aktiviti.sql`** — jadual `log_aktiviti` + trigger DB `rekod_log_aktiviti()` (SECURITY DEFINER, DEFENSIF: kegagalan audit tak sekat operasi) pada 10 jadual penting (resit, perbelanjaan, pendapatan_lain, kehadiran, kehadiran_jurulatih, pelajar, jurulatih, aset, cawangan, pengguna_profil) + RLS admin baca.
- Rekod Cipta/Edit/Padam automatik (siapa, bila, jadual, data snapshot jsonb). Log Masuk direkod dari page login (polisi RLS insert sendiri).
- UI: tab **"Log Aktiviti"** dalam `/notifikasi` (di sebelah "Amaran Operasi") — penapis Cipta/Edit/Padam/Log Masuk, papar "Nama {aksi} {jadual} · perincian" + masa. Loceng pautan ke sini.

**Modul Pendapatan Lain / Sumbangan (belum commit → akan commit, build+typecheck LULUS):**
- ⚠️ **WAJIB run `scripts/sql/pendapatan-lain.sql`** (jadual `pendapatan_lain` + RLS + bucket `bukti-pendapatan`) sebelum guna.
- Sebab: pendapatan dalam sistem dulu HANYA resit yuran pelajar. Sumbangan/penajaan/yuran program luar tiada tempat direkod → tercicir dari laporan & rekonsiliasi bank.
- Jadual: tarikh, sumber, kategori (Sumbangan/Penajaan/Yuran Program Luar/Sewa & Faedah/Lain-lain), jumlah, kaedah (Tunai/Transfer), cawangan opsional, nota, bukti (imej/PDF).
- Page `/kewangan/pendapatan` (borang + jadual + bukti, sama corak Perbelanjaan) + tab "Pendapatan Lain" dalam KewanganNav.
- Integrasi: Ringkasan Kewangan (jumlah + per cawangan + kiraan), Laporan Kewangan (jumlah + pecahan jenis + transaksi + CSV), Laporan LHDN Excel (Penyata PENDAPATAN, Rekonsiliasi ikut kaedah, sheet baharu Butiran Pendapatan Lain).
- Konteks cukai: yuran program luar & penajaan lazimnya bercukai; derma ikhlas kelabu; CFK bukan badan s44(6). Rekod semua, tag kategori, biar akauntan klasifikasi.

**Backup mingguan MASIH GAGAL (disahkan Sesi 6):** `gh secret list` kosong — secret `DATABASE_URL` belum diset. Fail workflow sudah betul (client-17). Tindakan USER: Supabase Connect → Session pooler URI → GitHub Settings → Secrets → Actions → `DATABASE_URL`.

---

## ⚡ MULA SINI SESI 5→6 (rujukan lama)

**Penghujung Sesi 5 (selepas `0a0fa71`):**
- Butang Slip gaji juga dalam tab Bayaran profil jurulatih (`ffd62d6`) — user awalnya cari di situ
- Workflow backup guna postgresql-client-17 PGDG (`118d929`) — user DIBERI PANDUAN setup secret `DATABASE_URL` (Supabase Connect → Session pooler URI → GitHub Settings → Secrets → Actions) tetapi **BELUM disahkan siap** — semak dulu di Sesi 6: repo Actions → "Backup Database Mingguan" ada run berjaya?
- Notifikasi pendua Tambah Pelajar (`3b18ba0`) — amaran kuning nama serupa semasa menaip, pautan profil, tidak menghalang. Deploy success; belum diuji dalam browser (user sedang guna tab masa tu) — user diberi langkah uji sendiri (taip "CHUA").
- **Pakej Adik-Beradik DIUJI PENUH di production** dengan 2 pelajar ujian (dipadam selepas ujian): auto-detect keluarga ✅, jumlah seorang manual RM60 ✅, 2 resit berasingan CFK-2026-00173/00174 ✅. Nota: sequence resit kini di ~00175.
- Jawapan soalan user: jumlah bayaran boleh key-in manual di kedua-dua borang (S-17 wajib manual; S-12 auto tapi boleh ganti)

---
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
- **BUG KRITIKAL DITEMUI & DIBAIKI (commit `1a27fd2`)** — punca sebenar aduan "data tak simpan": `new Date(y, m, 0).toISOString()` menukar hari akhir bulan waktu Malaysia ke UTC (tolak 8 jam) → penapis bulan jadi `lte.YYYY-MM-30` → rekod bertarikh 31/30/29/28 hb TIDAK dipaparkan walaupun tersimpan. Dibaiki dengan util `akhirBulan()` di 10 lokasi (perbelanjaan, kewangan, laporan×2, dashboard, makluman, jurulatih×3, kehadiran-saya). Disahkan live dalam browser user melalui Chrome extension. Pengajaran: JANGAN guna `toISOString()` untuk tarikh tempatan.
- Nota lama "service worker cache" masih relevan sebagai isu berasingan, tetapi aduan utama sesi ini ialah bug zon masa di atas.

**Tertunggak user:**
1. Isi `scripts/data/pelajar-placeholder.csv` (22 pelajar Klebang: ibu bapa/telefon/alamat) → `node scripts/update-pelajar-placeholder.mjs --commit`
2. ~~Cipta akaun jurulatih~~ ✅ 4 jurulatih sebenar (RM7/sesi) di-onboard user 5 Jul: AZZAHRA, UMAIRAH, FARZANAH (akaun dikaitkan) + HARUSSANI (**akaun "harussani" wujud tapi BELUM dikaitkan dalam Edit Jurulatih**); 3 sesi Klebang/Kumpulan sudah direkod dengan ciri baharu
3. Pasang PWA pada telefon jurulatih
4. (Pilihan) Secret `DATABASE_URL` di GitHub untuk backup mingguan
5. Rekod sewa Mac & Julai 2026 (jika sudah bayar) + upload bukti Apr/Mei/Jun
6. ~~Padam data ujian~~ ✅ SELESAI (5 Jul) — akaun ujian, profil JURULATIH UJIAN, 2 sesi, gaji RM50, gambar storage semua dipadam; disahkan hanya data sebenar tinggal

**Jurulatih self-service (dibina Sesi 5 atas arahan user):**
- Page `/kehadiran-saya` (mobile): butang sentuh Hadir/Tidak Hadir/Cuti untuk sesi HARI INI (upsert; hanya hari ini boleh diubah), ringkasan bulan (3 kotak), anggaran bayaran (sesi Hadir × kadar), sejarah sesi dengan penapis bulan
- Tab baharu "Sesi Saya" dalam BottomTabBar jurulatih; fix isActive supaya /kehadiran & /kehadiran-saya tidak aktif serentak
- Borang Edit Jurulatih kini ada seksyen "Akaun Login" — dropdown pengguna_profil bukan-admin untuk set `jurulatih.pengguna_id` (kaitan akaun ↔ profil jurulatih)
- Migration `scripts/sql/jurulatih-self-service.sql`: fungsi `jurulatih_id_semasa()` + 3 polisi RLS kehadiran_jurulatih (SELECT sendiri; INSERT/UPDATE sendiri dalam julat ±1 hari untuk zon masa) — **WAJIB run sebelum jurulatih guna page ini**
- Aliran penuh: cipta akaun di Tetapan → Pengguna → kaitkan dalam Edit Jurulatih → jurulatih login di telefon → tab Sesi Saya
- Diuji hujung-ke-hujung dengan akaun ujian `ujian.jurulatih@cfkhub.test` (jurulatih JURULATIH UJIAN `614d7711`): rekod hari ini ✅, ubah status ✅, tarikh lampau DISEKAT ✅, kewangan DISEKAT ✅, jurulatih lain DISEKAT ✅, padam DISEKAT ✅. **Akaun ujian masih wujud — padam bila user dah puas hati** (auth user + jurulatih + 1 rekod sesi 5 Jul Cuti).

**Histori Makluman (S-06, FR-45) — jurang audit terakhir, kini 100%:**
- Jadual `makluman_histori` + RLS (migration `scripts/sql/makluman-histori.sql` — **sudah di-run user**, RLS diuji: jurulatih hantar sendiri ✅, atas nama lain DISEKAT ✅)
- Rekod auto bila Salin Teks / klik WA dalam page Makluman; page `/makluman/histori` dengan penapis bulan+jenis, kembang teks penuh, admin nampak penghantar

**Gambar profil jurulatih (commit `9fb6a14`):**
- Kolum `gambar_path` + bucket peribadi `gambar-jurulatih` (migration `tambah-gambar-jurulatih.sql` — **sudah di-run user**; baca semua pengguna log masuk, urus admin sahaja)
- Edit Jurulatih: seksyen "Gambar Profil" — pilih/tukar/buang, preview bulat, JPG/PNG/WebP max 2MB, upload semasa Simpan
- Profil Jurulatih: avatar bulat 72px (signed URL 1 jam; fallback huruf pertama nama)
- CSP `img-src` kini benarkan host Supabase
- **Diuji hujung-ke-hujung dalam browser user** (Chrome extension): upload → preview → simpan → papar dalam profil ✅

**Fix rekod gaji jurulatih + menu sidebar (commit `5b624c7`):**
- **BUG: rekod gaji TIDAK PERNAH berfungsi** — ModalRekodBayaran hantar `jumlah` sedangkan kolum itu GENERATED (auto: bilangan_sesi × kadar_per_sesi) → 400 "cannot insert a non-DEFAULT value". Fix: jangan hantar `jumlah`; types Insert/Update dikemas.
- Sidebar admin kini ada menu **Jurulatih** (sebelum ini tiada pautan langsung ke /jurulatih!)
- **Aliran gaji diuji penuh dalam browser user**: kehadiran (1 sesi Hadir) → modal auto-isi 1×RM50 → Rekod Bayaran → toast berjaya → "Jumlah Keseluruhan Dibayar RM50" + sejarah + status "Sudah Direkod" ✅

**Nota multi-cawangan (soalan user):** memang sudah disokong sejak awal — `cawangan_ids` array, butang toggle multi-select dalam Daftar/Edit, paparan bercantum. Tiada perubahan diperlukan.

**Kehadiran jurulatih ikut cawangan & jenis kelas (commit `520b153`):**
- Kolum `cawangan_id` + `jenis_kelas` (Kumpulan/Personal) pada `kehadiran_jurulatih` (migration `kehadiran-jurulatih-cawangan.sql` — **sudah di-run user**)
- UNIQUE lama (jurulatih, tarikh) → UNIQUE NULLS NOT DISTINCT (jurulatih, tarikh, cawangan, jenis) — boleh beberapa sesi sehari, setiap satu dikira untuk gaji
- Borang admin S-27 + Sesi Saya (self-service) + tab Kehadiran profil semua dikemaskini
- **Diuji dalam browser user**: 2 sesi hari sama (Kumpulan + Buntong/Personal) → "2 sesi hadir = asas pengiraan bayaran" ✅

**Dashboard jurulatih + point + gaji auto-masuk Kewangan (commit `5a6d2a1`):**
- Senarai Jurulatih: 3 kad stat (Gaji Dibayar bulan ini / Jumlah Keseluruhan / Sesi Hadir bulan ini) + kolum Sesi Bln Ini, ⭐Point (1 point per sesi Hadir), Gaji Dibayar per jurulatih; badge point juga dalam Sesi Saya (telefon jurulatih)
- Rekod gaji auto-insert `kewangan_perbelanjaan` kategori **"Gaji Jurulatih"** — laporan kewangan/LHDN terus kira kos gaji. DISAHKAN dengan bayaran sebenar AZZAHRA RM7 → rekod perbelanjaan auto tercipta ✅
- Profil jurulatih: Jumlah Gaji Dibayar dalam kad status; butang "Rekod Kehadiran" di header profil (commit `41c1da2`)

**Gaji wajib ikut kehadiran (commit `44db8b5`):**
- Modal Rekod Bayaran: bilangan sesi ≤ sesi Hadir direkod (validasi + input max + nota had); butang rekod dikunci jika 0 sesi hadir

**Slip Gaji PDF (commit `2eac282`):**
- `SlipGajiPDF.tsx` + `BtnSlipGaji.tsx` — butang "Slip" pada setiap baris Sejarah Bayaran jurulatih
- Kandungan: header CFK, bulan gaji, maklumat jurulatih (nama/IC/status), butiran sesi × kadar, JUMLAH GAJI BERSIH, nota footer auto-jana
- Nama fail `Slip_Gaji_NAMA_Bulan Tahun.pdf`; **diuji di production** — toast berjaya, PDF turun ✅

**Sheet Rekonsiliasi Bank dalam Laporan LHDN Excel (commit `0a0fa71`):**
- Sheet ke-5: pecahan bulanan Masuk Bank (resit Transfer) / Tunai / Belanja / Pergerakan dijangka (formula)
- Sel kuning isi manual: baki awal tahun + baki penyata bank akhir setiap bulan; kolum BEZA berformula auto (baki − baki lalu − pergerakan)
- **Diuji di production** — toast "Laporan LHDN 2026 berjaya dijana" ✅
- Konteks: nasihat rekod LHDN diberi kepada user (S.82 simpan 7 tahun, bukti setiap perbelanjaan, e-Invois dikecualikan <RM500k) — jurang tinggal: secret `DATABASE_URL` untuk backup (keperluan simpanan 7 tahun)

**Onboarding jurulatih sebenar (dibuat user 5 Jul):** akaun `maisarahkhatibcfk@gmail.com` (aisyah maisarah binti khatib, Jurulatih, Klebang) dicipta di Tetapan → Pengguna; akaun ujian diblok oleh user. Langkah tinggal: Daftar profil jurulatih aisyah → Edit → kaitkan Akaun Login + gambar.

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
