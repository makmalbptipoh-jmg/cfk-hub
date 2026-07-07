-- ============================================================
-- CFK HUB — Log Aktiviti / Audit
-- Rekod automatik siapa Cipta/Edit/Padam rekod penting + Log Masuk.
-- Guna trigger DB (tangkap semua perubahan) + polisi log masuk klien.
-- Paste dalam Supabase SQL Editor dan Run. Selamat dijalankan berulang.
-- ============================================================

-- 1) Jadual log
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

CREATE INDEX IF NOT EXISTS idx_log_aktiviti_created ON log_aktiviti (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_log_aktiviti_jadual ON log_aktiviti (jadual);

ALTER TABLE log_aktiviti ENABLE ROW LEVEL SECURITY;

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

-- 2) Fungsi trigger — SECURITY DEFINER supaya insert audit tidak disekat RLS.
--    DEFENSIF: sebarang kegagalan audit TIDAK menggagalkan operasi asal.
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

-- 3) Pasang trigger pada jadual penting
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
    -- langkau jika jadual belum wujud (cth pendapatan_lain belum di-run)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=t) THEN
      EXECUTE format('DROP TRIGGER IF EXISTS trg_log_%I ON %I', t, t);
      EXECUTE format(
        'CREATE TRIGGER trg_log_%I AFTER INSERT OR UPDATE OR DELETE ON %I
         FOR EACH ROW EXECUTE FUNCTION rekod_log_aktiviti()', t, t);
    END IF;
  END LOOP;
END $$;
