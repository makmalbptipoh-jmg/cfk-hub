# DR-035: Adakah sistem memerlukan fungsi makluman melalui WhatsApp?

## Status
Diputuskan

## Soalan
Adakah CFK HUB perlu menghantar makluman automatik kepada ibu bapa dan pelajar melalui WhatsApp untuk pemberitahuan kelas, pembatalan, pertandingan, dan pengumuman lain?

## Konteks
Ibu bapa dan pelajar perlu dimaklumkan tentang perkembangan CFK — jadual kelas, pembatalan, pertandingan, dan pengumuman am. Pada masa ini, komunikasi dilakukan secara manual (call/text peribadi). Fungsi makluman dalam sistem akan mengurangkan beban Jurulatih dan Admin, serta memastikan maklumat sampai tepat pada masa.

## Pilihan
- **A** — Tiada makluman automatik — Admin/Jurulatih hantar secara manual seperti biasa
- **B** — Makluman melalui WhatsApp sahaja — sistem jana mesej, Admin/Jurulatih hantar melalui WhatsApp Business
- **C** — Makluman automatik melalui WhatsApp API — sistem hantar terus tanpa campur tangan manual

## Keputusan
**Pilihan B** — Makluman melalui WhatsApp: sistem jana kandungan mesej berformat, Admin/Jurulatih hantar melalui WhatsApp Business.

Jenis makluman yang disokong:
1. **Peringatan kelas** — jadual kelas minggu hadapan
2. **Pembatalan kelas** — pemberitahuan kelas dibatalkan/ditangguh
3. **Pertandingan** — maklumat pertandingan catur (tarikh, venue, yuran)
4. **Pengumuman am** — pemberitahuan lain (cuti, acara khas)

## Sebab
Pilihan B sesuai dengan bajet yang sangat terhad (RM50-200/tahun). WhatsApp API (Pilihan C) memerlukan kos bulanan dan setup teknikal yang kompleks. Pilihan B membenarkan sistem menyediakan mesej yang diformat dan siap hantar — Admin/Jurulatih tinggal copy-paste atau forward melalui WhatsApp Business yang sedia ada.

## Kesan
- Perlu tambah PD-019 untuk keputusan teknikal makluman WhatsApp
- Sistem perlu ada Modul Makluman dengan templat mesej yang boleh diubahsuai
- Admin pilih jenis makluman, pilih penerima (semua / satu cawangan / individu), sistem jana teks siap hantar
- Rekod makluman dihantar disimpan dalam sistem (siapa hantar, bila, kepada siapa)
- Bergantung kepada nombor telefon ibu bapa yang tersimpan dalam profil pelajar
