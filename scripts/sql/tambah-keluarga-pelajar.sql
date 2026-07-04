-- ============================================================
-- CFK HUB — Kaitan adik-beradik (PD-008)
-- Pelajar yang berkongsi keluarga_id yang sama = adik-beradik.
-- Paste dalam Supabase SQL Editor dan Run SEBELUM deploy kod.
-- Selamat dijalankan berulang kali.
-- ============================================================

ALTER TABLE pelajar ADD COLUMN IF NOT EXISTS keluarga_id UUID;
CREATE INDEX IF NOT EXISTS idx_pelajar_keluarga ON pelajar (keluarga_id) WHERE keluarga_id IS NOT NULL;
