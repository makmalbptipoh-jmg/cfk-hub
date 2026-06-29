# DR-009: Apakah maklumat yang dipaparkan dalam Dashboard dan siapa yang boleh melihatnya?

## Status
Diputuskan

## Soalan
Apakah kandungan Dashboard dan siapakah yang dibenarkan melihat paparan tersebut?

## Konteks
Dashboard adalah paparan utama sistem. Skop kandungan dan hak akses perlu ditentukan supaya pembangunan UI tidak perlu diulang.

## Keputusan
Dashboard memaparkan **maklumat berbeza mengikut peranan** pengguna.

**Dashboard Admin** (maklumat penuh):
- Jumlah pelajar aktif
- Ringkasan kehadiran (minggu / bulan semasa)
- Ringkasan bayaran terkumpul bulan ini
- Senarai pelajar belum bayar
- Jumlah pelajar per cawangan

**Dashboard Jurulatih** (maklumat operasi sahaja):
- Jumlah pelajar aktif
- Ringkasan kehadiran (minggu / bulan semasa)
- Jumlah pelajar per cawangan

## Sebab
Data kewangan (jumlah kutipan, senarai belum bayar) adalah maklumat sensitif yang hanya perlu diketahui oleh Admin. Jurulatih hanya perlukan maklumat operasi untuk menjalankan tugas mereka.

## Kesan
- Dua versi Dashboard perlu dibangunkan (Admin dan Jurulatih)
- Logik paparan perlu menyemak peranan pengguna yang log masuk
- Data kewangan tidak kelihatan kepada akaun Jurulatih
