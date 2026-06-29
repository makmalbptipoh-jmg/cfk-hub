# PD-015: Apakah fungsi yang dioptimumkan untuk kegunaan Admin di komputer (desktop)?

## Status
Diputuskan

## Soalan
Adakah terdapat fungsi Admin yang perlu dihadkan atau dioptimumkan khusus untuk skrin komputer (desktop), berbanding telefon?

## Konteks
Admin bekerja di pejabat menggunakan komputer. Fungsi seperti jana laporan Excel, urus aset, dan rekod kewangan adalah lebih sesuai pada skrin besar dengan papan kekunci. Perlu tentukan sama ada Admin juga boleh akses semua fungsi dari telefon atau ada fungsi yang desktop-only.

## Pilihan
- **A** — Semua fungsi Admin tersedia di kedua-dua mobile dan desktop (sistem responsif sepenuhnya)
- **B** — Fungsi kompleks (laporan, aset, kewangan) dioptimumkan untuk desktop; Admin digalakkan guna komputer untuk fungsi ini
- **C** — Fungsi laporan dan eksport Excel hanya tersedia di desktop; fungsi lain boleh diakses dari mana-mana

## Keputusan
**Pilihan B** — Semua fungsi Admin dioptimumkan untuk desktop, dengan pengutamaan berbeza mengikut skrin:

| Fungsi Admin | Desktop | Mobile |
|---|---|---|
| Dashboard Admin (gambaran keseluruhan) | ✅ Penuh | ✅ Ringkas |
| Pengurusan pelajar (daftar, edit profil) | ✅ Dioptimumkan | ⚠️ Berfungsi, kurang selesa |
| Rekod bayaran & jana resit | ✅ Dioptimumkan | ⚠️ Berfungsi, kurang selesa |
| Laporan LHDN (Excel/PDF) | ✅ Dioptimumkan | ⚠️ Jana boleh, muat turun bergantung peranti |
| Rekod perbelanjaan | ✅ Dioptimumkan | ⚠️ Berfungsi |
| Pengurusan aset | ✅ Dioptimumkan | ⚠️ Berfungsi |
| Pengurusan pengguna (tambah Jurulatih) | ✅ Dioptimumkan | ⚠️ Berfungsi |
| Makluman WhatsApp | ✅ Penuh | ✅ Penuh |

## Sebab
Admin mengendalikan fungsi kompleks seperti laporan LHDN, rekod aset, dan jana resit yang memerlukan skrin lebar untuk paparan data yang lengkap. Mengoptimumkan semua fungsi Admin untuk desktop memastikan produktiviti maksimum. Fungsi tetap boleh diakses dari mobile jika perlu (kecemasan) tetapi tidak direka bentuk untuk kegunaan mobile-first.

## Kesan
- Layout desktop Admin boleh guna sidebar navigasi, jadual data lebar, panel berbilang lajur
- Layout mobile Admin lebih ringkas — papar maklumat penting sahaja, butang tambah/edit lebih besar
- Eksport Excel dan PDF muat turun perlu berfungsi di desktop (Chrome/Edge); mobile bergantung kepada peranti
- Sistem tetap responsif (PWA) — tiada fungsi yang dikunci desktop-only sepenuhnya
