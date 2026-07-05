-- ============================================================
-- CFK HUB — Kehadiran jurulatih ikut cawangan & jenis kelas
-- Paste dalam Supabase SQL Editor dan Run SEBELUM deploy kod.
-- Selamat dijalankan berulang kali.
-- ============================================================

-- 1) Kolum baharu
ALTER TABLE kehadiran_jurulatih
  ADD COLUMN IF NOT EXISTS cawangan_id UUID REFERENCES cawangan(id);

ALTER TABLE kehadiran_jurulatih
  ADD COLUMN IF NOT EXISTS jenis_kelas TEXT NOT NULL DEFAULT 'Kumpulan'
  CHECK (jenis_kelas IN ('Kumpulan', 'Personal'));

-- 2) Benarkan beberapa sesi sehari (cawangan / jenis kelas berbeza):
--    ganti UNIQUE(jurulatih_id, tarikh) lama dengan yang lebih terperinci.
--    NULLS NOT DISTINCT: dua rekod tanpa cawangan pada hari sama = pendua.
ALTER TABLE kehadiran_jurulatih
  DROP CONSTRAINT IF EXISTS kehadiran_jurulatih_jurulatih_id_tarikh_key;

DO $$
BEGIN
  ALTER TABLE kehadiran_jurulatih
    ADD CONSTRAINT kehadiran_jurulatih_sesi_unik
    UNIQUE NULLS NOT DISTINCT (jurulatih_id, tarikh, cawangan_id, jenis_kelas);
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN duplicate_table THEN NULL;
END $$;
