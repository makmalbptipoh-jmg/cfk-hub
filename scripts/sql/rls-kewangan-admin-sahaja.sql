-- ============================================================
-- CFK HUB — Ketatkan BACA jadual kewangan: admin sahaja
-- Sebelum: policy "baca" (SELECT, qual = true) → mana-mana jurulatih log
-- masuk boleh baca SEMUA perbelanjaan & gaji semua jurulatih via anon key.
-- App tidak pernah baca 2 jadual ini dari sisi jurulatih (hanya skrin admin
-- + notifikasi yang sudah di-gate is_admin), jadi tiada fungsi terjejas.
-- Admin kekal boleh baca/tulis melalui policy ALL is_admin() sedia ada.
-- Idempotent. Run di Supabase SQL Editor.
-- ============================================================
begin;

drop policy if exists "baca" on public.kewangan_perbelanjaan;
drop policy if exists "baca" on public.bayaran_jurulatih;

commit;

-- SAHKAN (mesti tiada baris 'baca'; mesti ada policy ALL is_admin):
-- select tablename, policyname, cmd, qual from pg_policies
-- where tablename in ('kewangan_perbelanjaan','bayaran_jurulatih') order by 1, 2;

-- ROLLBACK (jika perlu):
-- create policy "baca" on public.kewangan_perbelanjaan for select to authenticated using (true);
-- create policy "baca" on public.bayaran_jurulatih for select to authenticated using (true);
