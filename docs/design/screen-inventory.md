# Inventori Skrin — CFK HUB

**Versi:** 1.1  
**Tarikh:** 8 Jul 2026 (tambah S-29 Pendapatan Lain, S-30 Dokumen Jualan)  
**Berdasarkan:** IA, PRD, DD-001 hingga DD-010

---

## Konvensyen Dokumen

- **Data Masuk (IN):** Data yang dipaparkan / dimuatkan ke skrin
- **Data Keluar (OUT):** Data yang dikemukakan / disimpan ke pangkalan data
- **Akses:** A = Admin sahaja, J = Jurulatih sahaja, A+J = Kedua-dua

---

## BAHAGIAN 1 — HALAMAN DIKONGSI

---

### S-01: Log Masuk
**Route:** `/login`  **Akses:** A+J  

| | |
|---|---|
| **Tujuan** | Pengesahan identiti pengguna sebelum masuk sistem |
| **Data IN** | — |
| **Data OUT** | `email`, `password` |
| **Selepas berjaya** | isAdmin=true → `/dashboard` \| isAdmin=false → `/kehadiran` |
| **Tindakan** | [Log Masuk] |
| **Ralat** | "E-mel atau kata laluan tidak sah." |

---

### S-02: Rekod Kehadiran Baharu
**Route:** `/kehadiran/rekod`  **Akses:** A+J  

| | |
|---|---|
| **Tujuan** | Tandakan status kehadiran semua pelajar aktif untuk satu sesi |
| **Data IN** | Senarai semua pelajar aktif (`nama`, `cawangan_daftar`, `foto` jika ada), tarikh semasa |
| **Data OUT** | `pelajar_id`, `tarikh`, `status` (Hadir/Tidak Hadir/Cuti), `nota` (opsional), `cawangan_sesi`, `jurulatih_id` |
| **Penapisan** | Dropdown pilih cawangan sesi, pilih tarikh |
| **Tindakan** | Toggle status setiap pelajar → [Simpan Rekod] |
| **Modal** | — |
| **Had** | Jurulatih: edit dalam 7 hari dari tarikh sesi sahaja |

---

### S-03: Senarai Pelajar
**Route:** `/pelajar`  **Akses:** A (edit) + J (baca sahaja)  

| | |
|---|---|
| **Tujuan** | Lihat semua pelajar; Admin boleh urus profil, Jurulatih baca sahaja |
| **Data IN** | `nama`, `cawangan_daftar`, `status` (Aktif/Tidak Aktif), `jenis_pelajar`, `telefon_ibu_bapa` |
| **Penapisan** | Status (Aktif/Tidak Aktif/Semua), Cawangan, Carian (nama/telefon) |
| **Format** | Jadual (desktop) / Kad (mobile) |
| **Tindakan (Admin)** | [+ Tambah Pelajar], [Import GForms], klik baris → S-04 |
| **Tindakan (Jurulatih)** | Klik baris → S-04 (baca sahaja) |

---

### S-04: Profil Pelajar
**Route:** `/pelajar/:id`  **Akses:** A (edit) + J (baca sahaja)  

| | |
|---|---|
| **Tujuan** | Lihat dan urus maklumat lengkap seorang pelajar |
| **Data IN** | `nama`, `tarikh_lahir`, `nama_ibu_bapa`, `telefon`, `email`, `cawangan_daftar`, `tarikh_daftar`, `jenis_pelajar`, `jenis_yuran`, `status`, adik-beradik (jika ada), sejarah kehadiran (10 terkini), sejarah resit (5 terkini) |
| **Data OUT (Admin)** | Semua medan boleh dikemaskini |
| **Tab/Seksyen** | Maklumat Peribadi \| Kehadiran \| Bayaran & Resit |
| **Tindakan (Admin)** | [Edit], [Nyahaktifkan] / [Aktifkan Semula], [+ Rekod Bayaran] |
| **Modal (Admin)** | M-04 (Nyahaktifkan Pelajar) |
| **Pautan WhatsApp** | Ikon WhatsApp di sebelah nombor telefon → buka wa.me |

---

### S-05: Cipta Makluman WhatsApp
**Route:** `/makluman/cipta`  **Akses:** A+J  

| | |
|---|---|
| **Tujuan** | Jana mesej WhatsApp berformat untuk dihantar kepada ibu bapa |
| **Data IN** | Templat mesej (4 jenis), senarai pelajar aktif (untuk individu), senarai cawangan |
| **Data OUT** | `jenis_makluman`, `penerima` (semua/cawangan/individu), `teks_mesej`, `tarikh_cipta`, `penghantar_id` |
| **Langkah UI** | 1. Pilih jenis → 2. Pilih penerima → 3. Edit teks → 4. Hantar |
| **Tindakan** | [Salin Mesej] (untuk group WA), [WhatsApp] (pautan wa.me untuk individu) |
| **Selepas hantar** | Rekod disimpan dalam histori makluman |

---

### S-06: Histori Makluman
**Route:** `/makluman/histori`  **Akses:** A (semua), J (milik sendiri)  

| | |
|---|---|
| **Tujuan** | Lihat rekod makluman yang telah dihantar |
| **Data IN** | `jenis_makluman`, `teks_mesej`, `penerima`, `tarikh`, `nama_penghantar` |
| **Penapisan** | Admin: semua / mengikut Jurulatih; Jenis makluman; Tarikh |
| **Tindakan** | Klik untuk lihat teks penuh |

---

## BAHAGIAN 2 — HALAMAN ADMIN SAHAJA

---

### S-07: Dashboard Admin
**Route:** `/dashboard`  **Akses:** A  

| | |
|---|---|
| **Tujuan** | Gambaran keseluruhan operasi CFK — halaman pertama Admin selepas log masuk |
| **Data IN** | Kiraan pelajar belum bayar (bulan ini, ≥4 kelas), kiraan kehadiran hari ini, jumlah pendapatan bulan ini (kumpulan + personal), jumlah pelajar aktif per cawangan |
| **Widget** | 1. Pelajar Belum Bayar (klik → S-14) \| 2. Kehadiran Hari Ini \| 3. Pendapatan Bulan Ini \| 4. Pelajar Aktif |
| **Tindakan** | Klik widget → halaman berkaitan |

---

### S-08: Tambah Pelajar Baharu (Manual)
**Route:** `/pelajar/tambah`  **Akses:** A  

| | |
|---|---|
| **Tujuan** | Daftar pelajar baharu secara manual (kes kecemasan) |
| **Format** | Stepper 3 langkah (DD-008) |
| **Langkah 1** | `nama`, `tarikh_lahir`, `jenis_pelajar`, `cawangan_daftar` |
| **Langkah 2** | `nama_ibu_bapa`, `telefon`, `email` (opsional), adik-beradik (toggle + carian pelajar sedia ada) |
| **Langkah 3** | Semak semua maklumat → [Daftar Pelajar] |
| **Data OUT** | Profil pelajar baharu + `sumber: Manual`, `tarikh_daftar: auto` |

---

### S-09: Import dari Google Forms
**Route:** `/pelajar/import`  **Akses:** A  

| | |
|---|---|
| **Tujuan** | Import rekod pelajar baharu dari Google Sheets/Forms |
| **Data IN** | Rekod dari Google Forms API: nama, tarikh lahir, ibu bapa, telefon, cawangan |
| **Data OUT** | Profil pelajar baharu + `sumber: Google Forms` |
| **Langkah** | 1. Tarik data → 2. Pratonton senarai → 3. Semak pendua (tandakan) → 4. Sahkan import |
| **Modal** | M-05 (Sahkan Import) |
| **Mesej** | "X rekod diimport. Y rekod dilewatkan (pendua)." |

---

### S-10: Semak & Edit Rekod Kehadiran
**Route:** `/kehadiran/semak`  **Akses:** A  

| | |
|---|---|
| **Tujuan** | Admin semak dan edit mana-mana rekod kehadiran tanpa had masa |
| **Data IN** | Rekod kehadiran dengan `nama_pelajar`, `tarikh`, `cawangan_sesi`, `status`, `jurulatih`, `nota`, `edited_by`, `edited_at` |
| **Penapisan** | Tarikh, Cawangan, Pelajar (carian) |
| **Tindakan** | Klik baris → edit modal / inline edit |
| **Data OUT** | `status` (dikemaskini), `nota` (dikemaskini), `edited_by: admin_id`, `edited_at: timestamp` |

---

### S-11: Rekod Bayaran — Kelas Kumpulan
**Route:** `/bayaran/kumpulan/tambah`  **Akses:** A  

| | |
|---|---|
| **Tujuan** | Rekod bayaran yuran bulanan pelajar kelas kumpulan |
| **Format** | Stepper 2 langkah |
| **Langkah 1** | Pilih pelajar (carian), pilih bulan, pilih jenis (individu/adik-beradik), jumlah (auto-isi), kaedah bayaran |
| **Langkah 2** | Pratonton resit → [Jana & Simpan Resit] |
| **Semak** | Sistem semak: pelajar sudah bayar bulan ini? Pelajar layak (≥4 kelas)? |
| **Data OUT** | `pelajar_id`, `bulan`, `jumlah`, `jenis_yuran`, `kaedah_bayaran`, `tarikh_bayar`, `admin_id` + cipta resit |
| **Panel** | P-01 (Pratonton Resit PDF) |

---

### S-12: Rekod Bayaran — Kelas Personal
**Route:** `/bayaran/personal/tambah`  **Akses:** A  

| | |
|---|---|
| **Tujuan** | Rekod bayaran sesi kelas personal (private) dan jana resit |
| **Format** | Stepper 2 langkah |
| **Langkah 1** | Pilih pelajar, tarikh sesi, kaedah (Online/Bersemuka), lokasi, tempoh (opsional) |
| **Langkah 2** | Jumlah (RM 80–150, Admin taip), status bayaran, kaedah bayaran → Pratonton Resit → [Simpan] |
| **Data OUT** | `pelajar_id`, `tarikh_sesi`, `kaedah`, `lokasi`, `jumlah`, `status_bayaran`, `kaedah_bayaran`, `admin_id` + cipta resit (jika sudah bayar) |
| **Panel** | P-01 (Pratonton Resit PDF) |

---

### S-13: Senarai Resit
**Route:** `/bayaran/resit`  **Akses:** A  

| | |
|---|---|
| **Tujuan** | Semak semua resit yang telah dijana |
| **Data IN** | `nombor_resit`, `nama_pelajar`, `jenis` (Kumpulan/Personal), `bulan`/`tarikh_sesi`, `jumlah`, `status` (Aktif/Dibatalkan), `tarikh_jana` |
| **Penapisan** | Tarikh, Cawangan, Jenis, Status (Aktif/Dibatalkan), Carian (nombor resit / nama pelajar) |
| **Tindakan** | Klik resit → S-13a (lihat resit), [Batal Resit] → M-01 |

---

### S-13a: Lihat Resit
**Route:** `/bayaran/resit/:id`  **Akses:** A  

| | |
|---|---|
| **Tujuan** | Lihat butiran penuh resit dan muat turun / kongsi PDF |
| **Data IN** | Semua maklumat resit + cop "DIBATALKAN" jika dibatalkan |
| **Tindakan** | [Muat Turun PDF], [Salin Pautan], [Batal Resit] → M-01 |

---

### S-14: Senarai Pelajar Belum Bayar
**Route:** `/bayaran/belum-bayar`  **Akses:** A sahaja  

| | |
|---|---|
| **Tujuan** | Senarai pelajar yang layak dikenakan yuran (≥4 kelas) tetapi belum bayar |
| **Data IN** | `nama_pelajar`, `cawangan`, `bulan`, `bilangan_kelas_hadir`, `telefon_ibu_bapa` |
| **Penapisan** | Cawangan, Bulan |
| **Tindakan** | Klik nama pelajar → S-04 (Profil Pelajar), Ikon WA → pautan wa.me individu |

---

### S-15: Laporan Kehadiran Ibu Bapa
**Route:** `/laporan/kehadiran`  **Akses:** A  

| | |
|---|---|
| **Tujuan** | Jana laporan PDF kehadiran pelajar untuk dikongsi kepada ibu bapa |
| **Data IN** | Senarai pelajar aktif, bulan/tahun pilihan |
| **Data OUT** | PDF dalam BM: nama pelajar, bulan, jadual sesi per tarikh, status setiap sesi, nota cuti, peratusan kehadiran |
| **Langkah** | 1. Pilih pelajar → 2. Pilih bulan → 3. Pratonton → 4. [Muat Turun PDF] |
| **Tindakan** | [Jana Laporan], [Muat Turun PDF], [Salin Pautan WA] |

---

### S-16: Laporan Kewangan LHDN
**Route:** `/laporan/kewangan`  **Akses:** A  

| | |
|---|---|
| **Tujuan** | Jana laporan kewangan untuk pelaporan cukai LHDN |
| **Data IN** | Rekod bayaran dan perbelanjaan mengikut tempoh dan cawangan |
| **Data OUT** | Excel (.xlsx) / PDF: pendapatan (Kumpulan + Personal), perbelanjaan (per cawangan), baki bersih |
| **Penapisan** | Tempoh (bulan/tahun), Cawangan (semua / tertentu) |
| **Tindakan** | [Jana Excel], [Jana PDF] |

---

### S-17: Senarai & Tambah Perbelanjaan
**Route:** `/kewangan/perbelanjaan`  **Akses:** A  

| | |
|---|---|
| **Tujuan** | Rekod dan semak semua perbelanjaan CFK |
| **Data IN (senarai)** | `tarikh`, `kategori`, `penerangan`, `jumlah`, `cawangan` |
| **Data OUT (tambah)** | `tarikh`, `kategori`, `penerangan`, `jumlah`, `cawangan` (Klebang/Buntong/Sri Iskandar/SMK Star/Umum), `admin_id` |
| **Format** | Borang satu halaman (DD-008 — pendek, <5 medan) |
| **Penapisan** | Tarikh, Cawangan, Kategori |
| **Tindakan** | [+ Tambah Perbelanjaan], Edit, Padam |

---

### S-18: Ringkasan Kewangan
**Route:** `/kewangan/ringkasan`  **Akses:** A  

| | |
|---|---|
| **Tujuan** | Gambaran keseluruhan kewangan CFK — pendapatan vs perbelanjaan |
| **Data IN** | Jumlah pendapatan (kumpulan + personal), jumlah perbelanjaan, baki, mengikut tempoh dan cawangan |
| **Paparan** | Jadual ringkasan + graf bar (opsional, Fasa 3) |
| **Penapisan** | Bulan / Tahun, Cawangan |

---

### S-29: Pendapatan Lain / Sumbangan
**Route:** `/kewangan/pendapatan`  **Akses:** A  

| | |
|---|---|
| **Tujuan** | Rekod wang masuk selain yuran pelajar (jualan, sumbangan, penajaan, sewa, dll) |
| **Data IN** | `tarikh`, `kategori`, `sumber`, `jumlah`, `kaedah`, `cawangan`, `nota`, `bukti`, `no_resit` |
| **Data OUT** | Rekod pendapatan + auto `no_resit` (CFK-L-YYYY-NNNNN) |
| **Penapisan** | Bulan, Kategori, Cawangan |
| **Tindakan** | [+ Rekod Pendapatan], Edit, Padam, Muat naik bukti, [Resit PDF] |
| **Nota** | Masuk Ringkasan Kewangan + Laporan LHDN |

---

### S-30: Dokumen Jualan (Sebut Harga / Invois / Resit)
**Route:** `/kewangan/dokumen`  **Akses:** A  

| | |
|---|---|
| **Tujuan** | Jualan peralatan & perkhidmatan kepada sekolah/organisasi — dengan alamat pembeli & senarai item |
| **Data IN** | `no_dokumen`, `tarikh`, `peringkat` (Sebut Harga/Invois/Resit), `pembeli` (nama/alamat/PIC/tel/emel), senarai item (perihalan × kuantiti × harga), `kaedah_bayaran`, `maklumat_bayaran`, `tarikh_bayar` |
| **Data OUT** | Dokumen + item; bila `peringkat=Resit` → auto-rekod ke `pendapatan_lain` (`dokumen_id`) |
| **Penapisan** | Bulan, Peringkat |
| **Format** | Satu dokumen → 3 jenis PDF (SH/INV/RS) kongsi nombor asas `YYYY-NNNNN` |
| **Tindakan** | [Dokumen Baharu], Edit, Padam, muat turun [SH]/[INV]/[RS] |
| **Fasa** | Sesi 7 (8 Jul 2026) |

---

### S-19: Senarai Aset
**Route:** `/aset`  **Akses:** A  

| | |
|---|---|
| **Tujuan** | Semak semua aset CFK yang aktif |
| **Data IN** | `nama_aset`, `kategori`, `nilai`, `tarikh_perolehan`, `cawangan`, `status` |
| **Ringkasan** | Jumlah nilai keseluruhan aset aktif |
| **Penapisan** | Cawangan, Kategori, Status (Aktif/Dilupuskan) |
| **Tindakan** | [+ Tambah Aset], klik aset → S-20 |

---

### S-20: Profil & Edit Aset
**Route:** `/aset/:id`  **Akses:** A  

| | |
|---|---|
| **Tujuan** | Lihat, edit, dan lupus aset |
| **Data IN** | `nama_aset`, `kategori`, `penerangan`, `nilai`, `tarikh_perolehan`, `cawangan`, `pembekal`, `status`, sejarah (jika dilupuskan: tarikh_lupus, sebab) |
| **Data OUT (edit)** | Maklumat aset dikemaskini |
| **Data OUT (lupus)** | `sebab_lupus` (wajib), `tarikh_lupus: auto`, `status: Dilupuskan` |
| **Tindakan** | [Edit], [Lupus Aset] → M-02 |

---

### S-21: Pengurusan Pengguna
**Route:** `/tetapan/pengguna`  **Akses:** A  

| | |
|---|---|
| **Tujuan** | Urus akaun Jurulatih |
| **Data IN** | `nama`, `email`, `cawangan`, `tarikh_cipta`, `status` |
| **Tindakan** | [+ Tambah Jurulatih], [Edit], [Reset Kata Laluan] → M-03 |

---

### S-22: Pengurusan Cawangan
**Route:** `/tetapan/cawangan`  **Akses:** A  

| | |
|---|---|
| **Tujuan** | Urus senarai cawangan CFK (dinamik, bukan hardcode) |
| **Data IN** | `nama_cawangan`, `alamat`, `status` (Aktif/Tidak Aktif) |
| **Data OUT** | Tambah / kemaskini / nyahaktifkan cawangan |
| **Tindakan** | [+ Tambah Cawangan], [Edit], [Nyahaktifkan] |

---

### S-24: Senarai Jurulatih
**Route:** `/jurulatih`  **Akses:** A  

| | |
|---|---|
| **Tujuan** | Lihat semua Jurulatih, status, dan cawangan mereka |
| **Data IN** | `nama`, `cawangan[]`, `kadar_bayaran`, `tarikh_mula`, `status` |
| **Tindakan** | [+ Tambah Jurulatih], [Profil], [Edit], carian nama |
| **Fasa** | Fasa 1 |

---

### S-25: Profil Jurulatih
**Route:** `/jurulatih/:id`  **Akses:** A  

| | |
|---|---|
| **Tujuan** | Paparan penuh maklumat Jurulatih termasuk ringkasan kehadiran & bayaran |
| **Data IN** | `nama_penuh`, `no_ic`, `no_telefon`, `emel`, `cawangan[]`, `kadar_bayaran`, `tarikh_mula`, `pengalaman_ringkas`, `kelayakan`, `status` |
| **Data IN (tambahan)** | Statistik kehadiran 3 bulan terkini, status bayaran bulan semasa |
| **Tindakan** | [Edit Profil] → S-26, [Rekod Kehadiran] → S-27, [Bayaran] → S-28, [Nyahaktifkan] |
| **Fasa** | Fasa 1 |

---

### S-26: Tambah / Edit Jurulatih
**Route:** `/jurulatih/baharu` atau `/jurulatih/:id/edit`  **Akses:** A  

| | |
|---|---|
| **Tujuan** | Borang tambah atau kemaskini profil Jurulatih |
| **Data OUT** | `nama_penuh`, `no_ic`, `no_telefon`, `emel`, `cawangan[]`, `kadar_bayaran`, `tarikh_mula`, `pengalaman_ringkas`, `kelayakan` |
| **Nota** | Borang tunggal (< 10 medan — tidak perlu stepper) |
| **Butang** | [Batal] \| [Simpan Profil] |
| **Fasa** | Fasa 1 |

---

### S-27: Kehadiran Jurulatih per Bulan
**Route:** `/jurulatih/:id/kehadiran`  **Akses:** A  

| | |
|---|---|
| **Tujuan** | Rekod dan lihat kehadiran Jurulatih per bulan |
| **Data IN** | `bulan`, `tahun`, senarai sesi dengan status (Hadir/Tidak Hadir/Cuti) |
| **Data OUT** | Status kehadiran per sesi |
| **Pengiraan** | Jumlah sesi hadir = asas pengiraan bayaran bulan tersebut |
| **Tindakan** | [+ Rekod Sesi], togol status kehadiran per sesi, [Lihat Bayaran] |
| **Fasa** | Fasa 2 |

---

### S-28: Bayaran Jurulatih
**Route:** `/jurulatih/:id/bayaran`  **Akses:** A  

| | |
|---|---|
| **Tujuan** | Rekod dan urus bayaran bulanan kepada Jurulatih |
| **Data IN** | Senarai rekod bayaran: bulan, bilangan sesi, kadar, jumlah, status |
| **Data OUT** | `bulan_bayaran`, `bilangan_sesi`, `kadar_per_sesi`, `jumlah`, `tarikh_bayar`, `nota` |
| **Formula** | Jumlah = Bilangan Sesi Hadir × Kadar per Sesi |
| **Tindakan** | [+ Rekod Bayaran Bulan Ini] → M-06 |
| **Fasa** | Fasa 2 |

---

## BAHAGIAN 3 — HALAMAN JURULATIH SAHAJA

---

### S-23: Dashboard Jurulatih (Ringkas)
**Route:** `/dashboard` (Jurulatih)  **Akses:** J  

| | |
|---|---|
| **Tujuan** | Gambaran ringkas operasi Jurulatih |
| **Data IN** | Kehadiran hari ini (cawangan dipilih), rekod kehadiran 7 hari lepas |
| **Paparan** | Kad statistik ringkas — berbeza dari Dashboard Admin |

---

## BAHAGIAN 4 — MODAL

---

### M-01: Modal Batal Resit
**Dicetuskan dari:** S-13, S-13a  

| | |
|---|---|
| **Data IN** | `nombor_resit`, `nama_pelajar`, `jumlah` |
| **Data OUT** | `sebab_batal` (wajib), `tarikh_batal: auto`, `dibatal_oleh: admin_id` |
| **Butang** | [Kembali] \| [Batalkan Resit] |

---

### M-02: Modal Lupus Aset
**Dicetuskan dari:** S-20  

| | |
|---|---|
| **Data IN** | `nama_aset`, `nilai` |
| **Data OUT** | `sebab_lupus` (wajib), `tarikh_lupus: auto` |
| **Butang** | [Kembali] \| [Lupus Aset] |

---

### M-03: Modal Reset Kata Laluan
**Dicetuskan dari:** S-21  

| | |
|---|---|
| **Data IN** | `nama_jurulatih`, `email` |
| **Data OUT** | `kata_laluan_baharu` (Admin taip), hash disimpan dalam pangkalan data |
| **Butang** | [Batal] \| [Tetapkan Kata Laluan] |
| **Nota** | Admin maklumkan kata laluan baharu kepada Jurulatih secara lisan/WhatsApp |

---

### M-04: Modal Nyahaktifkan Pelajar
**Dicetuskan dari:** S-04  

| | |
|---|---|
| **Data IN** | `nama_pelajar` |
| **Data OUT** | `status: Tidak Aktif`, `tarikh_nyahaktif: auto` |
| **Mesej** | "Pelajar ini tidak akan muncul dalam senarai semasa. Rekod kekal dalam sistem." |
| **Butang** | [Batal] \| [Nyahaktifkan] |

---

### M-05: Modal Sahkan Import Google Forms
**Dicetuskan dari:** S-09  

| | |
|---|---|
| **Data IN** | Senarai rekod import; rekod pendua ditandakan merah |
| **Data OUT** | Rekod yang dipilih untuk diimport |
| **Tindakan** | Pengguna boleh nyahtanda rekod pendua sebelum sahkan |
| **Butang** | [Batal] \| [Sahkan Import (X rekod)] |

---

### M-06: Modal Rekod Bayaran Jurulatih
**Dicetuskan dari:** S-28  

| | |
|---|---|
| **Data IN** | `nama_jurulatih`, `bulan_bayaran`, `bilangan_sesi_hadir`, `kadar_per_sesi` |
| **Data OUT** | `tarikh_bayar`, `nota` (pilihan); jumlah dikira automatik |
| **Paparan** | Pengiraan: X sesi × RM Y = RM Z |
| **Butang** | [Batal] \| [Rekod Bayaran] |
| **Fasa** | Fasa 2 |

---

## BAHAGIAN 5 — PANEL

---

### P-01: Panel Pratonton Resit PDF
**Dicetuskan dari:** S-11, S-12  

| | |
|---|---|
| **Tujuan** | Pratonton resit PDF sebelum disimpan/dicetak |
| **Data IN** | Semua maklumat resit yang diisi |
| **Paparan** | Preview resit dalam format PDF (A4): logo CFK, nama pelajar, nombor resit, jumlah, tarikh, kaedah bayaran, tandatangan/cop |
| **Tindakan** | [← Kembali Edit] \| [Simpan & Jana Resit] |

---

### P-02: Panel Carian Pelajar
**Dicetuskan dari:** S-03, S-02, S-11  

| | |
|---|---|
| **Tujuan** | Cari pelajar dengan cepat mengikut nama atau nombor telefon |
| **Data IN** | Input carian (minimum 2 aksara) |
| **Data OUT** | Pelajar dipilih |
| **Paparan** | Senarai cadangan pelajar dengan nama + cawangan + status |

---

## RINGKASAN INVENTORI

| Kategori | Bilangan |
|---|---|
| Halaman Dikongsi (Admin+Jurulatih) | 6 |
| Halaman Admin Sahaja | 23 |
| Halaman Jurulatih Sahaja | 1 |
| Modal | 6 |
| Panel | 2 |
| **JUMLAH** | **38** |

---

### Pemetaan Fasa Pembangunan

| Fasa | Skrin |
|---|---|
| **Fasa 1** (30 Jun) | S-01, S-02, S-03, S-04, S-07, S-08, S-09, S-21, S-22, S-23, S-24, S-25, S-26, M-03, M-04, M-05, P-02 |
| **Fasa 2** (7 Jul) | S-05, S-06, S-11, S-12, S-13, S-13a, S-14, S-15, S-16, S-27, S-28, M-01, M-06, P-01 |
| **Fasa 3** (14 Jul) | S-10, S-17, S-18, S-19, S-20, M-02 |
