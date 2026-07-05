-- ============================================================
-- CFK HUB — Histori Makluman (S-06, FR-45)
-- Paste dalam Supabase SQL Editor dan Run SEBELUM deploy kod
-- yang menggunakan jadual ini. Selamat dijalankan berulang kali.
-- ============================================================

CREATE TABLE IF NOT EXISTS makluman_histori (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  jenis TEXT NOT NULL CHECK (jenis IN ('Yuran', 'Kelas', 'Pertandingan', 'Pembatalan')),
  penerima TEXT NOT NULL,
  teks TEXT NOT NULL,
  penghantar_id UUID REFERENCES pengguna_profil(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_makluman_histori_created ON makluman_histori (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_makluman_histori_penghantar ON makluman_histori (penghantar_id);

ALTER TABLE makluman_histori ENABLE ROW LEVEL SECURITY;

-- Admin boleh semua
DROP POLICY IF EXISTS "admin_all_makluman_histori" ON makluman_histori;
CREATE POLICY "admin_all_makluman_histori" ON makluman_histori
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Semua pengguna log masuk boleh rekod makluman atas nama sendiri
DROP POLICY IF EXISTS "hantar_makluman_sendiri" ON makluman_histori;
CREATE POLICY "hantar_makluman_sendiri" ON makluman_histori
  FOR INSERT TO authenticated
  WITH CHECK (penghantar_id = auth.uid());

-- Jurulatih boleh lihat makluman yang dihantar sendiri
DROP POLICY IF EXISTS "lihat_makluman_sendiri" ON makluman_histori;
CREATE POLICY "lihat_makluman_sendiri" ON makluman_histori
  FOR SELECT TO authenticated
  USING (penghantar_id = auth.uid());
