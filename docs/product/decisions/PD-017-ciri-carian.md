# PD-017: Adakah sistem memerlukan ciri carian untuk Admin dan Jurulatih?

## Status
Diputuskan

## Soalan
Adakah sistem perlu menyediakan fungsi carian untuk mencari pelajar, rekod bayaran, atau rekod lain dengan cepat?

## Konteks
Dengan 100-200 pelajar merentas 4 cawangan, carian adalah keperluan kegunaan yang penting. Tanpa carian, Admin perlu tatal senarai panjang untuk cari rekod. Namun carian menambah kerumitan teknikal.

## Pilihan
- **A** — Carian asas: Cari pelajar mengikut nama sahaja
- **B** — Carian sederhana: Cari pelajar mengikut nama atau nombor telefon ibu bapa; cari resit mengikut nombor resit atau nama pelajar
- **C** — Carian penuh: Cari merentas semua modul (pelajar, resit, kewangan, aset) dengan penapisan lanjutan

## Keputusan
**Pilihan B** — Carian sederhana merentas dua skop utama:

| Skop Carian | Medan Carian | Pengguna |
|---|---|---|
| Cari pelajar | Nama pelajar, nombor telefon ibu bapa | Admin & Jurulatih |
| Cari resit | Nombor resit (CFK-YYYY-NNNNN), nama pelajar | Admin sahaja |

Carian pelajar boleh ditapis mengikut cawangan dan status (Aktif / Tidak Aktif).

## Sebab
Carian nombor telefon ibu bapa sangat praktikal — apabila ibu bapa hubungi untuk semak bayaran atau kehadiran, Admin boleh cari terus dari nombor tanpa perlu ingat nama anak. Carian nombor resit diperlukan untuk semak dan audit rekod kewangan LHDN. Carian penuh merentas semua modul (Pilihan C) terlalu kompleks untuk skop projek semasa.

## Kesan
- Kotak carian pelajar tersedia di bahagian atas senarai pelajar (modul Pelajar dan modul Kehadiran)
- Carian nombor telefon boleh match sebahagian nombor (contoh: taip "572" → tunjuk semua pelajar dengan nombor mengandungi "572")
- Carian resit tersedia dalam modul Bayaran/Resit (Admin sahaja)
- Hasil carian pelajar tunjuk: nama, cawangan daftar, status, nombor telefon ibu bapa
