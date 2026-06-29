# Dokumen Keperluan Reka Bentuk (Design Requirements Document) — CFK HUB

**Versi:** 1.0  
**Tarikh:** 27 Jun 2026  
**Pilihan Reka Bentuk:** Moden  
**Palet Warna:** Arang & Limau  

---

## 1. Ringkasan Pilihan Reka Bentuk

| Perkara | Keputusan |
|---|---|
| Gaya reka bentuk | Moden — bersih, bulat, ruang putih luas |
| Palet warna | Arang & Limau (#1E293B + #84CC16) |
| Tipografi | Plus Jakarta Sans (Google Fonts) |
| Bahasa UI | Bahasa Melayu sahaja |
| Platform Admin | Desktop (web browser) |
| Platform Jurulatih | Mobile (PWA) |
| Mod gelap | Tidak disokong — cahaya sahaja |

---

## 2. Sistem Warna

### 2.1 Warna Teras

| Token | Hex | Penggunaan |
|---|---|---|
| `--primary` | `#1E293B` | Sidebar, butang utama, teks gelap |
| `--accent` | `#84CC16` | CTA utama, keadaan aktif, aksen interaktif |
| `--accent-dark` | `#4D7C0F` | Hover pada elemen aksen |
| `--accent-text` | `#1E293B` | Teks di atas latar `--accent` |
| `--bg` | `#F1F5F9` | Latar halaman |
| `--card` | `#FFFFFF` | Latar kad, modal, input |
| `--text` | `#0F172A` | Teks utama |
| `--text-muted` | `#64748B` | Label, teks sekunder, placeholder |
| `--border` | `#E2E8F0` | Sempadan input, kad, jadual |

### 2.2 Warna Sidebar

| Token | Hex | Penggunaan |
|---|---|---|
| `--sidebar-text` | `#CBD5E1` | Teks item nav biasa |
| `--sidebar-muted` | `#64748B` | Label bahagian, teks pengguna |
| `--sidebar-active-bg` | `#84CC16` | Latar item nav aktif |
| `--sidebar-active-text` | `#1E293B` | Teks item nav aktif |

### 2.3 Warna Status

| Status | Latar | Teks | Titik Warna | Penggunaan |
|---|---|---|---|---|
| Hadir | `#F0FDF4` | `#166534` | `#84CC16` | Kehadiran Hadir |
| Tidak Hadir | `#FFF1F2` | `#9F1239` | `#F87171` | Kehadiran Tidak Hadir |
| Cuti | `#FFFBEB` | `#92400E` | `#FBBF24` | Kehadiran Cuti |
| Aktif | `#F0FDF4` | `#166534` | `#84CC16` | Status pelajar / resit |
| Belum Bayar | `#FFF1F2` | `#9F1239` | `#F87171` | Amaran bayaran tertunggak |
| Dibatalkan | `#F8FAFC` | `#64748B` | `#94A3B8` | Resit atau rekod dibatal |
| Kredit | `#EFF6FF` | `#1D4ED8` | `#38BDF8` | Baki kredit / bayaran hadapan |

### 2.4 Warna Sistem

| Tujuan | Hex | Penggunaan |
|---|---|---|
| Bahaya / Padam | `#EF4444` | Butang batal, amaran kritikal |
| Amaran | `#F59E0B` | Notis perhatian |
| Info | `#3B82F6` | Notis maklumat |
| Berjaya | `#22C55E` | Notis berjaya |
| Latar amaran | `#FFFBEB` | Kotak notis amaran |
| Latar bahaya | `#FFF1F2` | Kotak notis bahaya |

---

## 3. Tipografi

**Fon:** Plus Jakarta Sans  
**Sumber:** Google Fonts — `https://fonts.google.com/specimen/Plus+Jakarta+Sans`  
**Berat yang dimuatkan:** 400, 500, 600, 700

```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### 3.1 Skala Saiz

| Peranan | Saiz | Berat | Penggunaan |
|---|---|---|---|
| H1 — Tajuk Halaman | 24px | 700 | Tajuk halaman utama |
| H2 — Tajuk Kad | 16px | 700 | Tajuk topbar, tajuk utama kad |
| H3 — Tajuk Bahagian | 14px | 700 | Tajuk kad dalaman, tajuk bahagian |
| Body | 14px | 400 | Teks jadual, kandungan utama |
| Body Strong | 14px | 600 | Nama, nilai penting |
| Caption | 12px | 500 | Label borang, teks sub, metadata |
| Micro | 11px | 600 | Header jadual, label badge, label tab |
| Widget Value | 28px | 700 | Nilai nombor pada widget dashboard |

### 3.2 Peraturan Tipografi

- Semua teks dalam Bahasa Melayu (kecuali nama teknikal: PDF, WhatsApp, PWA)
- Baris tajuk jadual: HURUF BESAR, `11px`, `font-weight: 600`, `letter-spacing: 0.05em`
- Format wang: `RM 70.00` (ada ruang antara RM dan nilai)
- Format tarikh: `DD/MM/YYYY` (contoh: `27/06/2026`)
- Format telefon: `01X-XXX XXXX` (contoh: `019-572 7276`)
- Nombor resit: `CFK-YYYY-NNNNN` (contoh: `CFK-2026-00001`)

---

## 4. Grid & Susun Atur

### 4.1 Struktur Halaman Admin (Desktop)

```
┌─────────────────────────────────────────────────────────┐
│ CONTROL BAR (hanya dalam mockup — tidak ada di produk)  │
├────────────┬────────────────────────────────────────────┤
│            │  TOPBAR (height: 56px, sticky)             │
│  SIDEBAR   ├────────────────────────────────────────────┤
│  220px     │                                            │
│  fixed     │  PAGE CONTENT (padding: 24px)              │
│            │                                            │
│            │                                            │
└────────────┴────────────────────────────────────────────┘
```

| Elemen | Spesifikasi |
|---|---|
| Lebar sidebar | `220px` (tetap, tidak kolaps) |
| Tinggi topbar | `56px` |
| Padding kandungan | `24px` semua sisi |
| Jurang grid | `16px` |
| Grid widget | `repeat(4, 1fr)` |

### 4.2 Struktur Halaman Jurulatih (Mobile PWA)

```
┌─────────────────────┐
│  TOPBAR (primary)   │  Sticky, latar --primary
├─────────────────────┤
│  FILTER / CHIPS     │  Horizontal scroll
├─────────────────────┤
│                     │
│  CONTENT AREA       │  Scroll bebas
│                     │
│                     │
├─────────────────────┤
│  SAVE BAR           │  Sticky bottom (jika ada)
├─────────────────────┤
│  BOTTOM TAB BAR     │  Fixed, latar --primary, 4 tab
└─────────────────────┘
```

| Elemen | Spesifikasi |
|---|---|
| Lebar maksimum | `390px` (berpusat pada skrin lebih lebar) |
| Tinggi tab bar | `~70px` |
| Padding kandungan mobile | `16px` sisi |

### 4.3 Saiz Skrin (Breakpoints)

| Nama | Lebar | Paparan |
|---|---|---|
| Mobile | `< 640px` | Paparan Jurulatih (PWA) |
| Tablet | `640px – 1024px` | Sidebar kolaps (ikon sahaja) |
| Desktop | `> 1024px` | Paparan Admin penuh |

---

## 5. Komponen UI

### 5.1 Reka Bentuk Moden — Prinsip Utama

- **Sudut bulat besar:** Semua kad dan komponen menggunakan `border-radius: 20px`
- **Sidebar bulat kanan:** `border-radius: 0 24px 24px 0`
- **Item nav bulat:** `border-radius: 12px`, margin `2px 8px` dalam sidebar
- **Bayang kad:** `box-shadow: 0 0 0 1px var(--border)` (garis sempadan sahaja, tiada bayang)
- **Ruang putih:** Padding lebih luas antara elemen
- **Butang bulat:** `border-radius: 12px` untuk semua butang

### 5.2 Kad (Card)

```css
.card {
  background: var(--card);                    /* #FFFFFF */
  border: 1px solid var(--border);            /* #E2E8F0 */
  border-radius: 20px;                        /* Moden */
  box-shadow: 0 0 0 1px var(--border);
  overflow: hidden;
}
.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-body {
  padding: 20px;
}
```

### 5.3 Butang (Button)

| Kelas | Latar | Teks | Penggunaan |
|---|---|---|---|
| `btn-primary` | `#1E293B` | `#FFFFFF` | Tindakan utama sekunder |
| `btn-accent` | `#84CC16` | `#1E293B` | CTA utama (Simpan, Jana, Import) |
| `btn-outline` | Telus | `#0F172A` | Tindakan neutral |
| `btn-ghost` | Telus | `#64748B` | Tindakan minor (pautan jadual) |
| `btn-danger` | `#EF4444` | `#FFFFFF` | Batal, padam, tindakan bahaya |

```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 12px;            /* Moden */
  border: none;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.btn-sm { padding: 5px 12px; font-size: 12px; }
```

**Peraturan butang:**
- Label butang = tindakan yang berlaku (bukan "OK" atau "Ya")
- CTA utama halaman = `btn-accent` (satu sahaja per halaman)
- Butang berbahaya = `btn-danger`, mesti ada modal pengesahan dahulu

### 5.4 Badge / Tag Status

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 20px;            /* pil sepenuhnya */
  font-size: 11px;
  font-weight: 600;
}
```

Semua badge mengandungi titik warna (`●`) sebelum teks sebagai petunjuk visual tambahan.

### 5.5 Input & Borang

```css
.form-control {
  width: 100%;
  padding: 9px 12px;
  border: 1.5px solid var(--border);          /* #E2E8F0 */
  border-radius: 12px;                         /* Moden */
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13.5px;
  color: var(--text);
  background: var(--card);
  transition: border-color 0.15s;
  outline: none;
}
.form-control:focus {
  border-color: var(--accent);                 /* #84CC16 */
}
```

**Label borang:**
- Saiz: `12px`, berat: `600`, warna: `var(--text-muted)`
- Huruf besar: `letter-spacing: 0.03em`
- Medan wajib: asterisk merah `*` selepas label
- Ralat: sempadan merah `#EF4444`, mesej ralat `12px` merah di bawah input

### 5.6 Jadual (Table)

```css
.table { width: 100%; border-collapse: collapse; }
.table th {
  background: #F8FAFC;
  padding: 10px 14px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border);
}
.table td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
  font-size: 13.5px;
}
.table tr:hover td { background: #F8FAFC; }
```

- Header jadual: sticky (`position: sticky; top: 56px`) pada halaman panjang
- Nama dalam sel: `font-weight: 600`, baris sub: `font-size: 12px`, warna muted
- Penomboran halaman: di bawah jadual, butang nombor halaman gaya Moden

### 5.7 Sidebar Admin

```css
.sidebar {
  width: 220px;
  background: var(--primary);                  /* #1E293B */
  border-radius: 0 24px 24px 0;               /* Moden */
  min-height: 100vh;
  position: fixed;
  left: 0; top: 0;
  display: flex;
  flex-direction: column;
}
.sidebar-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 16px;
  border-radius: 12px;                         /* Moden */
  margin: 2px 8px;                             /* Moden — margin dalam sidebar */
  color: var(--sidebar-text);                  /* #CBD5E1 */
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}
.sidebar-nav-item:hover {
  background: rgba(255, 255, 255, 0.06);
}
.sidebar-nav-item.active {
  background: var(--sidebar-active-bg);        /* #84CC16 */
  color: var(--sidebar-active-text);           /* #1E293B */
  font-weight: 600;
}
```

**Struktur sidebar:**
1. Logo CFK HUB (ikon + teks)
2. Label bahagian (UTAMA, KEWANGAN, SISTEM) — `10px`, `font-weight: 600`, huruf besar
3. Item navigasi (ikon + label)
4. Footer — avatar + nama + role pengguna

**8 modul navigasi Admin:**
1. Dashboard (`📊`)
2. Pelajar (`👨‍🎓`)
3. Kehadiran (`✅`)
4. Bayaran & Resit (`💰`)
5. Laporan (`📈`)
6. Kewangan (`💸`)
7. Aset (`🗂️`)
8. Makluman (`📢`)
9. Tetapan (`⚙️`) — di bawah label SISTEM

### 5.8 Bottom Tab Bar (Jurulatih Mobile)

```css
.tab-bar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: var(--primary);                  /* #1E293B */
  display: flex;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  height: 70px;
}
.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--sidebar-muted);                 /* #64748B */
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
}
.tab-item.active { color: var(--accent); }     /* #84CC16 */
```

**4 tab Jurulatih:**
1. Kehadiran (`✅`) — tab lalai
2. Pelajar (`👨‍🎓`)
3. Makluman (`📢`)
4. Dashboard (`📊`)

### 5.9 Modal

```css
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal {
  background: var(--card);
  border-radius: 20px;                         /* Moden */
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}
.modal-header { padding: 20px 24px 16px; border-bottom: 1px solid var(--border); }
.modal-body { padding: 20px 24px; }
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
```

**Kandungan wajib modal tindakan berbahaya:**
1. Tajuk (tindakan yang akan berlaku)
2. Subjudul (ID rekod + ringkasan)
3. Kotak amaran oren — penerangan kesan
4. Medan sebab (wajib, textarea)
5. Footer: butang `Kembali` (kiri) + butang bahaya (kanan)

### 5.10 Wizard / Stepper (Borang Panjang)

Digunakan apabila borang mengandungi lebih daripada 4 medan.

**Bilangan langkah:**
- Tambah Pelajar: 3 langkah (Maklumat Pelajar → Maklumat Ibu Bapa → Semak & Sahkan)
- Rekod Bayaran: 2 langkah (Pilih Pelajar → Pilih Jenis & Jumlah)
- Rekod Perbelanjaan: 2 langkah (Butiran Perbelanjaan → Lampiran & Sahkan)

**Spesifikasi stepper:**

| Keadaan | Gaya Lingkaran | Garis |
|---|---|---|
| Selesai (`done`) | Latar `#84CC16`, teks `#1E293B`, ✓ | Latar `#84CC16` |
| Semasa (`active`) | Sempadan `#84CC16`, teks `#84CC16` | Latar `#E2E8F0` |
| Akan datang | Sempadan `#E2E8F0`, teks muted | Latar `#E2E8F0` |

### 5.11 Widget Dashboard

```css
.widget {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 20px;                         /* Moden */
  padding: 20px;
  cursor: pointer;
  transition: box-shadow 0.15s;
}
.widget:hover {
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
}
```

**4 widget Dashboard Admin:**
1. Pelajar Belum Bayar — nilai merah, klik ke senarai belum bayar
2. Hadir Hari Ini — nilai normal
3. Pendapatan Bulan Ini — nilai aksen gelap
4. Jumlah Pelajar Aktif — nilai normal

### 5.12 Chip / Filter Tag (Mobile)

```css
.chip {
  padding: 5px 14px;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  background: var(--card);
  color: var(--text-muted);
  white-space: nowrap;
}
.chip.active {
  background: var(--accent);                   /* #84CC16 */
  border-color: var(--accent);
  color: var(--accent-text);                   /* #1E293B */
  font-weight: 600;
}
```

---

## 6. Keadaan Kosong (Empty States)

Setiap senarai atau jadual mesti ada paparan keadaan kosong.

| Situasi | Teks |
|---|---|
| Tiada pelajar | "Tiada pelajar. Tambah pelajar baharu atau import dari Google Forms." |
| Tiada kehadiran | "Tiada rekod kehadiran untuk tarikh ini." |
| Tiada resit | "Tiada resit dijumpai. Cuba ubah penapis carian." |
| Tiada perbelanjaan | "Tiada rekod perbelanjaan untuk tempoh ini." |
| Tiada aset | "Tiada aset berdaftar." |
| Tiada makluman | "Tiada makluman untuk dihantar." |

**Gaya empty state:**
- Ikon SVG atau emoji besar (40–48px), warna `var(--text-muted)`
- Teks penerangan: `14px`, warna `var(--text-muted)`
- Butang tindakan (jika berkaitan): `btn-accent btn-sm`

---

## 7. Topbar Halaman Admin

```css
.topbar {
  background: var(--card);
  border-bottom: 1px solid var(--border);
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 50;
}
```

**Kiri:** Tajuk halaman (`16px`, `700`) + breadcrumb atau keterangan (`12px`, muted)  
**Kanan:** Butang tindakan halaman (maksimum 2 butang) + badge amaran (jika ada)

---

## 8. Kotak Notis (Notice Box)

| Jenis | Latar | Sempadan | Teks |
|---|---|---|---|
| Amaran | `#FFFBEB` | `#FDE68A` | `#92400E` |
| Bahaya | `#FFF1F2` | `#FECACA` | `#9F1239` |
| Info | `#EFF6FF` | `#BFDBFE` | `#1E40AF` |
| Berjaya | `#F0FDF4` | `#BBF7D0` | `#166534` |

```css
.notice {
  border-radius: 8px;                          /* Lebih kecil daripada kad */
  padding: 12px 14px;
  font-size: 12px;
  margin-bottom: 16px;
}
```

---

## 9. Topbar Mobile (Jurulatih)

```css
.mobile-topbar {
  background: var(--primary);                  /* #1E293B */
  padding: 16px;
  color: white;
  position: sticky;
  top: 0;
  z-index: 50;
}
.mobile-topbar-title { font-size: 17px; font-weight: 700; }
.mobile-topbar-sub { font-size: 12px; color: var(--sidebar-text); margin-top: 4px; }
```

---

## 10. Animasi & Peralihan

| Elemen | Animasi | Tempoh |
|---|---|---|
| Hover butang | `opacity: 0.9` atau warna berubah | `0.15s ease` |
| Hover baris jadual | Latar berubah ke `#F8FAFC` | `0.1s ease` |
| Hover widget | Bayang muncul | `0.15s ease` |
| Buka modal | Fade-in overlay + slide-up kad | `0.2s ease` |
| Tukar tab mobile | Warna ikon berubah | `0.15s ease` |
| Toggle kehadiran | Warna latar berubah | `0.15s ease` |

Prinsip: animasi halus, bukan mengganggu. Tiada animasi yang melebihi `300ms`.

---

## 11. Ikon

Gunakan emoji Unicode sebagai ikon untuk prototaip dan MVP:

| Fungsi | Ikon |
|---|---|
| Dashboard | `📊` |
| Pelajar | `👨‍🎓` |
| Kehadiran | `✅` |
| Bayaran / Resit | `💰` |
| Laporan | `📈` |
| Kewangan | `💸` |
| Aset | `🗂️` |
| Makluman | `📢` |
| Tetapan | `⚙️` |
| Carian | `🔍` |
| WhatsApp | `📱` |
| PDF / Muat turun | `↓` |
| Periksa / Berjaya | `✓` |
| Tutup / Hapus | `✕` |
| Amaran | `⚠️` |
| Catur (logo) | `♟` |

**Nota pembangunan:** Boleh gantikan dengan perpustakaan ikon SVG (contoh: Heroicons, Lucide) selepas MVP.

---

## 12. Logo & Jenama

| Elemen | Spesifikasi |
|---|---|
| Ikon aplikasi | `♟` (bidak catur hitam) |
| Warna ikon kotak | `#84CC16` (Lime) |
| Radius kotak ikon | `8px` (kecil) / `14px` (log masuk) |
| Nama sistem | **CFK HUB** |
| Tagline | *Sistem Pengurusan Chess For Kids* |
| Nama pentadbir | Ditunjuk di sidebar footer |

---

## 13. Skrin & Modal Dalam Skop

Rujuk `screen-inventory.md` untuk senarai penuh. Ringkasan:

| Fasa | Skrin | Diutamakan |
|---|---|---|
| Fasa 1 (30 Jun) | S-01 Log Masuk, S-02 Dashboard Admin, S-03 Pelajar, S-04–06 Tambah/Edit/Profil, S-08–10 Kehadiran, S-16–17 Bayaran/Resit, M-01–03 modal asas | Kritikal |
| Fasa 2 (7 Jul) | S-07 Pelajar Tidak Aktif, S-11–13 Laporan, S-18 Makluman, S-19 Jurulatih mobile, M-04–05 modal lanjutan | Penting |
| Fasa 3 (14 Jul) | S-14–15 Kewangan, S-20–23 Aset & Tetapan, P-01–02 panel | Tambahan |

---

## 14. Senarai Semak Pembangunan

### Wajib untuk setiap halaman:
- [ ] Keadaan kosong (empty state) jika senarai kosong
- [ ] Keadaan muatan (loading state) — skeleton atau spinner
- [ ] Mesej ralat jika API gagal
- [ ] Responsif — berfungsi pada 390px dan 1440px

### Wajib untuk setiap borang:
- [ ] Validasi medan wajib sebelum hantar
- [ ] Mesej ralat per medan (bukan popup global sahaja)
- [ ] Butang hantar dilumpuhkan semasa muatan
- [ ] Borang >4 medan: gunakan stepper

### Wajib untuk setiap modal tindakan berbahaya:
- [ ] Kotak amaran oren/merah
- [ ] Medan sebab (wajib, textarea)
- [ ] Butang "Kembali" untuk batalkan
- [ ] Label butang berbahaya = tindakan spesifik

---

*Dokumen ini digunakan bersama: screen-inventory.md, tone-and-voice-guide.md, dan semua rekod DD-001 hingga DD-010.*  
*Versi seterusnya akan dikemas kini semasa pembangunan Episode 06 (Technical Decisions).*
