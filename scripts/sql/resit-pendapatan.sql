-- ============================================================
-- CFK HUB — Resit untuk Pendapatan Lain (jualan peralatan, khidmat
-- kursus, tajaan, program luar dll). Tambah no. resit auto + jana PDF.
-- Paste dalam Supabase SQL Editor dan Run. Selamat dijalankan berulang.
-- ============================================================

-- 1) Kolum nombor resit
ALTER TABLE pendapatan_lain ADD COLUMN IF NOT EXISTS no_resit TEXT;

-- 2) Jujukan (sequence) untuk nombor resit luar
CREATE SEQUENCE IF NOT EXISTS seq_resit_pendapatan;

-- 3) Fungsi + trigger jana nombor: CFK-L-YYYY-NNNNN (L = pendapatan lain)
CREATE OR REPLACE FUNCTION jana_no_resit_pendapatan() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.no_resit IS NULL THEN
    NEW.no_resit := 'CFK-L-' || to_char(COALESCE(NEW.tarikh, CURRENT_DATE), 'YYYY')
      || '-' || lpad(nextval('seq_resit_pendapatan')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_no_resit_pendapatan ON pendapatan_lain;
CREATE TRIGGER trg_no_resit_pendapatan BEFORE INSERT ON pendapatan_lain
  FOR EACH ROW EXECUTE FUNCTION jana_no_resit_pendapatan();

-- 4) Backfill rekod sedia ada yang belum ada nombor resit
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT id, tarikh FROM pendapatan_lain WHERE no_resit IS NULL ORDER BY created_at LOOP
    UPDATE pendapatan_lain
      SET no_resit = 'CFK-L-' || to_char(COALESCE(r.tarikh, CURRENT_DATE), 'YYYY')
        || '-' || lpad(nextval('seq_resit_pendapatan')::text, 5, '0')
      WHERE id = r.id;
  END LOOP;
END $$;
