-- ============================================================
-- CFK HUB — Tambah kolum alamat pelajar
-- Paste dalam Supabase SQL Editor dan Run SEBELUM deploy kod
-- yang menggunakan medan alamat. Selamat dijalankan berulang kali.
-- ============================================================

ALTER TABLE pelajar ADD COLUMN IF NOT EXISTS alamat TEXT;
