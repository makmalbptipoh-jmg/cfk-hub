# DR-033: Adakah sistem memerlukan modul rekod kewangan (duit keluar masuk)?

## Status
Diputuskan

## Soalan
Adakah CFK HUB perlu menyediakan fungsi untuk merekod dan menjejak semua aliran kewangan organisasi — bukan sahaja yuran pelajar, tetapi juga perbelanjaan dan pendapatan lain?

## Konteks
Modul resit (DR-007, DR-008) hanya merekod kutipan yuran daripada ibu bapa. Namun CFK juga mempunyai perbelanjaan operasi (sewa tempat, peralatan, gaji jurulatih, dll.) dan mungkin pendapatan lain. Rekod kewangan lengkap diperlukan untuk pengurusan organisasi dan pelaporan LHDN.

## Keputusan
**Ya** — sistem perlu menyediakan modul rekod kewangan untuk menjejak:

**Duit Masuk (Pendapatan):**
- Yuran pelajar (sudah diliputi oleh modul resit — perlu dikaitkan)
- Pendapatan lain (sumbangan, yuran pertandingan, dll.)

**Duit Keluar (Perbelanjaan):**
- Sewa tempat / cawangan
- Pembelian peralatan (set catur, papan, dll.)
- Gaji / elaun jurulatih
- Perbelanjaan lain-lain

## Sebab
Rekod aliran kewangan lengkap diperlukan untuk:
1. Pengurusan kewangan organisasi yang teratur
2. Pelaporan kepada LHDN (DR-012) — pendapatan DAN perbelanjaan perlu direkod
3. Pemantauan kesihatan kewangan CFK secara keseluruhan

## Kesan
- Modul baharu "Kewangan" perlu dibangunkan berasingan dari modul Resit
- Rekod kewangan perlu ada: tarikh, kategori (masuk/keluar), jenis, jumlah, keterangan, lampiran (resit/invois)
- Laporan aliran tunai (cash flow) bulanan perlu disokong
- Export Excel untuk laporan kewangan LHDN perlu merangkumi data dari modul ini
- Hanya Admin yang boleh akses modul Kewangan
- Menambah skop pembangunan dengan ketara — perlu diambil kira dalam jadual pelancaran (DR-030)
