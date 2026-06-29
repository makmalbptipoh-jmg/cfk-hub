# DR-010: Profil siapa yang perlu diuruskan dalam sistem?

## Status
Diputuskan

## Soalan
Apakah entiti yang memerlukan profil atau rekod dalam sistem CFK HUB?

## Konteks
Mengenal pasti entiti yang memerlukan profil membantu menentukan struktur pangkalan data dan modul yang perlu dibangunkan.

## Keputusan
Sistem perlu mengurus profil untuk **semua** entiti berikut:
1. **Pelajar** — nama, maklumat hubungan ibu bapa, cawangan, tarikh daftar, status
2. **Jurulatih** — nama, nombor telefon, cawangan, status
3. **Admin** — akaun pengguna sistem
4. **Cawangan** — nama, lokasi, jurulatih bertanggungjawab

## Sebab
Semua entiti ini saling berkaitan dalam operasi harian CFK dan perlu direkod secara digital.

## Kesan
- Sistem memerlukan 4 modul profil yang berbeza
- Rekod kehadiran dan bayaran dikaitkan dengan profil pelajar
- Jurulatih dikaitkan dengan cawangan
