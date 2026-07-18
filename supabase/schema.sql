-- ============================================================
-- CFK HUB — Skema Pangkalan Data (RUJUKAN PENUH)
--
-- Fail ini ialah rujukan PENUH skema semasa — untuk setup segar
-- (fresh setup) projek Supabase baharu. Perubahan tambahan
-- (incremental) dibuat melalui fail migrasi dalam scripts/sql/*.sql
-- (paste-and-run dalam Supabase SQL Editor); fail ini menggabungkan
-- kesemua migrasi tersebut ke dalam definisi CREATE TABLE.
--
-- Tarikh sync terakhir: 2026-07-18
-- Jalankan dalam Supabase SQL Editor (ikut urutan).
-- ============================================================

-- 1. JADUAL CAWANGAN
CREATE TABLE IF NOT EXISTS cawangan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  alamat TEXT,
  no_telefon TEXT,
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
-- (alamat: tambah-alamat-pelajar.sql; keluarga_id: tambah-keluarga-pelajar.sql —
--  pelajar berkongsi keluarga_id sama = adik-beradik)
CREATE TABLE IF NOT EXISTS pelajar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_penuh TEXT NOT NULL,
  tarikh_lahir DATE,
  nama_ibu_bapa TEXT NOT NULL,
  no_telefon TEXT NOT NULL,
  emel_ibu_bapa TEXT,
  alamat TEXT,
  keluarga_id UUID,
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
-- (gambar_path: tambah-gambar-jurulatih.sql;
--  no_tng + tng_qr_path: gaji-advance-tng.sql — TNG eWallet)
CREATE TABLE IF NOT EXISTS jurulatih (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pengguna_id UUID REFERENCES pengguna_profil(id),
  gambar_path TEXT,
  nama_penuh TEXT NOT NULL,
  no_ic TEXT UNIQUE,
  no_telefon TEXT,
  emel TEXT,
  cawangan_ids UUID[] DEFAULT '{}',
  kadar_bayaran DECIMAL(8,2),
  tarikh_mula DATE,
  pengalaman_ringkas TEXT,
  kelayakan TEXT,
  no_tng TEXT,
  tng_qr_path TEXT,
  status TEXT DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Tidak Aktif')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. JADUAL KEHADIRAN JURULATIH
-- (cawangan_id + jenis_kelas: kehadiran-jurulatih-cawangan.sql —
--  benarkan beberapa sesi sehari; UNIQUE lama (jurulatih_id, tarikh)
--  diganti dengan constraint sesi unik yang lebih terperinci)
CREATE TABLE IF NOT EXISTS kehadiran_jurulatih (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  jurulatih_id UUID REFERENCES jurulatih(id) NOT NULL,
  tarikh DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Hadir', 'Tidak Hadir', 'Cuti')),
  cawangan_id UUID REFERENCES cawangan(id),
  jenis_kelas TEXT NOT NULL DEFAULT 'Kumpulan' CHECK (jenis_kelas IN ('Kumpulan', 'Personal')),
  nota TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- NULLS NOT DISTINCT: dua rekod tanpa cawangan pada hari sama = pendua
  CONSTRAINT kehadiran_jurulatih_sesi_unik
    UNIQUE NULLS NOT DISTINCT (jurulatih_id, tarikh, cawangan_id, jenis_kelas)
);

-- 9. JADUAL BAYARAN JURULATIH
-- (potongan_advance + kaedah_bayaran: gaji-advance-tng.sql —
--  kaedah_bayaran: 'Tunai' | 'TNG eWallet' | 'Transfer Bank')
CREATE TABLE IF NOT EXISTS bayaran_jurulatih (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  jurulatih_id UUID REFERENCES jurulatih(id) NOT NULL,
  bulan_bayaran TEXT NOT NULL,
  tahun_bayaran INTEGER NOT NULL,
  bilangan_sesi INTEGER NOT NULL,
  kadar_per_sesi DECIMAL(8,2) NOT NULL,
  jumlah DECIMAL(8,2) GENERATED ALWAYS AS (bilangan_sesi * kadar_per_sesi) STORED,
  potongan_advance DECIMAL(8,2) NOT NULL DEFAULT 0,
  kaedah_bayaran TEXT,
  tarikh_bayar DATE,
  status TEXT DEFAULT 'Belum Bayar' CHECK (status IN ('Sudah Bayar', 'Belum Bayar')),
  nota TEXT,
  direkod_oleh UUID REFERENCES pengguna_profil(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. JADUAL ADVANCE JURULATIH (pendahuluan gaji)
-- (gaji-advance-tng.sql)
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

-- 11. JADUAL KEWANGAN PERBELANJAAN
-- (bukti_path: tambah-bukti-perbelanjaan.sql — upload resit)
CREATE TABLE IF NOT EXISTS kewangan_perbelanjaan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tarikh DATE NOT NULL,
  kategori TEXT NOT NULL,
  penerangan TEXT NOT NULL,
  jumlah DECIMAL(8,2) NOT NULL,
  cawangan_id UUID REFERENCES cawangan(id),
  direkod_oleh UUID REFERENCES pengguna_profil(id),
  bukti_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. JADUAL ASET
-- (kuantiti + harga_seunit: tambah-kuantiti-aset.sql —
--  nilai_asal kekal JUMLAH keseluruhan = kuantiti × harga seunit)
CREATE TABLE IF NOT EXISTS aset (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  kategori TEXT,
  kuantiti INTEGER NOT NULL DEFAULT 1,
  harga_seunit NUMERIC(10,2),
  nilai_asal DECIMAL(8,2),
  tarikh_beli DATE,
  cawangan_id UUID REFERENCES cawangan(id),
  status TEXT DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Lupus')),
  sebab_lupus TEXT,
  tarikh_lupus DATE,
  nota TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. JADUAL IMPORT ANTRIAN (dari Google Forms)
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

-- 14. JADUAL HISTORI MAKLUMAN (makluman-histori.sql)
CREATE TABLE IF NOT EXISTS makluman_histori (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  jenis TEXT NOT NULL CHECK (jenis IN ('Yuran', 'Kelas', 'Pertandingan', 'Pembatalan')),
  penerima TEXT NOT NULL,
  teks TEXT NOT NULL,
  penghantar_id UUID REFERENCES pengguna_profil(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. JADUAL NOTIFIKASI (loceng amaran operasi + sejarah) (notifikasi.sql)
CREATE TABLE IF NOT EXISTS notifikasi (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  jenis TEXT NOT NULL,                 -- cth: 'belum_bayar'
  tajuk TEXT NOT NULL,
  mesej TEXT NOT NULL,
  pautan TEXT,                         -- URL dalam app untuk tindakan
  kunci TEXT UNIQUE,                   -- kunci nyahduplikat, cth 'belum_bayar:<pelajar>:2026-07'
  rujukan_id UUID,                     -- id entiti berkaitan (cth pelajar) untuk auto-selesai
  dibaca BOOLEAN NOT NULL DEFAULT FALSE,
  dibaca_pada TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. JADUAL DOKUMEN JUALAN (Sebut Harga / Invois / Resit Rasmi)
-- (dokumen-jualan.sql — jualan peralatan catur & perkhidmatan)
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

-- Nombor auto dokumen jualan: YYYY-NNNNN
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

-- 17. JADUAL DOKUMEN ITEM (baris-baris peralatan/perkhidmatan)
CREATE TABLE IF NOT EXISTS dokumen_item (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dokumen_id UUID NOT NULL REFERENCES dokumen_jualan(id) ON DELETE CASCADE,
  urutan INT NOT NULL DEFAULT 0,
  perihalan TEXT NOT NULL,
  kuantiti NUMERIC(10,2) NOT NULL DEFAULT 1 CHECK (kuantiti > 0),
  harga_seunit NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (harga_seunit >= 0)
);

-- 18. JADUAL PENDAPATAN LAIN / SUMBANGAN
-- (pendapatan-lain.sql; no_resit: resit-pendapatan.sql;
--  dokumen_id: dokumen-jualan.sql — auto pendapatan bila peringkat 'Resit')
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
  no_resit TEXT,                        -- nombor resit auto: CFK-L-YYYY-NNNNN
  dokumen_id UUID REFERENCES dokumen_jualan(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nombor resit auto pendapatan lain: CFK-L-YYYY-NNNNN (L = pendapatan lain)
CREATE SEQUENCE IF NOT EXISTS seq_resit_pendapatan;

CREATE OR REPLACE FUNCTION jana_no_resit_pendapatan() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.no_resit IS NULL THEN
    NEW.no_resit := 'CFK-L-' || to_char(COALESCE(NEW.tarikh, CURRENT_DATE), 'YYYY')
      || '-' || lpad(nextval('seq_resit_pendapatan')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_no_resit_pendapatan ON pendapatan_lain;
CREATE TRIGGER trg_no_resit_pendapatan BEFORE INSERT ON pendapatan_lain
  FOR EACH ROW EXECUTE FUNCTION jana_no_resit_pendapatan();

-- 19. JADUAL KELAS — SLOT MINGGUAN (jadual-kelas.sql)
-- Slot berulang MINGGUAN: kelas Kumpulan per cawangan, kelas
-- Personal terikat pada pelajar. Tiada tarikh — hanya hari minggu.
-- (jurulatih_ids UUID[]: jadual-jurulatih-ramai.sql — jurulatih RAMAI
--  per slot; kolum jurulatih_id tunggal asal telah digugurkan)
CREATE TABLE IF NOT EXISTS jadual_slot (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  jenis TEXT NOT NULL CHECK (jenis IN ('Kumpulan', 'Personal')),
  hari_minggu SMALLINT NOT NULL CHECK (hari_minggu BETWEEN 0 AND 6),  -- 0=Ahad ... 6=Sabtu
  masa_mula TIME NOT NULL,
  masa_tamat TIME NOT NULL,
  cawangan_id UUID REFERENCES cawangan(id),   -- wajib untuk Kumpulan; pilihan untuk Personal
  pelajar_id UUID REFERENCES pelajar(id),     -- wajib untuk Personal
  jurulatih_ids UUID[] NOT NULL DEFAULT '{}', -- senarai jurulatih (boleh ramai)
  lokasi TEXT,                                -- override lokasi (cth. rumah pelajar)
  nota TEXT,
  status TEXT NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Tidak Aktif')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_slot_masa CHECK (masa_tamat > masa_mula),
  CONSTRAINT chk_slot_kumpulan CHECK (jenis <> 'Kumpulan' OR cawangan_id IS NOT NULL),
  CONSTRAINT chk_slot_personal CHECK (jenis <> 'Personal' OR pelajar_id IS NOT NULL)
);

-- 20. JADUAL PEMBATALAN SLOT (batal-kelas.sql)
-- Slot jadual berulang setiap minggu; jadual ini merekod tarikh
-- tertentu di mana slot itu DIBATALKAN (cth. cuti umum, jurulatih
-- tiada). Slot dipapar bergaris + label "Dibatalkan" pada tarikh
-- itu sahaja — minggu lain berjalan seperti biasa.
CREATE TABLE IF NOT EXISTS jadual_slot_batal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_id UUID NOT NULL REFERENCES jadual_slot(id) ON DELETE CASCADE,
  tarikh DATE NOT NULL,
  sebab TEXT,
  direkod_oleh UUID REFERENCES pengguna_profil(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uniq_slot_batal UNIQUE (slot_id, tarikh)
);

-- 21. JADUAL AKTIVITI BERTARIKH (jadual-kelas.sql)
-- Aktiviti sekali sahaja: pertandingan, kem, mesyuarat, kelas ganti,
-- dan temujanji kelas personal ad-hoc (kategori 'Kelas Personal' + pelajar_id).
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
  jurulatih_ids UUID[] NOT NULL DEFAULT '{}', -- senarai jurulatih (boleh ramai)
  penerangan TEXT,
  status TEXT NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Dibatalkan')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_aktiviti_masa CHECK (masa_tamat IS NULL OR masa_mula IS NULL OR masa_tamat > masa_mula)
);

-- 22. JADUAL LOG AKTIVITI / AUDIT (log-aktiviti.sql)
-- Rekod automatik siapa Cipta/Edit/Padam rekod penting + Log Masuk.
CREATE TABLE IF NOT EXISTS log_aktiviti (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pengguna_id UUID,
  pengguna_nama TEXT,
  aksi TEXT NOT NULL,          -- 'Cipta' | 'Edit' | 'Padam' | 'Log Masuk'
  jadual TEXT NOT NULL,
  rekod_id UUID,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fungsi trigger audit — SECURITY DEFINER supaya insert audit tidak disekat RLS.
-- DEFENSIF: sebarang kegagalan audit TIDAK menggagalkan operasi asal.
CREATE OR REPLACE FUNCTION rekod_log_aktiviti() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_aksi TEXT;
  v_uid UUID;
  v_nama TEXT;
  v_baris JSONB;
  v_rekod_id UUID;
BEGIN
  v_uid := auth.uid();
  BEGIN
    SELECT nama INTO v_nama FROM pengguna_profil WHERE id = v_uid;
  EXCEPTION WHEN OTHERS THEN v_nama := NULL;
  END;
  IF v_nama IS NULL THEN v_nama := 'Sistem'; END IF;

  IF TG_OP = 'INSERT' THEN v_aksi := 'Cipta'; v_baris := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN v_aksi := 'Edit'; v_baris := to_jsonb(NEW);
  ELSE v_aksi := 'Padam'; v_baris := to_jsonb(OLD);
  END IF;

  v_rekod_id := (v_baris->>'id')::UUID;

  INSERT INTO log_aktiviti (pengguna_id, pengguna_nama, aksi, jadual, rekod_id, data)
  VALUES (v_uid, v_nama, v_aksi, TG_TABLE_NAME, v_rekod_id, v_baris);

  RETURN COALESCE(NEW, OLD);
EXCEPTION WHEN OTHERS THEN
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Pasang trigger audit pada jadual penting
DO $$
DECLARE
  t TEXT;
  jaduals TEXT[] := ARRAY[
    'resit', 'kewangan_perbelanjaan', 'pendapatan_lain',
    'kehadiran', 'kehadiran_jurulatih', 'pelajar',
    'jurulatih', 'aset', 'cawangan', 'pengguna_profil'
  ];
BEGIN
  FOREACH t IN ARRAY jaduals LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=t) THEN
      EXECUTE format('DROP TRIGGER IF EXISTS trg_log_%I ON %I', t, t);
      EXECUTE format(
        'CREATE TRIGGER trg_log_%I AFTER INSERT OR UPDATE OR DELETE ON %I
         FOR EACH ROW EXECUTE FUNCTION rekod_log_aktiviti()', t, t);
    END IF;
  END LOOP;
END $$;

-- ============================================================
-- INDEX UNTUK KELAJUAN QUERY
-- ============================================================

-- PELAJAR
CREATE INDEX IF NOT EXISTS idx_pelajar_status ON pelajar (status);
CREATE INDEX IF NOT EXISTS idx_pelajar_cawangan ON pelajar (cawangan_daftar_id, status);
CREATE INDEX IF NOT EXISTS idx_pelajar_keluarga ON pelajar (keluarga_id) WHERE keluarga_id IS NOT NULL;

-- KEHADIRAN
CREATE INDEX IF NOT EXISTS idx_kehadiran_pelajar_tarikh ON kehadiran (pelajar_id, tarikh DESC);
CREATE INDEX IF NOT EXISTS idx_kehadiran_sesi_tarikh ON kehadiran (cawangan_sesi_id, tarikh);
CREATE INDEX IF NOT EXISTS idx_kehadiran_tarikh_status ON kehadiran (tarikh, status);

-- RESIT
CREATE INDEX IF NOT EXISTS idx_resit_pelajar ON resit (pelajar_id, tahun_bayaran, bulan_bayaran);
CREATE INDEX IF NOT EXISTS idx_resit_bulan_tahun ON resit (tahun_bayaran, bulan_bayaran, status);
CREATE INDEX IF NOT EXISTS idx_resit_tarikh_bayar ON resit (tarikh_bayar DESC);

-- KEHADIRAN JURULATIH
CREATE INDEX IF NOT EXISTS idx_kehadiran_jurulatih ON kehadiran_jurulatih (jurulatih_id, tarikh DESC);

-- BAYARAN JURULATIH
CREATE INDEX IF NOT EXISTS idx_bayaran_jurulatih ON bayaran_jurulatih (jurulatih_id, tahun_bayaran, bulan_bayaran);

-- ADVANCE JURULATIH
CREATE INDEX IF NOT EXISTS idx_advance_jurulatih ON advance_jurulatih (jurulatih_id, status);

-- KEWANGAN PERBELANJAAN
CREATE INDEX IF NOT EXISTS idx_perbelanjaan_tarikh ON kewangan_perbelanjaan (tarikh DESC);
CREATE INDEX IF NOT EXISTS idx_perbelanjaan_cawangan ON kewangan_perbelanjaan (cawangan_id);

-- ASET
CREATE INDEX IF NOT EXISTS idx_aset_status ON aset (status);
CREATE INDEX IF NOT EXISTS idx_aset_cawangan ON aset (cawangan_id);

-- IMPORT ANTRIAN
CREATE INDEX IF NOT EXISTS idx_import_antrian_status ON import_antrian (status);

-- MAKLUMAN HISTORI
CREATE INDEX IF NOT EXISTS idx_makluman_histori_created ON makluman_histori (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_makluman_histori_penghantar ON makluman_histori (penghantar_id);

-- NOTIFIKASI
CREATE INDEX IF NOT EXISTS idx_notifikasi_dibaca ON notifikasi (dibaca, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifikasi_jenis ON notifikasi (jenis);

-- PENDAPATAN LAIN
CREATE INDEX IF NOT EXISTS idx_pendapatan_lain_tarikh ON pendapatan_lain (tarikh DESC);
CREATE INDEX IF NOT EXISTS idx_pendapatan_lain_kategori ON pendapatan_lain (kategori);
-- Satu dokumen hanya boleh ada satu rekod pendapatan (NULL dibenar berulang).
CREATE UNIQUE INDEX IF NOT EXISTS uq_pendapatan_dokumen
  ON pendapatan_lain (dokumen_id) WHERE dokumen_id IS NOT NULL;

-- DOKUMEN JUALAN
CREATE INDEX IF NOT EXISTS idx_dokumen_jualan_tarikh ON dokumen_jualan (tarikh DESC);
CREATE INDEX IF NOT EXISTS idx_dokumen_jualan_peringkat ON dokumen_jualan (peringkat);
CREATE INDEX IF NOT EXISTS idx_dokumen_item_dokumen ON dokumen_item (dokumen_id);

-- LOG AKTIVITI
CREATE INDEX IF NOT EXISTS idx_log_aktiviti_created ON log_aktiviti (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_log_aktiviti_jadual ON log_aktiviti (jadual);

-- JADUAL KELAS
CREATE INDEX IF NOT EXISTS idx_jadual_slot_hari ON jadual_slot (status, hari_minggu, masa_mula);
CREATE INDEX IF NOT EXISTS idx_slot_batal_tarikh ON jadual_slot_batal (tarikh);
CREATE INDEX IF NOT EXISTS idx_aktiviti_tarikh ON aktiviti (status, tarikh);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Keadaan AKHIR polisi selepas rls-ketat.sql + migrasi lain:
-- - Jadual teras: BACA terbuka (pengguna log masuk) + TULIS admin sahaja
-- - kehadiran: jurulatih boleh rekod (insert/update); padam admin
-- - pelajar: jurulatih boleh UPDATE (tanda Tak Aktif); tambah/padam admin
-- - kehadiran_jurulatih: admin semua + self-service jurulatih
-- ============================================================

ALTER TABLE cawangan ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengguna_profil ENABLE ROW LEVEL SECURITY;
ALTER TABLE pelajar ENABLE ROW LEVEL SECURITY;
ALTER TABLE kehadiran ENABLE ROW LEVEL SECURITY;
ALTER TABLE resit ENABLE ROW LEVEL SECURITY;
ALTER TABLE jurulatih ENABLE ROW LEVEL SECURITY;
ALTER TABLE kehadiran_jurulatih ENABLE ROW LEVEL SECURITY;
ALTER TABLE bayaran_jurulatih ENABLE ROW LEVEL SECURITY;
ALTER TABLE advance_jurulatih ENABLE ROW LEVEL SECURITY;
ALTER TABLE kewangan_perbelanjaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE aset ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_antrian ENABLE ROW LEVEL SECURITY;
ALTER TABLE makluman_histori ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifikasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE pendapatan_lain ENABLE ROW LEVEL SECURITY;
ALTER TABLE dokumen_jualan ENABLE ROW LEVEL SECURITY;
ALTER TABLE dokumen_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_aktiviti ENABLE ROW LEVEL SECURITY;
ALTER TABLE jadual_slot ENABLE ROW LEVEL SECURITY;
ALTER TABLE jadual_slot_batal ENABLE ROW LEVEL SECURITY;
ALTER TABLE aktiviti ENABLE ROW LEVEL SECURITY;

-- Helper: semak is_admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT is_admin FROM pengguna_profil WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper: dapatkan id jurulatih milik pengguna semasa (self-service)
CREATE OR REPLACE FUNCTION jurulatih_id_semasa()
RETURNS UUID AS $$
  SELECT id FROM jurulatih WHERE pengguna_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---------- Jadual teras: BACA terbuka + TULIS admin sahaja ----------
-- (ikut rls-ketat.sql: cawangan, resit, jurulatih, bayaran_jurulatih,
--  kewangan_perbelanjaan, aset, import_antrian)
DO $$
DECLARE t TEXT;
  senarai TEXT[] := ARRAY[
    'cawangan', 'resit', 'jurulatih', 'bayaran_jurulatih',
    'kewangan_perbelanjaan', 'aset', 'import_antrian'
  ];
BEGIN
  FOREACH t IN ARRAY senarai LOOP
    EXECUTE format('DROP POLICY IF EXISTS "baca" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "tulis_admin" ON %I', t);
    EXECUTE format('CREATE POLICY "baca" ON %I FOR SELECT TO authenticated USING (true)', t);
    EXECUTE format('CREATE POLICY "tulis_admin" ON %I FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()))', t);
  END LOOP;
END $$;

-- ---------- pengguna_profil ----------
DROP POLICY IF EXISTS "read_own_profil" ON pengguna_profil;
CREATE POLICY "read_own_profil" ON pengguna_profil
  FOR SELECT TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "admin_read_all_profil" ON pengguna_profil;
CREATE POLICY "admin_read_all_profil" ON pengguna_profil
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_manage_profil" ON pengguna_profil;
CREATE POLICY "admin_manage_profil" ON pengguna_profil
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ---------- pelajar: jurulatih UPDATE (Tak Aktif); tambah/padam admin ----------
DROP POLICY IF EXISTS "baca" ON pelajar;
DROP POLICY IF EXISTS "ubah" ON pelajar;
DROP POLICY IF EXISTS "tambah_admin" ON pelajar;
DROP POLICY IF EXISTS "padam_admin" ON pelajar;
CREATE POLICY "baca" ON pelajar FOR SELECT TO authenticated USING (true);
CREATE POLICY "ubah" ON pelajar FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tambah_admin" ON pelajar FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "padam_admin" ON pelajar FOR DELETE TO authenticated USING (is_admin(auth.uid()));

-- ---------- kehadiran: jurulatih rekod (insert/update); padam admin ----------
DROP POLICY IF EXISTS "baca" ON kehadiran;
DROP POLICY IF EXISTS "tambah" ON kehadiran;
DROP POLICY IF EXISTS "ubah" ON kehadiran;
DROP POLICY IF EXISTS "padam_admin" ON kehadiran;
CREATE POLICY "baca" ON kehadiran FOR SELECT TO authenticated USING (true);
CREATE POLICY "tambah" ON kehadiran FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "ubah" ON kehadiran FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "padam_admin" ON kehadiran FOR DELETE TO authenticated USING (is_admin(auth.uid()));

-- ---------- kehadiran_jurulatih: admin semua + self-service jurulatih ----------
DROP POLICY IF EXISTS "admin_all_kehadiran_jurulatih" ON kehadiran_jurulatih;
CREATE POLICY "admin_all_kehadiran_jurulatih" ON kehadiran_jurulatih
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Jurulatih boleh lihat rekod kehadiran SENDIRI (semua bulan)
DROP POLICY IF EXISTS "jurulatih_view_kehadiran_sendiri" ON kehadiran_jurulatih;
CREATE POLICY "jurulatih_view_kehadiran_sendiri" ON kehadiran_jurulatih
  FOR SELECT TO authenticated
  USING (jurulatih_id = jurulatih_id_semasa());

-- Jurulatih boleh rekod kehadiran sendiri untuk HARI INI sahaja
-- (julat ±1 hari untuk elak isu zon masa UTC vs Malaysia)
DROP POLICY IF EXISTS "jurulatih_insert_kehadiran_sendiri" ON kehadiran_jurulatih;
CREATE POLICY "jurulatih_insert_kehadiran_sendiri" ON kehadiran_jurulatih
  FOR INSERT TO authenticated
  WITH CHECK (
    jurulatih_id = jurulatih_id_semasa()
    AND tarikh BETWEEN CURRENT_DATE - 1 AND CURRENT_DATE + 1
  );

-- Jurulatih boleh ubah status rekod sendiri untuk HARI INI sahaja
DROP POLICY IF EXISTS "jurulatih_update_kehadiran_sendiri" ON kehadiran_jurulatih;
CREATE POLICY "jurulatih_update_kehadiran_sendiri" ON kehadiran_jurulatih
  FOR UPDATE TO authenticated
  USING (
    jurulatih_id = jurulatih_id_semasa()
    AND tarikh BETWEEN CURRENT_DATE - 1 AND CURRENT_DATE + 1
  )
  WITH CHECK (
    jurulatih_id = jurulatih_id_semasa()
    AND tarikh BETWEEN CURRENT_DATE - 1 AND CURRENT_DATE + 1
  );

-- ---------- advance_jurulatih: admin sahaja ----------
DROP POLICY IF EXISTS admin_all_advance_jurulatih ON advance_jurulatih;
CREATE POLICY admin_all_advance_jurulatih ON advance_jurulatih
  FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- ---------- makluman_histori ----------
-- Admin boleh semua
DROP POLICY IF EXISTS "admin_all_makluman_histori" ON makluman_histori;
CREATE POLICY "admin_all_makluman_histori" ON makluman_histori
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Semua pengguna log masuk boleh rekod makluman atas nama sendiri
DROP POLICY IF EXISTS "hantar_makluman_sendiri" ON makluman_histori;
CREATE POLICY "hantar_makluman_sendiri" ON makluman_histori
  FOR INSERT TO authenticated
  WITH CHECK (penghantar_id = auth.uid());

-- Jurulatih boleh lihat makluman yang dihantar sendiri
DROP POLICY IF EXISTS "lihat_makluman_sendiri" ON makluman_histori;
CREATE POLICY "lihat_makluman_sendiri" ON makluman_histori
  FOR SELECT TO authenticated
  USING (penghantar_id = auth.uid());

-- ---------- notifikasi: admin sahaja ----------
DROP POLICY IF EXISTS "admin_all_notifikasi" ON notifikasi;
CREATE POLICY "admin_all_notifikasi" ON notifikasi
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ---------- pendapatan_lain: admin sahaja ----------
DROP POLICY IF EXISTS "admin_all_pendapatan_lain" ON pendapatan_lain;
CREATE POLICY "admin_all_pendapatan_lain" ON pendapatan_lain
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ---------- dokumen_jualan + dokumen_item: admin sahaja ----------
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

-- ---------- log_aktiviti ----------
-- Admin sahaja boleh baca log
DROP POLICY IF EXISTS "log_aktiviti admin baca" ON log_aktiviti;
CREATE POLICY "log_aktiviti admin baca" ON log_aktiviti
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

-- Log Masuk direkod terus dari klien (setiap pengguna untuk dirinya sendiri)
DROP POLICY IF EXISTS "log_aktiviti log masuk sendiri" ON log_aktiviti;
CREATE POLICY "log_aktiviti log masuk sendiri" ON log_aktiviti
  FOR INSERT TO authenticated
  WITH CHECK (aksi = 'Log Masuk' AND pengguna_id = auth.uid());

-- ---------- jadual_slot / jadual_slot_batal / aktiviti ----------
-- BACA terbuka kepada semua pengguna log masuk; TULIS admin sahaja
DROP POLICY IF EXISTS "baca_jadual_slot" ON jadual_slot;
CREATE POLICY "baca_jadual_slot" ON jadual_slot
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "tulis_admin_jadual_slot" ON jadual_slot;
CREATE POLICY "tulis_admin_jadual_slot" ON jadual_slot
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "baca_slot_batal" ON jadual_slot_batal;
CREATE POLICY "baca_slot_batal" ON jadual_slot_batal
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "tulis_admin_slot_batal" ON jadual_slot_batal;
CREATE POLICY "tulis_admin_slot_batal" ON jadual_slot_batal
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

-- ============================================================
-- STORAGE — BUCKET & POLISI
-- ============================================================

-- Bucket peribadi: bukti perbelanjaan (imej/PDF)
INSERT INTO storage.buckets (id, name, public)
VALUES ('bukti-perbelanjaan', 'bukti-perbelanjaan', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "bukti perbelanjaan baca" ON storage.objects;
CREATE POLICY "bukti perbelanjaan baca"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'bukti-perbelanjaan');

DROP POLICY IF EXISTS "bukti perbelanjaan muat naik" ON storage.objects;
CREATE POLICY "bukti perbelanjaan muat naik"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'bukti-perbelanjaan');

DROP POLICY IF EXISTS "bukti perbelanjaan ganti" ON storage.objects;
CREATE POLICY "bukti perbelanjaan ganti"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'bukti-perbelanjaan')
  WITH CHECK (bucket_id = 'bukti-perbelanjaan');

DROP POLICY IF EXISTS "bukti perbelanjaan padam" ON storage.objects;
CREATE POLICY "bukti perbelanjaan padam"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'bukti-perbelanjaan');

-- Bucket peribadi: gambar profil jurulatih (juga folder tng-qr/ untuk QR TNG)
INSERT INTO storage.buckets (id, name, public)
VALUES ('gambar-jurulatih', 'gambar-jurulatih', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "gambar jurulatih baca" ON storage.objects;
CREATE POLICY "gambar jurulatih baca"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'gambar-jurulatih');

DROP POLICY IF EXISTS "gambar jurulatih muat naik" ON storage.objects;
CREATE POLICY "gambar jurulatih muat naik"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'gambar-jurulatih' AND is_admin(auth.uid()));

DROP POLICY IF EXISTS "gambar jurulatih ganti" ON storage.objects;
CREATE POLICY "gambar jurulatih ganti"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'gambar-jurulatih' AND is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'gambar-jurulatih' AND is_admin(auth.uid()));

DROP POLICY IF EXISTS "gambar jurulatih padam" ON storage.objects;
CREATE POLICY "gambar jurulatih padam"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'gambar-jurulatih' AND is_admin(auth.uid()));

-- Bucket peribadi: bukti pendapatan lain (imej/PDF)
INSERT INTO storage.buckets (id, name, public)
VALUES ('bukti-pendapatan', 'bukti-pendapatan', false)
ON CONFLICT (id) DO NOTHING;

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

-- ============================================================
-- SEED DATA AWAL
-- ============================================================

INSERT INTO cawangan (nama, alamat) VALUES
  ('Klebang', 'Klebang, Ipoh, Perak'),
  ('Buntong', 'Buntong, Ipoh, Perak'),
  ('Sri Iskandar', 'Sri Iskandar, Perak'),
  ('SMK Star', 'SMK Star, Ipoh, Perak')
ON CONFLICT DO NOTHING;
