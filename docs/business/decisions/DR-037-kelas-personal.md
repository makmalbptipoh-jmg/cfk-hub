# DR-037: Adakah sistem perlu menyokong kelas personal (private) selain kelas kumpulan?

## Status
Diputuskan

## Soalan
Selain kelas kumpulan bulanan, adakah CFK HUB perlu merekod dan menguruskan kelas personal (private one-to-one) dengan struktur yuran yang berbeza?

## Konteks
CFK menawarkan dua jenis kelas: kelas kumpulan (maksimum 10 pelajar, yuran bulanan) dan kelas personal (satu pelajar, yuran per sesi). Yuran kelas personal berbeza bergantung kepada faktor lokasi dan kaedah penyampaian.

## Pilihan
- **A** — Sistem hanya sokong kelas kumpulan; kelas personal diurus di luar sistem
- **B** — Sistem sokong kedua-dua jenis kelas: kumpulan (yuran bulanan) dan personal (yuran per sesi)

## Keputusan
**Pilihan B** — CFK HUB menyokong dua jenis kelas:

| Jenis Kelas | Yuran | Cara Kira |
|---|---|---|
| Kelas Kumpulan | RM 70/bulan (1 pelajar) / RM 100 (2 adik-beradik) / RM 150 (3 adik-beradik) | Bulanan; dikenakan jika ≥ 4 kehadiran (DR-036) |
| Kelas Personal | RM 80 – RM 150 / sesi | Per sesi; Admin tetapkan harga semasa rekod bayaran |

**Faktor yang mempengaruhi yuran kelas personal:**
- Lokasi: Di premis CFK / di rumah pelajar / lokasi lain
- Jarak: Berkadar dengan jarak perjalanan Jurulatih
- Kaedah: Online (lebih rendah) vs Bersemuka / Face-to-face (lebih tinggi)

## Sebab
Kelas personal adalah sumber pendapatan tambahan CFK yang perlu direkod untuk tujuan pelaporan kewangan LHDN. Tanpa rekod dalam sistem, pendapatan kelas personal tidak akan tercatat dalam laporan kewangan.

## Kesan
- Profil pelajar perlu ada medan "Jenis Pelajar": Kumpulan / Personal / Kedua-dua
- Modul bayaran perlu sokong dua jenis resit: Bulanan (kumpulan) dan Per Sesi (personal)
- Resit kelas personal perlu rekod: tarikh sesi, jenis (online/bersemuka), lokasi, jumlah
- Peraturan DR-036 (≥ 4 kelas untuk kenakan yuran) hanya terpakai untuk kelas kumpulan
- Laporan kewangan perlu boleh asingkan pendapatan kelas kumpulan vs kelas personal
- Tambah PD-022 untuk keputusan produk berkaitan kelas personal
