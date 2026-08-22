-- ============================================================
-- CFK HUB — Modul Penggredan (Grading System)
-- Paste dalam Supabase SQL Editor dan Run SEBELUM deploy kod.
-- Selamat dijalankan berulang kali (idempotent).
--
-- Tujuan: sistem penilaian/grading catur setiap 3 bulan (kitaran).
--   - Level 1-6 (umur 6-18): markah berpemberat → gred A-E, naik level.
--   - Level 0 Little Pawn (umur 4-5): checklist 12 item, tiada gred huruf.
--
-- Guna semula entiti sedia ada (FK, BUKAN duplikasi):
--   pelajar (nama/tarikh_lahir/jenis_kelas), cawangan, kehadiran
--   (auto-kira sesi hadir), pertandingan_keputusan (rating Improvement).
--
-- Reference tak dijadikan jadual (kekal const dalam src/lib):
--   Levels (TARAF_GRED), LittlePawnActivities/Session/Schedule.
--
-- 3 jadual:
--   gred_kitaran      — satu kitaran grading (Q1..Q4)
--   gred_penilaian    — penilaian Level 1-6 (satu pelajar / kitaran)
--   gred_little_pawn  — checklist Level 0 (satu pelajar / kitaran)
-- ============================================================

-- Jaga-jaga: pastikan fungsi jurulatih_id_semasa() wujud (jurulatih self-service).
CREATE OR REPLACE FUNCTION jurulatih_id_semasa()
RETURNS UUID AS $$
  SELECT id FROM jurulatih WHERE pengguna_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- 1) GRED_KITARAN — satu kitaran grading (setiap 3 bulan)
-- ============================================================
CREATE TABLE IF NOT EXISTS gred_kitaran (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,                          -- 'Q4 2026 (Okt-Dis)'
  tarikh_mula DATE NOT NULL,
  tarikh_tamat DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Dibuka' CHECK (status IN ('Dibuka', 'Ditutup')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE gred_kitaran IS 'Kitaran grading setiap 3 bulan. tarikh_mula digunakan kira minggu semasa (Little Pawn). status=Ditutup kunci edit gred.';

CREATE INDEX IF NOT EXISTS idx_gred_kitaran_status ON gred_kitaran (status, tarikh_mula DESC);

-- ============================================================
-- 2) GRED_PENILAIAN — penilaian Level 1-6 (berpemberat, gred A-E)
--    Simpan input mentah + snapshot dikira (skor_akhir/gred/naik_level)
--    supaya laporan/Excel baca nilai stabil (tak drift bila kehadiran diedit).
-- ============================================================
CREATE TABLE IF NOT EXISTS gred_penilaian (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pelajar_id UUID NOT NULL REFERENCES pelajar(id) ON DELETE CASCADE,
  kitaran_id UUID NOT NULL REFERENCES gred_kitaran(id) ON DELETE CASCADE,
  cawangan_id UUID REFERENCES cawangan(id) ON DELETE SET NULL,   -- snapshot cawangan masa dinilai
  level_mula SMALLINT NOT NULL DEFAULT 1 CHECK (level_mula BETWEEN 1 AND 6),
  band_umur TEXT CHECK (band_umur IN ('junior', 'inter', 'senior')),
  -- input mentah
  theory_raw NUMERIC(6,2),
  theory_max NUMERIC(6,2),
  puzzle_raw NUMERIC(6,2),
  puzzle_max NUMERIC(6,2),
  club_points SMALLINT DEFAULT 0 CHECK (club_points BETWEEN 0 AND 15),
  tournament_points SMALLINT DEFAULT 0 CHECK (tournament_points BETWEEN 0 AND 10),
  sesi_hadir SMALLINT DEFAULT 0,
  sesi_jumlah SMALLINT DEFAULT 0,
  att_hormat SMALLINT DEFAULT 0 CHECK (att_hormat BETWEEN 0 AND 5),
  att_fokus SMALLINT DEFAULT 0 CHECK (att_fokus BETWEEN 0 AND 5),
  att_sportsmanship SMALLINT DEFAULT 0 CHECK (att_sportsmanship BETWEEN 0 AND 5),
  att_usaha SMALLINT DEFAULT 0 CHECK (att_usaha BETWEEN 0 AND 5),
  rating_mula INTEGER,                          -- dari pertandingan.ts (kitaran lepas / 1000)
  rating_tamat INTEGER,                         -- dari pertandingan.ts (semasa)
  bonus_helper SMALLINT DEFAULT 0 CHECK (bonus_helper BETWEEN 0 AND 5),
  annotate_game TEXT,                           -- band senior sahaja
  nota_coach TEXT,
  -- snapshot dikira
  skor_akhir NUMERIC(6,2),
  gred TEXT CHECK (gred IN ('A', 'B', 'C', 'D', 'E')),
  naik_level BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'Draf' CHECK (status IN ('Draf', 'Selesai')),
  dinilai_oleh UUID REFERENCES pengguna_profil(id),
  dinilai_pada DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  dikemaskini_pada TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (pelajar_id, kitaran_id)               -- satu penilaian / pelajar / kitaran (upsert batch)
);

COMMENT ON TABLE gred_penilaian IS 'Penilaian grading Level 1-6. Pemberat: Theory 25/Puzzle 20/Practical 25/Kehadiran 10/Sikap 10/Improvement 10/Bonus 5 (maks 105). sesi_* auto dari kehadiran; rating_* dari modul pertandingan.';

CREATE INDEX IF NOT EXISTS idx_gred_penilaian_kitaran ON gred_penilaian (kitaran_id, cawangan_id);
CREATE INDEX IF NOT EXISTS idx_gred_penilaian_pelajar ON gred_penilaian (pelajar_id);

-- ============================================================
-- 3) GRED_LITTLE_PAWN — checklist Level 0 (umur 4-5)
--    i01..i12 nilai 0/1/2 (Belum/Sedang/Dah Boleh). Lajur nyata (audit Excel).
--    skor_akhir dalaman coach sahaja — JANGAN dedah gred/% pada parent (UI).
-- ============================================================
CREATE TABLE IF NOT EXISTS gred_little_pawn (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pelajar_id UUID NOT NULL REFERENCES pelajar(id) ON DELETE CASCADE,
  kitaran_id UUID NOT NULL REFERENCES gred_kitaran(id) ON DELETE CASCADE,
  cawangan_id UUID REFERENCES cawangan(id) ON DELETE SET NULL,
  i01 SMALLINT DEFAULT 0 CHECK (i01 BETWEEN 0 AND 2),
  i02 SMALLINT DEFAULT 0 CHECK (i02 BETWEEN 0 AND 2),
  i03 SMALLINT DEFAULT 0 CHECK (i03 BETWEEN 0 AND 2),
  i04 SMALLINT DEFAULT 0 CHECK (i04 BETWEEN 0 AND 2),
  i05 SMALLINT DEFAULT 0 CHECK (i05 BETWEEN 0 AND 2),
  i06 SMALLINT DEFAULT 0 CHECK (i06 BETWEEN 0 AND 2),
  i07 SMALLINT DEFAULT 0 CHECK (i07 BETWEEN 0 AND 2),
  i08 SMALLINT DEFAULT 0 CHECK (i08 BETWEEN 0 AND 2),
  i09 SMALLINT DEFAULT 0 CHECK (i09 BETWEEN 0 AND 2),
  i10 SMALLINT DEFAULT 0 CHECK (i10 BETWEEN 0 AND 2),
  i11 SMALLINT DEFAULT 0 CHECK (i11 BETWEEN 0 AND 2),
  i12 SMALLINT DEFAULT 0 CHECK (i12 BETWEEN 0 AND 2),
  sesi_hadir SMALLINT DEFAULT 0,
  sesi_jumlah SMALLINT DEFAULT 0,
  skor_sikap SMALLINT DEFAULT 0 CHECK (skor_sikap BETWEEN 0 AND 5),   -- behaviour 1-5
  minigame_selesai BOOLEAN DEFAULT FALSE,
  peringkat SMALLINT DEFAULT 1 CHECK (peringkat BETWEEN 1 AND 3),
  graduasi BOOLEAN DEFAULT FALSE,
  skor_akhir NUMERIC(6,2),                       -- dalaman coach sahaja
  nota_coach TEXT,
  status TEXT NOT NULL DEFAULT 'Draf' CHECK (status IN ('Draf', 'Selesai')),
  dinilai_oleh UUID REFERENCES pengguna_profil(id),
  dinilai_pada DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  dikemaskini_pada TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (pelajar_id, kitaran_id)
);

COMMENT ON TABLE gred_little_pawn IS 'Checklist Level 0 Little Pawn (umur 4-5). i01..i12 = 0/1/2. skor_akhir untuk rekod dalaman coach — JANGAN papar gred/% pada parent.';

CREATE INDEX IF NOT EXISTS idx_gred_little_pawn_kitaran ON gred_little_pawn (kitaran_id, cawangan_id);
CREATE INDEX IF NOT EXISTS idx_gred_little_pawn_pelajar ON gred_little_pawn (pelajar_id);

-- ============================================================
-- 4) RLS
--    BACA: terbuka authenticated (UI hanya terdedah admin + jurulatih).
--    TULIS gred_kitaran: admin sahaja (setup kitaran).
--    TULIS penilaian/little_pawn: admin ATAU jurulatih berpaut (mereka menilai).
--    (Tapisan cawangan-jurulatih dibuat di lapisan query, bukan RLS.)
-- ============================================================
ALTER TABLE gred_kitaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE gred_penilaian ENABLE ROW LEVEL SECURITY;
ALTER TABLE gred_little_pawn ENABLE ROW LEVEL SECURITY;

-- gred_kitaran (tulis admin sahaja)
DROP POLICY IF EXISTS "baca_gred_kitaran" ON gred_kitaran;
CREATE POLICY "baca_gred_kitaran" ON gred_kitaran
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "tulis_admin_gred_kitaran" ON gred_kitaran;
CREATE POLICY "tulis_admin_gred_kitaran" ON gred_kitaran
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- gred_penilaian (tulis admin ATAU jurulatih)
DROP POLICY IF EXISTS "baca_gred_penilaian" ON gred_penilaian;
CREATE POLICY "baca_gred_penilaian" ON gred_penilaian
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "tulis_gred_penilaian" ON gred_penilaian;
CREATE POLICY "tulis_gred_penilaian" ON gred_penilaian
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()) OR jurulatih_id_semasa() IS NOT NULL)
  WITH CHECK (is_admin(auth.uid()) OR jurulatih_id_semasa() IS NOT NULL);

-- gred_little_pawn (tulis admin ATAU jurulatih)
DROP POLICY IF EXISTS "baca_gred_little_pawn" ON gred_little_pawn;
CREATE POLICY "baca_gred_little_pawn" ON gred_little_pawn
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "tulis_gred_little_pawn" ON gred_little_pawn;
CREATE POLICY "tulis_gred_little_pawn" ON gred_little_pawn
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()) OR jurulatih_id_semasa() IS NOT NULL)
  WITH CHECK (is_admin(auth.uid()) OR jurulatih_id_semasa() IS NOT NULL);

-- ============================================================
-- SELEPAS RUN: sahkan polisi (elak landmine 42501). Patut 6 baris:
--   SELECT tablename, policyname, cmd FROM pg_policies
--   WHERE tablename IN ('gred_kitaran','gred_penilaian','gred_little_pawn')
--   ORDER BY tablename, policyname;
-- Kemudian run scripts/sql/_semakan-policy-audit.sql → 0 baris = lengkap.
-- ============================================================

-- ============================================================
-- ROLLBACK (jika perlu buang modul ini):
--   DROP TABLE IF EXISTS gred_little_pawn;
--   DROP TABLE IF EXISTS gred_penilaian;
--   DROP TABLE IF EXISTS gred_kitaran;
-- ============================================================
