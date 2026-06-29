# ADR-005: Bagaimana PDF resit dijana?

## Status
Diputuskan

## Konteks
CFK HUB perlu jana resit PDF dengan nombor auto `CFK-YYYY-NNNNN` yang boleh dimuat turun atau dicetak. Resit perlu kelihatan profesional dan mengandungi maklumat lengkap transaksi.

## Keputusan
**@react-pdf/renderer** — jana PDF menggunakan komponen React, pada sisi klien (client-side)

## Butiran Teknikal

### Cara Kerja
```
Admin klik "Jana Resit" / "↓ PDF"
         ↓
Next.js jana komponen React PDF
         ↓
@react-pdf/renderer render jadi PDF blob
         ↓
Browser auto-muat turun fail PDF
         (atau buka dalam tab baharu)
```

### Kandungan Resit PDF
| Bahagian | Maklumat |
|---|---|
| Header | Logo CFK + "Chess For Kids" + "RESIT RASMI" |
| Nombor Resit | CFK-2026-00001 (auto-generate) |
| Maklumat Pelajar | Nama, cawangan daftar |
| Maklumat Bayaran | Jenis, bulan, jumlah (RM) |
| Maklumat Pembayaran | Kaedah (tunai/transfer), tarikh |
| Footer | "Terima kasih" + nombor akaun bank CFK |

### Nombor Resit Auto-Generate
```sql
-- Supabase sequence untuk nombor resit
CREATE SEQUENCE resit_seq START 1;

-- Fungsi untuk jana nombor resit
CREATE OR REPLACE FUNCTION jana_nombor_resit()
RETURNS TEXT AS $$
BEGIN
  RETURN 'CFK-' || EXTRACT(YEAR FROM NOW()) || '-' ||
         LPAD(nextval('resit_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;
```

### Contoh Kod Komponen
```tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

export const ResitPDF = ({ resit }: { resit: ResitData }) => (
  <Document>
    <Page size="A5" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>RESIT RASMI</Text>
        <Text style={styles.subtitle}>Chess For Kids (CFK)</Text>
      </View>
      <View style={styles.body}>
        <Text>No. Resit: {resit.nombor_resit}</Text>
        <Text>Nama Pelajar: {resit.nama_pelajar}</Text>
        <Text>Cawangan: {resit.cawangan}</Text>
        <Text>Jenis Bayaran: {resit.jenis}</Text>
        <Text>Jumlah: RM {resit.jumlah.toFixed(2)}</Text>
        <Text>Tarikh: {resit.tarikh}</Text>
      </View>
    </Page>
  </Document>
);
```

## Penyimpanan PDF (ADR-008)
PDF **tidak disimpan** dalam storage. Ia dijana semula bila diperlukan berdasarkan data dalam pangkalan data.

**Sebab:** Data resit kekal dalam DB. Jana semula PDF bila-bila masa = lebih mudah, tiada kos storage.

## Sebab
1. Percuma dan open source
2. Berjalan sepenuhnya di browser — tiada server function diperlukan
3. Menggunakan konsep React yang sudah diketahui pembangun
4. Ukuran bundle kecil (~150KB)
5. Menyokong Bahasa Melayu dan format wang RM

## Kesan
- Pasang: `npm install @react-pdf/renderer`
- Komponen `<ResitPDF />` disimpan dalam `/src/components/pdf/`
- Gunakan `<PDFDownloadLink>` untuk butang muat turun
- Resit tidak disimpan dalam Supabase Storage — dijana on-demand
