# DR-029: Adakah sistem memerlukan audit trail (log aktiviti pengguna)?

## Status
Diputuskan

## Soalan
Adakah sistem perlu merekodkan log siapa melakukan tindakan apa dan pada masa bila dalam sistem?

## Konteks
Audit trail penting untuk akauntabiliti, penyiasatan isu, dan keselamatan. Namun ia menambah kerumitan dan penggunaan storan.

## Keputusan
**Audit trail minima** — hanya transaksi kewangan (rekod bayaran dan penjanaan resit) dilog secara automatik.

Maklumat yang dilog untuk setiap transaksi kewangan:
- Tarikh dan masa resit dijana
- Admin yang menjana resit
- Nombor resit, nama pelajar, jumlah bayaran, dan jenis bayaran

## Sebab
Resit digunakan untuk tujuan pelaporan LHDN (DR-012) dan hanya Admin yang boleh jana resit (DR-015). Log transaksi kewangan memastikan akauntabiliti penuh untuk setiap resit yang dikeluarkan dan melindungi CFK jika ada pertikaian dengan ibu bapa tentang rekod bayaran.

## Kesan
- Setiap penjanaan resit merekodkan metadata: siapa, bila, dan butiran transaksi
- Tindakan bukan kewangan (edit profil, kemaskini kehadiran) tidak dilog
- Log transaksi boleh dieksport sebagai sebahagian daripada laporan LHDN (DR-012)
- Storan log adalah minimal — hanya rekod kewangan sahaja
