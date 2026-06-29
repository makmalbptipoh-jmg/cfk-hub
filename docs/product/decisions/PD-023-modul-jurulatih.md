# PD-023: Apakah maklumat dan fungsi dalam modul Jurulatih?

## Status
Diputuskan

## Soalan
Adakah CFK HUB perlu menyimpan profil Jurulatih, merekod kehadiran mereka semasa sesi, dan mengira bayaran berdasarkan sesi yang dikendalikan?

## Konteks
Semasa rekabentuk awal, modul Jurulatih tidak dimasukkan dalam senarai skrin. Pengguna mendapati ini perlu ditambah kerana:
- Maklumat peribadi Jurulatih perlu disimpan (termasuk pengalaman ringkas)
- Kehadiran Jurulatih perlu direkod untuk tujuan pengurusan
- Bayaran Jurulatih dikira berdasarkan bilangan sesi yang dikendalikan (bayaran per sesi)

## Keputusan

### A. Profil Jurulatih

**Medan wajib:**
| Medan | Jenis | Keterangan |
|---|---|---|
| `nama_penuh` | Text | Nama penuh Jurulatih |
| `no_ic` | Text | No. IC / MyKad |
| `no_telefon` | Text | No. telefon peribadi |
| `emel` | Email | E-mel log masuk sistem |
| `cawangan[]` | Multi-select | Cawangan yang diajar (boleh lebih satu) |
| `tarikh_mula` | Date | Tarikh mula berkhidmat |
| `status` | Enum | Aktif / Tidak Aktif |

**Medan tambahan:**
| Medan | Jenis | Keterangan |
|---|---|---|
| `pengalaman_ringkas` | Textarea | Latar belakang & pengalaman catur |
| `kelayakan` | Text | Kelayakan catur (contoh: FIDE Rating, sijil) |
| `kadar_bayaran` | Decimal | Kadar bayaran per sesi (RM) |

### B. Kehadiran Jurulatih

- Kehadiran Jurulatih direkod oleh Admin per sesi kelas
- Status: **Hadir** / **Tidak Hadir** / **Cuti**
- Sesi yang direkod hadir = dikira dalam pengiraan bayaran bulan tersebut
- Admin boleh lihat ringkasan: berapa sesi Jurulatih hadir dalam sebulan

### C. Bayaran Jurulatih

**Formula pengiraan:**
```
Jumlah Bayaran = Bilangan Sesi Hadir × Kadar Bayaran per Sesi
```

**Rekod bayaran menyimpan:**
- Bulan bayaran
- Bilangan sesi yang dikendalikan
- Kadar per sesi (semasa transaksi)
- Jumlah bayaran
- Tarikh bayaran dibuat
- Status: **Sudah Bayar** / **Belum Bayar**
- Nota (pilihan)

### D. Kebenaran Akses

| Fungsi | Admin | Jurulatih |
|---|---|---|
| Lihat profil sendiri | ✓ | ✓ |
| Edit profil sendiri | ✗ | ✗ (minta Admin) |
| Tambah / edit profil Jurulatih | ✓ | ✗ |
| Rekod kehadiran Jurulatih | ✓ | ✗ |
| Lihat rekod kehadiran sendiri | ✗ | ✗ (fasa 2) |
| Rekod bayaran Jurulatih | ✓ | ✗ |
| Lihat penyata bayaran sendiri | ✗ | ✗ (fasa 2) |

> Fasa 1: Admin mengurus semua maklumat Jurulatih. Jurulatih tidak nampak penyata bayaran sendiri dalam MVP.

## Skrin Baharu (ditambah ke Screen Inventory)

| ID | Nama Skrin | Fasa |
|---|---|---|
| S-24 | Senarai Jurulatih | Fasa 1 |
| S-25 | Profil Jurulatih (Admin) | Fasa 1 |
| S-26 | Tambah / Edit Jurulatih | Fasa 1 |
| S-27 | Kehadiran Jurulatih per Bulan | Fasa 2 |
| S-28 | Bayaran Jurulatih | Fasa 2 |
| M-06 | Modal Rekod Bayaran Jurulatih | Fasa 2 |

## Kesan Kepada Modul Lain

- **Dashboard Admin:** Tambah widget "Jurulatih Belum Dibayar" bulan ini
- **Navigasi Sidebar:** Modul "Pelajar" dikekalkan; tambah "Jurulatih" sebagai modul baharu dalam UTAMA
- **Jumlah modul sidebar:** 9 modul (tambah 1)

## Sebab
Jurulatih adalah aset utama CFK. Menyimpan profil dan rekod bayaran dalam sistem yang sama membolehkan Admin mengurus semua aspek operasi dari satu tempat. Bayaran per sesi adalah model yang adil dan mudah dikira secara automatik daripada rekod kehadiran.
