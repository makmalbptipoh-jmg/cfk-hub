-- ============================================================
-- CFK HUB — Silibus Personal (template silibus khas pelajar Personal)
-- Paste dalam Supabase SQL Editor dan Run SEBELUM deploy kod.
-- Selamat dijalankan berulang kali (idempotent).
--
-- Tujuan: pelajar Personal (kelas 1-ke-1) belajar mengikut kurikulum
-- tersendiri, berbeza dari silibus Kumpulan. Tambah penanda "jenis"
-- pada Tajuk Besar supaya boleh bina kurikulum khas Personal, dan
-- jejak progress SETIAP pelajar Personal terhadap kurikulum itu.
--
-- TIADA jadual baharu — progress guna semula silibus_progress_pelajar
-- (subtajuk_id + pelajar_id) yang sedia generik.
-- ============================================================

-- ============================================================
-- 1) TAJUK BESAR — flag "jenis" (Kumpulan vs Personal)
--    Rekod sedia ada kekal 'Kumpulan' (default).
-- ============================================================
ALTER TABLE silibus_tajuk ADD COLUMN IF NOT EXISTS jenis TEXT NOT NULL DEFAULT 'Kumpulan';

-- Hadkan kepada nilai sah (idempotent — cipta constraint jika belum ada).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'silibus_tajuk_jenis_check'
  ) THEN
    ALTER TABLE silibus_tajuk
      ADD CONSTRAINT silibus_tajuk_jenis_check CHECK (jenis IN ('Kumpulan', 'Personal'));
  END IF;
END $$;

COMMENT ON COLUMN silibus_tajuk.jenis IS 'Kumpulan = silibus kelas biasa (progress per cawangan); Personal = template khas pelajar Personal (progress per pelajar).';

CREATE INDEX IF NOT EXISTS idx_silibus_tajuk_jenis ON silibus_tajuk (jenis);

-- ============================================================
-- NOTA: Tiada perubahan RLS diperlukan.
--   - silibus_tajuk / silibus_subtajuk : tulis admin (sedia ada).
--   - silibus_progress_pelajar         : tulis admin + jurulatih (sedia ada,
--                                        dari silibus-pelajar.sql & silibus-jurulatih.sql).
-- Kurikulum Personal berkongsi jadual progress yang sama — satu sumber kebenaran.
-- ============================================================

-- ============================================================
-- ROLLBACK (jika perlu buang ciri ini):
--   DROP INDEX IF EXISTS idx_silibus_tajuk_jenis;
--   ALTER TABLE silibus_tajuk DROP CONSTRAINT IF EXISTS silibus_tajuk_jenis_check;
--   ALTER TABLE silibus_tajuk DROP COLUMN IF EXISTS jenis;
-- ============================================================
