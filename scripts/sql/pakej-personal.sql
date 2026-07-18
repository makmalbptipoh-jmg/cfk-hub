-- ============================================================
-- CFK HUB — Pakej kelas personal (prabayar 4 kelas)
-- Paste dalam Supabase SQL Editor dan Run SEBELUM deploy kod.
-- Selamat dijalankan berulang kali.
--
-- Pelajar personal bayar TERUS untuk beberapa kelas (default 4).
-- Kolum bil_kelas pada resit merekod bilangan kelas dibeli untuk
-- resit jenis 'Personal'. Baki pakej = jumlah kelas dibeli TOLAK
-- bilangan sesi personal Hadir sejak resit berpakej pertama.
-- Resit lama (bil_kelas NULL) tidak dikira dalam pakej.
-- ============================================================

ALTER TABLE resit ADD COLUMN IF NOT EXISTS bil_kelas SMALLINT CHECK (bil_kelas IS NULL OR bil_kelas > 0);

COMMENT ON COLUMN resit.bil_kelas IS 'Bilangan kelas dibeli (resit jenis Personal sahaja; NULL = resit biasa/lama)';
