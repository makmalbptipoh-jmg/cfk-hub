# DR-013: Berapakah bilangan peranan (roles) yang berbeza dalam sistem?

## Status
Diputuskan

## Soalan
Adakah sistem memerlukan sistem peranan (role-based access control) yang formal?

## Konteks
Peranan menentukan tahap kerumitan sistem kebenaran. Lebih banyak peranan bermakna lebih banyak logik kawalan akses yang perlu dibangunkan.

## Keputusan
Sistem menggunakan **flag `isAdmin` dalam akaun pengguna** sebagai mekanisme kawalan akses. Semua akaun mempunyai field `isAdmin: true/false` yang menentukan akses kepada fungsi-fungsi terhad.

## Sebab
Dengan hanya 2 peranan dan beberapa perbezaan akses (resit, dashboard kewangan, edit profil), RBAC penuh adalah over-engineering. Flag mudah dalam akaun adalah cukup, berstruktur, dan boleh dikembangkan jika perlu tambah peranan baru pada masa hadapan.

## Kesan
- Setiap akaun pengguna mempunyai field `isAdmin: true/false`
- Fungsi terhad yang menyemak flag ini: Jana Resit, Dashboard kewangan, Edit/Tambah/Padam profil
- Jurulatih (`isAdmin: false`) hanya boleh: rekod kehadiran, lihat profil, lihat Dashboard operasi
- Sistem boleh dikembangkan dengan menambah peranan baru tanpa ubah struktur asas
