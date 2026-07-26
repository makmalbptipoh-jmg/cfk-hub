-- ============================================================
-- CFK HUB — Progress Pembelajaran Pelajar (kelas Personal)
-- Paste dalam Supabase SQL Editor dan Run SEBELUM deploy kod.
-- Selamat dijalankan berulang kali (idempotent).
--
-- Tujuan: rekod apa yang diajar kepada setiap pelajar personal
-- (Opening, Middlegame, Endgame, Strategy, ...) supaya perkembangan
-- setiap pelajar boleh dipantau — banyak tajuk + butiran, tahap
-- penguasaan, buku rujukan + muka surat.
--
-- 3 jadual + 1 bucket storan:
--   topik_kategori  — kategori tajuk (boleh tambah sendiri)
--   buku_rujukan    — buku/modul yang dimuat naik & digunakan mengajar
--   pelajar_topik   — satu baris = satu tajuk untuk seorang pelajar
-- ============================================================

-- ============================================================
-- 1) KATEGORI TOPIK — senarai boleh diurus sendiri dalam Tetapan
-- ============================================================
CREATE TABLE IF NOT EXISTS topik_kategori (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL UNIQUE,
  susunan SMALLINT NOT NULL DEFAULT 100,           -- kecil dahulu dalam senarai
  status TEXT NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Tidak Aktif')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE topik_kategori IS 'Kategori tajuk pengajaran catur (Opening, Middlegame, ...). Admin boleh tambah sendiri.';

-- Kategori permulaan. ON CONFLICT — tidak ganti nama yang user dah ubah.
INSERT INTO topik_kategori (nama, susunan) VALUES
  ('Asas & Peraturan',        10),
  ('Opening',                 20),
  ('Middlegame',              30),
  ('Endgame',                 40),
  ('Strategy',                50),
  ('Tactics',                 60),
  ('Checkmate Pattern',       70),
  ('Puzzle / Latihan',        80),
  ('Analisis Permainan',      90),
  ('Persediaan Pertandingan', 100),
  ('Lain-lain',               110)
ON CONFLICT (nama) DO NOTHING;

-- ============================================================
-- 2) BUKU RUJUKAN — buku/modul yang dimuat naik (PDF atau imej)
-- ============================================================
CREATE TABLE IF NOT EXISTS buku_rujukan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,                              -- cth "Chess Steps Manual 2"
  pengarang TEXT,
  fail_path TEXT,                                  -- path dalam bucket 'bahan-pengajaran'
  fail_nama TEXT,                                  -- nama asal fail (untuk paparan/muat turun)
  fail_saiz INTEGER,                               -- bait
  nota TEXT,
  status TEXT NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Tidak Aktif')),
  dimuat_naik_oleh UUID REFERENCES pengguna_profil(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE buku_rujukan IS 'Buku / modul pengajaran yang dimuat naik. Dirujuk oleh pelajar_topik (buku + muka surat).';

-- ============================================================
-- 3) PELAJAR_TOPIK — satu baris = satu tajuk untuk seorang pelajar
-- ============================================================
CREATE TABLE IF NOT EXISTS pelajar_topik (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pelajar_id UUID NOT NULL REFERENCES pelajar(id) ON DELETE CASCADE,
  kategori_id UUID REFERENCES topik_kategori(id),  -- pilihan (rekod lama / belum dikategori)
  tajuk TEXT NOT NULL,                             -- cth "Italian Game", "Back Rank Mate"
  butiran TEXT,                                    -- nota panjang: apa yang diajar, kelemahan, PR
  tahap TEXT NOT NULL DEFAULT 'Baru Diajar'
    CHECK (tahap IN ('Baru Diajar', 'Sedang Latih', 'Sudah Kuasai')),
  tarikh DATE NOT NULL,                            -- bila mula diajar
  tarikh_kuasai DATE,                              -- diisi automatik bila tahap = Sudah Kuasai
  buku_id UUID REFERENCES buku_rujukan(id) ON DELETE SET NULL,
  muka_surat TEXT,                                 -- cth "ms 12-15" / "Modul 2"
  direkod_oleh UUID REFERENCES pengguna_profil(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  dikemaskini_pada TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE pelajar_topik IS 'Progress pembelajaran per pelajar: tajuk yang diajar + tahap penguasaan. Digunakan untuk kelas personal.';

CREATE INDEX IF NOT EXISTS idx_pelajar_topik_pelajar ON pelajar_topik (pelajar_id, tarikh DESC);
CREATE INDEX IF NOT EXISTS idx_pelajar_topik_kategori ON pelajar_topik (kategori_id);
CREATE INDEX IF NOT EXISTS idx_pelajar_topik_tahap ON pelajar_topik (tahap);
CREATE INDEX IF NOT EXISTS idx_buku_rujukan_nama ON buku_rujukan (nama);
CREATE INDEX IF NOT EXISTS idx_topik_kategori_susunan ON topik_kategori (susunan, nama);

-- ============================================================
-- 4) RLS — BACA terbuka kepada pengguna log masuk; TULIS admin sahaja
--    (corak sama seperti jadual `silibus`)
-- ============================================================
ALTER TABLE topik_kategori ENABLE ROW LEVEL SECURITY;
ALTER TABLE buku_rujukan   ENABLE ROW LEVEL SECURITY;
ALTER TABLE pelajar_topik  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "baca_topik_kategori" ON topik_kategori;
CREATE POLICY "baca_topik_kategori" ON topik_kategori
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "tulis_admin_topik_kategori" ON topik_kategori;
CREATE POLICY "tulis_admin_topik_kategori" ON topik_kategori
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "baca_buku_rujukan" ON buku_rujukan;
CREATE POLICY "baca_buku_rujukan" ON buku_rujukan
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "tulis_admin_buku_rujukan" ON buku_rujukan;
CREATE POLICY "tulis_admin_buku_rujukan" ON buku_rujukan
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "baca_pelajar_topik" ON pelajar_topik;
CREATE POLICY "baca_pelajar_topik" ON pelajar_topik
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "tulis_admin_pelajar_topik" ON pelajar_topik;
CREATE POLICY "tulis_admin_pelajar_topik" ON pelajar_topik
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ============================================================
-- 5) BUCKET STORAN untuk fail buku (PDF / imej) — peribadi
--    (corak sama seperti bucket 'bukti-perbelanjaan')
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('bahan-pengajaran', 'bahan-pengajaran', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "bahan pengajaran baca" ON storage.objects;
CREATE POLICY "bahan pengajaran baca"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'bahan-pengajaran');

DROP POLICY IF EXISTS "bahan pengajaran muat naik" ON storage.objects;
CREATE POLICY "bahan pengajaran muat naik"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'bahan-pengajaran');

DROP POLICY IF EXISTS "bahan pengajaran ganti" ON storage.objects;
CREATE POLICY "bahan pengajaran ganti"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'bahan-pengajaran')
  WITH CHECK (bucket_id = 'bahan-pengajaran');

DROP POLICY IF EXISTS "bahan pengajaran padam" ON storage.objects;
CREATE POLICY "bahan pengajaran padam"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'bahan-pengajaran');

-- ============================================================
-- ROLLBACK (jika perlu buang ciri ini):
--   DROP TABLE IF EXISTS pelajar_topik;
--   DROP TABLE IF EXISTS buku_rujukan;
--   DROP TABLE IF EXISTS topik_kategori;
--   DELETE FROM storage.buckets WHERE id = 'bahan-pengajaran';
-- ============================================================
