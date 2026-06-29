# DD-005: Bagaimana navigasi Jurulatih di mobile (PWA)?

## Status
Diputuskan

## Soalan
Apakah jenis navigasi yang digunakan untuk Jurulatih yang mengakses CFK HUB melalui telefon pintar?

## Keputusan
**Tab Bar Bawah (Bottom Navigation Bar)** — 4 tab tetap di bahagian bawah skrin.

### Spesifikasi Tab Bar

| Ciri | Nilai |
|---|---|
| Tinggi | 64px |
| Latar | Charcoal `#1E293B` |
| Ikon aktif | Lime `#84CC16` + label |
| Ikon tidak aktif | Cool Gray `#94A3B8` |
| Saiz ikon | 24px |
| Saiz label | 11px |

### Susunan Tab

```
┌─────────────────────────────────────┐
│                                     │
│         [Kandungan Halaman]         │
│                                     │
├──────────┬──────────┬──────┬────────┤
│ ✅       │ 👨‍🎓      │ 📢   │ 📊    │
│Kehadiran │ Pelajar  │Maklu │Dashbrd │
└──────────┴──────────┴──────┴────────┘
```

Tab pertama (Kehadiran) adalah halaman aktif secara lalai selepas log masuk (PD-001).

## Sebab
Tab Bar Bawah adalah standard industri untuk aplikasi mobile (WhatsApp, Instagram, Grab). Boleh dicapai dengan ibu jari tanpa perlu regangkan jari ke atas skrin. Jurulatih di lapangan menggunakan satu tangan — Tab Bar Bawah memudahkan navigasi pantas antara 4 fungsi utama. Hamburger menu memerlukan dua tindakan (buka menu → pilih item) berbanding satu tindakan dengan Tab Bar.

## Kesan
- Jurulatih tidak perlu hamburger menu atau sidebar
- Keseluruhan UI Jurulatih dioptimumkan untuk sentuhan (touch-friendly) — butang minimum 44×44px
- Safe area (notch/home indicator) perlu diambil kira pada iOS
- Kandungan halaman tidak bertindih dengan Tab Bar (padding-bottom: 64px)
