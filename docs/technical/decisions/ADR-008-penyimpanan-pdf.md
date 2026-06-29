# ADR-008: Di mana fail PDF resit disimpan?

## Status
Diputuskan

## Konteks
Setiap resit boleh dimuat turun sebagai PDF. Perlu tentukan sama ada PDF disimpan dalam storage atau dijana semula setiap kali diperlukan.

## Keputusan
**Jana PDF on-demand (tidak disimpan)** — PDF dijana semula di browser setiap kali Admin klik "↓ PDF"

## Butiran Teknikal

### Cara Kerja
```
Admin klik "↓ PDF" pada resit CFK-2026-00042
         ↓
Next.js ambil data resit dari Supabase (berdasarkan ID)
         ↓
@react-pdf/renderer jana PDF dari data tersebut
         ↓
Browser muat turun fail: "Resit-CFK-2026-00042.pdf"
```

### Data Yang Diperlukan untuk Jana PDF
```typescript
interface ResitData {
  nombor_resit: string;        // CFK-2026-00042
  nama_pelajar: string;
  cawangan_daftar: string;
  jenis_bayaran: string;       // Kumpulan / Personal / Pendaftaran
  bulan_bayaran: string;       // Jun 2026
  jumlah: number;              // 70.00
  kaedah_bayaran: string;      // Tunai / Transfer
  tarikh_bayar: string;        // 27/06/2026
  nama_admin: string;          // Khatib
}
```

Data ini sedia ada dalam pangkalan data — tiada maklumat tambahan diperlukan.

## Perbandingan Pilihan

| | Jana On-demand | Simpan dalam Storage |
|---|---|---|
| Kos | RM 0 | RM 0 (Supabase free 1GB) |
| Kompleksiti | Rendah | Sederhana |
| Masa jana PDF | ~1 saat | Segera |
| Ruang storage | 0 MB | ~50KB per resit |
| Konsistensi | Sentiasa terkini | Mungkin lapuk jika data dikemas kini |
| **Cadangan** | **✅ Pilih ini** | Tidak perlu |

## Sebab
1. Lebih mudah — tiada logik simpan/ambil fail diperlukan
2. PDF sentiasa mencerminkan data terkini dalam DB
3. Tiada kos storage
4. Resit CFK tidak perlu dicache (pengguna jarang muat turun resit sama berkali-kali)
5. 1 saat tunggu jana PDF adalah boleh diterima

## Pengecualian
Jika pada masa hadapan CFK perlu hantar resit melalui e-mel atau WhatsApp sebagai lampiran, maka PDF perlu disimpan sementara. Ini akan dikaji semula dalam Fasa 3.

## Kesan
- Tiada jadual atau bucket storage untuk PDF
- Setiap resit dalam DB boleh dijana sebagai PDF pada bila-bila masa
- Resit yang dibatalkan (`status: Dibatalkan`) masih boleh dijana sebagai PDF dengan tanda air "DIBATALKAN"
