-- ============================================================
-- CFK HUB — Pendapatan Lain / Sumbangan
-- Rekod wang MASUK selain yuran pelajar (sumbangan, penajaan,
-- yuran program luar, sewa/faedah dll) supaya muncul dalam
-- Laporan Kewangan & Laporan LHDN dan rekonsiliasi bank tepat.
-- Paste dalam Supabase SQL Editor dan Run SEBELUM deploy kod.
-- Selamat dijalankan berulang kali.
-- ============================================================

-- 1) Jadual pendapatan lain
CREATE TABLE IF NOT EXISTS pendapatan_lain (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tarikh DATE NOT NULL,
  sumber TEXT NOT NULL,                 -- nama penyumbang/penaja/organisasi
  kategori TEXT NOT NULL,               -- Sumbangan/Penajaan/Yuran Program Luar/Sewa & Faedah/Lain-lain
  jumlah NUMERIC(10,2) NOT NULL CHECK (jumlah > 0),
  kaedah TEXT NOT NULL DEFAULT 'Transfer' CHECK (kaedah IN ('Tunai', 'Transfer')),
  cawangan_id UUID REFERENCES cawangan(id),
  nota TEXT,
  bukti_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pendapatan_lain_tarikh ON pendapatan_lain (tarikh DESC);
CREATE INDEX IF NOT EXISTS idx_pendapatan_lain_kategori ON pendapatan_lain (kategori);

ALTER TABLE pendapatan_lain ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_pendapatan_lain" ON pendapatan_lain;
CREATE POLICY "admin_all_pendapatan_lain" ON pendapatan_lain
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- 2) Bucket storan peribadi untuk bukti (imej/PDF)
INSERT INTO storage.buckets (id, name, public)
VALUES ('bukti-pendapatan', 'bukti-pendapatan', false)
ON CONFLICT (id) DO NOTHING;

-- 3) Polisi akses bukti: semua pengguna log masuk (loceng/laporan admin sahaja
--    guna jadual di atas; akses fail dikawal melalui signed URL)
DROP POLICY IF EXISTS "bukti pendapatan baca" ON storage.objects;
CREATE POLICY "bukti pendapatan baca"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'bukti-pendapatan');

DROP POLICY IF EXISTS "bukti pendapatan muat naik" ON storage.objects;
CREATE POLICY "bukti pendapatan muat naik"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'bukti-pendapatan');

DROP POLICY IF EXISTS "bukti pendapatan ganti" ON storage.objects;
CREATE POLICY "bukti pendapatan ganti"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'bukti-pendapatan')
  WITH CHECK (bucket_id = 'bukti-pendapatan');

DROP POLICY IF EXISTS "bukti pendapatan padam" ON storage.objects;
CREATE POLICY "bukti pendapatan padam"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'bukti-pendapatan');
