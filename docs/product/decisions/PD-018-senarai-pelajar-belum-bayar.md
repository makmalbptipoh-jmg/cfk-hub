# PD-018: Apakah maklumat dalam senarai pelajar belum bayar dan siapa yang boleh lihat?

## Status
Diputuskan

## Soalan
Apakah maklumat yang dipaparkan dalam senarai pelajar belum bayar, dan adakah senarai ini boleh dilihat oleh Jurulatih atau Admin sahaja?

## Konteks
Senarai pelajar belum bayar adalah alat pengurusan penting untuk Admin. Namun maklumat ini melibatkan status kewangan pelajar — perlu diputuskan sama ada Jurulatih perlu tahu maklumat ini untuk membantu Admin membuat susulan, atau adakah ia terlalu sensitif untuk dikongsi.

## Pilihan
- **A** — Admin sahaja boleh lihat senarai pelajar belum bayar (maklumat kewangan sensitif)
- **B** — Admin dan Jurulatih boleh lihat senarai pelajar belum bayar di cawangan masing-masing sahaja
- **C** — Admin lihat semua cawangan; Jurulatih lihat cawangan sendiri; senarai paparkan: nama pelajar, bulan belum bayar, nombor telefon ibu bapa

## Keputusan
**Pilihan A** — Senarai pelajar belum bayar hanya boleh dilihat oleh **Admin sahaja**.

Maklumat yang dipaparkan dalam senarai (Admin sahaja):

| Lajur | Maklumat |
|---|---|
| Nama pelajar | Nama penuh |
| Cawangan | Cawangan daftar pelajar |
| Bulan tertunggak | Bulan yang layak dikenakan caj tetapi belum bayar |
| Bilangan kelas hadir | Bilangan kelas yang telah dihadiri bulan berkenaan (untuk sahkan ≥ 4 kelas) |
| Nombor telefon ibu bapa | Untuk Admin buat susulan terus |

Admin boleh tapis senarai mengikut cawangan. Jurulatih tidak mempunyai akses langsung ke maklumat ini.

## Sebab
Maklumat status bayaran adalah data kewangan sensitif. Jurulatih tidak memerlukan maklumat ini untuk menjalankan tugas utama mereka (rekod kehadiran). Mengelakkan kemungkinan maklumat kewangan didedahkan kepada pelajar atau ibu bapa secara tidak sengaja oleh Jurulatih di lapangan.

## Kesan
- Modul "Belum Bayar" / senarai tertunggak tidak muncul dalam navigasi Jurulatih
- Senarai ini hanya accessible melalui Dashboard Admin (widget amaran — PD-009) dan modul Laporan Kewangan
- Sistem tapis senarai berdasarkan peraturan DR-036: hanya pelajar dengan ≥ 4 kehadiran bulan berkenaan yang muncul
- Admin boleh klik nama pelajar untuk terus ke profil dan rekod bayaran pelajar tersebut
