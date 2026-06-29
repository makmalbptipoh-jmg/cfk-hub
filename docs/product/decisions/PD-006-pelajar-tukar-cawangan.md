# PD-006: Bagaimana sistem mengendalikan kehadiran merentas cawangan dan pertukaran cawangan daftar?

## Status
Diputuskan

## Soalan
Memandangkan pelajar CFK boleh hadir ke mana-mana cawangan tetapi didaftarkan di satu cawangan pilihan sahaja — bagaimana sistem merekod kehadiran merentas cawangan, dan bagaimana pertukaran cawangan daftar dikendalikan?

## Konteks
Peraturan perniagaan CFK: Pelajar didaftar di **satu cawangan pilihan** (untuk tujuan yuran dan admin), tetapi **boleh hadir ke mana-mana cawangan** pada mana-mana hari. Jurulatih di setiap cawangan boleh ambil kehadiran untuk mana-mana pelajar yang hadir, tidak kira cawangan daftar mereka. Ini berbeza dari model "pelajar terikat dengan satu cawangan sahaja".

## Pilihan
- **A** — Rekod kehadiran simpan cawangan dihadiri sahaja (ganti cawangan daftar dalam rekod)
- **B** — Rekod kehadiran simpan kedua-dua: cawangan daftar pelajar DAN cawangan yang dihadiri pada hari tersebut
- **C** — Rekod kehadiran hanya dikaitkan dengan cawangan daftar pelajar — cawangan dihadiri tidak direkod

## Keputusan
**Pilihan B** — Setiap rekod kehadiran menyimpan dua maklumat cawangan:
1. **Cawangan daftar pelajar** — cawangan pilihan pelajar semasa pendaftaran (untuk yuran & admin)
2. **Cawangan sesi** — cawangan mana pelajar hadir pada hari tersebut (untuk laporan operasi)

Untuk **pertukaran cawangan daftar**: Admin kemaskini cawangan dalam profil pelajar. Rekod lama kekal dikaitkan dengan cawangan daftar lama (rekod bersejarah kekal tepat).

## Sebab
Menyimpan cawangan sesi membolehkan laporan operasi yang tepat — contoh: "Berapa pelajar hadir di Klebang hari ini?" termasuk pelajar dari cawangan lain yang turut hadir. Cawangan daftar kekal untuk tujuan pengurusan yuran dan pelaporan admin. Ini menghormati fleksibiliti CFK di mana pelajar bebas hadir ke mana-mana cawangan.

## Kesan
- Jadual kehadiran dalam pangkalan data perlu ada medan: `pelajar_id`, `tarikh`, `status`, `cawangan_daftar`, `cawangan_sesi`, `jurulatih_id`
- UI Jurulatih perlu tunjuk senarai SEMUA pelajar aktif (bukan hanya dari cawangan sendiri) dengan penapis cawangan
- Laporan kehadiran boleh ditapis mengikut cawangan daftar ATAU cawangan sesi
- Admin kemaskini cawangan daftar dalam profil pelajar apabila pelajar minta tukar cawangan pilihan
