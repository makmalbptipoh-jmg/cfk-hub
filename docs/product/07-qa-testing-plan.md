# QA & Testing Plan — CFK HUB

**Disediakan:** 24 Oktober 2026
**Kenapa mendesak:** `implementation-status.md` menunjukkan sebahagian besar ciri Sesi 10–24 berstatus **"BELUM diuji browser"**, walaupun sudah live di production. Typecheck, lint dan build yang lulus hanya membuktikan kod boleh dikompil. Ia tidak membuktikan ciri berfungsi dengan betul.

---

## 1. Lapisan ujian

| Lapisan | Alat | Bila | Status |
|---|---|---|---|
| L1 Statik | `npx tsc --noEmit`, `npm run lint` | Setiap perubahan | ✅ Rutin |
| L2 Unit | `npm test` (Vitest) | Setiap perubahan logik dalam `src/lib/` | ✅ 6 fail, **73 ujian lulus** |
| L3 Build | `npm run build` | Sebelum push | ✅ Rutin |
| L4 Preview | Vercel preview URL (dev tempatan tidak boleh: placeholder `.env.local`) | Setiap PR | ⚠ Jarang dibuat |
| L5 Ujian penerimaan (UAT) | Admin + 1 jurulatih, data sebenar | Sebelum merge ciri yang melibatkan wang/auth | ❌ Tiada proses |
| L6 Pemantauan | Vercel runtime errors / logs | Mingguan + selepas deploy | ⚠ Ad hoc |

## 2. Liputan unit sedia ada

| Fail ujian | Meliputi |
|---|---|
| `utils.test.ts` | Utiliti tarikh/format |
| `rating.test.ts` | Bintang kehadiran |
| `pertandingan.test.ts` | Rating Elo, ringkasan, pingat |
| `pertandingan-parse.test.ts` | Import Swiss-Manager (fixture `ranking-141225.xls`) |
| `grading.test.ts` | Skor, gred, gate promosi, `levelSemasaPelajar` |
| `gradingLittlePawn.test.ts` | Checklist, peringkat, graduasi |

## 3. Jurang unit (keutamaan: logik wang dahulu)

| P | Fail | Kenapa |
|---|---|---|
| P0 | `lib/tunggakan.ts` | Menentukan siapa yang dituntut yuran |
| P0 | `lib/gajiSesi.ts` | Gaji jurulatih |
| P0 | `lib/pakejPersonal.ts` | Baki pakej prabayar; kelas batal mesti ditolak |
| P1 | Logik ≥4 hadir + padanan resit dalam `/laporan` (kini inline dalam `page.tsx`) | Pindahkan ke `lib/` supaya boleh diuji |
| P1 | `lib/silibus.ts`, `lib/progresPelajar.ts` | Peratus progress |
| P2 | `lib/validation/*` | Skema borang kewangan/dokumen |

## 4. Senarai semak regresi kritikal (preview, ±20 minit)

Jalankan sebelum setiap merge ke `main` yang menyentuh kawasan berkaitan. Uji dengan **hard-refresh (Ctrl+Shift+R)** kerana cache PWA boleh memaparkan UI lama.

**Auth & peranan**
- [ ] Log masuk e-mel + Google (admin dan jurulatih)
- [ ] Jurulatih tidak nampak menu admin dan tidak boleh buka `/kewangan` (RLS menolak data)
- [ ] Log keluar automatik selepas 30 minit

**Core loop**
- [ ] Jurulatih tanda kehadiran 1 kelas → rekod muncul di laporan per kelas admin
- [ ] Pelajar silang-cawangan boleh ditanda
- [ ] Rekod resit → PDF muat turun → nombor resit berturutan
- [ ] Pelajar ≥4 hadir tanpa resit muncul di `/laporan/tunggakan`
- [ ] `/laporan` per pelajar: **Bulanan** (rekod harian + yuran) dan **Keseluruhan** (jadual bulan + Lihat + yuran tertunggak); tab Kehadiran/Silibus/Pertandingan; PDF dalam kedua-dua mod

**Wang**
- [ ] ToyyibPay: jana link → bayar RM1 sebenar → `/bayaran-selesai` → resit auto dicipta (**belum pernah diuji**)
- [ ] Gaji jurulatih bulan semasa = sesi × kadar − advance

**Prestasi**
- [ ] Silibus: jurulatih tanda Selesai dari telefon → % berubah di laporan pelajar
- [ ] Pertandingan: import keputusan → rating & pingat dalam laporan pelajar
- [ ] Penggredan: seed `gred_kitaran` → nilai 1 pelajar L1–6 + 1 Little Pawn → Kad PDF → Excel 5 sheet

**PDF (semua)**
- [ ] Tiada glyph "^" atau kotak kosong (Helvetica tidak menyokong ♞ ★ → ✓ emoji)

## 5. Selepas menjalankan SQL migration
1. Jalankan fail `scripts/sql/*.sql` di Supabase.
2. `SELECT * FROM pg_policies WHERE tablename = '...'`: bilangan polisi mesti seperti dijangka.
3. Jalankan `_semakan-policy-audit.sql`. Mesti pulang **0 baris**.
4. Uji dengan akaun **jurulatih** (bukan admin sahaja). Ralat 42501 biasanya hanya muncul untuk satu peranan.

## 6. Definisi "Siap" (Definition of Done)
Ciri hanya boleh ditanda **SIAP** dalam `implementation-status.md` bila:
1. L1 + L2 + L3 lulus.
2. Logik baharu dalam `src/lib/` ada ujian unit.
3. Item berkaitan dalam §4 sudah diuji di preview oleh pembangun.
4. Admin sudah cuba sendiri sekurang-kurangnya sekali (UAT).
5. Jika ada SQL: §5 sudah selesai.

Selagi syarat ini belum dipenuhi, kekalkan label **"BELUM diuji browser"**. Itu lebih jujur dan memudahkan penjejakan.

## 7. Backlog ujian browser (dari `implementation-status.md`)
Pertandingan lintas-cawangan (S23) · Penggredan penuh L1–L8 (S22) · Silibus Personal (S21) · Swiss-Manager (S20) · Progress silibus dalam laporan (S19) · Laporan pendapatan (S18) · Pendaftaran Google Sheet (S17) · Progress Personal + Bahan (S15) · Silibus/Tajuk + PDF (S13) · ToyyibPay (S12) · Kehadiran silang-cawangan (S11) · Batal kelas, gaji (S9–10) · Laporan pelajar Keseluruhan + tab (S24).
