# DD-004: Apakah jenis navigasi utama untuk Admin?

## Status
Diputuskan

## Soalan
Bagaimana Admin menavigasi antara modul-modul dalam CFK HUB di desktop?

## Keputusan
**Sidebar Menegak (Vertical Sidebar)** — kekal tersedia di sebelah kiri pada semua halaman Admin.

### Spesifikasi Sidebar

| Ciri | Nilai |
|---|---|
| Lebar | 240px (desktop) / boleh runtuh ke 64px (ikon sahaja) |
| Latar | Charcoal `#1E293B` |
| Teks item | Soft Gray `#F1F5F9` |
| Item aktif | Latar Lime `#84CC16`, Teks Charcoal `#1E293B` |
| Ikon | Lucide Icons (outline, 20px) |

### Susunan Item Sidebar

```
[Logo CFK HUB]
[Nama Admin]
──────────────
📊  Dashboard
👨‍🎓  Pelajar
✅  Kehadiran
💰  Bayaran & Resit
📈  Laporan
💸  Kewangan
🗂️  Aset
📢  Makluman
──────────────
⚙️  Tetapan
[Keluar]
```

## Sebab
Sidebar menegak adalah pilihan terbaik untuk sistem dengan 8+ modul. Pengguna dapat lihat semua navigasi sekaligus tanpa tindakan tambahan (berbeza dengan hamburger menu). Sesuai untuk Admin yang bekerja di desktop dengan skrin lebar dan perlu beralih antara modul dengan kerap.

## Kesan
- Layout Admin: [Sidebar 240px] + [Kawasan Kandungan]
- Pada skrin < 1024px, sidebar boleh runtuh atau disorokkan
- Breadcrumb ditambah di bahagian atas kandungan untuk orientasi pengguna
