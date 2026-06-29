# PD-001: Apakah halaman pertama yang dilihat pengguna selepas log masuk?

## Status
Diputuskan

## Soalan
Apakah skrin atau halaman yang dipaparkan kepada pengguna serta-merta selepas berjaya log masuk ke CFK HUB?

## Konteks
Halaman pertama selepas log masuk menentukan aliran kerja utama pengguna. Admin dan Jurulatih mempunyai keperluan berbeza — Admin perlu gambaran keseluruhan operasi manakala Jurulatih perlu akses pantas kepada fungsi kehadiran.

## Pilihan
- **A** — Dashboard (sama untuk semua pengguna, kandungan berbeza mengikut peranan)
- **B** — Halaman berbeza: Admin → Dashboard, Jurulatih → Modul Kehadiran terus
- **C** — Halaman selamat datang ringkas dengan pautan pantas ke fungsi utama

## Keputusan
Halaman pertama berbeza mengikut peranan:
- **Admin** → dibawa terus ke **Dashboard Admin** (gambaran keseluruhan operasi dan kewangan)
- **Jurulatih** → dibawa terus ke **Modul Kehadiran** (sedia untuk ambil kehadiran)

## Sebab
Setiap pengguna mempunyai keutamaan fungsi yang berbeza. Jurulatih menggunakan sistem terutamanya untuk rekod kehadiran semasa di lapangan — membawa mereka terus ke modul tersebut mengurangkan geseran dan menjimatkan masa. Admin pula perlu gambaran keseluruhan operasi sebagai titik mula.

## Kesan
- Sistem perlu detect peranan pengguna (`isAdmin`) selepas log masuk dan route ke halaman yang berbeza
- Dashboard Admin dikekalkan sebagai halaman utama Admin
- Halaman utama Jurulatih adalah Modul Kehadiran dengan pilihan navigasi ke modul lain
- UI navigasi perlu membolehkan Jurulatih pergi ke Dashboard atau modul lain bila-bila masa
