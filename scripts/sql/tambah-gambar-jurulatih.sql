-- ============================================================
-- CFK HUB — Gambar profil jurulatih
-- Paste dalam Supabase SQL Editor dan Run SEBELUM deploy kod
-- yang menggunakan medan gambar. Selamat dijalankan berulang kali.
-- ============================================================

-- 1) Kolum path gambar dalam profil jurulatih
ALTER TABLE jurulatih ADD COLUMN IF NOT EXISTS gambar_path TEXT;

-- 2) Bucket storan peribadi untuk gambar profil
INSERT INTO storage.buckets (id, name, public)
VALUES ('gambar-jurulatih', 'gambar-jurulatih', false)
ON CONFLICT (id) DO NOTHING;

-- 3) Polisi: semua pengguna log masuk boleh LIHAT; admin sahaja urus
DROP POLICY IF EXISTS "gambar jurulatih baca" ON storage.objects;
CREATE POLICY "gambar jurulatih baca"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'gambar-jurulatih');

DROP POLICY IF EXISTS "gambar jurulatih muat naik" ON storage.objects;
CREATE POLICY "gambar jurulatih muat naik"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'gambar-jurulatih' AND is_admin(auth.uid()));

DROP POLICY IF EXISTS "gambar jurulatih ganti" ON storage.objects;
CREATE POLICY "gambar jurulatih ganti"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'gambar-jurulatih' AND is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'gambar-jurulatih' AND is_admin(auth.uid()));

DROP POLICY IF EXISTS "gambar jurulatih padam" ON storage.objects;
CREATE POLICY "gambar jurulatih padam"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'gambar-jurulatih' AND is_admin(auth.uid()));
