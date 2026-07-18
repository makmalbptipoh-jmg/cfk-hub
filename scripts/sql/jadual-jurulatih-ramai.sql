-- ============================================================
-- CFK HUB — Jadual Kelas: jurulatih RAMAI per slot/aktiviti
-- (kolum jurulatih_id tunggal → jurulatih_ids senarai)
-- Paste dalam Supabase SQL Editor dan Run SEBELUM deploy kod.
-- Selamat dijalankan berulang kali. Data jurulatih sedia ada
-- dipindahkan automatik ke senarai.
-- ============================================================

ALTER TABLE jadual_slot ADD COLUMN IF NOT EXISTS jurulatih_ids UUID[] NOT NULL DEFAULT '{}';
ALTER TABLE aktiviti ADD COLUMN IF NOT EXISTS jurulatih_ids UUID[] NOT NULL DEFAULT '{}';

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'jadual_slot' AND column_name = 'jurulatih_id') THEN
    UPDATE jadual_slot SET jurulatih_ids = ARRAY[jurulatih_id]
    WHERE jurulatih_id IS NOT NULL AND jurulatih_ids = '{}';
    ALTER TABLE jadual_slot DROP COLUMN jurulatih_id;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'aktiviti' AND column_name = 'jurulatih_id') THEN
    UPDATE aktiviti SET jurulatih_ids = ARRAY[jurulatih_id]
    WHERE jurulatih_id IS NOT NULL AND jurulatih_ids = '{}';
    ALTER TABLE aktiviti DROP COLUMN jurulatih_id;
  END IF;
END $$;
