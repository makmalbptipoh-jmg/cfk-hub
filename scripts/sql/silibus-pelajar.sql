-- ============================================================
-- CFK HUB — Silibus Pelajar (progress silibus per pelajar)
-- Paste dalam Supabase SQL Editor dan Run SEBELUM deploy kod.
-- Selamat dijalankan berulang kali (idempotent).
--
-- Tujuan: selain progress per cawangan (silibus_progress), jejak
-- progress silibus SETIAP PELAJAR terhadap Tajuk Besar yang ditanda
-- "Wajib" (cth CFK STEP BY STEP) — kesan pelajar yang tertinggal.
-- ============================================================

-- ============================================================
-- 1) TAJUK BESAR — flag "wajib untuk semua pelajar"
-- ============================================================
ALTER TABLE silibus_tajuk ADD COLUMN IF NOT EXISTS wajib BOOLEAN NOT NULL DEFAULT false;

-- Tandakan kursus asas sebagai wajib (jika sudah wujud).
UPDATE silibus_tajuk SET wajib = true WHERE nama = 'CFK STEP BY STEP';

-- ============================================================
-- 2) PROGRESS PELAJAR — satu baris = progress satu subtajuk untuk satu pelajar
--    Sparse: tiada baris = "Belum". UNIQUE untuk upsert.
-- ============================================================
CREATE TABLE IF NOT EXISTS silibus_progress_pelajar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subtajuk_id UUID NOT NULL REFERENCES silibus_subtajuk(id) ON DELETE CASCADE,
  pelajar_id UUID NOT NULL REFERENCES pelajar(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Belum' CHECK (status IN ('Belum', 'Sedang', 'Selesai')),
  tarikh_selesai DATE,
  nota TEXT,
  dikemaskini_oleh UUID REFERENCES pengguna_profil(id),
  dikemaskini_pada TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (subtajuk_id, pelajar_id)
);

COMMENT ON TABLE silibus_progress_pelajar IS 'Progress subtajuk per pelajar (Belum/Sedang/Selesai). Tiada baris = Belum.';

CREATE INDEX IF NOT EXISTS idx_silibus_pp_pelajar ON silibus_progress_pelajar (pelajar_id);
CREATE INDEX IF NOT EXISTS idx_silibus_pp_subtajuk ON silibus_progress_pelajar (subtajuk_id);

-- ============================================================
-- 3) RLS — BACA terbuka kepada pengguna log masuk; TULIS admin sahaja
-- ============================================================
ALTER TABLE silibus_progress_pelajar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "baca_silibus_progress_pelajar" ON silibus_progress_pelajar;
CREATE POLICY "baca_silibus_progress_pelajar" ON silibus_progress_pelajar
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "tulis_admin_silibus_progress_pelajar" ON silibus_progress_pelajar;
CREATE POLICY "tulis_admin_silibus_progress_pelajar" ON silibus_progress_pelajar
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ============================================================
-- ROLLBACK (jika perlu buang ciri ini):
--   DROP TABLE IF EXISTS silibus_progress_pelajar;
--   ALTER TABLE silibus_tajuk DROP COLUMN IF EXISTS wajib;
-- ============================================================
