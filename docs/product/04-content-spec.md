# Content Spec — CFK HUB

**Disediakan:** 24 Oktober 2026
Dokumen ini menyenaraikan **kandungan sebenar** yang digunakan oleh app, bukan placeholder. Sumber kebenaran ialah fail yang disebut di setiap bahagian. Jika kandungan diubah, ubah fail sumber dahulu, kemudian kemas kini dokumen ini.

---

## 1. Bahasa & nada
- **Bahasa Melayu** untuk semua UI (DD-010). Istilah catur kekal Inggeris: Pawn, Knight, Bishop, Rook, Queen, King, check, piece.
- Nada: ringkas dan arahan terus ("Jana Laporan", "Simpan", "Tandakan Selesai").
- Mesej ralat mesti beritahu langkah seterusnya. Contoh: *"Gagal jana PDF. Sila refresh halaman (Ctrl+Shift+R) dan cuba lagi."*
- Simbol status UI: `✓` berjaya, `⚠` perlu tindakan, `ℹ` maklumat. Dalam PDF, guna teks sahaja.

---

## 2. Yuran (BRD §7, DR-036)
| Item | Nilai |
|---|---|
| Yuran pendaftaran | RM140 (sekali) |
| Yuran bulanan standard | RM70 |
| Adik-beradik | Belum dimuktamadkan |
| Kelas Personal | Pakej prabayar 4 kelas (`lib/pakejPersonal.ts`) |
| Peraturan | ≥ 4 sesi Hadir sebulan = yuran bulan itu perlu dijelaskan |

**Teks status yuran dalam laporan pelajar:**
- Perlu bayar: `⚠ Yuran {Bulan} {Tahun} perlu dijelaskan ({n} sesi hadir ≥ 4)`
- Sudah bayar: `✓ Yuran {Bulan} {Tahun} sudah dijelaskan`
- Belum cukup: `ℹ {n} sesi hadir — belum mencapai 4 sesi minimum`
- Keseluruhan: `⚠ {n} bulan yuran belum dijelaskan: {senarai}` / `✓ Tiada yuran tertunggak ({n} bulan direkod)`

---

## 3. Silibus
| Tajuk | Jenis | Sumber |
|---|---|---|
| **CFK STEP BY STEP** | Wajib (kelas biasa) | `scripts/sql/seed-cfk-step-by-step.sql`: INTRODUCTION + 41 bab |
| **KIRIL'S KLASS** | Personal | `seed-winning-chess-strategy.sql` (*Winning Chess Strategy for Kids*) |
| **COMBO MOMBO** | Personal | Sama seperti di atas |

Status progress: **Belum → Sedang → Selesai** (`WARNA_PROGRES`, `lib/silibus.ts`).

---

## 4. Taraf & gred (tiga sistem berasingan, jangan dicampur)

| Sistem | Fail | Kandungan |
|---|---|---|
| **Rating pertandingan** | `lib/pertandingan.ts` `TARAF_RATING` | Pawn ♟ 0 · Knight ♞ 950 · Bishop ♝ 1050 · Rook ♜ 1150 · Queen ♛ 1300 · King ♚ 1500. Elo bermula 1000. |
| **Level penggredan** | `lib/grading.ts` `TARAF_GRED` | 0 Little Pawn ♙ · 1 Pawn (0–799) · 2 Knight (800–999) · 3 Bishop (1000–1199) · 4 Rook (1200–1399) · 5 Queen (1400–1599) · 6 King (1600+) |
| **Bintang kehadiran** | `lib/rating.ts` | Bintang daripada kehadiran |

**Komponen skor penggredan L1–6** (maks 105): Theory 25 · Puzzle 20 · Practical 25 · Kehadiran 10 · Sikap 10 · Improvement 10 · Bonus 5.
**Gred:** A ≥ 85 · B ≥ 70 · C ≥ 55 · D ≥ 40 · E < 40.
**Halangan naik level:** Theory < 60% atau Practical < 60% (teks: *"Theory bawah 60%"*, *"Practical bawah 60%"*).

---

## 5. Little Pawn (Level 0): `lib/gradingLittlePawn.ts`

**12 item checklist** (status Belum / Sedang / Dah Boleh):

| Kumpulan | Item |
|---|---|
| Kenal | i01 Kenal nama enam pieces · i02 Kenal petak light dan dark · i03 Susun board sendiri · i04 Fokus 10 minit |
| Gerak | i05 Gerak Pawn (termasuk double move) · i06 Gerak Rook dan Bishop · i07 Gerak Knight (bentuk L) · i08 Gerak Queen dan King · i09 Faham cara makan piece |
| Main | i10 Kenal check dan cara escape · i11 Habis satu game penuh · i12 Salam lawan, terima kalah |

**8 aktiviti:** A1 Parade Piece (15m) · A2 Petak Gelap Petak Cerah (15m) · A3 Lumba Susun (20m) · A4 Pawn Race (20m) · A5 Lebuhraya Rook dan Bishop (20m) · A6 Lompat Kuda (20m) · A7 Rondaan Queen dan King (20m) · A8 Hari Mini Game (20m)

**Pelan sesi 90 minit (7 slot):**
| Minit | Slot | Isi |
|---|---|---|
| 0–10 | Buka | Salam sorang-sorang, free play piece atas board |
| 10–25 | Aktiviti A | Ikut jadual minggu |
| 25–35 | Gerak Badan | Piece hidup atas grid tape |
| 35–55 | Aktiviti B | Lebih mencabar |
| 55–65 | Rehat Tenang | Minum, mewarna, cerita pendek |
| 65–85 | Free Play | Coach tandakan checklist |
| 85–90 | Tutup | Bagi bintang, salam, brief parent |

Jadual 12 minggu: `JADUAL_LITTLE_PAWN`. Graduasi 12/12 akan membuka **Sijil Pawn Promotion**.

---

## 6. Templat WhatsApp: `(jurulatih)/makluman/_components/MaklumanKlient.tsx`
Empat kategori: **Yuran · Kelas · Pertandingan · Pembatalan**. Teks penuh ada dalam objek `templat` dalam fail itu.
Link bayaran ToyyibPay (`PermintaanKlient.tsx`):
> Assalamualaikum. Ini pautan untuk bayar yuran catur CFK bagi {nama} ({bulan} {tahun}) berjumlah {RMx}. Sila klik untuk bayar (FPX / DuitNow): {url}. Resit rasmi akan dihantar selepas bayaran selesai. Terima kasih. 🙏

Ringkasan sesi Little Pawn: nota parent **maks 140 aksara**, dikongsi melalui `wa.me/?text=`.

---

## 7. Dokumen PDF: nama fail
| Dokumen | Corak nama fail |
|---|---|
| Laporan pelajar | `Laporan_{Nama}_{Bulan}_{Tahun}.pdf` / `Laporan_{Nama}_Keseluruhan.pdf` |
| Kad gred | `CFK_Report_{Nama}_{Kitaran}.pdf` |
| Header semua PDF | "CFK HUB" + "Catur Untuk Kanak-Kanak" + logo rasmi |
