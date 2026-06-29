# DD-009: Adakah sistem menggunakan mod gelap (dark mode)?

## Status
Diputuskan

## Soalan
Adakah CFK HUB perlu menyokong tema gelap (dark mode) selain tema cerah (light mode)?

## Keputusan
**Tidak** — CFK HUB hanya menggunakan **tema cerah (light mode)** sahaja.

## Sebab
Dark mode menambah kerumitan pembangunan yang ketara (setiap warna perlu variasi gelap). CFK HUB adalah sistem dalaman yang digunakan terutamanya pada waktu siang di pejabat (Admin) dan pada waktu malam semasa kelas (Jurulatih). Palet Charcoal + Lime + Soft Gray sudah menyediakan kontras yang baik dalam tema cerah. Membangun dark mode tanpa mengurangkan kualiti tema utama tidak praktikal dalam tempoh pembangunan yang singkat (Jun–Julai 2026).

## Kesan
- Hanya satu set warna yang perlu dibangun dan diuji
- Sistem mengabaikan tetapan `prefers-color-scheme: dark` peranti pengguna
- Boleh ditambah sebagai ciri masa hadapan (post-Fasa 3) jika ada permintaan
