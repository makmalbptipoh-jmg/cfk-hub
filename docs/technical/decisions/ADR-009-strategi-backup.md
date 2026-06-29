# ADR-009: Bagaimana strategi backup data dilaksanakan?

## Status
Diputuskan

## Konteks
CFK HUB menyimpan data kewangan, resit, dan kehadiran yang perlu disimpan selama 7 tahun (pematuhan LHDN). Kehilangan data adalah risiko operasi yang serius. Supabase tier percuma tidak menyertakan backup automatik harian.

## Keputusan
**Eksport manual bulanan + GitHub Actions pg_dump mingguan**

Pendekatan dua lapisan:
1. **Backup automatik mingguan** via GitHub Actions → simpan dalam repositori peribadi
2. **Eksport manual bulanan** oleh Admin → simpan dalam Google Drive CFK

## Butiran Teknikal

### Lapisan 1: Backup Automatik Mingguan (GitHub Actions)

```yaml
# .github/workflows/backup.yml
name: Weekly Database Backup

on:
  schedule:
    - cron: '0 2 * * 0'  # Setiap Ahad 2:00 PG UTC (10:00 PG MYT)
  workflow_dispatch:       # Boleh trigger manual

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Backup Supabase Database
        run: |
          PGPASSWORD=${{ secrets.SUPABASE_DB_PASSWORD }} \
          pg_dump -h ${{ secrets.SUPABASE_DB_HOST }} \
                  -U postgres \
                  -d postgres \
                  -f backup-$(date +%Y%m%d).sql

      - name: Upload to GitHub Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: cfkhub-backup-${{ github.run_id }}
          path: backup-*.sql
          retention-days: 90  # Simpan 90 hari
```

### Lapisan 2: Eksport Manual Bulanan (Admin)

Admin boleh eksport data dari Supabase Dashboard setiap bulan:
1. Log masuk Supabase Dashboard
2. Pergi ke **Database → Backups** (atau guna Table Editor → Export CSV)
3. Muat turun fail SQL atau CSV
4. Simpan dalam folder Google Drive: `CFK HUB / Backup / 2026 / Jun`

### Apa Yang Di-backup
| Data | Kepentingan | Dalam Backup |
|---|---|---|
| Rekod pelajar | Kritikal | ✅ |
| Rekod kehadiran | Kritikal | ✅ |
| Resit & bayaran | Kritikal (LHDN 7 tahun) | ✅ |
| Rekod kewangan | Kritikal | ✅ |
| Rekod jurulatih | Penting | ✅ |
| Data aset | Penting | ✅ |
| Akaun pengguna | Sederhana | ✅ |
| PDF resit | Tidak perlu | ❌ (jana semula dari data) |

### Prosedur Pemulihan (Recovery)
Jika berlaku kehilangan data:
1. Dapatkan fail SQL backup terkini dari GitHub Actions artifacts
2. Buat projek Supabase baharu
3. Jalankan: `psql -h [new-host] -U postgres -d postgres -f backup-YYYYMMDD.sql`
4. Kemas kini `SUPABASE_URL` dan keys dalam Vercel

## Pelan Peningkatan
Jika CFK berkembang dan data bertambah penting:
- Naik taraf ke **Supabase Pro** ($25/bulan = ~RM 115) untuk backup harian automatik + point-in-time recovery
- Ini boleh dipertimbangkan setelah sistem stabil dan CFK ada lebih ramai pelajar

## Sebab
1. Backup mingguan lebih dari cukup untuk sistem yang dikemas kini harian
2. GitHub Actions percuma (2,000 minit/bulan — backup mengambil < 2 minit)
3. Dua lapisan backup (automatik + manual) memastikan redundansi
4. Prosedur pemulihan mudah diikuti oleh pembangun

## Kesan
- Pembangun perlu konfigurasi GitHub Actions dan simpan kunci DB sebagai secrets
- Admin perlu ingat eksport manual setiap bulan (boleh set peringatan Google Calendar)
- Fail backup SQL disimpan dalam repositori peribadi (bukan repositori kod utama)
