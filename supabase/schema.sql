-- ============================================================
-- CFK HUB — Skema Pangkalan Data
-- Jalankan dalam Supabase SQL Editor (ikut urutan)
-- ============================================================

-- 1. JADUAL CAWANGAN
CREATE TABLE IF NOT EXISTS cawangan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  alamat TEXT,
  status TEXT DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Tidak Aktif')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. JADUAL PENGGUNA PROFIL
CREATE TABLE IF NOT EXISTS pengguna_profil (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nama TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  cawangan_id UUID REFERENCES cawangan(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: auto-create profil bila user baru daftar
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO pengguna_profil (id, nama)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nama', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. JADUAL PELAJAR
CREATE TABLE IF NOT EXISTS pelajar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_penuh TEXT NOT NULL,
  tarikh_lahir DATE,
  nama_ibu_bapa TEXT NOT NULL,
  no_telefon TEXT NOT NULL,
  emel_ibu_bapa TEXT,
  cawangan_daftar_id UUID REFERENCES cawangan(id) NOT NULL,
  jenis_kelas TEXT DEFAULT 'Kumpulan' CHECK (jenis_kelas IN ('Kumpulan', 'Personal', 'Kumpulan+Personal')),
  yuran_bulanan DECIMAL(8,2) NOT NULL,
  status TEXT DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Tidak Aktif')),
  tarikh_daftar DATE DEFAULT CURRENT_DATE,
  sumber_daftar TEXT DEFAULT 'Manual' CHECK (sumber_daftar IN ('GoogleForms', 'Manual')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. JADUAL KEHADIRAN PELAJAR
CREATE TABLE IF NOT EXISTS kehadiran (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pelajar_id UUID REFERENCES pelajar(id) NOT NULL,
  tarikh DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Hadir', 'Tidak Hadir', 'Cuti')),
  nota TEXT,
  cawangan_daftar_id UUID REFERENCES cawangan(id) NOT NULL,
  cawangan_sesi_id UUID REFERENCES cawangan(id) NOT NULL,
  jurulatih_id UUID REFERENCES pengguna_profil(id),
  direkod_oleh UUID REFERENCES pengguna_profil(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pelajar_id, tarikh)
);

-- 5. SEQUENCE + FUNGSI NOMBOR RESIT
CREATE SEQUENCE IF NOT EXISTS resit_seq START 1;

CREATE OR REPLACE FUNCTION jana_nombor_resit()
RETURNS TEXT AS $$
BEGIN
  RETURN 'CFK-' || EXTRACT(YEAR FROM NOW())::TEXT ||
         '-' || LPAD(nextval('resit_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- 6. JADUAL RESIT
CREATE TABLE IF NOT EXISTS resit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombor_resit TEXT UNIQUE DEFAULT jana_nombor_resit(),
  pelajar_id UUID REFERENCES pelajar(id) NOT NULL,
  bulan_bayaran TEXT NOT NULL,
  tahun_bayaran INTEGER NOT NULL,
  jenis TEXT NOT NULL CHECK (jenis IN ('Kumpulan', 'Personal', 'Pendaftaran')),
  jumlah DECIMAL(8,2) NOT NULL,
  kaedah_bayaran TEXT CHECK (kaedah_bayaran IN ('Tunai', 'Transfer')),
  tarikh_bayar DATE NOT NULL,
  status TEXT DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Dibatalkan')),
  sebab_batal TEXT,
  tarikh_batal TIMESTAMPTZ,
  dibatal_oleh UUID REFERENCES pengguna_profil(id),
  direkod_oleh UUID REFERENCES pengguna_profil(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. JADUAL JURULATIH
CREATE TABLE IF NOT EXISTS jurulatih (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pengguna_id UUID REFERENCES pengguna_profil(id),
  nama_penuh TEXT NOT NULL,
  no_ic TEXT UNIQUE,
  no_telefon TEXT,
  emel TEXT,
  cawangan_ids UUID[] DEFAULT '{}',
  kadar_bayaran DECIMAL(8,2),
  tarikh_mula DATE,
  pengalaman_ringkas TEXT,
  kelayakan TEXT,
  status TEXT DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Tidak Aktif')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. JADUAL KEHADIRAN JURULATIH
CREATE TABLE IF NOT EXISTS kehadiran_jurulatih (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  jurulatih_id UUID REFERENCES jurulatih(id) NOT NULL,
  tarikh DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Hadir', 'Tidak Hadir', 'Cuti')),
  nota TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(jurulatih_id, tarikh)
);

-- 9. JADUAL BAYARAN JURULATIH
CREATE TABLE IF NOT EXISTS bayaran_jurulatih (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  jurulatih_id UUID REFERENCES jurulatih(id) NOT NULL,
  bulan_bayaran TEXT NOT NULL,
  tahun_bayaran INTEGER NOT NULL,
  bilangan_sesi INTEGER NOT NULL,
  kadar_per_sesi DECIMAL(8,2) NOT NULL,
  jumlah DECIMAL(8,2) GENERATED ALWAYS AS (bilangan_sesi * kadar_per_sesi) STORED,
  tarikh_bayar DATE,
  status TEXT DEFAULT 'Belum Bayar' CHECK (status IN ('Sudah Bayar', 'Belum Bayar')),
  nota TEXT,
  direkod_oleh UUID REFERENCES pengguna_profil(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. JADUAL KEWANGAN PERBELANJAAN
CREATE TABLE IF NOT EXISTS kewangan_perbelanjaan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tarikh DATE NOT NULL,
  kategori TEXT NOT NULL,
  penerangan TEXT NOT NULL,
  jumlah DECIMAL(8,2) NOT NULL,
  cawangan_id UUID REFERENCES cawangan(id),
  direkod_oleh UUID REFERENCES pengguna_profil(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. JADUAL ASET
CREATE TABLE IF NOT EXISTS aset (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  kategori TEXT,
  nilai_asal DECIMAL(8,2),
  tarikh_beli DATE,
  cawangan_id UUID REFERENCES cawangan(id),
  status TEXT DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Lupus')),
  sebab_lupus TEXT,
  tarikh_lupus DATE,
  nota TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. JADUAL IMPORT ANTRIAN (dari Google Forms)
CREATE TABLE IF NOT EXISTS import_antrian (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_penuh TEXT NOT NULL,
  tarikh_lahir TEXT,
  nama_ibu_bapa TEXT,
  no_telefon TEXT,
  cawangan_pilihan TEXT,
  adalah_pendua BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'Menunggu' CHECK (status IN ('Menunggu', 'Diimport', 'Ditolak')),
  tarikh_submit TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: detect pendua dalam import
CREATE OR REPLACE FUNCTION detect_import_pendua()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pelajar
    WHERE nama_penuh ILIKE NEW.nama_penuh
      AND no_telefon = NEW.no_telefon
  ) THEN
    NEW.adalah_pendua := TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_detect_pendua ON import_antrian;
CREATE TRIGGER trigger_detect_pendua
  BEFORE INSERT ON import_antrian
  FOR EACH ROW EXECUTE FUNCTION detect_import_pendua();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE cawangan ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengguna_profil ENABLE ROW LEVEL SECURITY;
ALTER TABLE pelajar ENABLE ROW LEVEL SECURITY;
ALTER TABLE kehadiran ENABLE ROW LEVEL SECURITY;
ALTER TABLE resit ENABLE ROW LEVEL SECURITY;
ALTER TABLE jurulatih ENABLE ROW LEVEL SECURITY;
ALTER TABLE kehadiran_jurulatih ENABLE ROW LEVEL SECURITY;
ALTER TABLE bayaran_jurulatih ENABLE ROW LEVEL SECURITY;
ALTER TABLE kewangan_perbelanjaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE aset ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_antrian ENABLE ROW LEVEL SECURITY;

-- Helper: semak is_admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT is_admin FROM pengguna_profil WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Cawangan: semua pengguna boleh lihat
CREATE POLICY "authenticated_read_cawangan" ON cawangan
  FOR SELECT TO authenticated USING (true);

-- Cawangan: admin sahaja boleh ubah
CREATE POLICY "admin_manage_cawangan" ON cawangan
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Pengguna Profil: boleh lihat profil sendiri
CREATE POLICY "read_own_profil" ON pengguna_profil
  FOR SELECT TO authenticated USING (id = auth.uid());

-- Pengguna Profil: admin boleh lihat semua
CREATE POLICY "admin_read_all_profil" ON pengguna_profil
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

-- Pengguna Profil: admin boleh ubah
CREATE POLICY "admin_manage_profil" ON pengguna_profil
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Pelajar: Admin boleh buat semua
CREATE POLICY "admin_all_pelajar" ON pelajar
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Pelajar: Jurulatih boleh lihat semua pelajar aktif
CREATE POLICY "jurulatih_view_pelajar" ON pelajar
  FOR SELECT TO authenticated
  USING (NOT is_admin(auth.uid()) AND status = 'Aktif');

-- Kehadiran: Admin boleh semua
CREATE POLICY "admin_all_kehadiran" ON kehadiran
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Kehadiran: Jurulatih boleh insert
CREATE POLICY "jurulatih_insert_kehadiran" ON kehadiran
  FOR INSERT TO authenticated
  WITH CHECK (NOT is_admin(auth.uid()) AND jurulatih_id = auth.uid());

-- Kehadiran: Jurulatih boleh lihat rekod yang mereka masukkan
CREATE POLICY "jurulatih_view_kehadiran" ON kehadiran
  FOR SELECT TO authenticated
  USING (NOT is_admin(auth.uid()) AND jurulatih_id = auth.uid());

-- Kehadiran: Jurulatih boleh kemaskini rekod yang mereka masukkan (hari sama)
CREATE POLICY "jurulatih_update_kehadiran" ON kehadiran
  FOR UPDATE TO authenticated
  USING (NOT is_admin(auth.uid()) AND jurulatih_id = auth.uid() AND tarikh = CURRENT_DATE)
  WITH CHECK (NOT is_admin(auth.uid()) AND jurulatih_id = auth.uid());

-- Resit: Admin sahaja
CREATE POLICY "admin_all_resit" ON resit
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Jurulatih: Admin sahaja boleh urus
CREATE POLICY "admin_all_jurulatih" ON jurulatih
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Jurulatih: Jurulatih boleh lihat senarai jurulatih
CREATE POLICY "jurulatih_view_jurulatih" ON jurulatih
  FOR SELECT TO authenticated
  USING (NOT is_admin(auth.uid()));

-- Kehadiran Jurulatih: Admin sahaja
CREATE POLICY "admin_all_kehadiran_jurulatih" ON kehadiran_jurulatih
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Bayaran Jurulatih: Admin sahaja
CREATE POLICY "admin_all_bayaran_jurulatih" ON bayaran_jurulatih
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Kewangan: Admin sahaja
CREATE POLICY "admin_all_kewangan" ON kewangan_perbelanjaan
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Aset: Admin sahaja
CREATE POLICY "admin_all_aset" ON aset
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Import Antrian: Admin sahaja
CREATE POLICY "admin_all_import" ON import_antrian
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ============================================================
-- SEED DATA AWAL
-- ============================================================

INSERT INTO cawangan (nama, alamat) VALUES
  ('Klebang', 'Klebang, Ipoh, Perak'),
  ('Buntong', 'Buntong, Ipoh, Perak'),
  ('Sri Iskandar', 'Sri Iskandar, Perak'),
  ('SMK Star', 'SMK Star, Ipoh, Perak')
ON CONFLICT DO NOTHING;
