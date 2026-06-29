# DD-006: Bagaimana senarai pelajar dan data dipaparkan?

## Status
Diputuskan

## Soalan
Apakah format paparan untuk senarai pelajar, rekod kehadiran, dan data lain dalam sistem?

## Keputusan
**Gabungan Kad (Cards) + Jadual (Table)** — bergantung kepada konteks dan peranti.

### Panduan Penggunaan

| Konteks | Format | Sebab |
|---|---|---|
| Senarai pelajar (desktop) | Jadual | Lihat banyak pelajar sekaligus, boleh sort/filter |
| Senarai pelajar (mobile) | Kad | Lebih mudah dibaca pada skrin kecil |
| Rekod kehadiran (semasa ambil) | Senarai vertikal + toggle | Cepat, satu tap per pelajar |
| Dashboard widgets | Kad statistik | Menonjolkan angka penting |
| Resit / laporan | Kad dokumen | Kelihatan seperti dokumen rasmi |
| Perbelanjaan / aset | Jadual | Data berulang dengan lajur konsisten |

### Spesifikasi Kad

```
┌─────────────────────────────────┐
│ Nama Pelajar          Cawangan  │
│ Ahmad bin Ali         Klebang   │
│ 012-345 6789      Aktif 🟢      │
└─────────────────────────────────┘
```
- Bucu bulat: `border-radius: 12px`
- Bayangan: `box-shadow: 0 1px 3px rgba(0,0,0,0.1)`
- Latar: `#FFFFFF`
- Sempadan: `1px solid #E2E8F0`

### Spesifikasi Jadual (Desktop)

- Header: Latar `#F8FAFC`, teks `#64748B`, huruf besar kecil
- Baris berselang-seli: putih / `#F8FAFC`
- Hover baris: `#F1F5F9`
- Sticky header apabila scroll

## Sebab
Gabungan kad dan jadual memaksimumkan kebolehgunaan merentas peranti. Jadual lebih efisien untuk data banyak di desktop manakala kad lebih mudah disentuh di mobile. Dashboard memerlukan kad statistik untuk menonjolkan angka utama.

## Kesan
- Breakpoint responsif: < 768px → tukar jadual ke kad
- Jadual perlu ada penapisan dan pengisihan mengikut lajur
- Kad mobile perlu ada swipe gesture untuk tindakan cepat (opsional, Fasa 2)
