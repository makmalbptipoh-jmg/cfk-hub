# DR-019: Adakah sistem memerlukan integrasi dengan gateway pembayaran (FPX, online banking)?

## Status
Diputuskan

## Soalan
Adakah sistem CFK HUB perlu disambungkan terus dengan mana-mana gateway pembayaran untuk memproses transaksi dalam talian?

## Konteks
Integrasi gateway pembayaran (seperti FPX, Billplz, atau Stripe) membolehkan bayaran diproses secara automatik dalam sistem tetapi memerlukan masa pembangunan yang lebih lama dan kadangkala yuran perkhidmatan.

## Keputusan
**Tidak**. Sistem tidak memerlukan integrasi gateway pembayaran.

## Sebab
Bayaran diterima secara manual (tunai atau pindahan online di luar sistem). Admin hanya merekodkan bayaran yang telah diterima ke dalam sistem dan menjana resit.

## Kesan
- Tiada API payment gateway perlu diintegrasikan
- Pembangunan lebih cepat dan mudah
- Admin bertanggungjawab mengesahkan bayaran sebelum merekodnya dalam sistem
- Tiada yuran gateway atau kelulusan merchant diperlukan
