# PD-004: Bolehkah Jurulatih tandakan kehadiran untuk sesi yang lepas (retroaktif)?

## Status
Diputuskan

## Soalan
Adakah Jurulatih dibenarkan memasukkan rekod kehadiran untuk sesi yang telah berlalu, atau hanya untuk sesi semasa dan akan datang?

## Konteks
Kadangkala Jurulatih mungkin terlupa tandakan kehadiran semasa sesi atau tiada sambungan internet. Perlu tentukan sama ada sistem membenarkan kemasukan rekod lampau dan jika ya, berapa lama had masanya.

## Pilihan
- **A** — Tidak dibenarkan — kehadiran hanya boleh direkod pada hari sesi berlangsung
- **B** — Dibenarkan dalam tempoh 7 hari selepas sesi
- **C** — Dibenarkan tanpa had masa (Jurulatih boleh rekod bila-bila masa)

## Keputusan
**Pilihan C** — Retroaktif terhad dengan kawalan berbeza mengikut peranan:
- **Jurulatih** — boleh rekod atau edit kehadiran dalam tempoh **7 hari** dari tarikh sesi
- **Admin** — boleh rekod atau edit kehadiran untuk **mana-mana tarikh** tanpa had masa

## Sebab
Jurulatih di lapangan mungkin terlupa rekod pada hari sesi atau tiada internet. Tempoh 7 hari memberi masa yang munasabah untuk pembetulan tanpa membuka ruang manipulasi data lama. Admin dikekalkan sebagai pengawal akhir untuk kes khas seperti pemindahan data lama atau pembetulan rekod lebih awal.

## Kesan
- Sistem perlu semak tarikh sesi berbanding tarikh semasa sebelum membenarkan edit oleh Jurulatih
- UI Jurulatih perlu paparkan amaran jika cuba edit rekod lebih dari 7 hari
- Admin panel perlu ada akses penuh ke semua rekod kehadiran tanpa sekatan tarikh
- Rekod kehadiran yang diedit perlu simpan metadata: siapa edit, bila edit (selaras dengan audit trail DR-029)
