-- ============================================================
-- CFK HUB — Jadual Kelas (slot mingguan + aktiviti bertarikh)
-- Paste dalam Supabase SQL Editor dan Run SEBELUM deploy kod
-- yang menggunakan jadual ini. Selamat dijalankan berulang kali.
-- ============================================================

-- Slot berulang MINGGUAN: kelas Kumpulan per cawangan, kelas
-- Personal terikat pada pelajar. Tiada tarikh — hanya hari minggu.
CREATE TABLE IF NOT EXISTS jadual_slot (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  jenis TEXT NOT NULL CHECK (jenis IN ('Kumpulan', 'Personal')),
  hari_minggu SMALLINT NOT NULL CHECK (hari_minggu BETWEEN 0 AND 6),  -- 0=Ahad ... 6=Sabtu
  masa_mula TIME NOT NULL,
  masa_tamat TIME NOT NULL,
  cawangan_id UUID REFERENCES cawangan(id),   -- wajib untuk Kumpulan; pilihan untuk Personal
  pelajar_id UUID REFERENCES pelajar(id),     -- wajib untuk Personal
  jurulatih_id UUID REFERENCES jurulatih(id), -- pilihan
  lokasi TEXT,                                -- override lokasi (cth. rumah pelajar)
  nota TEXT,
  status TEXT NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Tidak Aktif')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_slot_masa CHECK (masa_tamat > masa_mula),
  CONSTRAINT chk_slot_kumpulan CHECK (jenis <> 'Kumpulan' OR cawangan_id IS NOT NULL),
  CONSTRAINT chk_slot_personal CHECK (jenis <> 'Personal' OR pelajar_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_jadual_slot_hari ON jadual_slot (status, hari_minggu, masa_mula);

-- Aktiviti BERTARIKH sekali sahaja: pertandingan, kem, mesyuarat,
-- kelas ganti, dan temujanji kelas personal ad-hoc (kategori
-- 'Kelas Personal' + pelajar_id).
CREATE TABLE IF NOT EXISTS aktiviti (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  kategori TEXT NOT NULL DEFAULT 'Lain-lain'
    CHECK (kategori IN ('Pertandingan', 'Kem', 'Mesyuarat', 'Kelas Personal', 'Kelas Ganti', 'Lain-lain')),
  tarikh DATE NOT NULL,
  masa_mula TIME,          -- pilihan (acara sehari penuh boleh kosong)
  masa_tamat TIME,
  lokasi TEXT,
  cawangan_id UUID REFERENCES cawangan(id),   -- pilihan
  pelajar_id UUID REFERENCES pelajar(id),     -- untuk 'Kelas Personal' ad-hoc
  jurulatih_id UUID REFERENCES jurulatih(id), -- pilihan
  penerangan TEXT,
  status TEXT NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Dibatalkan')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_aktiviti_masa CHECK (masa_tamat IS NULL OR masa_mula IS NULL OR masa_tamat > masa_mula)
);

CREATE INDEX IF NOT EXISTS idx_aktiviti_tarikh ON aktiviti (status, tarikh);

-- RLS: BACA terbuka kepada semua pengguna log masuk (bersedia untuk
-- akses jurulatih kelak); TULIS admin sahaja — ikut gaya rls-ketat.sql.
ALTER TABLE jadual_slot ENABLE ROW LEVEL SECURITY;
ALTER TABLE aktiviti ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "baca_jadual_slot" ON jadual_slot;
CREATE POLICY "baca_jadual_slot" ON jadual_slot
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "tulis_admin_jadual_slot" ON jadual_slot;
CREATE POLICY "tulis_admin_jadual_slot" ON jadual_slot
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "baca_aktiviti" ON aktiviti;
CREATE POLICY "baca_aktiviti" ON aktiviti
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "tulis_admin_aktiviti" ON aktiviti;
CREATE POLICY "tulis_admin_aktiviti" ON aktiviti
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));
