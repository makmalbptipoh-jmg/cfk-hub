-- ============================================================
-- CFK HUB — Modul Pertandingan (integrasi Swiss-Manager)
-- Paste dalam Supabase SQL Editor dan Run SEBELUM deploy kod.
-- Selamat dijalankan berulang kali (idempotent).
--
-- Tujuan: setiap cawangan/kelas jalankan pertandingan catur dalaman
-- guna Swiss-Manager. App jana template pendaftaran (peserta) & proses
-- fail "Ranking List" yang di-export balik → rekod kedudukan/mata setiap
-- pelajar → jadi rating & pingat dalam Laporan Pelajar.
--
-- 3 jadual:
--   pertandingan            — satu acara (nama, tarikh, cawangan)
--   pertandingan_peserta    — pelajar didaftar & di-export ke template
--   pertandingan_keputusan  — baris result dari fail ranking
-- ============================================================

-- Jaga-jaga: pastikan fungsi jurulatih_id_semasa() wujud (jurulatih self-service).
CREATE OR REPLACE FUNCTION jurulatih_id_semasa()
RETURNS UUID AS $$
  SELECT id FROM jurulatih WHERE pengguna_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- 1) PERTANDINGAN — satu acara pertandingan
-- ============================================================
CREATE TABLE IF NOT EXISTS pertandingan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  tarikh DATE NOT NULL,
  cawangan_id UUID REFERENCES cawangan(id) ON DELETE SET NULL,
  jurulatih_id UUID REFERENCES jurulatih(id) ON DELETE SET NULL,
  bil_pusingan SMALLINT,
  status TEXT NOT NULL DEFAULT 'Draf' CHECK (status IN ('Draf', 'Selesai')),
  catatan TEXT,
  dicipta_oleh UUID REFERENCES pengguna_profil(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE pertandingan IS 'Acara pertandingan catur dalaman (per cawangan/kelas).';

CREATE INDEX IF NOT EXISTS idx_pertandingan_cawangan ON pertandingan (cawangan_id);
CREATE INDEX IF NOT EXISTS idx_pertandingan_tarikh ON pertandingan (tarikh DESC);

-- ============================================================
-- 2) PESERTA — pelajar didaftar; nama_ekspot = kunci padanan result
-- ============================================================
CREATE TABLE IF NOT EXISTS pertandingan_peserta (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pertandingan_id UUID NOT NULL REFERENCES pertandingan(id) ON DELETE CASCADE,
  pelajar_id UUID NOT NULL REFERENCES pelajar(id) ON DELETE CASCADE,
  nama_ekspot TEXT NOT NULL,
  sno SMALLINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (pertandingan_id, pelajar_id)
);

COMMENT ON TABLE pertandingan_peserta IS 'Pelajar yang didaftar untuk satu pertandingan. nama_ekspot = nama tepat ditulis ke template Swiss-Manager (kunci padanan result).';

CREATE INDEX IF NOT EXISTS idx_pertandingan_peserta_pertandingan ON pertandingan_peserta (pertandingan_id);
CREATE INDEX IF NOT EXISTS idx_pertandingan_peserta_pelajar ON pertandingan_peserta (pelajar_id);

-- ============================================================
-- 3) KEPUTUSAN — satu baris = satu kedudukan dari fail ranking
--    pelajar_id nullable: baris yang gagal dipadan (resolve manual).
-- ============================================================
CREATE TABLE IF NOT EXISTS pertandingan_keputusan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pertandingan_id UUID NOT NULL REFERENCES pertandingan(id) ON DELETE CASCADE,
  peserta_id UUID REFERENCES pertandingan_peserta(id) ON DELETE SET NULL,
  pelajar_id UUID REFERENCES pelajar(id) ON DELETE SET NULL,
  nama_ranking TEXT NOT NULL,
  kedudukan SMALLINT NOT NULL,
  sno SMALLINT,
  mata NUMERIC(5,2) NOT NULL DEFAULT 0,
  buchholz NUMERIC(6,2),
  sonneborn NUMERIC(6,2),
  jumlah_peserta SMALLINT NOT NULL DEFAULT 0,
  pingat TEXT CHECK (pingat IN ('Emas', 'Perak', 'Gangsa')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (pertandingan_id, kedudukan)
);

COMMENT ON TABLE pertandingan_keputusan IS 'Keputusan setiap kedudukan dari fail Ranking List Swiss-Manager. pelajar_id NULL = belum dipadan.';

CREATE INDEX IF NOT EXISTS idx_pertandingan_keputusan_pertandingan ON pertandingan_keputusan (pertandingan_id);
CREATE INDEX IF NOT EXISTS idx_pertandingan_keputusan_pelajar ON pertandingan_keputusan (pelajar_id);

-- ============================================================
-- 4) RLS — BACA terbuka; TULIS admin ATAU jurulatih berpaut
--    (UI hanya terdedah kepada admin + jurulatih).
-- ============================================================
ALTER TABLE pertandingan ENABLE ROW LEVEL SECURITY;
ALTER TABLE pertandingan_peserta ENABLE ROW LEVEL SECURITY;
ALTER TABLE pertandingan_keputusan ENABLE ROW LEVEL SECURITY;

-- pertandingan
DROP POLICY IF EXISTS "baca_pertandingan" ON pertandingan;
CREATE POLICY "baca_pertandingan" ON pertandingan
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "tulis_pertandingan" ON pertandingan;
CREATE POLICY "tulis_pertandingan" ON pertandingan
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()) OR jurulatih_id_semasa() IS NOT NULL)
  WITH CHECK (is_admin(auth.uid()) OR jurulatih_id_semasa() IS NOT NULL);

-- pertandingan_peserta
DROP POLICY IF EXISTS "baca_pertandingan_peserta" ON pertandingan_peserta;
CREATE POLICY "baca_pertandingan_peserta" ON pertandingan_peserta
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "tulis_pertandingan_peserta" ON pertandingan_peserta;
CREATE POLICY "tulis_pertandingan_peserta" ON pertandingan_peserta
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()) OR jurulatih_id_semasa() IS NOT NULL)
  WITH CHECK (is_admin(auth.uid()) OR jurulatih_id_semasa() IS NOT NULL);

-- pertandingan_keputusan
DROP POLICY IF EXISTS "baca_pertandingan_keputusan" ON pertandingan_keputusan;
CREATE POLICY "baca_pertandingan_keputusan" ON pertandingan_keputusan
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "tulis_pertandingan_keputusan" ON pertandingan_keputusan;
CREATE POLICY "tulis_pertandingan_keputusan" ON pertandingan_keputusan
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()) OR jurulatih_id_semasa() IS NOT NULL)
  WITH CHECK (is_admin(auth.uid()) OR jurulatih_id_semasa() IS NOT NULL);

-- ============================================================
-- ROLLBACK (jika perlu buang modul ini):
--   DROP TABLE IF EXISTS pertandingan_keputusan;
--   DROP TABLE IF EXISTS pertandingan_peserta;
--   DROP TABLE IF EXISTS pertandingan;
-- ============================================================
