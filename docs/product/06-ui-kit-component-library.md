# UI Kit / Component Library — CFK HUB

**Disediakan:** 24 Oktober 2026 · **Dijejak secara jujur:** hanya komponen yang betul-betul wujud dalam `src/` dan bilangan penggunaannya.

---

## 1. Hakikat semasa

| Ukuran | Nilai | Maksud |
|---|---|---|
| `style={{...}}` inline dalam `.tsx` | **~3,600** | Hampir semua gaya ditulis inline |
| `className=` | **15** | Tailwind dipasang tetapi hampir tidak dipakai |
| Komponen UI generik dalam `components/ui/` | **3 + 1 fail gaya** | Butang, kad, badge, tab dan jadual **belum** jadi komponen |

Kesannya: rupa yang konsisten bergantung pada salin-tampal nilai daripada [Design System](02-design-system.md). Setiap kali padding atau warna butang diubah, puluhan fail perlu disentuh.

---

## 2. Komponen yang wujud

### 2.1 UI generik (`src/components/ui/`)
| Komponen | Fungsi | Fail guna |
|---|---|---|
| `borang.ts` → `gayaInput`, `gayaLabel` | Gaya input & label kongsi | 25 |
| `Toaster.tsx` + `lib/stores/toast-store` | Notifikasi toast (`toast.success/error`) | 51 |
| `SkeletonPage.tsx` | Rangka memuat halaman | 9 |
| `DialogSah.tsx` | Dialog pengesahan tindakan | 5 |

### 2.2 Layout (`src/components/layout/`)
| Komponen | Fungsi |
|---|---|
| `Sidebar.tsx` | Navigasi admin (16 item + Tetapan) |
| `BottomTabBar.tsx` | Navigasi jurulatih: 5 tab + sheet "Lagi" |
| `NavigasiAtas.tsx` | Bar atas |
| `LocengNotifikasi.tsx` | Loceng + kiraan notifikasi |
| `AutoLogout.tsx` | Log keluar selepas 30 minit tidak aktif |

### 2.3 Domain
| Komponen | Fungsi | Fail guna |
|---|---|---|
| `pelajar/CariPelajar.tsx` | Carian & pilih pelajar (autocomplete) | 8 |
| `pelajar/KaitanAdikBeradik.tsx` | Pautan adik-beradik | — |
| `pelajar/ModalNyahaktif.tsx` | Nyahaktif pelajar | — |
| `tetapan/ModalResetKataLaluan.tsx` | Reset kata laluan pengguna | — |
| `GrafProgres.tsx` | Graf garis rating pertandingan (SVG) | — |

### 2.4 Eksport
- **PDF (24 fail dalam `components/pdf/`):** resit, resit pendapatan, slip gaji, dokumen jualan, laporan pelajar/kelas/bilangan kelas/pendapatan/progres/silibus (×4), kad pelajar, kad gred, kad Little Pawn, sijil Pawn, laporan kelas gred, keputusan pertandingan, jadual minggu. Butang pembalut dinamakan `Btn*.tsx` dan memuatkan `@react-pdf/renderer` secara dinamik.
- **Excel (3 fail dalam `components/excel/`):** `BtnLaporanLHDN`, `BtnLaporanAset`, `BtnDataGredExcel`. Semuanya guna `exceljs` dengan header `#1E293B` dan baris 1 dibekukan.

---

## 3. Corak berulang yang BELUM jadi komponen

Corak ini muncul berkali-kali sebagai inline style. Ia calon pertama untuk dijadikan komponen (keutamaan ikut kekerapan):

| Calon | Rupa (rujuk Design System) | Contoh lokasi |
|---|---|---|
| `<Butang varian="primer|aksen|garis">` | §5 butang primer/aksen | Hampir setiap halaman |
| `<Kad tajuk=... tindakan=...>` | Kad 16/20px dengan header `14px 20px` | `/laporan`, `/penggredan` |
| `<Badge status=...>` | Pil status §2 | Kehadiran, resit, silibus |
| `<KadStatistik label nilai warna>` | Grid 4 statistik | Header laporan, dashboard |
| `<TogolSegmen>` / `<TabPil>` | §5 | `/laporan` (Sesi 24) |
| `<KeadaanKosong mesej>` | Teks tengah `40px` | Semua senarai |
| `<BarPeratus nilai skala>` | Bar 8–10px + warna ikut skala | Laporan, silibus |
| `<Jadual>` | Header uppercase 11px, baris berselang | Laporan, kewangan |

## 4. Peraturan migrasi (cadangan)
1. **Jangan tulis semula sekaligus.** Bina komponen dalam `components/ui/` dan guna untuk **skrin baharu** serta skrin yang memang sedang disentuh.
2. Komponen mesti guna token `var(--...)` sahaja.
3. Kemas kini jadual §2 setiap kali komponen ditambah, termasuk bilangan fail yang menggunakannya.
4. Ganti 9 `confirm()` natif dengan `DialogSah`.
