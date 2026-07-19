-- ============================================================
-- CFK HUB — Jurulatih daftar pelajar baru dari telefon
-- Sebelum ini: INSERT pelajar HANYA admin (polisi "tambah_admin"
-- WITH CHECK is_admin). Migration ini benarkan jurulatih BERPAUT
-- (akaun dikaitkan dengan profil jurulatih) menambah pelajar terus.
-- Juga tambah nilai sumber_daftar 'Jurulatih' supaya admin boleh
-- kenal pasti pelajar yang didaftar oleh jurulatih (untuk notifikasi).
-- Paste dalam Supabase SQL Editor & Run. Selamat dijalankan berulang.
-- Bergantung pada is_admin(auth.uid()) & jurulatih_id_semasa() sedia ada.
-- ============================================================

-- ---------- 1. Nilai sumber_daftar 'Jurulatih' ----------
-- Constraint inline dinamakan auto 'pelajar_sumber_daftar_check' oleh Postgres.
ALTER TABLE pelajar DROP CONSTRAINT IF EXISTS pelajar_sumber_daftar_check;
ALTER TABLE pelajar ADD CONSTRAINT pelajar_sumber_daftar_check
  CHECK (sumber_daftar IN ('GoogleForms', 'Manual', 'Jurulatih'));

-- ---------- 2. RLS INSERT: admin ATAU jurulatih berpaut ----------
DROP POLICY IF EXISTS "tambah_admin" ON pelajar;
DROP POLICY IF EXISTS "tambah_admin_atau_jurulatih" ON pelajar;
CREATE POLICY "tambah_admin_atau_jurulatih" ON pelajar
  FOR INSERT TO authenticated
  WITH CHECK (is_admin(auth.uid()) OR jurulatih_id_semasa() IS NOT NULL);

-- Nota: polisi "baca" (SELECT semua), "ubah" (UPDATE — jurulatih tandai
-- Tak Aktif) & "padam_admin" (DELETE admin) TIDAK disentuh.

-- ============================================================
-- ROLLBACK (buang komen & run untuk balikkan ke keadaan asal):
-- DROP POLICY IF EXISTS "tambah_admin_atau_jurulatih" ON pelajar;
-- CREATE POLICY "tambah_admin" ON pelajar
--   FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
-- ALTER TABLE pelajar DROP CONSTRAINT IF EXISTS pelajar_sumber_daftar_check;
-- ALTER TABLE pelajar ADD CONSTRAINT pelajar_sumber_daftar_check
--   CHECK (sumber_daftar IN ('GoogleForms', 'Manual'));
-- ============================================================
