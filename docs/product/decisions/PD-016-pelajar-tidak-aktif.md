# PD-016: Apakah yang berlaku kepada rekod pelajar yang tamat program atau tidak aktif?

## Status
Diputuskan

## Soalan
Bagaimana sistem mengendalikan pelajar yang telah berhenti atau tamat program CFK — adakah rekod mereka dipadamkan, diarkibkan, atau hanya ditandakan tidak aktif?

## Konteks
Pelajar mungkin berhenti atas pelbagai sebab — tamat program, berpindah, atau sebab peribadi. Rekod mereka masih bernilai untuk sejarah kehadiran dan bayaran (terutama untuk tempoh simpan 7 tahun — DR-018). Cara pengendalian mempengaruhi ketulenan laporan semasa.

## Pilihan
- **A** — Tandakan sebagai "Tidak Aktif" — rekod kekal dalam sistem tetapi tidak muncul dalam senarai semasa dan laporan aktif
- **B** — Arkib — rekod dipindahkan ke bahagian arkib yang boleh dicari secara berasingan
- **C** — Padam — rekod dipadamkan sepenuhnya dari sistem (tidak disyorkan berdasarkan keperluan 7 tahun DR-018)

## Keputusan
**Pilihan A** — Tandakan sebagai "Tidak Aktif" dengan kemudahan pengaktifan semula.

Status pelajar dalam sistem:
- **Aktif** — pelajar sedang mengikuti program CFK; muncul dalam semua senarai dan laporan semasa
- **Tidak Aktif** — pelajar berhenti atau tamat; tidak muncul dalam senarai kehadiran dan laporan aktif; rekod kekal sepenuhnya dalam sistem

**Pengaktifan semula:** Admin boleh tukar status pelajar daripada "Tidak Aktif" kembali kepada "Aktif" bila-bila masa (contoh: pelajar yang berhenti kemudian mendaftar semula). Semua rekod lama (kehadiran, bayaran) kekal dan dikaitkan semula dengan profil yang sama.

## Sebab
Selaras dengan keperluan simpan data 7 tahun (DR-018). Pelajar mungkin berhenti sementara dan kembali kemudian — pengaktifan semula mengelakkan pendaftaran profil pendua dan mengekalkan sejarah rekod yang lengkap. Lebih mudah dari arkib berasingan.

## Kesan
- Profil pelajar ada medan status: `Aktif` / `Tidak Aktif`
- Senarai pelajar dalam modul kehadiran hanya tunjuk pelajar "Aktif" secara lalai
- Admin boleh tapis untuk lihat semua pelajar termasuk "Tidak Aktif"
- Admin boleh klik "Nyahaktifkan" atau "Aktifkan Semula" dari profil pelajar
- Tarikh dinyahaktifkan dan tarikh diaktifkan semula direkod dalam profil pelajar
- Pelajar "Tidak Aktif" tidak muncul dalam senarai "belum bayar" dan laporan operasi semasa
