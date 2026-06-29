# PD-007: Bolehkah Admin mengedit atau membatalkan resit yang telah dijana?

## Status
Diputuskan

## Soalan
Adakah Admin dibenarkan mengubah suai atau membatalkan resit PDF yang telah dijana dan mungkin sudah dikongsi kepada ibu bapa?

## Konteks
Kesilapan dalam rekod bayaran boleh berlaku (jumlah salah, nama salah, jenis bayaran salah). Resit adalah dokumen kewangan rasmi dengan nombor unik — perubahan atau pembatalan perlu dikendalikan dengan berhati-hati untuk mengekalkan integriti rekod audit LHDN.

## Pilihan
- **A** — Tidak boleh edit atau batal — resit adalah muktamad. Admin perlu jana resit pembetulan baharu jika ada kesilapan
- **B** — Boleh batal sahaja (tandakan sebagai "Dibatalkan") — nombor resit kekal dalam rekod tetapi tidak sah; perlu jana resit baharu
- **C** — Boleh edit dalam tempoh 24 jam selepas dijana; selepas itu menjadi muktamad

## Keputusan
**Pilihan B** — Admin boleh membatalkan resit sahaja. Aliran pembatalan:
1. Admin pilih resit → klik "Batal Resit"
2. Admin masukkan sebab pembatalan (wajib)
3. Status resit bertukar kepada **"Dibatalkan"** — nombor resit asal kekal dalam sistem sebagai rekod
4. Sistem paparkan cop/label "DIBATALKAN" pada resit PDF jika dicetak/dikongsi semula
5. Admin jana **resit baharu** dengan nombor resit baharu jika bayaran masih sah

## Sebab
Resit adalah dokumen kewangan rasmi. Memadamkan atau mengedit resit boleh menjejaskan integriti rekod LHDN. Pembatalan dengan rekod kekal memastikan setiap nombor resit boleh dikesan dan diaudit — nombor tidak boleh hilang dari sistem walaupun dibatalkan.

## Kesan
- Resit mempunyai status: `Aktif` atau `Dibatalkan`
- Rekod pembatalan simpan: sebab batal, siapa batal, bila batal (audit trail DR-029)
- Laporan kewangan perlu tapis dan tidak kira resit yang dibatalkan dalam jumlah pendapatan
- Nombor resit (CFK-YYYY-NNNNN) tidak boleh digunakan semula walaupun resit asal dibatalkan
- Admin sahaja boleh membatalkan resit (bukan Jurulatih)
