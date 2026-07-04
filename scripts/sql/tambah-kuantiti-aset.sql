-- ============================================================
-- CFK HUB — Tambah kuantiti unit & harga seunit pada aset
-- Paste dalam Supabase SQL Editor dan Run SEBELUM deploy kod.
-- nilai_asal kekal sebagai JUMLAH keseluruhan (kuantiti × harga seunit).
-- Aset sedia ada: kuantiti = 1, harga seunit = nilai asal.
-- Selamat dijalankan berulang kali.
-- ============================================================

ALTER TABLE aset ADD COLUMN IF NOT EXISTS kuantiti INTEGER NOT NULL DEFAULT 1;
ALTER TABLE aset ADD COLUMN IF NOT EXISTS harga_seunit NUMERIC(10,2);

UPDATE aset SET harga_seunit = nilai_asal WHERE harga_seunit IS NULL;
