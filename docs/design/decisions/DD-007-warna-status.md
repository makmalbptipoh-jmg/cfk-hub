# DD-007: Apakah warna kod untuk status kehadiran dan status resit?

## Status
Diputuskan

## Soalan
Apakah warna yang digunakan untuk mewakili status berbeza dalam sistem, selaras dengan palet Charcoal + Lime + Soft Gray?

## Keputusan
Sistem warna status yang selaras dengan tema utama:

### Status Kehadiran

| Status | Warna | Hex | Badge |
|---|---|---|---|
| **Hadir** | Lime (warna tema) | `#84CC16` | 🟢 Hadir |
| **Tidak Hadir** | Coral Red | `#F87171` | 🔴 Tidak Hadir |
| **Cuti** | Amber | `#FBBF24` | 🟡 Cuti |

### Status Resit

| Status | Warna | Hex | Badge |
|---|---|---|---|
| **Aktif** | Lime | `#84CC16` | 🟢 Aktif |
| **Dibatalkan** | Slate Gray | `#94A3B8` | ⚫ Dibatalkan |

### Status Pelajar

| Status | Warna | Hex | Badge |
|---|---|---|---|
| **Aktif** | Lime | `#84CC16` | 🟢 Aktif |
| **Tidak Aktif** | Slate Gray | `#94A3B8` | ⚫ Tidak Aktif |

### Status Bayaran

| Status | Warna | Hex | Badge |
|---|---|---|---|
| **Sudah Bayar** | Lime | `#84CC16` | 🟢 Bayar |
| **Belum Bayar** | Coral Red | `#F87171` | 🔴 Belum Bayar |
| **Kredit** | Sky Blue | `#38BDF8` | 🔵 Kredit |

### Amaran Dashboard

| Jenis | Warna | Hex |
|---|---|---|
| Maklumat | Sky Blue | `#0EA5E9` |
| Berjaya | Lime | `#84CC16` |
| Amaran | Amber | `#F59E0B` |
| Ralat / Kritikal | Coral Red | `#EF4444` |

## Sebab
Lime digunakan untuk semua status positif/berjaya kerana ia adalah warna aksen utama tema — konsisten dan mudah dikenali. Merah coral dipilih berbanding merah terang kerana lebih selesa pada mata dan tidak terlalu keras berbanding latar Charcoal/Gray. Amber untuk status neutral/peringatan. Semua warna mempunyai kontras yang mencukupi untuk keterbacaan (WCAG AA compliant).

## Kesan
- Badge status menggunakan pill/tag dengan warna latar cair (10% opacity) dan teks gelap
- Contoh: Badge Hadir = latar `#F0FDF4`, teks `#166534`, dot `#84CC16`
- Warna status tidak digunakan untuk hiasan — hanya untuk makna
