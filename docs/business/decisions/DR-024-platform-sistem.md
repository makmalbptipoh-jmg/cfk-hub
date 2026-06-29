# DR-024: Apakah platform yang perlu disokong oleh sistem CFK HUB?

## Status
Diputuskan

## Soalan
Adakah sistem perlu dibangunkan untuk web sahaja, atau perlu juga ada aplikasi Android?

## Konteks
Menyokong pelbagai platform meningkatkan kebolehaksesan tetapi menambah masa dan kos pembangunan. Pilihan platform mempengaruhi pemilihan teknologi.

## Keputusan
Sistem dibangunkan sebagai **web app responsif dengan sokongan Progressive Web App (PWA)**.

- Admin mengakses melalui browser di komputer
- Jurulatih mengakses melalui browser di telefon, dan boleh "pasang" sistem di skrin utama telefon seperti app native

## Sebab
PWA memberikan pengalaman hampir seperti app Android native untuk Jurulatih di lapangan tanpa perlu membangunkan dua codebase berasingan. Ini menjimatkan masa pembangunan yang kritikal, mengelakkan keperluan kelulusan Google Play Store, dan membolehkan kemas kini dibuat sekali sahaja untuk semua pengguna.

## Kesan
- Satu codebase sahaja untuk web dan mobile
- UI perlu responsif sepenuhnya untuk skrin kecil (mobile) dan besar (desktop)
- PWA perlu dikonfigurasi: manifest.json, service worker, ikon app
- Jurulatih boleh pasang sistem di skrin utama telefon Android melalui browser Chrome
- Tiada kelulusan Google Play Store diperlukan
- Fungsi utama di mobile: rekod kehadiran dan lihat profil pelajar
