# PD-021: Bagaimana pelajar baharu didaftarkan ke dalam sistem?

## Status
Diputuskan

## Soalan
Apakah sumber pendaftaran pelajar baharu — Google Forms sahaja, manual dalam sistem, atau kedua-dua?

## Konteks
CFK menggunakan Google Forms untuk pendaftaran pelajar baharu (DR-026). Ibu bapa isi borang online dan data diimport ke CFK HUB secara automatik melalui Google Apps Script. Perlu diputuskan sama ada pendaftaran manual dalam sistem masih diperlukan sebagai pilihan alternatif.

## Pilihan
- **A** — Google Forms sahaja — tiada borang pendaftaran manual dalam CFK HUB
- **B** — Google Forms sebagai sumber utama + Admin boleh daftar pelajar secara manual dalam sistem (kes kecemasan)
- **C** — Manual dalam sistem sahaja — Admin masukkan terus; Google Forms untuk maklumat awam sahaja

## Keputusan
**Pilihan B** — Google Forms sebagai lalai, dengan pendaftaran manual sebagai pilihan kecemasan.

**Aliran utama (Google Forms → CFK HUB):**
1. Ibu bapa isi Google Forms pendaftaran
2. Google Apps Script tarik data ke CFK HUB secara automatik
3. Rekod pelajar baharu dicipta dalam sistem dengan status "Aktif"
4. Admin semak dan sahkan rekod import jika perlu

**Aliran kecemasan (pendaftaran manual oleh Admin):**
1. Admin buka modul Pelajar → "Tambah Pelajar Baharu"
2. Admin isi borang yang sama (medan PD-003)
3. Rekod dicipta terus dalam sistem; tiada import Google Forms diperlukan

## Sebab
Google Forms adalah sumber utama yang efisien dan mengurangkan kerja data entry Admin. Namun pendaftaran manual diperlukan untuk kes kecemasan — pelajar hadir ke kelas tanpa isi Google Forms dahulu, atau masalah teknikal pada sistem import. Mengelakkan situasi pelajar tidak dapat didaftarkan hanya kerana satu saluran tidak berfungsi.

## Kesan
- Borang pendaftaran manual dalam sistem perlu ada dengan medan yang sama seperti Google Forms (PD-003)
- Rekod yang diimport dari Google Forms perlu ada label/penanda "Sumber: Google Forms" untuk audit
- Rekod yang didaftar manual perlu ada label "Sumber: Manual - [nama Admin]"
- Sistem perlu semak pendua sebelum import (cth: nama + nombor telefon yang sama) untuk elak rekod berganda
- Admin perlu boleh semak dan kemaskini rekod yang diimport dari Google Forms jika ada maklumat kurang tepat
