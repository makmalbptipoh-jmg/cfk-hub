# DR-012: Adakah sistem memerlukan modul laporan?

## Status
Diputuskan

## Soalan
Adakah sistem CFK HUB perlu menyediakan fungsi penjanaan laporan?

## Konteks
Modul laporan menambah kerumitan teknikal tetapi memberikan nilai tinggi kepada pengurusan. Perlu ditentukan sama ada ia dalam skop pembangunan.

## Keputusan
**Ya**, sistem memerlukan modul laporan.

Laporan yang diperlukan:
1. Laporan kehadiran per bulan (per pelajar / per cawangan)
2. Laporan bayaran per bulan
3. Laporan pelajar belum bayar
4. Export laporan ke PDF atau Excel

## Sebab
Admin memerlukan data ringkasan untuk pengurusan dan pemantauan prestasi program CFK. Export Excel khususnya diperlukan untuk tujuan pelaporan kepada **Lembaga Hasil Dalam Negeri (LHDN)** — rekod bayaran dalam format Excel memudahkan semakan dan audit cukai.

## Kesan
- Modul laporan perlu dibangunkan sebagai komponen berasingan
- Fungsi export PDF dan/atau Excel perlu disokong
- Laporan boleh ditapis mengikut tarikh, cawangan, atau jenis bayaran
