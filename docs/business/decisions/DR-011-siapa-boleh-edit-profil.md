# DR-011: Siapa yang boleh mengedit profil dalam sistem?

## Status
Diputuskan

## Soalan
Siapakah pengguna yang dibenarkan menambah, mengedit, atau memadam profil dalam sistem?

## Konteks
Kawalan pengeditan profil menentukan keselamatan data dan akauntabiliti perubahan rekod.

## Keputusan
Hanya **Admin** yang boleh menambah, mengedit, atau memadam profil dalam sistem.

## Sebab
Kawalan terpusat memastikan integriti data — hanya satu pihak bertanggungjawab atas ketepatan semua rekod. Memandangkan Admin juga yang menyelenggara sistem (DR-032), ini adalah pendekatan yang paling selamat dan teratur.

## Kesan
- Butang tambah, edit, dan padam profil hanya kelihatan dan boleh diakses oleh Admin
- Jurulatih hanya boleh melihat profil tetapi tidak boleh mengubahnya
- Jika Jurulatih perlu kemaskini maklumat pelajar, mereka perlu maklumkan Admin
