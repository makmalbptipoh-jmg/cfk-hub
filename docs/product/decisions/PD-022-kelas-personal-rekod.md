# PD-022: Bagaimana sistem merekod bayaran dan kehadiran kelas personal?

## Status
Diputuskan

## Soalan
Apakah cara sistem mengendalikan rekod sesi, kehadiran, dan bayaran untuk kelas personal (private) yang berbeza dari kelas kumpulan?

## Konteks
Kelas personal berbeza dari kelas kumpulan dalam beberapa aspek: yuran per sesi (bukan bulanan), lokasi dan kaedah berbeza-beza, dan tidak tertakluk kepada peraturan ≥ 4 kelas (DR-036). Perlu diputuskan cara terbaik merekodnya dalam sistem.

## Pilihan
- **A** — Rekod bayaran sahaja (resit per sesi); tiada rekod kehadiran khas untuk kelas personal
- **B** — Satu borang merekod kehadiran + bayaran sekaligus per sesi kelas personal
- **C** — Modul berasingan sepenuhnya untuk kelas personal

## Keputusan
**Pilihan B** — Admin rekod satu borang per sesi kelas personal yang merangkumi kehadiran dan bayaran sekaligus:

**Medan borang sesi kelas personal:**

| Medan | Wajib? | Catatan |
|---|---|---|
| Nama pelajar | Ya | Pilih dari senarai pelajar |
| Tarikh sesi | Ya | |
| Kaedah | Ya | Online / Bersemuka |
| Lokasi | Ya | Premis CFK / Rumah pelajar / Lain-lain |
| Tempoh (jam) | Tidak | Opsional |
| Jumlah yuran (RM) | Ya | Admin tetapkan: RM 80 – RM 150 |
| Status bayaran | Ya | Sudah Bayar / Belum Bayar |
| Kaedah bayaran | Jika bayar | Tunai / Maybank Transfer |

Sistem jana resit secara automatik apabila status bayaran = "Sudah Bayar".

## Sebab
Menggabungkan kehadiran dan bayaran dalam satu borang mengurangkan kerja Admin — tidak perlu masuk ke dua modul berbeza untuk rekod satu sesi. Kelas personal yang belum dibayar juga boleh dikesan dan diurus dalam sistem yang sama.

## Kesan
- Profil pelajar boleh tunjuk sejarah kelas personal (senarai sesi, jumlah yuran)
- Resit kelas personal berbeza format dari resit kumpulan — perlu nyatakan "Kelas Personal", tarikh sesi, kaedah, lokasi
- Laporan kewangan boleh asingkan pendapatan: Kelas Kumpulan vs Kelas Personal
- Peraturan DR-036 (≥ 4 kelas untuk kenakan yuran) TIDAK terpakai untuk kelas personal — setiap sesi direkod dan dibayar berasingan
- Pelajar boleh ada status kelas: "Kumpulan", "Personal", atau "Kedua-dua" dalam profil
