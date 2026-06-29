# Dokumen Keperluan Produk (PRD) — CFK HUB

**Versi:** 1.0  
**Tarikh:** 27 Jun 2026  
**Pemilik Produk:** Khatib bin Md Yan (Admin CFK)  
**Status:** Diluluskan — Sedia untuk Fasa Reka Bentuk

---

## 1. Ringkasan Produk

**CFK HUB** adalah sistem pengurusan dalaman berasaskan web (PWA) untuk Chess For Kids (CFK) — sebuah akademi catur kanak-kanak yang beroperasi di 4 cawangan di Perak, Malaysia. Sistem ini menggantikan kaedah manual (HTML/Excel/kertas) yang telah digunakan selama 5 tahun.

**Masalah utama yang diselesaikan:**
- Rekod kehadiran manual mengambil masa 80% lebih lama dari yang sepatutnya
- Tiada sistem resit digital yang teratur (keperluan LHDN)
- Komunikasi ibu bapa tidak tersusun
- Tiada visibiliti aset dan kewangan CFK secara terpusat

**Pengguna sasaran:**
- **1 Admin** (pemilik/pengurus CFK) — akses penuh semua modul
- **6 Jurulatih** — akses terhad kepada kehadiran, senarai pelajar, dan makluman

---

## 2. Matlamat Produk

| ID | Matlamat | Metrik Kejayaan |
|---|---|---|
| G-01 | Kurangkan masa rekod kehadiran | Dari 30 minit → bawah 5 minit per sesi |
| G-02 | Jana resit digital berformat LHDN | 100% resit digital dengan nombor auto |
| G-03 | Sediakan laporan kehadiran ibu bapa | Jana PDF dalam < 30 saat |
| G-04 | Rekod kewangan terpusat | Semua pendapatan + perbelanjaan dalam satu sistem |
| G-05 | Makluman WhatsApp teratur | Admin/Jurulatih hantar makluman dalam < 2 minit |

---

## 3. Skop Produk

### 3.1 Dalam Skop (Fasa 1–3, Jun–Julai 2026)

| Modul | Fasa | Pengguna |
|---|---|---|
| Log Masuk & Pengesahan | 1 | Semua |
| Dashboard Admin | 1 | Admin |
| Modul Pelajar (daftar, profil, import GForms) | 1 | Admin |
| Modul Kehadiran (rekod, semak, edit) | 1 | Admin + Jurulatih |
| Modul Bayaran & Resit (kumpulan + personal) | 2 | Admin |
| Modul Laporan (kehadiran ibu bapa, LHDN) | 2 | Admin |
| Modul Makluman WhatsApp | 2 | Admin + Jurulatih |
| Modul Kewangan (perbelanjaan) | 3 | Admin |
| Modul Aset | 3 | Admin |
| Tetapan (pengguna, cawangan) | 1 | Admin |

### 3.2 Luar Skop

- Portal ibu bapa / akses ibu bapa ke sistem
- Pembayaran dalam talian (gateway pembayaran)
- Aplikasi Android / iOS berasingan (gunakan PWA)
- Notifikasi push automatik
- Integrasi dengan sistem akademik luar

---

## 4. Peranan Pengguna

### 4.1 Admin

- **Bilangan:** 1 pengguna
- **Peranti utama:** Komputer desktop/laptop
- **Akses:** Semua modul tanpa sekatan
- **Pengenalan sistem:** `isAdmin: true`

**Tanggungjawab utama:**
- Urus pendaftaran pelajar dan profil
- Rekod bayaran dan jana resit
- Jana laporan kewangan dan kehadiran
- Urus aset dan perbelanjaan CFK
- Urus akaun Jurulatih dan cawangan

### 4.2 Jurulatih

- **Bilangan:** 6 pengguna
- **Peranti utama:** Telefon pintar (PWA)
- **Akses:** Kehadiran, senarai pelajar (baca), makluman
- **Pengenalan sistem:** `isAdmin: false`

**Tanggungjawab utama:**
- Rekod kehadiran pelajar setiap sesi
- Semak senarai pelajar
- Hantar makluman WhatsApp

---

## 5. Keperluan Fungsi

### 5.1 Pengesahan & Keselamatan

| ID | Keperluan |
|---|---|
| FR-01 | Sistem perlu ada halaman log masuk dengan e-mel dan kata laluan |
| FR-02 | Sistem perlu route Admin ke Dashboard dan Jurulatih ke Modul Kehadiran selepas log masuk |
| FR-03 | Admin boleh tetapkan semula kata laluan Jurulatih terus dari panel pengurusan pengguna |
| FR-04 | Sesi log masuk perlu tamat tempoh selepas tempoh tidak aktif |

### 5.2 Modul Pelajar

| ID | Keperluan |
|---|---|
| FR-05 | Sistem perlu simpan profil pelajar dengan medan: nama penuh, tarikh lahir, nama ibu bapa, nombor telefon, e-mel (opsional), cawangan daftar, tarikh daftar (auto), jenis pelajar (kumpulan/personal/kedua-dua), jenis yuran |
| FR-06 | Admin boleh tambah pelajar secara manual melalui borang dalam sistem |
| FR-07 | Sistem perlu import rekod pelajar dari Google Forms melalui Google Apps Script secara automatik |
| FR-08 | Sistem perlu semak rekod pendua (nama + nombor telefon) sebelum sahkan import |
| FR-09 | Admin boleh nyahaktifkan atau mengaktifkan semula pelajar; rekod tidak dipadam |
| FR-10 | Pelajar "Tidak Aktif" tidak muncul dalam senarai kehadiran semasa tetapi boleh dicari |
| FR-11 | Sistem perlu sokong hubungan adik-beradik antara profil pelajar |
| FR-12 | Admin boleh cari pelajar mengikut nama atau nombor telefon ibu bapa |

### 5.3 Modul Kehadiran

| ID | Keperluan |
|---|---|
| FR-13 | Jurulatih boleh rekod kehadiran untuk mana-mana cawangan (bukan cawangan sendiri sahaja) |
| FR-14 | Setiap rekod kehadiran menyimpan: pelajar_id, tarikh, status, cawangan_sesi, cawangan_daftar, jurulatih_id |
| FR-15 | Status kehadiran yang disokong: Hadir / Tidak Hadir / Cuti (dengan nota opsional) |
| FR-16 | Jurulatih boleh edit rekod kehadiran dalam tempoh 7 hari dari tarikh sesi; Admin boleh edit tanpa had masa |
| FR-17 | Semua edit rekod kehadiran menyimpan metadata: siapa edit dan bila |

### 5.4 Modul Bayaran & Resit

| ID | Keperluan |
|---|---|
| FR-18 | Sistem perlu sokong dua jenis bayaran: Kelas Kumpulan (bulanan) dan Kelas Personal (per sesi) |
| FR-19 | Yuran kelas kumpulan: RM 70 (1 pelajar) / RM 50 per orang (2 adik-beradik = RM 100) / RM 50 per orang (3 adik-beradik = RM 150) |
| FR-20 | Yuran kelas personal: RM 80–150 per sesi; Admin tetapkan jumlah semasa rekod |
| FR-21 | Yuran kelas kumpulan hanya dikenakan jika pelajar hadir ≥ 4 sesi dalam bulan tersebut |
| FR-22 | Jika pelajar hadir < 4 sesi dan sudah bayar, sistem rekod sebagai kredit dibawa ke hadapan |
| FR-23 | Resit dijana secara automatik dengan nombor format `CFK-YYYY-NNNNN` yang berurutan |
| FR-24 | Admin boleh membatalkan resit; status bertukar "Dibatalkan" tetapi rekod tidak dipadam |
| FR-25 | Resit yang dibatalkan menyimpan: sebab batal, siapa batal, bila batal |
| FR-26 | Nombor resit tidak boleh digunakan semula walaupun resit asal dibatalkan |
| FR-27 | Resit boleh dijana sebagai PDF dan dikongsi |
| FR-28 | Sistem paparkan senarai pelajar yang layak dikenakan caj (≥ 4 kelas) tetapi belum bayar |
| FR-29 | Dashboard Admin paparkan bilangan pelajar belum bayar secara automatik |

### 5.5 Modul Laporan

| ID | Keperluan |
|---|---|
| FR-30 | Admin boleh jana laporan kehadiran pelajar individu dalam format PDF Bahasa Melayu |
| FR-31 | Laporan kehadiran ibu bapa merangkumi: senarai sesi per tarikh, status setiap sesi, nota cuti, peratusan kehadiran |
| FR-32 | Admin boleh jana laporan kewangan untuk pelaporan LHDN dalam format Excel dan PDF |
| FR-33 | Laporan kewangan boleh ditapis mengikut tempoh (bulan/tahun) dan cawangan |

### 5.6 Modul Kewangan

| ID | Keperluan |
|---|---|
| FR-34 | Admin boleh rekod perbelanjaan CFK dengan medan: tarikh, kategori, penerangan, jumlah, cawangan (atau "Umum") |
| FR-35 | Sistem paparkan ringkasan pendapatan vs perbelanjaan mengikut tempoh dan cawangan |
| FR-36 | Laporan kewangan mengasingkan pendapatan: Kelas Kumpulan vs Kelas Personal |

### 5.7 Modul Aset

| ID | Keperluan |
|---|---|
| FR-37 | Admin boleh daftar aset dengan medan: nama, kategori, nilai, tarikh perolehan, cawangan, syarikat/pembekal |
| FR-38 | Admin boleh melupuskan aset; sebab pelupusan wajib diisi; rekod kekal dengan status "Dilupuskan" |
| FR-39 | Sistem paparkan nilai keseluruhan aset aktif |
| FR-40 | Laporan aset boleh tunjuk aset aktif dan aset dilupuskan secara berasingan |

### 5.8 Modul Makluman WhatsApp

| ID | Keperluan |
|---|---|
| FR-41 | Admin dan Jurulatih boleh cipta makluman dari templat: Peringatan Kelas / Pembatalan / Pertandingan / Pengumuman |
| FR-42 | Pengguna boleh edit teks templat sebelum hantar |
| FR-43 | Sistem sediakan butang "Salin Mesej" untuk hantar ke group WhatsApp |
| FR-44 | Sistem sediakan pautan `wa.me/?text=...` untuk hubungi individu terus |
| FR-45 | Sistem simpan histori makluman: jenis, tarikh, penghantar |

### 5.9 Tetapan

| ID | Keperluan |
|---|---|
| FR-46 | Admin boleh tambah, edit, dan nyahaktifkan akaun Jurulatih |
| FR-47 | Admin boleh tetapkan semula kata laluan Jurulatih tanpa memerlukan e-mel/OTP |
| FR-48 | Admin boleh tambah, edit nama, dan nyahaktifkan cawangan |
| FR-49 | Semua dropdown cawangan dalam sistem baca dari pangkalan data (dinamik, bukan hardcode) |
| FR-50 | Cawangan "Tidak Aktif" tidak muncul dalam pilihan pendaftaran pelajar baharu |

---

## 6. Keperluan Bukan Fungsi

| ID | Keperluan | Sasaran |
|---|---|---|
| NFR-01 | Prestasi — masa muatan halaman | < 3 saat pada sambungan 4G |
| NFR-02 | Kebolehgunaan mobile | Boleh digunakan dengan satu tangan pada skrin 5–6 inci |
| NFR-03 | PWA | Boleh dipasang di telefon sebagai ikon aplikasi |
| NFR-04 | Simpan data | 7 tahun minimum (keperluan LHDN) |
| NFR-05 | Saiz pangkalan data | Sokong 100–200 pelajar aktif dengan rekod 7 tahun |
| NFR-06 | Keselamatan | Log masuk wajib; tiada akses tanpa pengesahan |
| NFR-07 | PDPA asas | Tiada pendedahan data pelajar kepada pihak ketiga |
| NFR-08 | Bajet hosting | RM 50–200 / tahun (domain sahaja; hosting percuma) |
| NFR-09 | Penyenggaraan | Admin boleh uruskan sistem sendiri tanpa bantuan teknikal |

---

## 7. Struktur Navigasi Ringkas

### Admin
`Log Masuk → Dashboard → [Pelajar | Kehadiran | Bayaran & Resit | Laporan | Kewangan | Aset | Makluman | Tetapan]`

### Jurulatih
`Log Masuk → Kehadiran (halaman utama) → [Pelajar | Makluman | Dashboard]`

---

## 8. Struktur Yuran (Rujukan)

### Yuran Pendaftaran (Sekali Bayar)

| Kategori | Yuran |
|---|---|
| 1 pelajar | RM 140 |
| 2 adik-beradik | RM 170 |
| 3 adik-beradik | RM 220 |

### Yuran Bulanan — Kelas Kumpulan

| Kategori | Yuran / Bulan |
|---|---|
| 1 pelajar | RM 70 |
| 2 adik-beradik | RM 100 |
| 3 adik-beradik | RM 150 |

*One-Price Policy: Satu yuran memberi akses ke semua cawangan*

### Yuran Kelas Personal (Per Sesi)

| Faktor | Julat |
|---|---|
| Online | RM 80 – RM 100 |
| Bersemuka / Face-to-face | RM 100 – RM 150 |

*Jumlah tepat ditetapkan oleh Admin berdasarkan lokasi dan jarak*

---

## 9. Jadual Pelancaran

| Fasa | Tarikh | Modul |
|---|---|---|
| Fasa 1 | 30 Jun 2026 | Log Masuk, Dashboard, Pelajar, Kehadiran, Tetapan |
| Fasa 2 | 7 Jul 2026 | Bayaran & Resit, Laporan, Makluman WhatsApp |
| Fasa 3 | 14 Jul 2026 | Kewangan, Aset |

---

## 10. Kriteria Penerimaan

Sistem dianggap berjaya apabila:

- [ ] Admin boleh log masuk dan dihantar ke Dashboard
- [ ] Jurulatih boleh log masuk dan terus rekod kehadiran
- [ ] Import pelajar dari Google Forms berfungsi
- [ ] Resit PDF dijana dengan nombor `CFK-YYYY-NNNNN`
- [ ] Dashboard tunjuk bilangan pelajar belum bayar dengan tepat (ikut peraturan ≥ 4 kelas)
- [ ] Laporan kehadiran ibu bapa boleh dijana dalam PDF BM
- [ ] Laporan kewangan boleh dieksport ke Excel
- [ ] Makluman WhatsApp boleh disalin atau dihantar melalui pautan wa.me
- [ ] Admin boleh tambah cawangan baharu tanpa bantuan pembangun
- [ ] Sistem berfungsi sebagai PWA di telefon Android dan iOS

---

*Dokumen ini adalah dokumen peringkat produk. Keputusan teknikal (framework, pangkalan data, hosting) akan didokumenkan dalam Technical Design Document (Episode 06).*
