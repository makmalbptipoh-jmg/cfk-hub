-- ============================================================
-- CFK HUB — Silibus Berstruktur (Tajuk Besar → Subtajuk + Progress per Cawangan)
-- Paste dalam Supabase SQL Editor dan Run SEBELUM deploy kod.
-- Selamat dijalankan berulang kali (idempotent).
--
-- Tujuan: kurikulum catur berstruktur. Satu Tajuk Besar (cth
-- "Short & Sweet: London System") mengandungi banyak Subtajuk (bab).
-- Setiap cawangan ada progress sendiri per subtajuk (Belum/Sedang/
-- Selesai) — trace kelas mana dah habis apa. Setiap subtajuk boleh
-- ada bahan: FEN, PGN (fail atau teks), nota, pautan URL.
--
-- 3 jadual (jadual `silibus` log harian lama KEKAL tidak disentuh):
--   silibus_tajuk     — Tajuk Besar (senarai induk dikongsi)
--   silibus_subtajuk  — Subtajuk bawah satu Tajuk Besar + bahan
--   silibus_progress  — progress per cawangan (sparse: tiada baris = Belum)
-- ============================================================

-- ============================================================
-- 1) TAJUK BESAR — senarai induk dikongsi semua cawangan
-- ============================================================
CREATE TABLE IF NOT EXISTS silibus_tajuk (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,                               -- cth "Short & Sweet: Aman Hambleton's London System"
  susunan SMALLINT NOT NULL DEFAULT 100,            -- kecil dahulu
  nota TEXT,                                        -- keterangan pilihan
  status TEXT NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Tidak Aktif')),
  dicipta_oleh UUID REFERENCES pengguna_profil(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE silibus_tajuk IS 'Tajuk Besar silibus catur (kursus/topik induk). Mengandungi banyak subtajuk.';

CREATE INDEX IF NOT EXISTS idx_silibus_tajuk_susunan ON silibus_tajuk (susunan, nama);

-- ============================================================
-- 2) SUBTAJUK — bab bawah satu Tajuk Besar + bahan (FEN/PGN/nota/pautan)
-- ============================================================
CREATE TABLE IF NOT EXISTS silibus_subtajuk (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tajuk_id UUID NOT NULL REFERENCES silibus_tajuk(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,                               -- cth "Bab 3: 2...Bf5 Sidelines"
  susunan SMALLINT NOT NULL DEFAULT 100,            -- urutan bab
  fen TEXT,                                         -- kedudukan papan (notasi FEN)
  pgn_teks TEXT,                                    -- PGN ditampal terus
  pgn_path TEXT,                                    -- path fail .pgn dalam bucket 'bahan-pengajaran'
  pgn_nama TEXT,                                    -- nama asal fail
  pgn_saiz INTEGER,                                 -- bait
  nota TEXT,                                        -- nota panjang
  pautan TEXT,                                      -- URL (lichess/chessable/youtube...)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE silibus_subtajuk IS 'Subtajuk (bab) bawah satu Tajuk Besar, dengan bahan catur: FEN, PGN (fail/teks), nota, pautan.';

CREATE INDEX IF NOT EXISTS idx_silibus_subtajuk_tajuk ON silibus_subtajuk (tajuk_id, susunan);

-- ============================================================
-- 3) PROGRESS — satu baris = progress satu subtajuk untuk satu cawangan
--    Sparse: tiada baris bermakna "Belum". UNIQUE untuk upsert.
-- ============================================================
CREATE TABLE IF NOT EXISTS silibus_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subtajuk_id UUID NOT NULL REFERENCES silibus_subtajuk(id) ON DELETE CASCADE,
  cawangan_id UUID NOT NULL REFERENCES cawangan(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Belum' CHECK (status IN ('Belum', 'Sedang', 'Selesai')),
  tarikh_selesai DATE,
  nota TEXT,
  dikemaskini_oleh UUID REFERENCES pengguna_profil(id),
  dikemaskini_pada TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (subtajuk_id, cawangan_id)
);

COMMENT ON TABLE silibus_progress IS 'Progress subtajuk per cawangan (Belum/Sedang/Selesai). Tiada baris = Belum.';

CREATE INDEX IF NOT EXISTS idx_silibus_progress_cawangan ON silibus_progress (cawangan_id);
CREATE INDEX IF NOT EXISTS idx_silibus_progress_subtajuk ON silibus_progress (subtajuk_id);

-- ============================================================
-- 4) RLS — BACA terbuka kepada pengguna log masuk; TULIS admin sahaja
--    (corak sama seperti jadual `silibus` / `progres-pelajar.sql`)
-- ============================================================
ALTER TABLE silibus_tajuk    ENABLE ROW LEVEL SECURITY;
ALTER TABLE silibus_subtajuk ENABLE ROW LEVEL SECURITY;
ALTER TABLE silibus_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "baca_silibus_tajuk" ON silibus_tajuk;
CREATE POLICY "baca_silibus_tajuk" ON silibus_tajuk
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "tulis_admin_silibus_tajuk" ON silibus_tajuk;
CREATE POLICY "tulis_admin_silibus_tajuk" ON silibus_tajuk
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "baca_silibus_subtajuk" ON silibus_subtajuk;
CREATE POLICY "baca_silibus_subtajuk" ON silibus_subtajuk
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "tulis_admin_silibus_subtajuk" ON silibus_subtajuk;
CREATE POLICY "tulis_admin_silibus_subtajuk" ON silibus_subtajuk
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "baca_silibus_progress" ON silibus_progress;
CREATE POLICY "baca_silibus_progress" ON silibus_progress
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "tulis_admin_silibus_progress" ON silibus_progress;
CREATE POLICY "tulis_admin_silibus_progress" ON silibus_progress
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ============================================================
-- 5) STORAN PGN — guna semula bucket sedia ada 'bahan-pengajaran'
--    (polisi sudah wujud dari progres-pelajar.sql). Path: silibus-pgn/{id}.pgn
--    Blok di bawah idempotent — selamat jika bucket belum wujud.
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('bahan-pengajaran', 'bahan-pengajaran', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ROLLBACK (jika perlu buang ciri ini):
--   DROP TABLE IF EXISTS silibus_progress;
--   DROP TABLE IF EXISTS silibus_subtajuk;
--   DROP TABLE IF EXISTS silibus_tajuk;
--   -- (bucket 'bahan-pengajaran' dikongsi — JANGAN drop di sini)
-- ============================================================
