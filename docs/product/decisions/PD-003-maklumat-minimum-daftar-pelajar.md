# PD-003: Apakah maklumat minimum yang diperlukan untuk mendaftar pelajar baharu?

## Status
Diputuskan

## Soalan
Apakah medan borang yang wajib diisi semasa mendaftar pelajar baharu dalam sistem?

## Konteks
Terlalu banyak medan wajib menyukarkan proses pendaftaran. Terlalu sedikit menghasilkan data yang tidak lengkap. Perlu keseimbangan antara data yang diperlukan untuk operasi dan kemudahan kemasukan data.

## Pilihan
- **A** — Minimum teras: Nama pelajar, Nama ibu bapa, Nombor telefon ibu bapa, Cawangan
- **B** — Standard: Nama pelajar, Tarikh lahir, Nama ibu bapa, Nombor telefon, E-mel, Cawangan, Tarikh daftar, Jenis yuran
- **C** — Lengkap: Semua medan termasuk alamat rumah, nama sekolah, maklumat kecemasan

## Keputusan
**Pilihan B** — Profil pelajar standard dengan 8 medan:

| Medan | Wajib? | Catatan |
|---|---|---|
| Nama penuh pelajar | Ya | |
| Tarikh lahir | Ya | Untuk kategori umur pertandingan |
| Nama ibu bapa / penjaga | Ya | |
| Nombor telefon ibu bapa | Ya | Untuk makluman WhatsApp |
| E-mel ibu bapa | Tidak | Opsional |
| Cawangan | Ya | Klebang / Buntong / Sri Iskandar / SMK Star |
| Tarikh daftar | Ya | Jana automatik oleh sistem |
| Jenis yuran bulanan | Ya | RM70 (1 pelajar) / RM100 (2 adik-beradik) / RM150 (3 adik-beradik) |
| Yuran pendaftaran | Ya | RM140 (1 pelajar) / RM170 (2 adik-beradik) / RM220 (3 adik-beradik) — sekali sahaja |

## Sebab
Pilihan B menyediakan data yang mencukupi untuk semua operasi utama — kehadiran, resit, laporan ibu bapa, makluman WhatsApp, dan rekod pertandingan mengikut kategori umur. E-mel dibuat opsional kerana tidak semua ibu bapa pelajar mempunyai e-mel aktif. Medan ini juga selaras dengan data yang dikumpul melalui Google Forms (DR-026).

## Kesan
- Borang pendaftaran pelajar perlu ada 8 medan dengan 6 medan wajib
- Google Forms import perlu peta medan yang sama (nama, tarikh lahir, nama ibu bapa, telefon, cawangan, jenis yuran)
- Sistem jana tarikh daftar secara automatik — tidak perlu diisi manual
- E-mel tersimpan jika ada, tetapi makluman utama melalui WhatsApp (nombor telefon)
