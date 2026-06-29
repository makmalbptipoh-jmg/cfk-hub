# DR-028: Siapakah pemilik data dalam sistem CFK HUB?

## Status
Diputuskan

## Soalan
Siapakah entiti yang memiliki dan bertanggungjawab ke atas data yang disimpan dalam sistem?

## Konteks
Pemilikan data menentukan siapa yang berhak mengakses, memindahkan, atau memadam data, terutama jika berlaku pertikaian atau pertukaran vendor.

## Keputusan
Data dimiliki oleh **Chess For Kids (CFK)** — yang merupakan sekaligus **pemilik data dan pembangun sistem**.

## Sebab
CFK membangunkan sistem ini untuk kegunaan dalaman mereka sendiri. Tiada pihak ketiga (vendor luar atau pembangun bebas) yang terlibat. Oleh itu, tiada isu pemisahan hak data antara pemilik dan pembangun.

## Kesan
- CFK mempunyai kawalan penuh ke atas semua data — kod sistem, pangkalan data, dan rekod operasi
- Tiada perjanjian pemilikan data dengan pihak luar diperlukan
- Admin CFK mempunyai akses penuh ke atas semua data dalam sistem
- Jika platform cloud ditukar pada masa hadapan, CFK boleh eksport semua data kerana mereka adalah pemilik akaun cloud
