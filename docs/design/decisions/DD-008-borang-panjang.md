# DD-008: Bagaimana borang panjang dipaparkan?

## Status
Diputuskan

## Soalan
Apakah pendekatan UI untuk borang yang mempunyai banyak medan (seperti pendaftaran pelajar, rekod bayaran personal)?

## Keputusan
**Langkah-Langkah (Step-by-Step Wizard / Stepper)** — borang panjang dibahagi kepada 2–4 langkah dengan progress indicator di atas.

### Contoh: Borang Tambah Pelajar Baharu (3 langkah)

```
[Langkah 1: Maklumat Pelajar] ──── [Langkah 2: Maklumat Ibu Bapa] ──── [Langkah 3: Semak & Sahkan]
        ●─────────────────────────────────○──────────────────────────────────○
```

**Langkah 1:** Nama penuh, tarikh lahir, jenis pelajar, cawangan daftar  
**Langkah 2:** Nama ibu bapa, nombor telefon, e-mel (opsional), adik-beradik  
**Langkah 3:** Semak semua maklumat → [Butang: Daftar Pelajar]

### Contoh: Rekod Bayaran Personal (2 langkah)

**Langkah 1:** Pilih pelajar, tarikh sesi, kaedah, lokasi  
**Langkah 2:** Jumlah, status bayaran, kaedah bayaran → Pratonton Resit → Sahkan

### Spesifikasi Stepper

| Ciri | Nilai |
|---|---|
| Progress bar | Garis mendatar dengan bulatan langkah |
| Langkah aktif | Bulatan Lime `#84CC16` |
| Langkah selesai | Tick Lime `#84CC16` |
| Langkah belum | Bulatan Gray `#E2E8F0` |
| Navigasi | [← Kembali] [Seterusnya →] / [Simpan] |

### Borang Pendek (1 langkah sahaja)
Borang dengan < 5 medan (cth: tambah perbelanjaan, lupus aset) gunakan **borang satu halaman biasa** — tidak perlu stepper.

## Sebab
Stepper mengurangkan rasa terbeban dengan memecahkan tugas kompleks kepada bahagian kecil yang boleh diuruskan. Pengguna dapat lihat kemajuan mereka dan tidak sesat dalam borang panjang. Sesuai untuk pengguna yang tidak fasih teknologi (beberapa Jurulatih mungkin kurang mahir digital).

## Kesan
- Borang yang perlu stepper: Tambah Pelajar, Rekod Bayaran Kumpulan (jika adik-beradik), Rekod Bayaran Personal
- Borang satu halaman: Tambah Perbelanjaan, Tambah Aset, Cipta Makluman, Reset Kata Laluan
- Butang "Kembali" membolehkan edit langkah sebelumnya tanpa hilang data
- Validasi dilakukan pada setiap langkah sebelum benarkan maju ke langkah seterusnya
