# DR-017: Di manakah data sistem CFK HUB disimpan?

## Status
Diputuskan

## Soalan
Adakah data sistem disimpan di cloud atau di server dalaman (on-premise)?

## Konteks
Lokasi penyimpanan data mempengaruhi kos, keselamatan, kemudahan akses, dan kerumitan penyelenggaraan.

## Keputusan
Data disimpan di **cloud**.

## Sebab
Cloud menawarkan akses dari mana-mana peranti (web dan Android), tiada perlu server fizikal, dan backup automatik. Sesuai untuk sistem berskala sederhana tanpa keperluan PDPA ketat.

## Kesan
- Perlu memilih penyedia cloud: Firebase (Google) atau Supabase dicadangkan
- Tiada keperluan memiliki atau menyelenggara server fizikal
- Akses dari web browser dan Android app menggunakan API yang sama
- Kos bergantung kepada pelan cloud yang dipilih (free tier mencukupi untuk 50-100 pelajar)
