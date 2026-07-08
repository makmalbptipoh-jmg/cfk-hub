# Seni Bina Maklumat & Navigasi — CFK HUB

**Versi:** 1.1  
**Tarikh:** 8 Jul 2026 (kemas kini: modul Kewangan — Pendapatan Lain + Dokumen Jualan)  
**Berdasarkan:** DR-001 hingga DR-037, PD-001 hingga PD-022

---

## 1. Gambaran Keseluruhan Sistem

CFK HUB adalah sistem pengurusan dalaman untuk Chess For Kids (CFK) dengan **dua peranan pengguna** yang mempunyai aliran navigasi berbeza:

| Peranan | Halaman Pertama Selepas Log Masuk | Skop Akses |
|---|---|---|
| **Admin** | Dashboard Admin | Semua modul |
| **Jurulatih** | Modul Kehadiran (terus) | Kehadiran, Pelajar (baca), Makluman |

---

## 2. Hierarki Halaman — Admin

```
CFK HUB (Admin)
│
├── 🔐 Log Masuk
│
└── [Selepas log masuk → Dashboard Admin]
    │
    ├── 📊 Dashboard Admin
    │   ├── Widget: Pelajar Belum Bayar (bulan ini)
    │   ├── Widget: Kehadiran Hari Ini (semua cawangan)
    │   ├── Widget: Pendapatan Bulan Ini
    │   └── Widget: Jumlah Pelajar Aktif (per cawangan)
    │
    ├── 👨‍🎓 Modul Pelajar
    │   ├── Senarai Pelajar
    │   │   ├── [Tapis] Status: Aktif / Tidak Aktif / Semua
    │   │   ├── [Tapis] Cawangan
    │   │   ├── [Carian] Nama / Nombor Telefon Ibu Bapa
    │   │   └── [Butang] Tambah Pelajar / Import Google Forms
    │   ├── Profil Pelajar (lihat & edit)
    │   │   ├── Maklumat Peribadi
    │   │   ├── Adik-beradik (jika ada)
    │   │   ├── Sejarah Kehadiran
    │   │   ├── Sejarah Bayaran & Resit
    │   │   └── [Butang] Nyahaktifkan / Aktifkan Semula
    │   ├── Tambah Pelajar Baharu (Manual)
    │   └── Import dari Google Forms
    │       ├── Pratonton rekod import
    │       ├── Semak pendua
    │       └── Sahkan import
    │
    ├── ✅ Modul Kehadiran
    │   ├── Rekod Kehadiran Baharu
    │   │   ├── Pilih Cawangan
    │   │   ├── Pilih Tarikh Sesi
    │   │   └── Senarai Pelajar + Status (Hadir/Tidak Hadir/Cuti)
    │   └── Semak & Edit Rekod Kehadiran
    │       ├── [Tapis] Tarikh / Cawangan / Pelajar
    │       └── Edit rekod (Admin: tiada had tarikh)
    │
    ├── 💰 Modul Bayaran & Resit
    │   ├── Rekod Bayaran Baharu
    │   │   ├── Kelas Kumpulan (bayaran bulanan)
    │   │   │   ├── Pilih pelajar
    │   │   │   ├── Pilih bulan
    │   │   │   ├── Jumlah (auto: RM70 / RM50 adik-beradik)
    │   │   │   └── Kaedah bayaran
    │   │   └── Kelas Personal (bayaran per sesi)
    │   │       ├── Pilih pelajar
    │   │       ├── Tarikh sesi
    │   │       ├── Kaedah (Online / Bersemuka)
    │   │       ├── Lokasi
    │   │       ├── Jumlah (RM80–RM150)
    │   │       └── Status bayaran
    │   ├── Senarai Resit
    │   │   ├── [Tapis] Tarikh / Cawangan / Jenis / Status
    │   │   ├── Lihat Resit (PDF preview)
    │   │   └── Batal Resit (dengan sebab wajib)
    │   └── Senarai Pelajar Belum Bayar
    │       ├── [Tapis] Cawangan
    │       └── [Papar] Nama, Cawangan, Kelas Hadir, Bulan Tertunggak, No. Telefon
    │
    ├── 📈 Modul Laporan
    │   ├── Laporan Kehadiran Ibu Bapa
    │   │   ├── Pilih Pelajar
    │   │   ├── Pilih Bulan
    │   │   └── Jana PDF (BM)
    │   ├── Laporan Kewangan LHDN
    │   │   ├── Pilih Tempoh (bulan/tahun)
    │   │   ├── [Tapis] Cawangan / Semua
    │   │   └── Jana Excel / PDF
    │   └── Ringkasan Kehadiran
    │       ├── [Tapis] Cawangan / Bulan
    │       └── Peratusan kehadiran per pelajar
    │
    ├── 💸 Modul Kewangan  (tab: Ringkasan | Perbelanjaan | Pendapatan Lain | Dokumen Jualan)
    │   ├── Ringkasan Kewangan
    │   │   ├── Pendapatan (Yuran + Pendapatan Lain) vs Perbelanjaan
    │   │   └── Baki bersih + pecahan per cawangan
    │   ├── Rekod Perbelanjaan
    │   │   ├── Senarai + [Tapis] Cawangan (Klebang/Buntong/Sri Iskandar/SMK Star/Umum) / Tarikh / Kategori
    │   │   └── Tambah / Edit / Padam (+ lampiran bukti)
    │   ├── Pendapatan Lain / Sumbangan
    │   │   ├── Rekod wang masuk selain yuran (jualan, sumbangan, penajaan, sewa…)
    │   │   └── Auto nombor resit (CFK-L-YYYY-NNNNN) + muat turun resit PDF
    │   └── Dokumen Jualan — Sebut Harga / Invois / Resit  ← BAHARU (Sesi 7)
    │       ├── Satu dokumen → 3 jenis PDF (SH / INV / RS) kongsi nombor asas
    │       ├── Butiran pembeli (nama sekolah + alamat + PIC) + senarai item berperingkat
    │       ├── Akaun bank taip manual / tunai
    │       └── Auto-rekod ke Pendapatan bila peringkat 'Resit'
    │
    ├── 🗂️ Modul Aset
    │   ├── Senarai Aset Aktif
    │   │   ├── [Tapis] Cawangan / Kategori
    │   │   └── Nilai keseluruhan aset aktif
    │   ├── Tambah Aset Baharu
    │   ├── Profil Aset (lihat & edit)
    │   │   ├── Maklumat aset
    │   │   ├── Nilai & tarikh perolehan
    │   │   └── [Butang] Lupus Aset (dengan sebab wajib)
    │   └── Senarai Aset Dilupuskan
    │       └── [Papar] Nama, Nilai, Tarikh Lupus, Sebab
    │
    ├── 📢 Modul Makluman
    │   ├── Cipta Makluman Baharu
    │   │   ├── Pilih Jenis (Peringatan Kelas / Pembatalan / Pertandingan / Pengumuman)
    │   │   ├── Pilih Penerima (Semua / Cawangan / Individu)
    │   │   ├── Edit teks templat
    │   │   ├── [Butang] Salin Mesej (untuk group WA)
    │   │   └── [Butang] WhatsApp (pautan wa.me untuk individu)
    │   └── Histori Makluman
    │       └── [Papar] Jenis, Tarikh, Penghantar, Penerima
    │
    └── ⚙️ Tetapan
        ├── Pengurusan Pengguna
        │   ├── Senarai Jurulatih
        │   ├── Tambah Jurulatih Baharu
        │   ├── Edit Profil Jurulatih
        │   └── Reset Kata Laluan Jurulatih
        ├── Pengurusan Cawangan
        │   ├── Senarai Cawangan (Aktif / Tidak Aktif)
        │   ├── Tambah Cawangan Baharu
        │   ├── Edit Maklumat Cawangan
        │   └── Nyahaktifkan Cawangan
        └── Profil Admin
            └── Tukar Kata Laluan
```

---

## 3. Hierarki Halaman — Jurulatih

```
CFK HUB (Jurulatih)
│
├── 🔐 Log Masuk
│
└── [Selepas log masuk → Modul Kehadiran terus]
    │
    ├── ✅ Modul Kehadiran  ← HALAMAN UTAMA JURULATIH
    │   ├── Rekod Kehadiran Baharu
    │   │   ├── Pilih Cawangan (semua cawangan aktif)
    │   │   ├── Pilih Tarikh Sesi (lalai: hari ini)
    │   │   └── Senarai SEMUA pelajar aktif + status
    │   │       └── [Tapis cawangan untuk fokus]
    │   └── Semak & Edit Rekod Kehadiran
    │       └── Edit hanya dalam tempoh 7 hari dari tarikh sesi
    │
    ├── 👨‍🎓 Senarai Pelajar (baca sahaja)
    │   ├── Senarai semua pelajar aktif
    │   ├── [Carian] Nama / Nombor Telefon Ibu Bapa
    │   ├── [Tapis] Cawangan
    │   └── Profil Pelajar (baca sahaja — tiada edit)
    │       ├── Maklumat peribadi
    │       └── Kehadiran terkini
    │
    ├── 📢 Makluman WhatsApp
    │   ├── Cipta Makluman
    │   │   ├── Pilih Jenis
    │   │   ├── Edit teks
    │   │   ├── [Butang] Salin Mesej
    │   │   └── [Butang] WhatsApp individu
    │   └── Histori Makluman (hantar oleh Jurulatih ini)
    │
    └── 📊 Dashboard Jurulatih (ringkas)
        ├── Kehadiran hari ini (cawangan dipilih)
        └── Rekod kehadiran minggu ini
```

---

## 4. Inventori Skrin / Halaman

### Halaman Dikongsi (Admin & Jurulatih)

| Halaman | Admin | Jurulatih | Catatan |
|---|---|---|---|
| Log Masuk | ✅ | ✅ | Satu halaman, route berbeza selepas log masuk |
| Rekod Kehadiran | ✅ Penuh | ✅ Penuh | Jurulatih: had 7 hari edit |
| Senarai Pelajar | ✅ Edit | ✅ Baca sahaja | |
| Profil Pelajar | ✅ Edit | ✅ Baca sahaja | |
| Cipta Makluman WA | ✅ | ✅ | |
| Histori Makluman | ✅ Semua | ✅ Milik sendiri | |

### Halaman Admin Sahaja

| Halaman | Keterangan |
|---|---|
| Dashboard Admin | Widget belum bayar, statistik, pendapatan |
| Tambah / Import Pelajar | Tambah manual atau import Google Forms |
| Rekod Bayaran Kumpulan | Jana resit bulanan |
| Rekod Bayaran Personal | Jana resit per sesi kelas personal |
| Senarai Resit | Lihat & batal resit |
| Senarai Pelajar Belum Bayar | Terhad Admin sahaja (PD-018) |
| Laporan Kehadiran Ibu Bapa | Jana PDF BM |
| Laporan Kewangan LHDN | Jana Excel / PDF |
| Rekod Perbelanjaan | Tambah, edit, senarai (+ bukti) |
| Pendapatan Lain / Sumbangan | Wang masuk selain yuran + resit PDF |
| Dokumen Jualan | Sebut Harga / Invois / Resit untuk jualan peralatan & khidmat (Sesi 7) |
| Ringkasan Kewangan | Pendapatan vs Perbelanjaan |
| Modul Aset (semua) | Tambah, edit, lupus |
| Pengurusan Pengguna | Tambah / reset kata laluan Jurulatih |
| Pengurusan Cawangan | Tambah / edit / nyahaktifkan |

---

## 5. Navigasi Utama

### Sidebar / Menu Admin

```
[Logo CFK HUB]
─────────────────
📊  Dashboard
👨‍🎓  Pelajar
✅  Kehadiran
💰  Bayaran & Resit
📈  Laporan
💸  Kewangan
🗂️  Aset
📢  Makluman
─────────────────
⚙️  Tetapan
👤  [Nama Admin] ▼
    └── Log Keluar
```

### Menu Bawah / Tab Bar Jurulatih (Mobile)

```
[✅ Kehadiran]  [👨‍🎓 Pelajar]  [📢 Makluman]  [📊 Dashboard]
```

---

## 6. Modal & Panel

| Modal / Panel | Dicetuskan Dari | Kandungan |
|---|---|---|
| Modal Batal Resit | Senarai Resit | Sebab pembatalan (wajib) + Sahkan |
| Modal Lupus Aset | Profil Aset | Sebab pelupusan (wajib) + Sahkan |
| Modal Reset Kata Laluan | Pengurusan Pengguna | Kata laluan baharu (Admin taip) |
| Modal Nyahaktifkan Pelajar | Profil Pelajar | Sahkan nyahaktifkan + tarikh |
| Modal Sahkan Import | Import Google Forms | Pratonton + semak pendua + Sahkan |
| Panel Pratonton Resit | Rekod Bayaran | PDF preview sebelum simpan |
| Panel Carian | Senarai Pelajar / Resit | Carian nama / telefon / nombor resit |

---

## 7. Aliran Pengguna Utama

### UF-01: Rekod Kehadiran (Jurulatih)
```
Log Masuk → Modul Kehadiran → Pilih Cawangan & Tarikh → 
Tandakan Status Setiap Pelajar → Simpan → Selesai
```

### UF-02: Rekod Bayaran & Jana Resit (Admin)
```
Bayaran & Resit → Rekod Bayaran Baharu → Pilih Jenis (Kumpulan/Personal) →
Pilih Pelajar → Isi Butiran → Pratonton Resit → Sahkan → 
Resit PDF dijana → Kongsi kepada Ibu Bapa (WhatsApp)
```

### UF-03: Semak Pelajar Belum Bayar (Admin)
```
Dashboard → Widget Belum Bayar → Senarai Pelajar Belum Bayar →
Klik Pelajar → Profil Pelajar → Hubungi Ibu Bapa (pautan wa.me)
```

### UF-04: Jana Laporan Kehadiran Ibu Bapa (Admin)
```
Laporan → Laporan Kehadiran Ibu Bapa → Pilih Pelajar → Pilih Bulan →
Jana PDF → Muat Turun / Kongsi WhatsApp
```

### UF-05: Hantar Makluman WhatsApp (Admin/Jurulatih)
```
Makluman → Cipta Makluman Baharu → Pilih Jenis → Pilih Penerima →
Edit Teks (jika perlu) → [Salin] untuk group / [WhatsApp] untuk individu
```

### UF-06: Daftar Pelajar Baharu (Admin)
```
[Via Google Forms] Forms diisi → Import automatik → Admin semak → Sahkan
[Via Manual] Pelajar → Tambah Pelajar → Isi Borang → Simpan
```

### UF-07: Rekod Kelas Personal (Admin)
```
Bayaran & Resit → Rekod Bayaran Personal → Pilih Pelajar →
Isi Tarikh/Kaedah/Lokasi/Jumlah → Status Bayaran → Simpan → Jana Resit
```

### UF-08: Jualan Peralatan / Khidmat ke Sekolah (Admin) — Sesi 7
```
Kewangan → Dokumen Jualan → Dokumen Baharu (Peringkat: Sebut Harga) →
Isi pembeli + alamat + senarai item → Simpan → Muat turun SH → hantar sekolah
  → [sekolah setuju] Edit → Peringkat: Invois (+ akaun bank) → Muat turun INV
  → [sekolah bayar] Edit → Peringkat: Resit (+ tarikh bayar) → Muat turun RS
     → jumlah auto-masuk Pendapatan (Laporan Kewangan/LHDN)
```

---

## 8. Nota Teknikal

- **Routing selepas log masuk:** Sistem semak `isAdmin` → Admin ke `/dashboard`, Jurulatih ke `/kehadiran`
- **Senarai pelajar dalam kehadiran:** Jurulatih lihat SEMUA pelajar aktif (bukan cawangan sendiri sahaja) — selaras polisi One-Price CFK
- **Had edit kehadiran:** Sistem semak perbezaan tarikh sesi vs tarikh semasa; Jurulatih dihalang edit jika > 7 hari
- **Resit PDF:** Dijana di sisi pelayan (server-side) untuk konsistensi; nombor resit format `CFK-YYYY-NNNNN`
- **Semak pendua import:** Sistem padankan nama + nombor telefon sebelum import dari Google Forms
- **Cawangan dinamik:** Semua dropdown cawangan baca dari pangkalan data (bukan hardcode)
