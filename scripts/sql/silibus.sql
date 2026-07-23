-- ============================================================
-- CFK HUB — Rekod Silibus / Tajuk Kelas
-- Paste dalam Supabase SQL Editor dan Run SEBELUM deploy kod.
-- Selamat dijalankan berulang kali.
--
-- Log bertarikh: setiap baris = satu tajuk / silibus yang diajar
-- pada satu tarikh untuk satu kelas (cawangan + jenis). Guna untuk
-- pantau perkembangan pengajaran per cawangan + jana laporan PDF.
-- ============================================================

CREATE TABLE IF NOT EXISTS silibus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tarikh DATE NOT NULL,
  cawangan_id UUID REFERENCES cawangan(id),          -- pilihan (Personal boleh tiada cawangan)
  pelajar_id UUID REFERENCES pelajar(id),            -- untuk kelas Personal: trace kelas siapa
  jenis TEXT NOT NULL DEFAULT 'Kumpulan' CHECK (jenis IN ('Kumpulan', 'Personal')),
  tajuk TEXT NOT NULL,                               -- tajuk / silibus yang diajar
  muka_surat TEXT,                                   -- "page" — cth "ms 12-15" / "Modul 2"
  nota TEXT,
  direkod_oleh UUID REFERENCES pengguna_profil(id),  -- audit: siapa rekod
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Untuk jadual yang sudah wujud (dari run terdahulu): tambah kolum pelajar_id.
ALTER TABLE silibus ADD COLUMN IF NOT EXISTS pelajar_id UUID REFERENCES pelajar(id);

CREATE INDEX IF NOT EXISTS idx_silibus_tarikh ON silibus (tarikh DESC);
CREATE INDEX IF NOT EXISTS idx_silibus_cawangan ON silibus (cawangan_id, tarikh DESC);
CREATE INDEX IF NOT EXISTS idx_silibus_pelajar ON silibus (pelajar_id, tarikh DESC);

COMMENT ON TABLE silibus IS 'Rekod silibus/tajuk yang diajar setiap kelas (cawangan + tarikh + jenis). Log dalaman untuk laporan pengajaran.';

-- RLS: BACA terbuka kepada semua pengguna log masuk; TULIS admin sahaja.
ALTER TABLE silibus ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "baca_silibus" ON silibus;
CREATE POLICY "baca_silibus" ON silibus
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "tulis_admin_silibus" ON silibus;
CREATE POLICY "tulis_admin_silibus" ON silibus
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ============================================================
-- ROLLBACK (jika perlu buang ciri ini):
-- DROP TABLE IF EXISTS silibus;
-- ============================================================
