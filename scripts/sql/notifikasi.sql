-- ============================================================
-- CFK HUB — Notifikasi (loceng amaran operasi + sejarah)
-- Paste dalam Supabase SQL Editor dan Run SEBELUM deploy kod
-- yang menggunakan jadual ini. Selamat dijalankan berulang kali.
-- ============================================================

CREATE TABLE IF NOT EXISTS notifikasi (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  jenis TEXT NOT NULL,                 -- cth: 'belum_bayar'
  tajuk TEXT NOT NULL,
  mesej TEXT NOT NULL,
  pautan TEXT,                         -- URL dalam app untuk tindakan
  kunci TEXT UNIQUE,                   -- kunci nyahduplikat, cth 'belum_bayar:<pelajar>:2026-07'
  rujukan_id UUID,                     -- id entiti berkaitan (cth pelajar) untuk auto-selesai
  dibaca BOOLEAN NOT NULL DEFAULT FALSE,
  dibaca_pada TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifikasi_dibaca ON notifikasi (dibaca, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifikasi_jenis ON notifikasi (jenis);

ALTER TABLE notifikasi ENABLE ROW LEVEL SECURITY;

-- Admin sahaja (guna fungsi is_admin sedia ada)
DROP POLICY IF EXISTS "admin_all_notifikasi" ON notifikasi;
CREATE POLICY "admin_all_notifikasi" ON notifikasi
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));
