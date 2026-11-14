-- ============================================================
-- ARKIB LANGKAH B — PINDAH jadual lama ke skema arkib (bukan padam)
-- Run SELEPAS Langkah A disemak.
-- Supabase > SQL Editor > Ctrl+A, Delete > tampal SEMUA > Run
-- Jadual yang tiada akan dilangkau (tiada ralat).
-- ============================================================

create schema if not exists arkib;

do $$
declare t text;
begin
  foreach t in array array['pelajar_topik', 'topik_kategori', 'silibus', 'permintaan_bayaran'] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I set schema arkib', t);
    end if;
  end loop;
end $$;

-- Hasil: semua jadual patut di 'arkib', tiada di 'public'
select table_schema, table_name
from information_schema.tables
where table_name in ('pelajar_topik', 'topik_kategori', 'silibus', 'permintaan_bayaran')
order by table_schema, table_name;

-- PULIH (jika perlu), contoh:
-- alter table arkib.silibus set schema public;
