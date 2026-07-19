-- ============================================================
-- CFK HUB — Bayaran Online (ToyyibPay)
-- Paste dalam Supabase SQL Editor dan Run SEBELUM deploy kod.
-- Selamat dijalankan berulang kali.
--
-- Admin jana "permintaan bayaran" (bil ToyyibPay) → hantar link ke
-- ibu bapa via WhatsApp. Bila ibu bapa selesai bayar (FPX/DuitNow),
-- ToyyibPay panggil balik server kita → resit auto-dijana dan
-- permintaan ditanda 'Selesai'. Kaedah bayaran resit = 'Online'.
-- ============================================================

-- 1. Benarkan kaedah_bayaran 'Online' pada resit (sebelum ini: Tunai/Transfer sahaja)
ALTER TABLE resit DROP CONSTRAINT IF EXISTS resit_kaedah_bayaran_check;
ALTER TABLE resit ADD CONSTRAINT resit_kaedah_bayaran_check
  CHECK (kaedah_bayaran IN ('Tunai', 'Transfer', 'Online'));

-- 2. Jadual permintaan bayaran online
CREATE TABLE IF NOT EXISTS permintaan_bayaran (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_code TEXT UNIQUE NOT NULL,               -- kod bil ToyyibPay
  pelajar_id UUID NOT NULL REFERENCES pelajar(id),
  nama_pelajar TEXT NOT NULL,                   -- snapshot nama masa jana
  no_telefon TEXT,                              -- snapshot telefon untuk WhatsApp
  jenis TEXT NOT NULL CHECK (jenis IN ('Kumpulan', 'Personal', 'Pendaftaran')),
  bulan_bayaran TEXT NOT NULL,
  tahun_bayaran INTEGER NOT NULL,
  bil_kelas SMALLINT CHECK (bil_kelas IS NULL OR bil_kelas > 0),
  jumlah DECIMAL(8,2) NOT NULL CHECK (jumlah > 0),
  status TEXT NOT NULL DEFAULT 'Menunggu' CHECK (status IN ('Menunggu', 'Selesai', 'Gagal')),
  resit_id UUID REFERENCES resit(id),           -- resit yang dijana bila dibayar
  payment_ref TEXT,                             -- no rujukan transaksi ToyyibPay
  dibuat_oleh UUID REFERENCES pengguna_profil(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  dibayar_pada TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_permintaan_bayaran_status ON permintaan_bayaran (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_permintaan_bayaran_pelajar ON permintaan_bayaran (pelajar_id);

COMMENT ON TABLE permintaan_bayaran IS 'Permintaan bayaran online (bil ToyyibPay). Resit dijana hanya bila status Selesai.';

-- 3. RLS: baca oleh mana-mana pengguna login; tulis admin sahaja.
--    (Callback ToyyibPay guna service-role key → memintas RLS.)
ALTER TABLE permintaan_bayaran ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "baca" ON permintaan_bayaran;
CREATE POLICY "baca" ON permintaan_bayaran FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "tulis_admin" ON permintaan_bayaran;
CREATE POLICY "tulis_admin" ON permintaan_bayaran FOR ALL TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- ============================================================
-- ROLLBACK (jika perlu buang ciri ini):
-- DROP TABLE IF EXISTS permintaan_bayaran;
-- ALTER TABLE resit DROP CONSTRAINT IF EXISTS resit_kaedah_bayaran_check;
-- ALTER TABLE resit ADD CONSTRAINT resit_kaedah_bayaran_check
--   CHECK (kaedah_bayaran IN ('Tunai', 'Transfer'));
-- ============================================================
