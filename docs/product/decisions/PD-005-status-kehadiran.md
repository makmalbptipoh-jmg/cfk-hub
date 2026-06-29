# PD-005: Apakah status kehadiran yang disokong oleh sistem?

## Status
Diputuskan

## Soalan
Berapakah bilangan status kehadiran yang boleh dipilih oleh Jurulatih semasa menandakan kehadiran pelajar?

## Konteks
Status kehadiran menentukan butiran rekod yang tersimpan. Status yang lebih banyak memberikan data yang lebih kaya tetapi menambah kerumitan UI dan kemasukan data di lapangan.

## Pilihan
- **A** — Dua status sahaja: Hadir / Tidak Hadir
- **B** — Tiga status: Hadir / Tidak Hadir / MC (Sakit dengan surat)
- **C** — Empat status: Hadir / Tidak Hadir / MC / Cuti (Dimaklumkan)

## Keputusan
**Pilihan B** — Tiga status kehadiran:
- **Hadir** — Pelajar hadir ke sesi
- **Tidak Hadir** — Pelajar tidak hadir tanpa makluman
- **Cuti** — Pelajar tidak hadir dengan sebab (sakit, urusan keluarga, dll.)

Jurulatih boleh tambah nota ringkas apabila memilih status "Cuti" (opsional).

## Sebab
Status "Cuti" membezakan ketidakhadiran yang dimaklumkan daripada yang tidak dimaklumkan. Ini menjadikan laporan kehadiran kepada ibu bapa lebih tepat dan bermakna — ibu bapa tahu sama ada anak mereka ponteng tanpa sebab atau absen dengan sebab yang sah. Tidak terlalu kompleks untuk Jurulatih di lapangan.

## Kesan
- UI kehadiran Jurulatih perlu paparkan 3 pilihan: Hadir / Tidak Hadir / Cuti
- Medan nota opsional muncul apabila "Cuti" dipilih
- Laporan kehadiran ibu bapa perlu paparkan ketiga-tiga status dengan jelas
- Statistik kehadiran dalam laporan perlu kira peratusan kehadiran (Hadir / jumlah sesi)
