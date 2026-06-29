# PD-019: Bagaimana sistem menyediakan mesej makluman WhatsApp untuk dihantar?

## Status
Diputuskan

## Soalan
Apakah cara sistem menyediakan dan memaparkan mesej makluman WhatsApp kepada Admin/Jurulatih untuk dihantar kepada ibu bapa?

## Konteks
DR-035 memutuskan bahawa sistem akan jana mesej siap hantar (Pilihan B — bukan API automatik). Perlu diputuskan bagaimana sistem menyediakan mesej ini kepada pengguna untuk dihantar melalui WhatsApp Business — sama ada melalui pautan terus, teks biasa untuk copy-paste, atau cara lain.

## Pilihan
- **A** — Teks biasa untuk disalin: Sistem paparkan mesej yang boleh disalin (copy) dan Admin/Jurulatih tampalkan (paste) dalam WhatsApp secara manual
- **B** — Pautan wa.me: Sistem jana pautan `wa.me/?text=...` dengan mesej sudah terformat; klik pautan buka WhatsApp terus dengan mesej sedia
- **C** — Gabungan A dan B: Sistem sediakan kedua-dua — pautan wa.me untuk hantar individu dan teks salin untuk hantar ke group WhatsApp

## Keputusan
**Pilihan C** — Gabungan dua cara penghantaran, mengikut keperluan:

| Cara | Kegunaan | Mekanisme |
|---|---|---|
| **Teks salin** | Hantar ke group WhatsApp (semua ibu bapa cawangan) | Sistem paparkan mesej berformat → butang "Salin" → Admin/Jurulatih tampal dalam group |
| **Pautan wa.me** | Hubungi ibu bapa individu (susulan bayaran, pertanyaan) | Butang "WhatsApp" → buka apl WhatsApp dengan nombor + mesej sudah sedia |

**Templat makluman yang disokong:**
1. Peringatan kelas (jadual minggu hadapan)
2. Pembatalan / penangguhan kelas
3. Makluman pertandingan (tarikh, venue, yuran)
4. Pengumuman am

Admin/Jurulatih boleh edit teks templat sebelum hantar.

## Sebab
Operasi CFK memerlukan dua cara berbeza — broadcast ke group untuk makluman umum, dan hubungi individu untuk susulan khusus. Teks salin sesuai untuk group kerana WhatsApp tidak benarkan hantar ke group melalui pautan `wa.me`. Pautan `wa.me` pula sangat mudah untuk hubungi ibu bapa individu terus dengan nombor yang sudah tersimpan dalam sistem.

## Kesan
- Modul Makluman perlu ada antara muka pilih jenis makluman + pilih penerima (semua / cawangan / individu)
- Butang "Salin Mesej" untuk group dan butang "Hantar WhatsApp" (pautan wa.me) untuk individu
- Templat mesej disimpan dalam sistem dan boleh diubahsuai oleh Admin
- Nombor telefon ibu bapa dari profil pelajar digunakan untuk jana pautan wa.me
- Rekod makluman dihantar disimpan: jenis, tarikh, siapa hantar (audit trail)
