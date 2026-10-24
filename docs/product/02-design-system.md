# Design System — CFK HUB

**Disediakan:** 24 Oktober 2026
**Status:** DIKUNCI. Semua skrin baharu mesti ikut dokumen ini. Untuk menukar apa-apa peraturan, cipta rekod DD baharu dalam `docs/design/decisions/`.
**Sumber kebenaran kod:** `src/app/globals.css` (token), `src/components/ui/borang.ts` (gaya borang)

Dokumen ini menggabungkan DD-001 hingga DD-010. Di tempat kod sebenar berbeza daripada keputusan asal, **kod yang menang** (ditanda ⚠ *drift*), kerana pengguna sudah biasa dengan rupa itu.

---

## 1. Prinsip

1. **Data dahulu.** Angka, status dan nama pelajar mesti paling menonjol. Tiada hiasan (DD-001).
2. **Warna membawa makna.** Hijau, merah dan kuning hanya untuk status. Jangan guna warna sebagai hiasan.
3. **Satu tangan, satu tap.** Skrin jurulatih dipakai di kelas dengan telefon, jadi tindakan utama mesti boleh dibuat dengan satu tap.
4. **Bahasa Melayu sahaja.** Ikut glosari DD-010. Istilah catur kekal Inggeris (Pawn, Knight, check).
5. **Tema cerah sahaja** (DD-009).

---

## 2. Token warna (`globals.css`)

Sentiasa guna `var(--token)`. Jangan tulis hex terus untuk peranan yang sudah ada token.

| Token | Nilai | Guna untuk |
|---|---|---|
| `--primary` | `#1E293B` | Butang primer, header kad laporan, sidebar, tab aktif |
| `--accent` | `#84CC16` | CTA sekunder (cth. Muat Turun PDF), item sidebar aktif |
| `--accent-dark` | `#4D7C0F` | Hover aksen |
| `--accent-text` | `#1E293B` | Teks atas latar aksen |
| `--bg` | `#F1F5F9` | Latar halaman |
| `--card` | `#FFFFFF` | Latar kad, input, modal |
| `--text` | `#0F172A` | Teks utama |
| `--text-muted` | `#64748B` | Label, metadata |
| `--border` | `#E2E8F0` | Semua sempadan |
| `--danger` / `--warning` / `--info` / `--success` | `#EF4444` / `#F59E0B` / `#3B82F6` / `#22C55E` | Tindakan & amaran |

### Warna status (⚠ *drift* daripada DD-007: kod guna pasangan latar pucat + teks gelap, bukan badge Lime/Coral pekat)

| Status | Latar | Teks | Sempadan |
|---|---|---|---|
| Hadir / Aktif / Selesai / Dibayar | `--hadir-bg` `#F0FDF4` | `--hadir-text` `#166534` | `#BBF7D0` |
| Tidak Hadir / Batal | `--tidak-hadir-bg` `#FFF1F2` | `--tidak-hadir-text` `#9F1239` | `#FECDD3` |
| Cuti / Sedang | `--cuti-bg` `#FFFBEB` | `--cuti-text` `#92400E` | `#FDE68A` |
| Amaran yuran | `#FFF7ED` | `#C2410C` | `#FED7AA` |
| Info / statistik | `#EFF6FF` | `#1E40AF` | `#BFDBFE` |
| Tidak aktif / neutral | `#F8FAFC` | `--text-muted` | `--border` |

### Skala prestasi (bar peratus)

| Julat | Warna | Digunakan dalam |
|---|---|---|
| Kehadiran < 50% / 50–74% / ≥ 75% | `#EF4444` / `#F59E0B` / `#10B981` | Laporan pelajar keseluruhan |
| Silibus < 34% / 34–66% / ≥ 67% | `#EF4444` / `#F59E0B` / `#10B981` | Progress silibus |

### Warna domain (dikunci dalam `src/lib/`)
- **Taraf rating pertandingan:** `TARAF_RATING` dalam `pertandingan.ts` (Pawn kelabu → King emas)
- **Gred A–E:** `WARNA_GRED` dalam `grading.ts`
- **Pingat:** `WARNA_PINGAT` dalam `pertandingan.ts`
- **Progress silibus:** `WARNA_PROGRES` dalam `silibus.ts`

Jangan cipta palet baharu untuk konsep yang sama. Import dari fail-fail ini.

---

## 3. Tipografi

Satu fon sahaja: **Plus Jakarta Sans**, self-host melalui `next/font` (`--font-jakarta`).

**Huruf besar global:** `body { text-transform: uppercase }`. Input e-mel, kata laluan, tarikh, nombor, tel, carian, URL dan placeholder dikecualikan. Data dalam DB tidak berubah.

| Peranan | Saiz | Berat | Nota |
|---|---|---|---|
| Tajuk halaman | 22px | 700, `letter-spacing: -0.3px` | ⚠ *drift*: DD-003 kata 24px |
| Tajuk kad / seksyen | 13.5–14px | 700 | |
| Nama dalam header gelap | 17px | 700 | |
| Badan / data jadual | 13–13.5px | 400–600 | |
| Label borang & header jadual | 11–12px | 600–700, uppercase, `letter-spacing: 0.05em` | `gayaLabel` |
| Nombor statistik | 18–24px | 800 | |
| Badge | 11–12px | 600–700 | |

---

## 4. Ruang, bucu, bayang

| Elemen | Nilai |
|---|---|
| Lebar kandungan laporan/borang | `maxWidth: 760px` |
| Kad utama | `borderRadius: 20px`, `padding: 24px` |
| Kad sekunder / seksyen | `borderRadius: 16px`, header `padding: 14px 20px` |
| Kotak status | `borderRadius: 14px`, `padding: 14px 20px` |
| Input & butang | `borderRadius: 12px`, `padding: 10px 14px` / `11px 24px` |
| Badge / pil | `borderRadius: 20px` |
| Jarak antara kad | `16px` (`24px` selepas borang) |
| Bayang | Hampir tiada. Sempadan `1px solid var(--border)` menggantikan bayang. |

---

## 5. Corak interaksi (dikunci)

| Corak | Peraturan |
|---|---|
| **Butang primer** | Latar `--primary`, teks putih, 700. Bila disabled, latar `#94A3B8` dan `cursor: not-allowed`. Label bertukar semasa memuat ("Memuatkan...", "Jana PDF..."). |
| **Butang aksen** | Untuk muat turun/eksport. Latar `--accent`, teks `--accent-text`. Ikon `Download`. |
| **Togol segmen** | Bekas `#F1F5F9` dengan `padding 3px`. Pilihan aktif ialah kad putih dengan bayang kecil. Contoh: Bulanan / Keseluruhan. |
| **Tab seksyen** | Pil dengan ikon. Tab aktif berlatar `--primary`, tab lain `--card` bersempadan. Contoh: Kehadiran / Silibus / Pertandingan. |
| **Maklum balas** | `toast.success` / `toast.error` (`lib/stores/toast-store`). Jangan guna `alert()`. |
| **Pengesahan tindakan bahaya** | `DialogSah` (`components/ui/DialogSah.tsx`). ⚠ Masih ada 9 `confirm()` natif yang perlu diganti. |
| **Memuat halaman** | `loading.tsx` + `SkeletonPage` |
| **Keadaan kosong** | Teks `--text-muted` di tengah, `padding: 40px`, satu ayat ("Tiada rekod ... ") |
| **Borang panjang** | Stepper 2–4 langkah (DD-008) |
| **Navigasi** | Admin guna Sidebar (DD-004). Jurulatih guna BottomTabBar 5 tab + "Lagi" (⋯) (⚠ *drift*: DD-005 asal 4 tab). |
| **Log keluar automatik** | Selepas 30 minit tidak aktif (`AutoLogout`) |
| **Sesuai mudah alih** | Grid `repeat(auto-fit, minmax(220px, 1fr))`, `flexWrap: 'wrap'`. Jadual lebar dibungkus `overflowX: auto`. |

---

## 6. Ikon
**Lucide** sahaja (`lucide-react`), saiz 14–15px dalam butang, 20px dalam sidebar. Emoji dibenarkan untuk pingat 🥇 dan simbol status ✓ ⚠ ℹ dalam UI web, tetapi **tidak dalam PDF** (lihat §7).

---

## 7. PDF (`@react-pdf/renderer`)
- Fon **Helvetica / Helvetica-Bold** sahaja. Glyph bukan ASCII (♞ ★ → ✓ emoji) akan jadi "^" atau kotak kosong. Gunakan teks ASCII atau lukis dengan `<Svg>`.
- Header: logo `LOGO_CFK` + "CFK HUB / Catur Untuk Kanak-Kanak", garis bawah `2px #1E293B`.
- Header jadual: latar `#1E293B`, teks putih 8pt uppercase. Baris berselang `#F8FAFC`.
- Saiz A4 portrait. Sijil guna A4 landscape.

---

## 8. Art direction (ringkas)

| Aspek | Arah |
|---|---|
| **Mood** | Tenang, teratur, boleh dipercayai, seperti buku rekod kelab yang kemas. Bukan app permainan kanak-kanak. |
| **Personaliti** | Profesional untuk admin. Mesra dan memberi semangat dalam output untuk ibu bapa dan kanak-kanak (kad gred, sijil, bintang Little Pawn). |
| **Ilustrasi** | Tiada dalam UI kerja. Simbol buah catur (♟♞♝♜♛♚) dipakai sebagai ikon taraf dalam UI web sahaja. |
| **Fotografi** | Hanya gambar profil jurulatih. Tiada foto stok. |
| **Logo** | Logo rasmi CFK (`logoCfk.ts`) pada login, sidebar dan semua PDF |
| **Output untuk kanak-kanak** | Boleh lebih berwarna (warna gred, bintang, bingkai sijil dwi-warna) tetapi kekal guna palet §2 |
