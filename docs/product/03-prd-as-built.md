# PRD (As-Built) — CFK HUB

**Disediakan:** 24 Oktober 2026
**Kedudukan dokumen:** `docs/planning/implementation-plan.md` ialah spec **pra-binaan** (Part 0–J, kod skrin S-xx). Dokumen ini merekod **apa yang benar-benar dibina** setakat Sesi 24. Keperluan perniagaan kekal dalam `docs/business/business-requirements-document.md`.

---

## 1. Tech stack

| Lapisan | Pilihan | Versi / nota |
|---|---|---|
| Framework | Next.js App Router | 16.2.9. Rujuk `node_modules/next/dist/docs/` kerana ada perubahan API (AGENTS.md). |
| UI | React | 19.2.4. Inline style + token CSS. Tailwind 4 dipasang tetapi jarang diguna. |
| Bahasa | TypeScript | Jenis DB dalam `src/types/database.ts` |
| Data & auth | Supabase (Postgres + RLS + Auth) | `@supabase/supabase-js` 2.x. Klien: `lib/supabase/{client,server,middleware}.ts` |
| Hosting | Vercel | Deploy melalui PR → `main` |
| PWA | `@ducanh2912/next-pwa` | Cache boleh menyebabkan UI lama dipaparkan. Hard-refresh untuk sahkan. |
| PDF | `@react-pdf/renderer` 4.x | Fon Helvetica sahaja |
| Excel | `exceljs` | |
| State | `zustand` | Toast store |
| Pembayaran | ToyyibPay | `lib/toyyibpay.ts`, `api/bayaran` |
| Integrasi | Google Sheets (pendaftaran) | `lib/google-sheets.ts`, service account |
| Ujian | Vitest | 6 fail ujian dalam `src/lib/` |

**Migrasi DB:** fail `scripts/sql/*.sql` dijalankan **secara manual** di Supabase SQL editor. Selepas run, sahkan `pg_policies` dan jalankan `_semakan-policy-audit.sql` (mesti pulang 0 baris).

---

## 2. Peranan & akses

| Peranan | Penanda | Layout | Akses |
|---|---|---|---|
| **Admin** | `pengguna_profil.is_admin = true` / fungsi SQL `is_admin()` | `(admin)` dengan Sidebar | Semua modul |
| **Jurulatih** | `is_admin = false` + rekod `jurulatih` (`cawangan_ids`) | `(jurulatih)` dengan BottomTabBar | Kehadiran, sesi sendiri, silibus pelajar, pertandingan, penggredan, makluman, daftar pelajar |
| Ibu bapa | Tiada akaun (DR-014) | — | Hanya menerima PDF/WhatsApp dan link bayaran |

Route `(jurulatih)` turut boleh dibuka oleh admin (dengan Sidebar). RLS ialah lapisan kawalan sebenar. UI hanya menyembunyikan menu.

---

## 3. Model data (36 jadual + 2 fungsi dalam `database.ts`)

| Domain | Jadual |
|---|---|
| **Organisasi** | `cawangan`, `pengguna_profil`, `log_aktiviti` |
| **Pelajar** | `pelajar`, `import_antrian` |
| **Jadual & kehadiran** | `jadual_slot`, `jadual_slot_batal`, `aktiviti`, `kehadiran` |
| **Wang masuk** | `resit` (+ `jana_nombor_resit()`), `permintaan_bayaran` (ToyyibPay), `pendapatan_lain`, `dokumen_jualan`, `dokumen_item` |
| **Wang keluar** | `kewangan_perbelanjaan`, `bayaran_jurulatih`, `advance_jurulatih` |
| **Jurulatih** | `jurulatih`, `kehadiran_jurulatih` |
| **Aset** | `aset` |
| **Komunikasi** | `makluman_histori`, `notifikasi` |
| **Silibus** | `silibus`, `silibus_progress`, `silibus_tajuk`, `silibus_subtajuk`, `silibus_progress_pelajar`, `topik_kategori`, `pelajar_topik`, `buku_rujukan` |
| **Pertandingan** | `pertandingan`, `pertandingan_peserta`, `pertandingan_keputusan` |
| **Penggredan** | `gred_kitaran`, `gred_penilaian`, `gred_little_pawn` |

**Peraturan perniagaan dalam kod:**
- Yuran perlu dibayar bila **≥ 4 sesi Hadir** dalam sebulan dan tiada resit Aktif untuk bulan itu (DR-036). Lihat `/laporan`, `lib/tunggakan.ts`.
- `resit.bulan_bayaran` disimpan sebagai nama bulan `ms-MY` (cth. "Oktober") + `tahun_bayaran`.
- Rating pertandingan bermula pada Elo asas 1000 (`lib/pertandingan.ts`).
- Skor penggredan dikira **di server** (`actions/penggredan.ts` → `kiraPenilaian`).

---

## 4. Peta skrin

### Admin `(admin)`
| Route | Fungsi |
|---|---|
| `/dashboard` | Ringkasan operasi |
| `/pelajar`, `/[id]`, `/[id]/edit`, `/baharu`, `/import`, `/personal` | Pengurusan pelajar, import Google Sheet, kelas Personal |
| `/jadual` | Jadual kelas (harian/mingguan/bulanan), batal kelas, PDF mingguan |
| `/silibus` | Silibus berstruktur & personal |
| `/bahan` | Bahan & buku rujukan |
| `/jurulatih`, `/[id]`, `/[id]/edit`, `/[id]/kehadiran`, `/[id]/bayaran`, `/baharu`, `/gaji` | Jurulatih, kehadiran, gaji, advance |
| `/bayaran`, `/[id]`, `/baharu`, `/personal/baharu`, `/permintaan` | Resit, bayaran personal, link ToyyibPay |
| `/laporan` | Laporan per kelas + **per pelajar (Bulanan / Keseluruhan; tab Kehadiran / Silibus / Pertandingan)** |
| `/laporan/bilangan-kelas`, `/kewangan`, `/pendapatan`, `/tunggakan` | Laporan khusus |
| `/kewangan`, `/dokumen`, `/pendapatan`, `/perbelanjaan` | Kewangan & dokumen jualan |
| `/aset`, `/baharu`, `/[id]/edit` | Aset |
| `/notifikasi` | Notifikasi |
| `/tetapan/pengguna`, `/cawangan`, `/kategori`, `/perkhidmatan` | Tetapan |

### Jurulatih `(jurulatih)`
| Route | Fungsi |
|---|---|
| `/kehadiran` | Tanda kehadiran (tab utama) |
| `/kehadiran-saya` | Sesi & kehadiran jurulatih sendiri |
| `/silibus-pelajar` | Kemas kini progress silibus dari telefon |
| `/pertandingan`, `/baharu`, `/[id]` | Cipta pertandingan, peserta lintas-cawangan, import keputusan Swiss-Manager |
| `/dashboard-jurulatih` | Ringkasan jurulatih |
| `/pelajar-baharu` | Daftar pelajar dari telefon |
| `/penggredan` (+ `nilai/`, `little-pawn/`, `kad/`, `kad-lp/`, `batch/`, `sejarah/`, `sesi/`, `aktiviti/`, `jadual-little-pawn/`) | Modul penggredan penuh |
| `/makluman`, `/histori` | Templat WhatsApp |

### Awam / auth
`/login` (e-mel + Google OAuth), `/auth/callback`, `/bayaran-selesai` (pulangan ToyyibPay).

---

## 5. Keperluan bukan fungsian (as-built)
- **Mudah alih dahulu** untuk jurulatih (PWA, BottomTabBar).
- **Keselamatan:** RLS diketatkan (`rls-ketat.sql`), audit polisi, log keluar automatik 30 minit, `log_aktiviti`.
- **Prestasi:** fon self-host, `loading.tsx` per kumpulan route, indeks DB (`indexes.sql`).
- **Dev tempatan:** `.env.local` guna placeholder, jadi `npm run dev` gagal. Pengesahan dibuat di Vercel preview.
