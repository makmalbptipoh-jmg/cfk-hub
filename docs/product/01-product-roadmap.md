# Product Roadmap — CFK HUB

**Disediakan:** 24 Oktober 2026 · **Sumber:** `docs/planning/implementation-status.md` (Sesi 1–24), BRD §8

---

## 1. Core loop

CFK HUB wujud untuk satu kitaran operasi bulanan. Semua modul lain menyokong kitaran ini.

```
Daftar pelajar ──► Jadual kelas ──► Jurulatih tanda kehadiran (telefon)
       ▲                                         │
       │                                         ▼
 Laporan kepada ibu bapa ◄── Yuran & resit ◄── Peraturan ≥4 hadir = perlu bayar (DR-036)
       │
       └──► Prestasi: silibus · penggredan · pertandingan
```

| Langkah | Pengguna | Skrin |
|---|---|---|
| 1. Daftar | Admin / Jurulatih | `/pelajar/baharu`, `/pelajar-baharu`, `/pelajar/import` (Google Sheet) |
| 2. Hadir | Jurulatih | `/kehadiran` (mobile, BottomTabBar) |
| 3. Bayar | Admin / ibu bapa (ToyyibPay) | `/bayaran/baharu`, `/bayaran/permintaan`, `/bayaran-selesai` |
| 4. Lapor | Admin | `/laporan` (per kelas, per pelajar bulanan/keseluruhan), `/laporan/tunggakan` |
| 5. Kembang | Jurulatih | `/silibus-pelajar`, `/penggredan`, `/pertandingan` |

**Momen "aha" untuk Admin:** kali pertama yuran tertunggak dan laporan pelajar keluar sendiri daripada data kehadiran yang jurulatih isi, tanpa perlu kira dengan tangan.

---

## 2. Skop feature: apa yang sudah wujud

| Kawasan | Modul | Status |
|---|---|---|
| **Teras operasi** | Log masuk (e-mel + Google OAuth), peranan Admin/Jurulatih, cawangan | LIVE |
| | Pelajar (CRUD, adik-beradik, nyahaktif, import Google Sheet, kelas Personal + pakej prabayar) | LIVE |
| | Kehadiran pelajar (silang-cawangan), jadual kelas + batal kelas, PDF jadual mingguan | LIVE |
| **Wang** | Resit (auto-nombor, PDF), bayaran online ToyyibPay, tunggakan | LIVE (ToyyibPay belum diuji transaksi sebenar) |
| | Kewangan (perbelanjaan, pendapatan lain, dokumen jualan: sebut harga/invois/resit rasmi), laporan LHDN | LIVE |
| | Jurulatih: kehadiran, gaji sesi, advance, TNG, slip gaji | LIVE |
| | Aset | LIVE |
| **Prestasi pelajar** | Silibus berstruktur (tajuk → subtajuk), silibus personal, progress per pelajar | LIVE |
| | Pertandingan (Swiss-Manager import, rating Elo asas 1000, pingat, lintas-cawangan) | LIVE |
| | Penggredan (Level 0 Little Pawn + Level 1–6, kad laporan PDF, sijil, Excel, batch, sejarah, pelan sesi) | LIVE |
| **Komunikasi** | Makluman WhatsApp (templat yuran/kelas/pertandingan/pembatalan), notifikasi dalam app | LIVE |
| **Laporan** | Per kelas, per pelajar (bulanan + keseluruhan + tab), bilangan kelas, pendapatan, kewangan, tunggakan | LIVE (Sesi 24 belum deploy) |

---

## 3. Rollout berfasa

### Fasa 1–3: SIAP (Jun–Julai 2026)
Ikut BRD §8: teras, laporan dan kewangan, aset dan PWA. Semuanya live.

### Fasa 4: Prestasi pelajar, SIAP (Julai–Ogos 2026)
Silibus, pertandingan dan penggredan. Kod siap dan live, tetapi **kebanyakannya belum diuji dalam browser** (lihat [07-qa-testing-plan.md](07-qa-testing-plan.md)).

### Fasa 5: Pengukuhan (CADANGAN, Nov–Dis 2026)
Fokus fasa ini ialah membuktikan apa yang sudah ada berfungsi, bukan menambah modul baharu.

| Keutamaan | Item | Sebab |
|---|---|---|
| P0 | Jalankan [QA plan](07-qa-testing-plan.md) untuk semua item "BELUM diuji browser" | Risiko terbesar sekarang ialah ciri yang rosak senyap |
| P0 | Uji ToyyibPay dengan 1 transaksi sebenar (RM1) | Aliran duit tidak boleh bergantung pada andaian |
| P1 | Seed `gred_kitaran` suku semasa + nilai 1 kelas penuh | Modul penggredan belum pernah dipakai dengan data sebenar |
| P1 | Ujian unit untuk `tunggakan.ts`, `gajiSesi.ts`, `pakejPersonal.ts` | Logik wang belum ada ujian (lihat QA §3) |
| P2 | Kurangkan inline style → komponen UI kongsi (lihat [06](06-ui-kit-component-library.md)) | 3,600+ `style={{}}` menyukarkan konsistensi |

### Fasa 6: Ditangguhkan / perlu keputusan
| Item | Perlu keputusan |
|---|---|
| E5 penggredan: zip PDF individu | Setuju tambah dependency `jszip`? |
| SMK STAR sebagai cawangan ke-5 | Sahkan status cawangan |
| Akses ibu bapa (portal baca sahaja) | DR-014 kini "tidak". Kaji semula jika permintaan laporan meningkat. |
| Mod gelap | DD-009 kini "tidak" |

---

## 4. Monetization

**Tidak berkaitan sebagai produk.** CFK HUB tidak dijual. Ia menyokong hasil akademi melalui:
- **Kutipan yuran lebih baik:** peraturan ≥4 hadir (DR-036), laporan tunggakan, link bayaran ToyyibPay.
- **Kos operasi lebih rendah:** gaji jurulatih dikira automatik daripada sesi, laporan LHDN siap eksport.
- **Nilai kepada ibu bapa:** kad laporan gred, sijil dan laporan pelajar menyokong pengekalan pelajar.

Jika suatu hari mahu dijual kepada akademi lain, barulah Market Research dan Growth Strategy perlu ditulis.

---

## 5. Metrik kejayaan (cadangan, semua boleh dikira dari DB sedia ada)

| Metrik | Takrif | Sasaran cadangan | Sumber |
|---|---|---|---|
| Kehadiran direkod tepat masa | % sesi dengan rekod `kehadiran` pada hari yang sama | ≥ 95% | `kehadiran.created_at` vs `tarikh` |
| Kadar kutipan yuran | Bulan perlu bayar (≥4 hadir) yang ada resit Aktif | ≥ 90% | `kehadiran` + `resit` |
| Umur tunggakan | Purata bulan tertunggak per pelajar berhutang | < 1.5 bulan | `/laporan/tunggakan` |
| Penggunaan prestasi | % pelajar aktif dengan progress silibus dikemaskini dalam 30 hari | ≥ 70% | `silibus_progress_pelajar` |
| Penggredan | % pelajar dinilai "Selesai" per kitaran | 100% | `gred_penilaian` |
| Kebolehpercayaan | Ralat runtime production per minggu | 0 kritikal | Vercel runtime errors |
