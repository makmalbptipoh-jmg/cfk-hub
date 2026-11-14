-- ============================================================
-- ARKIB LANGKAH A — SEMAK SAHAJA (tiada data diubah)
-- Supabase > SQL Editor > Ctrl+A, Delete > tampal SEMUA > Run
-- Hantar hasil kepada Claude sebelum run Langkah B.
-- ============================================================

select t as jadual,
       to_regclass('public.' || t) is not null as di_public,
       to_regclass('arkib.' || t) is not null as di_arkib
from unnest(array['pelajar_topik', 'topik_kategori', 'silibus', 'permintaan_bayaran']) as t;
