-- ============================================================
-- CFK HUB — Bukti perbelanjaan (upload resit)
-- Paste dalam Supabase SQL Editor dan Run SEBELUM deploy kod
-- yang menggunakan medan bukti. Selamat dijalankan berulang kali.
-- ============================================================

-- 1) Kolum path fail bukti dalam rekod perbelanjaan
ALTER TABLE kewangan_perbelanjaan ADD COLUMN IF NOT EXISTS bukti_path TEXT;

-- 2) Bucket storan peribadi untuk fail bukti (imej/PDF)
INSERT INTO storage.buckets (id, name, public)
VALUES ('bukti-perbelanjaan', 'bukti-perbelanjaan', false)
ON CONFLICT (id) DO NOTHING;

-- 3) Polisi akses: semua pengguna log masuk boleh baca/muat naik/ganti/padam
DROP POLICY IF EXISTS "bukti perbelanjaan baca" ON storage.objects;
CREATE POLICY "bukti perbelanjaan baca"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'bukti-perbelanjaan');

DROP POLICY IF EXISTS "bukti perbelanjaan muat naik" ON storage.objects;
CREATE POLICY "bukti perbelanjaan muat naik"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'bukti-perbelanjaan');

DROP POLICY IF EXISTS "bukti perbelanjaan ganti" ON storage.objects;
CREATE POLICY "bukti perbelanjaan ganti"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'bukti-perbelanjaan')
  WITH CHECK (bucket_id = 'bukti-perbelanjaan');

DROP POLICY IF EXISTS "bukti perbelanjaan padam" ON storage.objects;
CREATE POLICY "bukti perbelanjaan padam"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'bukti-perbelanjaan');
