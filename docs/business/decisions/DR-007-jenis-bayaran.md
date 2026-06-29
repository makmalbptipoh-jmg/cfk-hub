# DR-007: Apakah jenis-jenis bayaran yang perlu disokong oleh sistem?

## Status
Diputuskan

## Soalan
Apakah kategori atau jenis bayaran yang perlu boleh direkodkan dalam sistem?

## Konteks
Jenis bayaran menentukan pilihan yang tersedia semasa Admin merekodkan transaksi dan menjana resit.

## Keputusan
Sistem menyokong **semua** jenis bayaran, termasuk:
1. Yuran Pendaftaran
2. Yuran Bulanan
3. Bayaran Lain-lain (boleh ditaip sendiri)

## Sebab
CFK mempunyai pelbagai jenis kutipan. Sistem perlu fleksibel untuk menampung semua senario.

## Kesan
- Borang rekod bayaran perlu ada medan "Jenis Bayaran" dengan pilihan dropdown + pilihan "Lain-lain" dengan medan teks
- Laporan boleh ditapis mengikut jenis bayaran
