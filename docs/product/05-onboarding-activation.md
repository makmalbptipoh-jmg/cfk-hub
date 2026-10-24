# Onboarding & Activation Plan — CFK HUB

**Disediakan:** 24 Oktober 2026
**Skop:** pengguna **dalaman**, iaitu jurulatih baharu dan admin baharu. CFK HUB tiada pendaftaran awam (DR-004). Semua akaun dicipta oleh Admin di `/tetapan/pengguna`.

---

## 1. Momen "aha"

| Pengguna | Momen aha | Bukti dalam data |
|---|---|---|
| **Jurulatih** | Tanda kehadiran satu kelas penuh dalam bawah 1 minit dari telefon, dan tidak perlu hantar senarai kepada admin lagi | Rekod `kehadiran` pertama dicipta oleh jurulatih itu |
| **Admin** | Jana laporan pelajar / tunggakan dan nampak siapa perlu bayar tanpa mengira sendiri | Laporan pertama + resit pertama |

**Pengguna dikira aktif** bila jurulatih sudah merekod kehadiran untuk **3 sesi berturut-turut** pada hari kelas itu sendiri.

---

## 2. Senarai semak Admin (sebelum jurulatih mula)

1. `/tetapan/cawangan`: pastikan cawangan jurulatih berstatus Aktif.
2. `/jurulatih/baharu`: cipta profil jurulatih (gambar, kadar sesi, cawangan).
3. `/tetapan/pengguna`: cipta akaun (e-mel) atau minta jurulatih log masuk dengan Google, kemudian pautkan ke profil.
4. `/jadual`: pastikan slot kelas jurulatih wujud. Jadual menentukan apa yang dipapar di `/kehadiran`.
5. Hantar mesej WhatsApp aluan (§4).

## 3. Hari pertama jurulatih (dipandu, ±10 minit, boleh dibuat di cawangan)

| Langkah | Skrin | Apa yang ditunjuk |
|---|---|---|
| 1 | `/login` | Log masuk (Google lebih mudah). **Pasang ke skrin utama** (PWA): Chrome → ⋮ → Add to Home screen. |
| 2 | `/kehadiran` | Pilih kelas hari ini, kemudian tap setiap pelajar Hadir / Tidak Hadir / Cuti, kemudian Simpan. **Ini tugasan teras.** |
| 3 | `/kehadiran-saya` | Semak sesi sendiri. Bayaran dikira daripada sesi ini. |
| 4 | `/silibus-pelajar` | Tandakan subtajuk yang diajar hari ini (Sedang / Selesai) |
| 5 | Tab "Lagi" (⋯) | Penggredan, Pelan Sesi Hari Ini (Little Pawn), Makluman |

**Ditangguh ke minggu ke-2:** pertandingan, penggredan dan daftar pelajar baharu. Jangan beri semua sekaligus.

## 4. Mesej aluan (WhatsApp)
> Salam {nama}, akaun CFK HUB cikgu sudah siap. Buka https://cfk-hub.vercel.app dan log masuk dengan Google ({e-mel}). Sila "Add to Home screen". Setiap kelas, buka tab **Kehadiran** → tanda pelajar → Simpan. Itu sahaja untuk minggu pertama. Ada masalah? WhatsApp admin.

## 5. Titik geseran yang diketahui & mitigasi
| Geseran | Mitigasi |
|---|---|
| UI lama selepas update (cache PWA) | Ajar cara tarik ke bawah untuk refresh / tutup dan buka semula app |
| Log keluar automatik selepas 30 minit tidak aktif | Beritahu awal supaya jurulatih tidak sangka akaun rosak |
| Pelajar dari cawangan lain hadir | Kehadiran silang-cawangan disokong. Tunjuk carian pelajar. |
| Lupa tanda kehadiran | Admin semak laporan per kelas setiap minggu dan ingatkan jurulatih |

## 6. Ukuran (minggu 1–4)
| Minggu | Sasaran |
|---|---|
| 1 | Log masuk + 1 kelas direkod sendiri |
| 2 | Semua kelas direkod pada hari yang sama |
| 3 | Progress silibus dikemas kini sekurang-kurangnya sekali |
| 4 | Aktif (§1) tanpa peringatan admin |
