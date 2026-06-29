# Business Requirements Document (BRD)
## CFK HUB — Sistem Pengurusan Chess For Kids

**Versi:** 1.0
**Tarikh:** 27 Jun 2026
**Disediakan oleh:** Chess For Kids (CFK)
**Status:** Diluluskan

---

## 1. Latar Belakang

### 1.1 Tentang Organisasi
Chess For Kids (CFK) adalah organisasi swasta yang mengendalikan program pengajaran catur untuk kanak-kanak di negeri Perak. CFK beroperasi melalui 4 cawangan:

| Cawangan | Lokasi |
|---|---|
| CFK Klebang | Klebang, Perak |
| CFK Buntong | Buntong, Perak |
| CFK Sri Iskandar | Sri Iskandar, Perak |
| CFK SMK Star | SMK Star, Perak |

Organisasi ini dikendalikan oleh **1 Admin** dan **6 Jurulatih** yang berkhidmat merentas keempat-empat cawangan, dengan kapasiti antara **100 hingga 200 pelajar** aktif.

### 1.2 Situasi Semasa (As-Is)
CFK telah menggunakan sistem pengurusan berasaskan fail HTML mudah selama lebih kurang **5 tahun**. Sistem lama tersebut hanya memfokuskan kepada rekod bayaran sahaja, tanpa modul kehadiran, profil pelajar yang tersusun, pengurusan aset, atau pelaporan kewangan yang komprehensif.

**Masalah utama sistem semasa:**
- Rekod kehadiran pelajar dilakukan secara manual atau tidak direkod langsung
- Tiada sistem pengurusan bayaran yang terpusat dan sistematik
- Resit pembayaran tidak seragam dan sukar dijejak
- Profil pelajar dan jurulatih tidak tersimpan secara digital dengan betul
- Tiada laporan kewangan yang boleh digunakan untuk semakan dalaman
- Maklumat cawangan tidak diuruskan dengan baik
- Tiada rekod aset fizikal CFK yang bernilai ~RM30,000

### 1.3 Keperluan Sistem Baharu
CFK memerlukan satu platform digital bersepadu — **CFK HUB** — yang mendigitalisasi semua proses operasi utama dalam satu sistem yang mudah digunakan oleh kakitangan yang celik digital.

---

## 2. Objektif Perniagaan

| # | Objektif | Ukuran Kejayaan |
|---|---|---|
| OB-01 | Mengurangkan masa Admin dalam proses manual | Jimat **80%** masa operasi pentadbiran |
| OB-02 | Memastikan setiap bayaran direkod dan diresit dengan betul | **Sifar** resit hilang atau pendua |
| OB-03 | Memastikan semua Jurulatih menggunakan sistem | 100% Jurulatih aktif dalam sistem dalam **1 minggu** selepas pelancaran |
| OB-04 | Menyediakan rekod kewangan yang boleh dijejak | Laporan kewangan bulanan sedia dalam Excel dan PDF |
| OB-05 | Mendaftar dan mengurus aset CFK | 100% aset CFK (~RM30,000) didaftar dalam sistem |
| OB-06 | Membolehkan ibu bapa terima laporan kehadiran | Laporan kehadiran boleh dijana dan dikongsi dalam masa 5 minit |

---

## 3. Skop Sistem

### 3.1 Dalam Skop (In-Scope)

**Modul 1: Pengurusan Pengguna & Akaun**
- Log masuk selamat untuk Admin dan Jurulatih
- Pengurusan akaun oleh Admin (tambah, edit, padam)
- Kawalan akses berdasarkan flag `isAdmin`

**Modul 2: Profil & Maklumat**
- Profil Pelajar (nama, maklumat ibu bapa, cawangan, tarikh daftar, jenis yuran, status)
- Profil Jurulatih (nama, telefon, cawangan, status)
- Profil Admin (akaun pengguna)
- Maklumat Cawangan (nama, lokasi, jurulatih bertanggungjawab)

**Modul 3: Rekod Kehadiran**
- Tandakan kehadiran per sesi oleh Jurulatih
- Ringkasan kehadiran bulanan automatik
- Laporan kehadiran per pelajar / per cawangan

**Modul 4: Bayaran & Resit**
- Rekod bayaran oleh Admin (Yuran Pendaftaran RM140 / Yuran Bulanan RM70 / Pakej Adik-Beradik / Lain-lain)
- Sokongan kaedah bayaran: Tunai dan Online
- Jana resit PDF automatik dengan:
  - Logo CFK
  - Nombor resit automatik (format: `CFK-YYYY-NNNNN`)
  - Tandatangan digital Admin
  - Layout sesuai untuk cetak (A4)
- Audit trail untuk setiap resit yang dijana

**Modul 5: Rekod Kewangan (Duit Keluar Masuk)**
- Rekod semua pendapatan CFK (termasuk yuran pelajar)
- Rekod semua perbelanjaan (sewa, bil utiliti, gaji, peralatan, dll.)
- Laporan aliran tunai (cash flow) bulanan
- Export Excel dan PDF untuk tujuan semakan kewangan

**Modul 6: Pengurusan Aset**
- Daftar aset baharu dengan maklumat lengkap (nama, kategori, kos, cawangan, tarikh perolehan)
- Kemaskini status aset (Aktif / Rosak / Dilupuskan)
- Rekod pelupusan aset dengan sebab dan tarikh
- Laporan senarai aset per cawangan
- Integrasi dengan modul Kewangan untuk rekod kos perolehan dan nilai pelupusan

**Modul 7: Dashboard**
- Dashboard Admin: gambaran penuh termasuk kewangan
- Dashboard Jurulatih: maklumat operasi sahaja (kehadiran dan pelajar)

**Modul 8: Laporan**
- Laporan kehadiran bulanan (per pelajar / per cawangan) — PDF
- Laporan bayaran bulanan — Excel dan PDF
- Laporan pelajar belum bayar — Excel dan PDF
- Laporan kewangan lengkap (duit keluar masuk) — Excel dan PDF
- Laporan senarai aset — Excel dan PDF

**Modul 9: Integrasi Google Forms**
- Import data pelajar baharu dari Google Forms secara automatik
- Admin sahkan pendaftaran sebelum diaktifkan
- Notis privasi PDPA dalam borang pendaftaran

### 3.2 Luar Skop (Out-of-Scope)
- Portal atau akses untuk ibu bapa
- Integrasi gateway pembayaran (bayaran diproses di luar sistem)
- Mod akses offline
- Aplikasi Android berasingan (digantikan dengan PWA)
- Notifikasi automatik kepada ibu bapa (dikongsi manual melalui WhatsApp)
- Pematuhan PDPA penuh (hanya notis asas dalam Google Forms)
- Pengurusan pertandingan catur

---

## 4. Pengguna & Peranan

### 4.1 Admin (`isAdmin: true`)
**Bilangan:** 1 orang
**Akses:** Penuh ke semua modul

| Keupayaan | Butiran |
|---|---|
| Pengurusan akaun | Tambah, edit, padam akaun Jurulatih |
| Pengurusan profil | Tambah, edit, padam semua profil |
| Bayaran & Resit | Rekod bayaran dan jana resit |
| Kewangan | Rekod duit keluar masuk |
| Aset | Daftar, kemaskini, lupus aset |
| Laporan | Jana semua laporan dan eksport |
| Dashboard | Paparan penuh termasuk maklumat kewangan |

### 4.2 Jurulatih (`isAdmin: false`)
**Bilangan:** 6 orang (tersebar di 4 cawangan)
**Akses:** Terhad kepada fungsi operasi lapangan

| Keupayaan | Butiran |
|---|---|
| Kehadiran | Tandakan kehadiran pelajar di cawangan sendiri |
| Profil | Lihat sahaja (tidak boleh edit) |
| Dashboard | Paparan operasi (kehadiran dan pelajar sahaja) |
| Aset | Lihat senarai aset di cawangan sendiri |

---

## 5. Keperluan Perniagaan Fungsian

### 5.1 Keperluan Pengurusan Pelajar
| ID | Keperluan |
|---|---|
| BR-01 | Sistem mesti menyimpan profil lengkap setiap pelajar termasuk maklumat ibu bapa dan cawangan |
| BR-02 | Sistem mesti menyokong pendaftaran pelajar baharu secara manual oleh Admin |
| BR-03 | Sistem mesti menyokong import data pelajar dari Google Forms secara automatik |
| BR-04 | Admin mesti menyemak dan mengesahkan setiap pendaftaran dari Google Forms sebelum diaktifkan |
| BR-05 | Sistem mesti menyokong jenis yuran berbeza: Standard (RM70/bulan) dan Pakej Adik-Beradik |
| BR-06 | Yuran pendaftaran adalah RM140 (sekali bayar) |

### 5.2 Keperluan Kehadiran
| ID | Keperluan |
|---|---|
| BR-07 | Jurulatih mesti boleh tandakan kehadiran pelajar per sesi melalui telefon |
| BR-08 | Sistem mesti mengira jumlah kehadiran bulanan secara automatik |
| BR-09 | Rekod kehadiran tidak boleh diubah setelah disimpan oleh Jurulatih |
| BR-10 | Laporan kehadiran bulanan mesti boleh dijana dalam format PDF untuk dikongsi kepada ibu bapa |

### 5.3 Keperluan Bayaran & Resit
| ID | Keperluan |
|---|---|
| BR-11 | Hanya Admin yang boleh rekod bayaran dan jana resit |
| BR-12 | Sistem mesti jana nombor resit unik secara automatik dalam format `CFK-YYYY-NNNNN` |
| BR-13 | Resit mesti mengandungi logo CFK dan tandatangan digital Admin |
| BR-14 | Resit mesti boleh dimuat turun sebagai PDF dan dicetak menggunakan printer standard (A4) |
| BR-15 | Sistem mesti menyokong jenis bayaran: Yuran Pendaftaran, Yuran Bulanan, Lain-lain |
| BR-16 | Sistem mesti menyokong kaedah bayaran: Tunai dan Online |
| BR-17 | Sistem mesti merekod audit trail untuk setiap resit yang dijana |

### 5.4 Keperluan Kewangan
| ID | Keperluan |
|---|---|
| BR-18 | Sistem mesti membolehkan Admin rekod semua perbelanjaan dengan kategori |
| BR-19 | Sistem mesti menjana laporan aliran tunai bulanan (duit masuk vs duit keluar) |
| BR-20 | Laporan kewangan mesti boleh dieksport ke Excel dan PDF |
| BR-21 | Rekod kewangan mesti disimpan selama 7 tahun (keperluan semakan LHDN) |

### 5.5 Keperluan Aset
| ID | Keperluan |
|---|---|
| BR-22 | Admin mesti boleh daftar aset baharu dengan maklumat lengkap |
| BR-23 | Admin mesti boleh rekod pelupusan aset dengan sebab dan tarikh |
| BR-24 | Kos perolehan aset mesti dikaitkan secara automatik dengan rekod perbelanjaan |
| BR-25 | Sistem mesti menyokong laporan senarai aset per cawangan |

### 5.6 Keperluan Laporan
| ID | Keperluan |
|---|---|
| BR-26 | Semua laporan mesti boleh dieksport ke format Excel dan/atau PDF |
| BR-27 | Laporan mesti boleh ditapis mengikut tarikh, cawangan, atau kategori |
| BR-28 | Laporan pelajar belum bayar mesti disokong |

---

## 6. Keperluan Bukan Fungsian

| ID | Kategori | Keperluan |
|---|---|---|
| NFR-01 | Platform | Sistem boleh diakses melalui web browser (komputer dan telefon) |
| NFR-02 | PWA | Sistem boleh dipasang di skrin utama telefon Android sebagai Progressive Web App |
| NFR-03 | Responsif | UI mesti berfungsi baik pada skrin kecil (telefon) dan besar (komputer) |
| NFR-04 | Prestasi | Sistem mesti menyokong 100–200 pelajar dengan lancar |
| NFR-05 | Keselamatan | Sistem dalaman sahaja — tiada akses tanpa log masuk |
| NFR-06 | Data | Data disimpan di cloud (Firebase atau Supabase) |
| NFR-07 | Storan | Data disimpan selama 7 tahun |
| NFR-08 | Privasi | Notis privasi PDPA asas dalam Google Forms pendaftaran |
| NFR-09 | Kos | Guna teknologi percuma / free tier; domain sahaja berbayar (RM50–RM200/tahun) |
| NFR-10 | Internet | Sistem memerlukan sambungan internet (tiada mod offline) |

---

## 7. Struktur Yuran

| Jenis | Jumlah |
|---|---|
| Yuran Pendaftaran | RM140 (sekali bayar) |
| Yuran Bulanan (Standard) | RM70 / bulan |
| Pakej Adik-Beradik | Tertakluk kepada perbincangan (perlu disahkan) |

---

## 8. Pelan Pelancaran (Berfasa)

| Fasa | Tarikh Sasaran | Skop |
|---|---|---|
| **Fasa 1** | 30 Jun 2026 | Log masuk, Profil Pelajar/Jurulatih/Cawangan, Rekod Kehadiran, Jana Resit |
| **Fasa 2** | 7 Julai 2026 | Dashboard berbeza, Laporan Excel/PDF, Rekod Kewangan, Audit Trail |
| **Fasa 3** | 14 Julai 2026 | Pengurusan Aset, Google Forms, PWA, Penambahbaikan UI |

---

## 9. Migrasi Data

Data pelajar aktif dari sistem lama (fail HTML) perlu dimigrate ke sistem baharu secara manual oleh Admin sebelum atau semasa Fasa 1 dilancarkan. Rekod bayaran lama tidak perlu dimigrate — sistem bermula segar dari tarikh pelancaran.

---

## 10. Risiko & Mitigasi

| Risiko | Tahap | Mitigasi |
|---|---|---|
| Sistem tidak boleh diakses semasa operasi | Sederhana | Admin simpan nombor telefon pembangun untuk hubungi jika ada isu teknikal |
| Tiada pelan backup formal | Tinggi | Cloud Firebase/Supabase ada backup automatik; Admin perlu eksport laporan Excel setiap bulan sebagai backup tambahan |
| Masa pembangunan Fasa 1 terlalu ketat (5 hari) | Tinggi | Fokus hanya pada fungsi teras Fasa 1; tangguhkan fungsi lanjutan ke Fasa 2-3 |
| Jurulatih lambat adopsi sistem baharu | Rendah | Semua pengguna celik digital; latihan ringkas cukup |
| Data pelajar lama hilang semasa migrasi | Sederhana | Backup fail HTML lama sebelum mula migrasi |

---

## 11. Definisi & Singkatan

| Istilah | Maksud |
|---|---|
| CFK | Chess For Kids |
| Admin | Pentadbir utama sistem CFK HUB |
| Jurulatih | Pengajar kelas catur di cawangan |
| PWA | Progressive Web App — web app yang boleh dipasang di telefon |
| LHDN | Lembaga Hasil Dalam Negeri Malaysia |
| PDPA | Akta Perlindungan Data Peribadi 2010 |
| MVP | Minimum Viable Product — versi paling asas yang boleh digunakan |
| DR | Decision Record — rekod keputusan |

---

*Dokumen ini disediakan berdasarkan 34 rekod keputusan perniagaan dan 12 user journeys CFK HUB.*
*Tarikh: 27 Jun 2026 | Versi 1.0*
