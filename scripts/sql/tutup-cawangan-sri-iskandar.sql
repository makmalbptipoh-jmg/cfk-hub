-- ============================================================
-- CFK HUB — TUTUP cawangan Sri Iskandar (14 Nov 2026)
-- Cawangan + slot jadual Aktif → 'Tidak Aktif'.
-- Pelajar TIDAK disentuh (ada yang pindah cawangan — pindah/nyahaktif
-- secara manual di /pelajar). Rekod lama (kehadiran, resit, gaji) kekal.
-- Idempotent.
-- ============================================================

-- 1) SEMAK DULU
select id, nama, status from cawangan where nama ilike '%iskandar%';

select id, jenis, hari_minggu, masa_mula, status
from jadual_slot
where cawangan_id in (select id from cawangan where nama ilike '%iskandar%')
  and status = 'Aktif';

-- Pelajar Aktif yang masih berdaftar di Sri Iskandar (untuk tindakan manual):
select id, nama_penuh, jenis_kelas
from pelajar
where cawangan_daftar_id in (select id from cawangan where nama ilike '%iskandar%')
  and status = 'Aktif'
order by nama_penuh;

-- 2) TUTUP
begin;

update jadual_slot set status = 'Tidak Aktif'
where cawangan_id in (select id from cawangan where nama ilike '%iskandar%')
  and status = 'Aktif';

update cawangan set status = 'Tidak Aktif'
where nama ilike '%iskandar%';

commit;

-- 3) SAHKAN — cawangan 'Tidak Aktif', 0 slot Aktif
select nama, status from cawangan where nama ilike '%iskandar%';
select count(*) as slot_aktif_berbaki
from jadual_slot
where cawangan_id in (select id from cawangan where nama ilike '%iskandar%')
  and status = 'Aktif';
