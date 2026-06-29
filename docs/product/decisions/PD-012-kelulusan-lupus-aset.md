# PD-012: Adakah diperlukan kelulusan khas untuk melupuskan aset bernilai tinggi?

## Status
Diputuskan

## Soalan
Adakah sistem perlu mengenakan had nilai aset yang memerlukan pengesahan tambahan sebelum ia boleh dilupuskan?

## Konteks
Aset CFK bernilai ~RM30,000 keseluruhannya. Pelupusan aset bernilai tinggi tanpa kawalan boleh menyebabkan kerugian yang tidak terkawal. Namun dengan hanya 1 Admin dalam sistem, kawalan dua peringkat mungkin tidak praktikal.

## Pilihan
- **A** — Tiada had — Admin boleh lupus mana-mana aset tanpa pengesahan tambahan
- **B** — Aset bernilai RM500 ke atas memerlukan Admin taip semula jumlah nilai sebagai pengesahan (double-confirm)
- **C** — Semua pelupusan aset memerlukan Admin muat naik dokumen kelulusan (gambar atau PDF)

## Keputusan
**Pilihan A** — Tiada had atau kelulusan tambahan. Admin boleh lupus mana-mana aset terus dalam sistem. Admin wajib isi medan **sebab pelupusan** (wajib, bukan opsional) sebelum rekod dikemas kini.

Maklumat yang direkod semasa lupus:
- Sebab pelupusan (wajib)
- Tarikh lupus (jana automatik)
- Siapa yang merekod lupus (Admin — audit trail DR-029)
- Status aset bertukar kepada "Dilupuskan" (kekal dalam sistem sebagai rekod bersejarah)

## Sebab
CFK hanya mempunyai 1 Admin. Memerlukan kelulusan formal bermakna Admin meluluskan keputusan Admin sendiri — tidak menambah nilai kawalan sebenar. Kewajipan mengisi sebab pelupusan dan audit trail (siapa, bila) sudah mencukupi untuk tujuan rekod dalaman dan pelaporan aset.

## Kesan
- Borang lupus aset memerlukan medan sebab (wajib diisi, tidak boleh kosong)
- Rekod aset tidak dipadam — status bertukar kepada "Dilupuskan" dengan tarikh dan sebab
- Laporan aset boleh tunjuk senarai aset aktif DAN aset dilupuskan secara berasingan
- Nilai aset dilupuskan perlu ditolak dari jumlah nilai aset aktif dalam laporan
