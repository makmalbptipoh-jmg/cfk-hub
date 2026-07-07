-- ============================================================
-- CFK HUB — Ketatkan RLS ikut peranan (admin vs jurulatih)
-- Sebelum ini jadual teras guna polisi "auth" = MANA-MANA pengguna
-- log masuk boleh baca/TULIS (termasuk jurulatih, melalui API).
-- Migration ini: kekal BACA terbuka (tiada page rosak) tetapi hadkan
-- TULIS kepada admin — KECUALI kehadiran (jurulatih rekod) & pelajar
-- UPDATE (jurulatih tandai Tak Aktif). Paste dalam Supabase SQL Editor
-- dan Run. Selamat dijalankan berulang kali (idempotent).
-- Bergantung pada fungsi is_admin(auth.uid()) sedia ada.
-- ============================================================

-- ---------- Jadual: BACA terbuka + TULIS admin sahaja ----------
-- (jurulatih tiada UI menulis jadual ini; sekat penulisan API)
DO $$
DECLARE t TEXT;
  senarai TEXT[] := ARRAY[
    'cawangan', 'resit', 'jurulatih', 'bayaran_jurulatih',
    'kewangan_perbelanjaan', 'aset', 'import_antrian'
  ];
BEGIN
  FOREACH t IN ARRAY senarai LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=t) THEN
      EXECUTE format('DROP POLICY IF EXISTS "auth" ON %I', t);
      EXECUTE format('DROP POLICY IF EXISTS "baca" ON %I', t);
      EXECUTE format('DROP POLICY IF EXISTS "tulis_admin" ON %I', t);
      EXECUTE format('CREATE POLICY "baca" ON %I FOR SELECT TO authenticated USING (true)', t);
      EXECUTE format('CREATE POLICY "tulis_admin" ON %I FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()))', t);
    END IF;
  END LOOP;
END $$;

-- ---------- kehadiran: jurulatih rekod (insert/update); padam admin ----------
DROP POLICY IF EXISTS "auth" ON kehadiran;
DROP POLICY IF EXISTS "baca" ON kehadiran;
DROP POLICY IF EXISTS "tambah" ON kehadiran;
DROP POLICY IF EXISTS "ubah" ON kehadiran;
DROP POLICY IF EXISTS "padam_admin" ON kehadiran;
CREATE POLICY "baca" ON kehadiran FOR SELECT TO authenticated USING (true);
CREATE POLICY "tambah" ON kehadiran FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "ubah" ON kehadiran FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "padam_admin" ON kehadiran FOR DELETE TO authenticated USING (is_admin(auth.uid()));

-- ---------- pelajar: jurulatih UPDATE (Tak Aktif); tambah/padam admin ----------
DROP POLICY IF EXISTS "auth" ON pelajar;
DROP POLICY IF EXISTS "baca" ON pelajar;
DROP POLICY IF EXISTS "ubah" ON pelajar;
DROP POLICY IF EXISTS "tambah_admin" ON pelajar;
DROP POLICY IF EXISTS "padam_admin" ON pelajar;
CREATE POLICY "baca" ON pelajar FOR SELECT TO authenticated USING (true);
CREATE POLICY "ubah" ON pelajar FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tambah_admin" ON pelajar FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "padam_admin" ON pelajar FOR DELETE TO authenticated USING (is_admin(auth.uid()));

-- Nota: kehadiran_jurulatih, pengguna_profil, pendapatan_lain, notifikasi,
-- log_aktiviti, makluman_histori TIDAK disentuh — sudah ada polisi khusus
-- (self-service jurulatih / admin sahaja).

-- ============================================================
-- ROLLBACK (jika perlu balikkan ke keadaan asal — buang komen & run):
-- DO $$ DECLARE t TEXT; senarai TEXT[] := ARRAY['cawangan','resit','jurulatih',
--   'bayaran_jurulatih','kewangan_perbelanjaan','aset','import_antrian','kehadiran','pelajar'];
-- BEGIN FOREACH t IN ARRAY senarai LOOP
--   EXECUTE format('DROP POLICY IF EXISTS "baca" ON %I', t);
--   EXECUTE format('DROP POLICY IF EXISTS "tulis_admin" ON %I', t);
--   EXECUTE format('DROP POLICY IF EXISTS "tambah" ON %I', t);
--   EXECUTE format('DROP POLICY IF EXISTS "ubah" ON %I', t);
--   EXECUTE format('DROP POLICY IF EXISTS "tambah_admin" ON %I', t);
--   EXECUTE format('DROP POLICY IF EXISTS "padam_admin" ON %I', t);
--   EXECUTE format('CREATE POLICY "auth" ON %I FOR ALL USING (auth.role() = ''authenticated'')', t);
-- END LOOP; END $$;
-- ============================================================
