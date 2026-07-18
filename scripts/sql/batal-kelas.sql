-- ============================================================
-- CFK HUB — Pembatalan kelas mingguan untuk tarikh tertentu
-- Paste dalam Supabase SQL Editor dan Run SEBELUM deploy kod.
-- Selamat dijalankan berulang kali.
--
-- Slot jadual berulang setiap minggu; jadual ini merekod tarikh
-- tertentu di mana slot itu DIBATALKAN (cth. cuti umum, jurulatih
-- tiada). Slot dipapar bergaris + label "Dibatalkan" pada tarikh
-- itu sahaja — minggu lain berjalan seperti biasa.
-- ============================================================

CREATE TABLE IF NOT EXISTS jadual_slot_batal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_id UUID NOT NULL REFERENCES jadual_slot(id) ON DELETE CASCADE,
  tarikh DATE NOT NULL,
  sebab TEXT,
  direkod_oleh UUID REFERENCES pengguna_profil(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uniq_slot_batal UNIQUE (slot_id, tarikh)
);

CREATE INDEX IF NOT EXISTS idx_slot_batal_tarikh ON jadual_slot_batal (tarikh);

-- RLS: BACA terbuka kepada semua pengguna log masuk (portal jurulatih
-- boleh nampak pembatalan kelak); TULIS admin sahaja.
ALTER TABLE jadual_slot_batal ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "baca_slot_batal" ON jadual_slot_batal;
CREATE POLICY "baca_slot_batal" ON jadual_slot_batal
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "tulis_admin_slot_batal" ON jadual_slot_batal;
CREATE POLICY "tulis_admin_slot_batal" ON jadual_slot_batal
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));
