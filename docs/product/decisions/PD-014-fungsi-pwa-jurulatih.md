# PD-014: Apakah fungsi yang perlu tersedia untuk Jurulatih melalui telefon (PWA)?

## Status
Diputuskan

## Soalan
Apakah modul dan fungsi sistem yang perlu boleh diakses sepenuhnya oleh Jurulatih melalui telefon pintar (PWA)?

## Konteks
Jurulatih menggunakan telefon semasa di lapangan. UI mobile perlu dioptimumkan untuk skrin kecil dan kegunaan satu tangan. Terlalu banyak fungsi di mobile menjadikan UI sesak dan sukar digunakan.

## Pilihan
- **A** — Minimum: Rekod Kehadiran sahaja di mobile; semua fungsi lain hanya di desktop
- **B** — Sederhana: Rekod Kehadiran + Lihat Profil Pelajar + Dashboard Jurulatih di mobile
- **C** — Penuh: Semua fungsi Jurulatih tersedia di mobile (kehadiran, profil, dashboard, laporan kehadiran)

## Keputusan
**Pilihan B** — Tiga fungsi utama dioptimumkan untuk mobile (PWA) Jurulatih:

| Fungsi | Mobile (PWA) | Catatan |
|---|---|---|
| Rekod kehadiran | ✅ Penuh | Fungsi utama Jurulatih di lapangan |
| Lihat senarai pelajar | ✅ Penuh | Semak nama pelajar semasa ambil kehadiran |
| Hantar makluman WhatsApp | ✅ Penuh | Jana mesej & kongsi melalui WhatsApp |
| Laporan kehadiran ibu bapa | ⚠️ Terhad | Boleh lihat, jana PDF — lebih sesuai di desktop |
| Dashboard Jurulatih | ✅ Ringkas | Statistik asas sahaja |

## Sebab
Jurulatih di lapangan memerlukan tiga fungsi ini semasa sesi kelas. Senarai pelajar diperlukan untuk semak nama semasa ambil kehadiran. Makluman WhatsApp perlu di mobile kerana Jurulatih biasanya hantar dari telefon yang sama. Laporan lengkap lebih sesuai diakses di komputer oleh Admin.

## Kesan
- UI mobile Jurulatih perlu dioptimumkan untuk skrin kecil: butang besar, navigasi mudah, satu tangan
- Halaman pertama Jurulatih selepas log masuk = Modul Kehadiran (PD-001)
- Senarai pelajar dalam mobile perlu ada carian nama yang pantas
- Fungsi jana PDF laporan kehadiran boleh ada di mobile tetapi tidak dioptimumkan (cukup berfungsi sahaja)
