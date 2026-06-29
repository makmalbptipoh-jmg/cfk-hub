# DR-021: Adakah nombor resit dijana secara automatik oleh sistem?

## Status
Diputuskan

## Soalan
Adakah sistem perlu menjana nombor resit secara automatik atau Admin yang menaip sendiri?

## Konteks
Nombor resit automatik memastikan tiada pendua dan memudahkan rujukan rekod. Nombor manual berisiko ralat manusia dan pendua.

## Keputusan
**Ya**, nombor resit dijana secara **automatik** oleh sistem.

Format yang dicadangkan: `CFK-YYYY-NNNNN`
Contoh: `CFK-2026-00001`, `CFK-2026-00002`

## Sebab
Nombor automatik mengelakkan pendua, memastikan urutan yang konsisten, dan mengurangkan beban kerja Admin.

## Kesan
- Sistem perlu menyimpan pembilang resit dan menambahnya setiap kali resit baru dijana
- Nombor resit tidak boleh diubah setelah dijana
- Format nombor perlu konsisten dan termasuk tahun untuk memudahkan rujukan
