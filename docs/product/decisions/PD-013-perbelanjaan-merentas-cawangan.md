# PD-013: Bagaimana sistem mengendalikan perbelanjaan yang melibatkan lebih dari satu cawangan?

## Status
Diputuskan

## Soalan
Apabila CFK membuat perbelanjaan yang dikongsi antara beberapa cawangan (contoh: pembelian peralatan untuk semua cawangan), bagaimana rekod ini dimasukkan?

## Konteks
Sesetengah perbelanjaan CFK adalah untuk satu cawangan sahaja (sewa), manakala yang lain adalah untuk keseluruhan organisasi (gaji pentadbir, peralatan am). Cara pengelasan mempengaruhi laporan kewangan per cawangan.

## Pilihan
- **A** — Semua perbelanjaan dikaitkan dengan satu cawangan atau "Umum/Semua Cawangan" — Admin pilih sendiri
- **B** — Perbelanjaan boleh dibahagi antara cawangan (Admin masukkan peratusan per cawangan)
- **C** — Perbelanjaan hanya dikategorikan sebagai "Operasi CFK" tanpa perlu kaitkan dengan cawangan tertentu

## Keputusan
**Pilihan A** — Setiap rekod perbelanjaan dikaitkan dengan **satu entiti** sahaja. Admin pilih daripada senarai:
- Klebang
- Buntong
- Sri Iskandar
- SMK Star
- **Umum** (untuk perbelanjaan yang melibatkan semua cawangan atau tidak khusus mana-mana cawangan)

## Sebab
Pembahagian kos antara cawangan (Pilihan B) terlalu kompleks untuk organisasi kecil dan tidak memberi manfaat yang sepadan. Kategori "Umum" menampung semua perbelanjaan bersama tanpa memerlukan Admin membuat pengiraan peratusan. Laporan kewangan per cawangan masih boleh dijana dengan menapis mengikut cawangan.

## Kesan
- Borang tambah perbelanjaan perlu ada dropdown pilihan cawangan + "Umum"
- Laporan kewangan boleh tapis: semua cawangan / cawangan tertentu / Umum sahaja
- Laporan LHDN keseluruhan kira jumlah semua cawangan termasuk "Umum"
- Kategori "Umum" boleh digunakan untuk: pembelian peralatan untuk semua cawangan, yuran domain, kos teknikal sistem
