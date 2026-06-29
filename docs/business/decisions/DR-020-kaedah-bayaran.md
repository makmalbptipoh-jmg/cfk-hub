# DR-020: Apakah kaedah pembayaran yang diterima dan perlu direkodkan dalam sistem?

## Status
Diputuskan

## Soalan
Apakah kaedah pembayaran yang diterima daripada ibu bapa dan perlu disokong dalam rekod sistem?

## Konteks
Walaupun tiada gateway pembayaran (DR-019), sistem masih perlu merekodkan kaedah bayaran yang digunakan untuk tujuan resit dan laporan.

## Keputusan
Sistem menyokong rekod untuk dua kaedah bayaran:
1. **Tunai** — bayaran secara fizikal
2. **Online** — pindahan bank atau e-wallet (diproses di luar sistem)

## Sebab
Ibu bapa membayar menggunakan kedua-dua kaedah. Resit perlu mencatit kaedah bayaran untuk kejelasan.

## Kesan
- Borang rekod bayaran perlu ada medan "Kaedah Bayaran": Tunai / Online
- Medan ini akan tertera dalam resit digital
- Laporan boleh ditapis mengikut kaedah bayaran
