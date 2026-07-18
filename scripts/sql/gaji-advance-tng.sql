-- ============================================================
-- CFK HUB — Advance gaji, TNG eWallet & kaedah bayaran
-- Paste dalam Supabase SQL Editor dan Run SEBELUM deploy kod.
-- Selamat dijalankan berulang kali.
--
-- 1) jurulatih: no_tng (no telefon TNG eWallet) + tng_qr_path
--    (gambar QR TNG dalam bucket gambar-jurulatih, folder tng-qr/)
-- 2) bayaran_jurulatih: potongan_advance (tolak advance dari gaji)
--    + kaedah_bayaran ('Tunai' | 'TNG eWallet' | 'Transfer Bank')
-- 3) Jadual baharu advance_jurulatih (pendahuluan gaji)
-- ============================================================

ALTER TABLE jurulatih ADD COLUMN IF NOT EXISTS no_tng TEXT;
ALTER TABLE jurulatih ADD COLUMN IF NOT EXISTS tng_qr_path TEXT;

ALTER TABLE bayaran_jurulatih ADD COLUMN IF NOT EXISTS potongan_advance DECIMAL(8,2) NOT NULL DEFAULT 0;
ALTER TABLE bayaran_jurulatih ADD COLUMN IF NOT EXISTS kaedah_bayaran TEXT;

CREATE TABLE IF NOT EXISTS advance_jurulatih (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  jurulatih_id UUID REFERENCES jurulatih(id) NOT NULL,
  jumlah DECIMAL(8,2) NOT NULL CHECK (jumlah > 0),
  baki DECIMAL(8,2) NOT NULL CHECK (baki >= 0),
  tarikh_advance DATE NOT NULL,
  kaedah_bayaran TEXT DEFAULT 'Tunai',
  status TEXT NOT NULL DEFAULT 'Belum Selesai' CHECK (status IN ('Belum Selesai', 'Selesai')),
  bayaran_id UUID REFERENCES bayaran_jurulatih(id),
  nota TEXT,
  direkod_oleh UUID REFERENCES pengguna_profil(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_advance_jurulatih ON advance_jurulatih (jurulatih_id, status);

ALTER TABLE advance_jurulatih ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_all_advance_jurulatih ON advance_jurulatih;
CREATE POLICY admin_all_advance_jurulatih ON advance_jurulatih
  FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
