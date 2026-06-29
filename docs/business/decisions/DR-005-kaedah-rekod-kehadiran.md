# DR-005: Bagaimanakah rekod kehadiran pelajar dilakukan — per sesi, per kelas, atau harian?

## Status
Diputuskan

## Soalan
Apakah unit masa yang digunakan untuk merekod kehadiran pelajar?

## Konteks
Cara rekod kehadiran menentukan struktur data dan antaramuka sistem. Pilihan berbeza (harian, per kelas, per sesi) menghasilkan pengalaman dan laporan yang berbeza.

## Keputusan
Kehadiran direkod **per sesi** dan diringkaskan secara **bulanan**.

## Sebab
Kelas CFK dijalankan mengikut sesi (bukan harian berterusan). Ringkasan bulanan diperlukan untuk tujuan pelaporan dan pemantauan.

## Kesan
- Setiap rekod kehadiran mempunyai: Tarikh Sesi, Nama Pelajar, Status Hadir
- Sistem perlu mengira jumlah kehadiran per bulan secara automatik
- Laporan bulanan kehadiran perlu disokong
