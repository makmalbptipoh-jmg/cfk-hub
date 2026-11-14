-- ============================================================
-- CFK HUB — ARKIB jadual ciri yang dibuang (Sesi 25, 14 Nov 2026)
-- Run SELEPAS kod baharu (branch chore/buang-ciri-bertindih) LIVE.
--
-- Jadual TIDAK dipadam — dipindah ke skema `arkib` (luar API Supabase),
-- jadi data kekal & boleh dipulihkan. Padam kekal hanya bila pasti
-- (lihat bahagian PADAM KEKAL di bawah, dikomen).
--
--   pelajar_topik, topik_kategori → Progress Pembelajaran lama (diganti tab
--                                    Silibus Personal di /silibus)
--   silibus                       → Log Harian silibus (tab dibuang)
--   permintaan_bayaran            → Bayaran online ToyyibPay (dibuang)
--
-- buku_rujukan KEKAL (masih dipakai /bahan). resit.kaedah_bayaran 'Online'
-- KEKAL dalam CHECK supaya resit online lama masih sah.
-- Idempotent: selamat run lebih sekali.
-- ============================================================

-- 1) SEMAK DULU — lokasi & bilangan rekod (selamat walaupun jadual tiada)
select t as jadual,
       to_regclass('public.' || t) is not null as di_public,
       to_regclass('arkib.' || t) is not null as di_arkib,
       case when to_regclass('public.' || t) is not null then
         (xpath('/row/c/text()', query_to_xml(
           format('select count(*) as c from public.%I', t), false, true, '')))[1]::text::int
       end as bil_rekod,
       case when t = 'permintaan_bayaran' and to_regclass('public.permintaan_bayaran') is not null then
         (xpath('/row/c/text()', query_to_xml(
           'select count(*) as c from public.permintaan_bayaran where status = ''Menunggu''',
           false, true, '')))[1]::text::int
       end as bil_menunggu
from unnest(array['pelajar_topik', 'topik_kategori', 'silibus', 'permintaan_bayaran']) as t;
-- Jika bil_menunggu > 0, semak di toyyibpay.com dahulu (bayaran yang masuk
-- SELEPAS ini TIDAK akan auto-jana resit lagi). Senarai penuh:
--   select bill_code, nama_pelajar, bulan_bayaran, tahun_bayaran, jumlah, created_at
--   from public.permintaan_bayaran where status = 'Menunggu' order by created_at desc;

-- 2) ARKIB
create schema if not exists arkib;

do $$
declare t text;
begin
  -- pelajar_topik dahulu (FK → topik_kategori; kedua-dua masuk skema sama)
  foreach t in array array['pelajar_topik', 'topik_kategori', 'silibus', 'permintaan_bayaran'] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I set schema arkib', t);
      raise notice 'Diarkib: %', t;
    end if;
  end loop;
end $$;

-- 3) SAHKAN — 4 baris di skema arkib, 0 baris di public
select table_schema, table_name
from information_schema.tables
where table_name in ('pelajar_topik', 'topik_kategori', 'silibus', 'permintaan_bayaran')
order by table_schema, table_name;

-- ============================================================
-- PULIH (jika perlu):
-- alter table arkib.pelajar_topik      set schema public;
-- alter table arkib.topik_kategori     set schema public;
-- alter table arkib.silibus            set schema public;
-- alter table arkib.permintaan_bayaran set schema public;
--
-- PADAM KEKAL (hanya bila pasti, cth. selepas 3 bulan):
-- drop table if exists arkib.pelajar_topik;
-- drop table if exists arkib.topik_kategori;
-- drop table if exists arkib.silibus;
-- drop table if exists arkib.permintaan_bayaran;
-- ============================================================
