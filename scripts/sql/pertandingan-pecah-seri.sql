-- ============================================================
-- CFK HUB — Pertandingan: simpan SEMUA tie-break (pecah seri) generik
-- Paste dalam Supabase SQL Editor dan Run. Idempotent.
--
-- Sebelum ini hanya `buchholz` + `sonneborn` (2 tie-break). Swiss-Manager
-- boleh dikonfigur dengan pelbagai tie-break (cth BH:GP, PS, SB). Column
-- `pecah_seri` (JSONB) simpan senarai penuh ikut label sebenar dalam fail:
--   [{ "label": "BH:GP", "nilai": 40.5 }, { "label": "PS", "nilai": 33.5 }, ...]
-- ============================================================

ALTER TABLE pertandingan_keputusan
  ADD COLUMN IF NOT EXISTS pecah_seri JSONB;

COMMENT ON COLUMN pertandingan_keputusan.pecah_seri IS 'Senarai tie-break ikut label Swiss-Manager: [{label, nilai}]. Column buchholz/sonneborn dikekalkan untuk keserasian.';

-- ============================================================
-- ROLLBACK:
--   ALTER TABLE pertandingan_keputusan DROP COLUMN IF EXISTS pecah_seri;
-- ============================================================
