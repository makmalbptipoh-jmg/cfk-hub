-- ============================================================
-- CFK HUB — Jurulatih boleh update Silibus Pelajar (dari telefon)
-- Paste dalam Supabase SQL Editor dan Run SEBELUM deploy kod.
-- Selamat dijalankan berulang kali (idempotent).
--
-- Benarkan jurulatih BERPAUT (pengguna_id = auth.uid()) menulis ke
-- silibus_progress_pelajar — INSERT + UPDATE sahaja (upsert), BUKAN DELETE.
-- Polisi admin sedia ada (FOR ALL) dikekalkan. Polisi permissive OR-digabung.
-- Guna semula fungsi jurulatih_id_semasa() (jurulatih-self-service.sql).
-- TIADA jadual baharu.
-- ============================================================

-- Jaga-jaga: pastikan fungsi wujud (kalau skrip jurulatih belum dijalankan).
CREATE OR REPLACE FUNCTION jurulatih_id_semasa()
RETURNS UUID AS $$
  SELECT id FROM jurulatih WHERE pengguna_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- INSERT: jurulatih berpaut boleh cipta baris progress
DROP POLICY IF EXISTS "jurulatih_insert_silibus_progress_pelajar" ON silibus_progress_pelajar;
CREATE POLICY "jurulatih_insert_silibus_progress_pelajar" ON silibus_progress_pelajar
  FOR INSERT TO authenticated
  WITH CHECK (jurulatih_id_semasa() IS NOT NULL);

-- UPDATE: jurulatih berpaut boleh kemas kini baris sedia ada (upsert on-conflict)
DROP POLICY IF EXISTS "jurulatih_update_silibus_progress_pelajar" ON silibus_progress_pelajar;
CREATE POLICY "jurulatih_update_silibus_progress_pelajar" ON silibus_progress_pelajar
  FOR UPDATE TO authenticated
  USING (jurulatih_id_semasa() IS NOT NULL)
  WITH CHECK (jurulatih_id_semasa() IS NOT NULL);

-- ============================================================
-- ROLLBACK (jurulatih kembali baca-sahaja):
--   DROP POLICY IF EXISTS "jurulatih_insert_silibus_progress_pelajar" ON silibus_progress_pelajar;
--   DROP POLICY IF EXISTS "jurulatih_update_silibus_progress_pelajar" ON silibus_progress_pelajar;
-- ============================================================
