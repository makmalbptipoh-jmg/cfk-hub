-- ============================================================
-- CFK HUB — SQL Index untuk Kelajuan Query
-- Paste keseluruhan fail ini dalam Supabase SQL Editor dan Run.
-- Selamat dijalankan berulang kali (IF NOT EXISTS).
-- ============================================================

-- PELAJAR
-- Senarai pelajar ditapis ikut status + cawangan (S-03, dashboard)
CREATE INDEX IF NOT EXISTS idx_pelajar_status ON pelajar (status);
CREATE INDEX IF NOT EXISTS idx_pelajar_cawangan ON pelajar (cawangan_daftar_id, status);

-- KEHADIRAN
-- Profil pelajar (tab kehadiran) + laporan bulanan per pelajar
CREATE INDEX IF NOT EXISTS idx_kehadiran_pelajar_tarikh ON kehadiran (pelajar_id, tarikh DESC);
-- Rekod/semak kehadiran ikut sesi cawangan + tarikh (S-07, S-08)
CREATE INDEX IF NOT EXISTS idx_kehadiran_sesi_tarikh ON kehadiran (cawangan_sesi_id, tarikh);
-- Dashboard "Hadir Hari Ini" (kiraan ikut tarikh + status)
CREATE INDEX IF NOT EXISTS idx_kehadiran_tarikh_status ON kehadiran (tarikh, status);

-- RESIT
-- Profil pelajar (tab bayaran) + semakan "belum bayar"
CREATE INDEX IF NOT EXISTS idx_resit_pelajar ON resit (pelajar_id, tahun_bayaran, bulan_bayaran);
-- Senarai resit + laporan kewangan ikut bulan/tahun (S-11, S-20)
CREATE INDEX IF NOT EXISTS idx_resit_bulan_tahun ON resit (tahun_bayaran, bulan_bayaran, status);
-- Resit terkini di dashboard (susunan tarikh)
CREATE INDEX IF NOT EXISTS idx_resit_tarikh_bayar ON resit (tarikh_bayar DESC);

-- KEHADIRAN JURULATIH
-- Sesi jurulatih per bulan (S-27) + kiraan bayaran
CREATE INDEX IF NOT EXISTS idx_kehadiran_jurulatih ON kehadiran_jurulatih (jurulatih_id, tarikh DESC);

-- BAYARAN JURULATIH
-- Sejarah bayaran jurulatih (S-28)
CREATE INDEX IF NOT EXISTS idx_bayaran_jurulatih ON bayaran_jurulatih (jurulatih_id, tahun_bayaran, bulan_bayaran);

-- KEWANGAN PERBELANJAAN
-- Penapis bulan + kategori + cawangan (S-14, S-15, S-20)
CREATE INDEX IF NOT EXISTS idx_perbelanjaan_tarikh ON kewangan_perbelanjaan (tarikh DESC);
CREATE INDEX IF NOT EXISTS idx_perbelanjaan_cawangan ON kewangan_perbelanjaan (cawangan_id);

-- ASET
-- Penapis status/kategori/cawangan (S-18)
CREATE INDEX IF NOT EXISTS idx_aset_status ON aset (status);
CREATE INDEX IF NOT EXISTS idx_aset_cawangan ON aset (cawangan_id);

-- IMPORT ANTRIAN
-- Skrin import menapis ikut status Menunggu (S-09)
CREATE INDEX IF NOT EXISTS idx_import_antrian_status ON import_antrian (status);
