# PD-009: Adakah sistem perlu memaparkan amaran pelajar belum bayar kepada Admin?

## Status
Diputuskan

## Soalan
Bagaimanakah sistem memaklumkan Admin tentang pelajar yang belum membayar yuran bulanan?

## Konteks
Mengesan pelajar belum bayar adalah keperluan operasi utama CFK. Amaran yang berkesan membantu Admin bertindak dengan cepat tanpa perlu semak setiap rekod secara manual.

## Pilihan
- **A** — Tiada amaran — Admin semak sendiri secara manual
- **B** — Amaran pasif — senarai tersedia dalam modul laporan sahaja
- **C** — Amaran aktif — Dashboard Admin paparkan bilangan pelajar layak dikenakan caj tetapi belum bayar; klik untuk lihat senarai penuh

## Keputusan
**Pilihan C** — Amaran aktif di Dashboard Admin. Logik amaran mengikut peraturan DR-036:

**Kriteria pelajar "belum bayar":**
- Pelajar dengan kehadiran **≥ 4 kelas** dalam bulan semasa ATAU bulan lepas, DAN
- Belum ada rekod bayaran / resit untuk bulan berkenaan

**Paparan Dashboard:**
- Widget/kad menunjukkan: *"X pelajar belum bayar bulan ini"*
- Klik → buka senarai penuh dengan nama, cawangan, bilangan kelas hadir, bulan tertunggak

## Sebab
Peraturan yuran-kehadiran CFK (DR-036) menjadikan "belum bayar" lebih kompleks — Admin tidak boleh semak secara visual tanpa sistem mengira kehadiran dahulu. Amaran aktif di Dashboard menjimatkan masa Admin dan memastikan tiada pelajar yang layak ditagih terlepas pandang.

## Kesan
- Dashboard Admin perlu ada widget amaran bayaran yang dikira secara automatik
- Sistem perlu jalankan semakan kehadiran vs bayaran setiap kali Admin log masuk (atau pada selang masa tertentu)
- Senarai pelajar belum bayar perlu boleh ditapis mengikut cawangan
- Pelajar dengan kredit dibawa ke hadapan (bayar awal bulan kehadiran rendah) tidak muncul dalam senarai belum bayar
- Berkaitan dengan PD-018 (kandungan senarai pelajar belum bayar)
