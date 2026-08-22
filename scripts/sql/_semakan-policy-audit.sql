-- ============================================================
-- CFK HUB — SEMAKAN AUDIT: policy RLS yang HILANG di production
-- Read-only. Run di Supabase SQL Editor. 0 baris = semua migrasi manual dah run.
-- Jika ada baris → fail SQL berkaitan tertinggal, run semula fail itu.
-- (Dibina 2026-08-21 dari semua scripts/sql/*.sql — lihat memori
--  sql-migrations-manual-verify-pg-policies)
-- ============================================================
with expected(tbl, pol) as (
  values
    -- batal-kelas.sql
    ('jadual_slot_batal','baca_slot_batal'),('jadual_slot_batal','tulis_admin_slot_batal'),
    -- bayaran-online.sql
    ('permintaan_bayaran','baca'),('permintaan_bayaran','tulis_admin'),
    -- dokumen-jualan.sql
    ('dokumen_jualan','admin_all_dokumen_jualan'),('dokumen_item','admin_all_dokumen_item'),
    -- gaji-advance-tng.sql
    ('advance_jurulatih','admin_all_advance_jurulatih'),
    -- jadual-kelas.sql
    ('jadual_slot','baca_jadual_slot'),('jadual_slot','tulis_admin_jadual_slot'),
    ('aktiviti','baca_aktiviti'),('aktiviti','tulis_admin_aktiviti'),
    -- jurulatih-daftar-pelajar.sql (+ rls-ketat pelajar)
    ('pelajar','baca'),('pelajar','ubah'),('pelajar','tambah_admin_atau_jurulatih'),('pelajar','padam_admin'),
    -- jurulatih-self-service.sql
    ('kehadiran_jurulatih','jurulatih_view_kehadiran_sendiri'),
    ('kehadiran_jurulatih','jurulatih_insert_kehadiran_sendiri'),
    ('kehadiran_jurulatih','jurulatih_update_kehadiran_sendiri'),
    -- log-aktiviti.sql
    ('log_aktiviti','log_aktiviti admin baca'),('log_aktiviti','log_aktiviti log masuk sendiri'),
    -- makluman-histori.sql
    ('makluman_histori','admin_all_makluman_histori'),('makluman_histori','hantar_makluman_sendiri'),
    ('makluman_histori','lihat_makluman_sendiri'),
    -- notifikasi.sql
    ('notifikasi','admin_all_notifikasi'),
    -- pendapatan-lain.sql
    ('pendapatan_lain','admin_all_pendapatan_lain'),
    -- penggredan.sql
    ('gred_kitaran','baca_gred_kitaran'),('gred_kitaran','tulis_admin_gred_kitaran'),
    ('gred_penilaian','baca_gred_penilaian'),('gred_penilaian','tulis_gred_penilaian'),
    ('gred_little_pawn','baca_gred_little_pawn'),('gred_little_pawn','tulis_gred_little_pawn'),
    -- pertandingan.sql (disahkan run 2026-08-21)
    ('pertandingan','baca_pertandingan'),('pertandingan','tulis_pertandingan'),
    ('pertandingan_peserta','baca_pertandingan_peserta'),('pertandingan_peserta','tulis_pertandingan_peserta'),
    ('pertandingan_keputusan','baca_pertandingan_keputusan'),('pertandingan_keputusan','tulis_pertandingan_keputusan'),
    -- progres-pelajar.sql
    ('topik_kategori','baca_topik_kategori'),('topik_kategori','tulis_admin_topik_kategori'),
    ('buku_rujukan','baca_buku_rujukan'),('buku_rujukan','tulis_admin_buku_rujukan'),
    ('pelajar_topik','baca_pelajar_topik'),('pelajar_topik','tulis_admin_pelajar_topik'),
    -- rls-ketat.sql (kehadiran + senarai jadual)
    ('kehadiran','baca'),('kehadiran','tambah'),('kehadiran','ubah'),('kehadiran','padam_admin'),
    ('cawangan','baca'),('cawangan','tulis_admin'),
    ('resit','baca'),('resit','tulis_admin'),
    ('jurulatih','baca'),('jurulatih','tulis_admin'),
    ('bayaran_jurulatih','baca'),('bayaran_jurulatih','tulis_admin'),
    ('kewangan_perbelanjaan','baca'),('kewangan_perbelanjaan','tulis_admin'),
    ('aset','baca'),('aset','tulis_admin'),
    ('import_antrian','baca'),('import_antrian','tulis_admin'),
    -- silibus-*.sql (silibus-jurulatih dibetulkan 2026-08-21)
    ('silibus_progress_pelajar','baca_silibus_progress_pelajar'),
    ('silibus_progress_pelajar','tulis_admin_silibus_progress_pelajar'),
    ('silibus_progress_pelajar','jurulatih_insert_silibus_progress_pelajar'),
    ('silibus_progress_pelajar','jurulatih_update_silibus_progress_pelajar'),
    ('silibus_tajuk','baca_silibus_tajuk'),('silibus_tajuk','tulis_admin_silibus_tajuk'),
    ('silibus_subtajuk','baca_silibus_subtajuk'),('silibus_subtajuk','tulis_admin_silibus_subtajuk'),
    ('silibus_progress','baca_silibus_progress'),('silibus_progress','tulis_admin_silibus_progress'),
    ('silibus','baca_silibus'),('silibus','tulis_admin_silibus'),
    -- storage.objects (tablename = 'objects')
    ('objects','bukti pendapatan baca'),('objects','bukti pendapatan muat naik'),
    ('objects','bukti pendapatan ganti'),('objects','bukti pendapatan padam'),
    ('objects','bahan pengajaran baca'),('objects','bahan pengajaran muat naik'),
    ('objects','bahan pengajaran ganti'),('objects','bahan pengajaran padam'),
    ('objects','bukti perbelanjaan baca'),('objects','bukti perbelanjaan muat naik'),
    ('objects','bukti perbelanjaan ganti'),('objects','bukti perbelanjaan padam'),
    ('objects','gambar jurulatih baca'),('objects','gambar jurulatih muat naik'),
    ('objects','gambar jurulatih ganti'),('objects','gambar jurulatih padam')
)
select e.tbl as jadual, e.pol as policy_hilang
from expected e
left join pg_policies p on p.tablename = e.tbl and p.policyname = e.pol
where p.policyname is null
order by e.tbl, e.pol;
