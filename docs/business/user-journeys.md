# User Journeys — CFK HUB (Chess For Kids)

Dokumen ini menyenaraikan aliran kerja utama (user journeys) bagi sistem CFK HUB. Setiap journey menggambarkan langkah demi langkah bagaimana pengguna berinteraksi dengan sistem untuk mencapai matlamat mereka.

**Pengguna Sistem:**
- **Admin** — Pentadbir utama CFK (1 orang)
- **Jurulatih** — Pengajar kelas catur di cawangan (6 orang, 4 cawangan)

---

## UJ-01: Admin Log Masuk ke Sistem

**Pelakon:** Admin atau Jurulatih
**Prasyarat:** Akaun pengguna telah dicipta oleh Admin
**Hasil yang dijangka:** Pengguna berjaya log masuk dan dibawa ke Dashboard

### Langkah-langkah:
1. Pengguna buka CFK HUB melalui browser (web) atau ikon PWA di telefon
2. Sistem paparkan skrin log masuk
3. Pengguna masukkan e-mel dan kata laluan
4. Sistem sahkan kelayakan pengguna
5. Sistem kenal pasti peranan pengguna (`isAdmin: true/false`)
6. Admin dibawa ke **Dashboard Admin** (termasuk maklumat kewangan)
7. Jurulatih dibawa ke **Dashboard Jurulatih** (maklumat operasi sahaja)

### Senario Alternatif:
- Kata laluan salah → Sistem paparkan mesej ralat, pengguna boleh cuba semula
- Akaun tidak wujud → Pengguna perlu hubungi Admin untuk dapatkan akaun

---

## UJ-02: Admin Daftar Pelajar Baharu (Manual)

**Pelakon:** Admin
**Prasyarat:** Admin telah log masuk
**Hasil yang dijangka:** Profil pelajar baharu dicipta dalam sistem

### Langkah-langkah:
1. Admin klik modul "Pelajar" → "Tambah Pelajar"
2. Admin isi borang profil pelajar:
   - Nama penuh pelajar
   - Tarikh lahir
   - Nama ibu bapa / penjaga
   - Nombor telefon ibu bapa
   - E-mel ibu bapa (jika ada)
   - Cawangan (Klebang / Buntong / Sri Iskandar / SMK Star)
   - Tarikh daftar
   - Jenis yuran (Standard RM70 / Pakej Adik-beradik)
3. Admin klik "Simpan"
4. Sistem cipta profil pelajar dengan status "Aktif"
5. Sistem paparkan mesej kejayaan

---

## UJ-03: Pelajar Baharu Daftar Melalui Google Forms

**Pelakon:** Ibu Bapa (luar sistem), Admin
**Prasyarat:** Google Forms pendaftaran CFK telah disediakan dan dikongsi kepada ibu bapa
**Hasil yang dijangka:** Data pelajar dari Google Forms diimport ke dalam sistem secara automatik

### Langkah-langkah:
1. Ibu bapa isi borang pendaftaran Google Forms (termasuk maklumat pelajar dan persetujuan PDPA)
2. Google Apps Script mencetus secara automatik apabila borang dihantar
3. Skrip hantar data ke sistem CFK HUB
4. Sistem simpan rekod pelajar dengan status **"Belum Disahkan"**
5. Admin terima notifikasi dalam sistem: "Pelajar baharu menunggu pengesahan"
6. Admin semak maklumat pelajar baharu
7. Admin sahkan dan tukar status kepada **"Aktif"** atau tolak jika maklumat tidak lengkap

### Nota:
- Ibu bapa perlu bersetuju dengan notis privasi PDPA dalam Google Forms (DR-027)
- Admin mempunyai kuasa muktamad untuk sahkan atau tolak setiap pendaftaran

---

## UJ-04: Admin Rekod Bayaran dan Keluarkan Resit

**Pelakon:** Admin
**Prasyarat:** Profil pelajar wujud dalam sistem; bayaran telah diterima (tunai atau pindahan bank)
**Hasil yang dijangka:** Rekod bayaran disimpan, resit PDF dijana dan sedia untuk dikongsi kepada ibu bapa

### Langkah-langkah:
1. Admin klik modul "Bayaran" → "Rekod Bayaran Baharu"
2. Admin cari nama pelajar (carian atau senarai)
3. Admin isi butiran bayaran:
   - Jenis bayaran (Yuran Pendaftaran RM140 / Yuran Bulanan RM70 / Lain-lain)
   - Bulan yang dibayar (jika yuran bulanan)
   - Jumlah bayaran
   - Kaedah bayaran (Tunai / Online)
   - Tarikh bayaran diterima
   - Nota tambahan (jika ada)
4. Admin klik "Simpan & Jana Resit"
5. Sistem jana nombor resit automatik (format: `CFK-2026-NNNNN`)
6. Sistem rekod metadata audit: Admin yang jana, tarikh dan masa
7. Sistem jana fail PDF resit dengan:
   - Logo CFK di bahagian atas
   - Nombor resit unik
   - Maklumat pelajar dan bayaran
   - Tandatangan digital Admin
8. Sistem paparkan pratonton resit PDF
9. Admin muat turun atau kongsi resit PDF terus kepada ibu bapa (WhatsApp / e-mel)

### Senario Alternatif:
- Jenis bayaran "Lain-lain" → Admin taip keterangan sendiri dalam medan teks
- Pakej adik-beradik → Admin rekod dua bayaran berasingan dengan diskaun yang sesuai

---

## UJ-05: Jurulatih Tandakan Kehadiran Pelajar

**Pelakon:** Jurulatih
**Prasyarat:** Jurulatih telah log masuk; sesi kelas sedang berlangsung
**Hasil yang dijangka:** Rekod kehadiran sesi disimpan dalam sistem

### Langkah-langkah:
1. Jurulatih buka CFK HUB di telefon (PWA) semasa sesi berlangsung
2. Jurulatih klik modul "Kehadiran" → "Ambil Kehadiran"
3. Sistem paparkan senarai pelajar untuk cawangan Jurulatih berkenaan
4. Jurulatih pilih tarikh sesi (default: hari ini)
5. Jurulatih tandakan status setiap pelajar:
   - ✅ Hadir
   - ❌ Tidak Hadir
   - 🔄 MC / Cuti (jika berkaitan)
6. Jurulatih klik "Simpan Kehadiran"
7. Sistem simpan rekod kehadiran dikaitkan dengan akaun Jurulatih
8. Sistem paparkan mesej kejayaan: "Kehadiran untuk [Tarikh] telah disimpan"

### Nota:
- Jurulatih tidak boleh edit rekod kehadiran yang telah disimpan (DR-006)
- Satu rekod kehadiran per sesi per cawangan

---

## UJ-06: Admin Jana Laporan Kehadiran untuk Ibu Bapa

**Pelakon:** Admin
**Prasyarat:** Rekod kehadiran telah diisi oleh Jurulatih
**Hasil yang dijangka:** Laporan kehadiran pelajar dalam format PDF sedia untuk dikongsi kepada ibu bapa

### Langkah-langkah:
1. Admin klik modul "Laporan" → "Laporan Kehadiran"
2. Admin pilih parameter laporan:
   - Bulan dan tahun
   - Cawangan (atau semua cawangan)
   - Pelajar tertentu (atau semua pelajar)
3. Sistem jana laporan kehadiran:
   - Nama pelajar
   - Jumlah sesi hadir / tidak hadir
   - Peratusan kehadiran
   - Senarai tarikh sesi
4. Admin pratonton laporan
5. Admin muat turun sebagai PDF
6. Admin kongsi PDF kepada ibu bapa melalui WhatsApp secara individu atau group

---

## UJ-07: Admin Jana Laporan Kewangan Bulanan (LHDN)

**Pelakon:** Admin
**Prasyarat:** Rekod bayaran dan rekod perbelanjaan bulan berkenaan telah lengkap
**Hasil yang dijangka:** Laporan kewangan bulanan dalam format Excel dan PDF sedia untuk simpan dan semakan

### Langkah-langkah:
1. Admin klik modul "Laporan" → "Laporan Kewangan"
2. Admin pilih bulan dan tahun
3. Sistem jana laporan yang merangkumi:
   - **Pendapatan:** Senarai semua bayaran yuran diterima (dengan nombor resit)
   - **Perbelanjaan:** Senarai semua rekod duit keluar (sewa, gaji, peralatan, dll.)
   - **Ringkasan:** Jumlah masuk, jumlah keluar, baki bersih
4. Admin pratonton laporan
5. Admin eksport ke **Excel** (untuk simpan rekod LHDN)
6. Admin eksport ke **PDF** (untuk cetak atau arkib)

---

## UJ-08: Admin Rekod Perbelanjaan (Duit Keluar)

**Pelakon:** Admin
**Prasyarat:** Admin telah log masuk
**Hasil yang dijangka:** Rekod perbelanjaan disimpan dalam modul Kewangan

### Langkah-langkah:
1. Admin klik modul "Kewangan" → "Rekod Perbelanjaan"
2. Admin isi butiran perbelanjaan:
   - Tarikh
   - Kategori (Sewa / Bil Utiliti / Gaji Jurulatih / Peralatan / Lain-lain)
   - Jumlah (RM)
   - Keterangan ringkas
   - Cawangan berkaitan (jika berkaitan)
   - Lampirkan resit/invois (jika ada)
3. Admin klik "Simpan"
4. Rekod perbelanjaan disimpan dan dimasukkan dalam laporan kewangan bulanan

---

## UJ-09: Admin Daftar Aset Baharu

**Pelakon:** Admin
**Prasyarat:** Aset fizikal baharu telah dibeli atau diterima
**Hasil yang dijangka:** Rekod aset baharu disimpan dalam sistem

### Langkah-langkah:
1. Admin klik modul "Aset" → "Daftar Aset Baharu"
2. Admin isi butiran aset:
   - Nama aset
   - Kategori (Peralatan Catur / Perabot / Elektronik / Lain-lain)
   - Nombor siri / kod aset (jika ada)
   - Tarikh perolehan
   - Kos perolehan (RM)
   - Cawangan / lokasi aset
   - Status (Aktif)
3. Admin klik "Simpan"
4. Sistem jana ID aset automatik
5. Rekod kos perolehan dikaitkan secara automatik dengan modul Kewangan sebagai perbelanjaan (DR-033)

---

## UJ-10: Admin Rekod Aset Dilupuskan

**Pelakon:** Admin
**Prasyarat:** Aset wujud dalam sistem dengan status "Aktif"
**Hasil yang dijangka:** Status aset dikemas kini kepada "Dilupuskan" dengan rekod sebab dan tarikh

### Langkah-langkah:
1. Admin klik modul "Aset" → cari aset berkenaan
2. Admin klik "Lupuskan Aset"
3. Admin isi butiran pelupusan:
   - Tarikh dilupuskan
   - Sebab (Rosak / Hilang / Tamat Hayat / Dijual / Didermakan)
   - Nota tambahan
   - Nilai pelupusan (RM0 jika dibuang / nilai jualan jika dijual)
4. Admin klik "Sahkan Pelupusan"
5. Sistem kemas kini status aset kepada **"Dilupuskan"**
6. Rekod pelupusan disimpan dalam sejarah aset
7. Jika ada nilai jualan → dikaitkan dengan modul Kewangan sebagai pendapatan

---

## UJ-11: Admin Semak Dashboard dan Gambaran Keseluruhan

**Pelakon:** Admin
**Prasyarat:** Admin telah log masuk
**Hasil yang dijangka:** Admin mendapat gambaran keseluruhan operasi CFK secara pantas

### Langkah-langkah:
1. Admin log masuk → dibawa terus ke Dashboard Admin
2. Dashboard memaparkan:
   - Jumlah pelajar aktif (semua cawangan)
   - Ringkasan kehadiran minggu / bulan semasa
   - Jumlah bayaran terkumpul bulan ini (RM)
   - Senarai pelajar belum bayar bulan ini
   - Jumlah pelajar per cawangan (Klebang / Buntong / Sri Iskandar / SMK Star)
3. Admin klik mana-mana kad ringkasan untuk pergi ke modul berkaitan

---

## UJ-12: Admin Migrate Data Pelajar Lama

**Pelakon:** Admin
**Prasyarat:** Data pelajar lama tersedia dalam fail HTML atau Excel lama
**Hasil yang dijangka:** Semua data pelajar sedia ada berjaya dipindahkan ke sistem baharu

### Langkah-langkah:
1. Admin semak data pelajar dari sistem lama (fail HTML)
2. Untuk setiap pelajar, Admin gunakan UJ-02 (Daftar Pelajar Manual) untuk masukkan data ke sistem baharu
3. Admin semak semula senarai pelajar dalam sistem untuk pastikan tiada pendua
4. Admin kemas kini status pelajar yang tidak aktif kepada "Tidak Aktif"

### Nota:
- Proses ini dilakukan sekali sahaja semasa onboarding sistem
- Data rekod bayaran lama tidak perlu dimigrate — sistem bermula segar dari tarikh pelancaran
- Sasaran: Semua pelajar aktif dimigrate sebelum Fasa 1 dilancarkan (30 Jun 2026)

---

## Ringkasan User Journeys

| ID | Journey | Pelakon | Modul |
|---|---|---|---|
| UJ-01 | Log masuk ke sistem | Admin / Jurulatih | Auth |
| UJ-02 | Daftar pelajar baharu (manual) | Admin | Profil Pelajar |
| UJ-03 | Pelajar daftar via Google Forms | Ibu Bapa + Admin | Profil Pelajar |
| UJ-04 | Rekod bayaran dan keluarkan resit | Admin | Bayaran / Resit |
| UJ-05 | Tandakan kehadiran pelajar | Jurulatih | Kehadiran |
| UJ-06 | Jana laporan kehadiran untuk ibu bapa | Admin | Laporan |
| UJ-07 | Jana laporan kewangan bulanan (LHDN) | Admin | Laporan / Kewangan |
| UJ-08 | Rekod perbelanjaan (duit keluar) | Admin | Kewangan |
| UJ-09 | Daftar aset baharu | Admin | Aset |
| UJ-10 | Rekod aset dilupuskan | Admin | Aset |
| UJ-11 | Semak dashboard | Admin | Dashboard |
| UJ-12 | Migrate data pelajar lama | Admin | Profil Pelajar |

---

*Dokumen ini disediakan pada 27 Jun 2026*
*Versi 1.0 — CFK HUB (Chess For Kids)*
