# DR-018: Berapakah tempoh penyimpanan data dalam sistem?

## Status
Diputuskan

## Soalan
Berapa lama rekod dan data pelajar perlu disimpan dalam sistem CFK HUB?

## Konteks
Polisi penyimpanan data mempengaruhi kos storan dan keperluan pengurusan data dalam jangka panjang.

## Keputusan
Data disimpan selama **7 tahun**.

## Sebab
Keperluan penyimpanan rekod di bawah undang-undang cukai Malaysia (Akta Cukai Pendapatan 1967) memerlukan rekod kewangan disimpan selama minimum 7 tahun untuk tujuan audit LHDN. Memandangkan laporan Excel untuk LHDN adalah keperluan utama sistem (DR-012), tempoh 7 tahun memastikan pematuhan penuh.

## Kesan
- Rekod bayaran, resit, dan kehadiran disimpan selama 7 tahun sebelum boleh diarkib atau dipadam
- Dengan 100-200 pelajar, saiz data dalam 7 tahun masih sangat kecil — free tier cloud lebih dari mencukupi
- Tiada fungsi padam automatik diperlukan dalam jangka masa terdekat
- Admin boleh eksport rekod lama ke Excel sebelum diarkib jika diperlukan
