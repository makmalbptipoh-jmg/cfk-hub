-- ============================================================
-- CFK HUB — Dokumen Jualan (Sebut Harga / Invois / Resit Rasmi)
-- Untuk jualan peralatan catur & perkhidmatan kepada sekolah/organisasi.
-- Satu dokumen = satu urusan pembeli; boleh cetak 3 jenis PDF
-- (SH = Sebut Harga, INV = Invois, RS = Resit) kongsi nombor asas.
-- Bila peringkat = 'Resit', aplikasi auto-rekod ke pendapatan_lain
-- supaya masuk Laporan Kewangan & LHDN.
-- Paste dalam Supabase SQL Editor dan Run SEBELUM deploy kod.
-- Selamat dijalankan berulang kali.
-- ============================================================

-- 1) Jadual dokumen
CREATE TABLE IF NOT EXISTS dokumen_jualan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  no_dokumen TEXT,                        -- nombor asas: YYYY-NNNNN (prefix SH/INV/RS ditambah pada PDF)
  tarikh DATE NOT NULL,
  peringkat TEXT NOT NULL DEFAULT 'Sebut Harga'
    CHECK (peringkat IN ('Sebut Harga', 'Invois', 'Resit')),
  kategori TEXT NOT NULL DEFAULT 'Jualan Peralatan',
  pembeli_nama TEXT NOT NULL,            -- nama sekolah / organisasi / individu
  pembeli_alamat TEXT,                   -- alamat penuh (untuk surat rasmi sekolah)
  pembeli_telefon TEXT,
  pembeli_emel TEXT,
  pembeli_pic TEXT,                      -- untuk perhatian (person in charge)
  kaedah_bayaran TEXT DEFAULT 'Transfer'
    CHECK (kaedah_bayaran IN ('Tunai', 'Transfer')),
  maklumat_bayaran TEXT,                 -- butiran akaun bank (taip manual) untuk invois
  tarikh_bayar DATE,                     -- bila bayaran diterima (untuk resit)
  sah_sehingga DATE,                     -- tarikh luput sebut harga
  cawangan_id UUID REFERENCES cawangan(id),
  nota TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dokumen_jualan_tarikh ON dokumen_jualan (tarikh DESC);
CREATE INDEX IF NOT EXISTS idx_dokumen_jualan_peringkat ON dokumen_jualan (peringkat);

-- 2) Nombor auto: YYYY-NNNNN (prefix jenis ditambah semasa jana PDF)
CREATE SEQUENCE IF NOT EXISTS seq_dokumen_jualan;

CREATE OR REPLACE FUNCTION jana_no_dokumen_jualan() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.no_dokumen IS NULL THEN
    NEW.no_dokumen := to_char(COALESCE(NEW.tarikh, CURRENT_DATE), 'YYYY')
      || '-' || lpad(nextval('seq_dokumen_jualan')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_no_dokumen_jualan ON dokumen_jualan;
CREATE TRIGGER trg_no_dokumen_jualan BEFORE INSERT ON dokumen_jualan
  FOR EACH ROW EXECUTE FUNCTION jana_no_dokumen_jualan();

-- 3) Jadual item (baris-baris peralatan/perkhidmatan)
CREATE TABLE IF NOT EXISTS dokumen_item (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dokumen_id UUID NOT NULL REFERENCES dokumen_jualan(id) ON DELETE CASCADE,
  urutan INT NOT NULL DEFAULT 0,
  perihalan TEXT NOT NULL,
  kuantiti NUMERIC(10,2) NOT NULL DEFAULT 1 CHECK (kuantiti > 0),
  harga_seunit NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (harga_seunit >= 0)
);

CREATE INDEX IF NOT EXISTS idx_dokumen_item_dokumen ON dokumen_item (dokumen_id);

-- 4) Pautan ke pendapatan_lain (auto pendapatan bila peringkat 'Resit')
ALTER TABLE pendapatan_lain
  ADD COLUMN IF NOT EXISTS dokumen_id UUID REFERENCES dokumen_jualan(id) ON DELETE CASCADE;

-- Satu dokumen hanya boleh ada satu rekod pendapatan (NULL dibenar berulang).
CREATE UNIQUE INDEX IF NOT EXISTS uq_pendapatan_dokumen
  ON pendapatan_lain (dokumen_id) WHERE dokumen_id IS NOT NULL;

-- 5) RLS: admin sahaja
ALTER TABLE dokumen_jualan ENABLE ROW LEVEL SECURITY;
ALTER TABLE dokumen_item ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_dokumen_jualan" ON dokumen_jualan;
CREATE POLICY "admin_all_dokumen_jualan" ON dokumen_jualan
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_all_dokumen_item" ON dokumen_item;
CREATE POLICY "admin_all_dokumen_item" ON dokumen_item
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));
