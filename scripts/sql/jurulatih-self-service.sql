-- ============================================================
-- CFK HUB — Jurulatih self-service: rekod kehadiran sendiri
-- Paste dalam Supabase SQL Editor dan Run SEBELUM guna page
-- /kehadiran-saya. Selamat dijalankan berulang kali.
-- ============================================================

-- Helper: dapatkan id jurulatih milik pengguna semasa
CREATE OR REPLACE FUNCTION jurulatih_id_semasa()
RETURNS UUID AS $$
  SELECT id FROM jurulatih WHERE pengguna_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

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
