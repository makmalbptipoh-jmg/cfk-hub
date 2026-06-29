# PD-008: Bagaimana sistem mengendalikan pakej adik-beradik — satu resit atau berasingan?

## Status
Diputuskan

## Soalan
Apabila ibu bapa membayar yuran untuk lebih dari satu anak (pakej adik-beradik), adakah satu resit dikumpulkan atau resit berasingan untuk setiap pelajar?

## Konteks
Pakej adik-beradik melibatkan diskaun atau yuran khas. Cara pengendalian resit mempengaruhi kejelasan rekod bayaran dan pengalaman Admin semasa kemasukan data.

## Pilihan
- **A** — Satu resit untuk semua adik-beradik dalam satu transaksi (resit gabungan dengan nama semua pelajar)
- **B** — Resit berasingan untuk setiap pelajar (lebih mudah untuk rekod individu dan laporan per pelajar)
- **C** — Admin pilih sendiri — boleh sama ada gabungan atau berasingan

## Keputusan
**Pilihan B** — Resit berasingan untuk setiap pelajar. Setiap anak mendapat resit individu dengan nombor resit unik sendiri. Bagi pakej adik-beradik, jumlah yuran dibahagi dan direkod secara individu:

| Pakej | Jumlah | Per pelajar (resit individu) |
|---|---|---|
| 2 adik-beradik | RM 100/bulan | RM 50 setiap seorang |
| 3 adik-beradik | RM 150/bulan | RM 50 setiap seorang |

## Sebab
Resit berasingan memudahkan rekod per pelajar — setiap pelajar ada sejarah bayaran sendiri yang lengkap. Ini penting apabila pelajar kemudiannya bertukar ke yuran individu (cth: seorang adik-beradik berhenti) — rekod sedia ada kekal bersih tanpa perlu pisahkan resit gabungan.

## Kesan
- Apabila Admin rekod bayaran pakej adik-beradik, sistem jana resit berasingan secara automatik untuk setiap pelajar dalam kumpulan
- Admin perlu kaitkan adik-beradik dalam profil pelajar (medan "adik-beradik" dalam profil)
- Sistem perlu tahu hubungan adik-beradik untuk kira yuran pakej dengan betul
- Laporan pendapatan akan tunjuk jumlah resit yang lebih banyak tetapi jumlah wang yang tepat per pelajar
