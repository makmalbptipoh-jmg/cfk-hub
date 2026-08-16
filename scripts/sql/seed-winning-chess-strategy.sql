-- ============================================================
-- CFK HUB — Seed: "Winning Chess Strategy for Kids" (SILIBUS PERSONAL)
-- Paste dalam Supabase SQL Editor dan Run.
--
-- Buku ini ada 5 seksyen → dimodel sebagai 5 "Tajuk Besar" jenis 'Personal'
-- (model kita 2-aras: Tajuk Besar → Subtajuk). Nombor muka surat disimpan
-- dalam medan `nota` subtajuk (papar sebagai "MS").
--
-- SYARAT: jalankan `scripts/sql/silibus-personal.sql` DAHULU (lajur `jenis`).
-- IDEMPOTENT: setiap seksyen dilangkau jika sudah wujud (nama + jenis Personal).
-- ============================================================

DO $$
DECLARE tid UUID;
BEGIN
  -- ==========================================================
  -- 1) KIRIL'S KLASS
  -- ==========================================================
  SELECT id INTO tid FROM silibus_tajuk WHERE nama = 'KIRIL''S KLASS' AND jenis = 'Personal' LIMIT 1;
  IF tid IS NULL THEN
    INSERT INTO silibus_tajuk (nama, susunan, jenis, nota, status)
    VALUES ('KIRIL''S KLASS', 10, 'Personal', 'Winning Chess Strategy for Kids', 'Aktif')
    RETURNING id INTO tid;
    INSERT INTO silibus_subtajuk (tajuk_id, nama, susunan, nota) VALUES
      (tid, 'BASIC MATES',              1,  'ms 11'),
      (tid, 'DOWN TO THE LAST PAWN',    2,  'ms 18'),
      (tid, 'THREE KEYS TO STRATEGY',   3,  'ms 24'),
      (tid, 'ONE PAWN DRAWS',           4,  'ms 33'),
      (tid, 'KING vs. KING',            5,  'ms 41'),
      (tid, 'PIN TO WIN part 1',        6,  'ms 49'),
      (tid, 'SUPERKING',                7,  'ms 55'),
      (tid, 'TIME FOR A TEMPO',         8,  'ms 62'),
      (tid, 'ROOKS ON THE SEVENTH',     9,  'ms 69'),
      (tid, 'TRADING QUEENS',           10, 'ms 76'),
      (tid, 'TRADING OTHER STUFF',      11, 'ms 86'),
      (tid, 'OPENING PRINCIPLES',       12, 'ms 97'),
      (tid, 'ROOK LIFTS',               13, 'ms 110'),
      (tid, 'WEAK PAWNS',               14, 'ms 115'),
      (tid, 'STRONG PAWNS',             15, 'ms 127'),
      (tid, 'RAMS AND LEVERS',          16, 'ms 133'),
      (tid, 'PIN TO WIN part 2',        17, 'ms 139'),
      (tid, 'KNIGHT PATHS & OUTPOSTS',  18, 'ms 145'),
      (tid, 'BLOCKADES & OTHER POSTS',  19, 'ms 150'),
      (tid, 'CASTLES MADE OF SAND',     20, 'ms 154'),
      (tid, 'PLAYING WITH BEES',        21, 'ms 166'),
      (tid, 'OPPOSITE BEES',            22, 'ms 173'),
      (tid, 'UNDERDOG PROMOTIONS',      23, 'ms 179'),
      (tid, 'ROOKS BEHIND',             24, 'ms 183'),
      (tid, 'PHILIDOR AND LUCENA',      25, 'ms 187'),
      (tid, 'KING AND PAWNS',           26, 'ms 193'),
      (tid, 'COMMON MISTAKES',          27, 'ms 197'),
      (tid, 'LOGIC OF CHESS',           28, 'ms 203');
    RAISE NOTICE 'KIRIL''S KLASS dicipta (id %) — 28 subtajuk.', tid;
  ELSE
    RAISE NOTICE 'KIRIL''S KLASS sudah wujud (id %). Dilangkau.', tid;
  END IF;

  -- ==========================================================
  -- 2) COMBO MOMBO
  -- ==========================================================
  SELECT id INTO tid FROM silibus_tajuk WHERE nama = 'COMBO MOMBO' AND jenis = 'Personal' LIMIT 1;
  IF tid IS NULL THEN
    INSERT INTO silibus_tajuk (nama, susunan, jenis, nota, status)
    VALUES ('COMBO MOMBO', 20, 'Personal', 'Winning Chess Strategy for Kids', 'Aktif')
    RETURNING id INTO tid;
    INSERT INTO silibus_subtajuk (tajuk_id, nama, susunan, nota) VALUES
      (tid, 'KNIGHT FORK',        1,  'ms 39'),
      (tid, 'QUEEN FORK',         2,  'ms 47'),
      (tid, 'PIN',                3,  'ms 53'),
      (tid, 'DISCOVERED CHECK',   4,  'ms 60'),
      (tid, 'X-RAY',              5,  'ms 67'),
      (tid, 'DOUBLE CHECK',       6,  'ms 74'),
      (tid, 'FORK',               7,  'ms 95'),
      (tid, 'DISCOVERED ATTACK',  8,  'ms 108'),
      (tid, 'BACK RANK',          9,  'ms 114'),
      (tid, 'DOUBLE ATTACK',      10, 'ms 126'),
      (tid, 'PROMOTION',          11, 'ms 132'),
      (tid, 'OVERLOAD',           12, 'ms 138'),
      (tid, 'DESTRUCTION',        13, 'ms 144'),
      (tid, 'DECOY',              14, 'ms 149'),
      (tid, 'DEFLECTION',         15, 'ms 153'),
      (tid, 'SQUARE CLEARANCE',   16, 'ms 165'),
      (tid, 'LINE CLEARANCE',     17, 'ms 172'),
      (tid, 'OBSTRUCTION',        18, 'ms 178'),
      (tid, 'STALEMATE',          19, 'ms 186'),
      (tid, 'SCI-FI MATE',        20, 'ms 192'),
      (tid, 'SMOTHERED MATE',     21, 'ms 196'),
      (tid, 'PERPETUAL CHECK',    22, 'ms 202');
    RAISE NOTICE 'COMBO MOMBO dicipta (id %) — 22 subtajuk.', tid;
  ELSE
    RAISE NOTICE 'COMBO MOMBO sudah wujud (id %). Dilangkau.', tid;
  END IF;

  -- ==========================================================
  -- 3) TACTICS 101
  -- ==========================================================
  SELECT id INTO tid FROM silibus_tajuk WHERE nama = 'TACTICS 101' AND jenis = 'Personal' LIMIT 1;
  IF tid IS NULL THEN
    INSERT INTO silibus_tajuk (nama, susunan, jenis, nota, status)
    VALUES ('TACTICS 101', 30, 'Personal', 'Winning Chess Strategy for Kids', 'Aktif')
    RETURNING id INTO tid;
    INSERT INTO silibus_subtajuk (tajuk_id, nama, susunan, nota) VALUES
      (tid, 'KNIGHT FORK',        1, 'ms 40'),
      (tid, 'QUEEN FORK',         2, 'ms 48'),
      (tid, 'PIN',                3, 'ms 54'),
      (tid, 'DISCOVERED CHECK',   4, 'ms 61'),
      (tid, 'X-RAY',              5, 'ms 68'),
      (tid, 'DOUBLE CHECK',       6, 'ms 75'),
      (tid, 'FORK',               7, 'ms 96'),
      (tid, 'DISCOVERED ATTACK',  8, 'ms 109');
    RAISE NOTICE 'TACTICS 101 dicipta (id %) — 8 subtajuk.', tid;
  ELSE
    RAISE NOTICE 'TACTICS 101 sudah wujud (id %). Dilangkau.', tid;
  END IF;

  -- ==========================================================
  -- 4) CHESS LINGO
  -- ==========================================================
  SELECT id INTO tid FROM silibus_tajuk WHERE nama = 'CHESS LINGO' AND jenis = 'Personal' LIMIT 1;
  IF tid IS NULL THEN
    INSERT INTO silibus_tajuk (nama, susunan, jenis, nota, status)
    VALUES ('CHESS LINGO', 40, 'Personal', 'Winning Chess Strategy for Kids', 'Aktif')
    RETURNING id INTO tid;
    INSERT INTO silibus_subtajuk (tajuk_id, nama, susunan, nota) VALUES
      (tid, 'CHECKMATE',          1,  'ms 9'),
      (tid, 'GIUOCO PIANO',       2,  'ms 8'),
      (tid, 'GAMBIT',             3,  'ms 10'),
      (tid, 'PARTS OF GAME',      4,  'ms 17'),
      (tid, 'STRATEGY/TACTICS',   5,  'ms 23'),
      (tid, 'THE EXCHANGE',       6,  'ms 32'),
      (tid, 'COMBINATION',        7,  'ms 38'),
      (tid, 'DEVELOP',            8,  'ms 46'),
      (tid, 'THREAT',             9,  'ms 52'),
      (tid, 'TEMPO',              10, 'ms 59'),
      (tid, 'STRAIGHT LINES',     11, 'ms 66'),
      (tid, 'INITIATIVE',         12, 'ms 73'),
      (tid, 'PIECE',              13, 'ms 84'),
      (tid, 'EN PASSANT',         14, 'ms 94'),
      (tid, 'SQUARE OF A PAWN',   15, 'ms 107'),
      (tid, 'QUEEN',              16, 'ms 113'),
      (tid, 'FIANCHETTO',         17, 'ms 125'),
      (tid, 'MINOR PIECES',       18, 'ms 131'),
      (tid, 'EN PRISE / J''ADOUBE', 19, 'ms 137'),
      (tid, 'ZUGZWANG',           20, 'ms 143'),
      (tid, 'ZWISCHENZUG',        21, 'ms 148'),
      (tid, 'CHEAPO',             22, 'ms 152'),
      (tid, 'DESPERADO',          23, 'ms 164'),
      (tid, 'EVALUATE',           24, 'ms 171'),
      (tid, 'STYLE',              25, 'ms 177'),
      (tid, 'KIBITZ',             26, 'ms 181'),
      (tid, 'TOURNAMENTS',        27, 'ms 185'),
      (tid, 'BLITZ / CLOCKS',     28, 'ms 191'),
      (tid, 'COUNTERPLAY',        29, 'ms 195'),
      (tid, 'CAISSA',             30, 'ms 201'),
      (tid, 'ADJOURN / FORFEIT',  31, 'ms 207');
    RAISE NOTICE 'CHESS LINGO dicipta (id %) — 31 subtajuk.', tid;
  ELSE
    RAISE NOTICE 'CHESS LINGO sudah wujud (id %). Dilangkau.', tid;
  END IF;

  -- ==========================================================
  -- 5) OTHER STUFF
  -- ==========================================================
  SELECT id INTO tid FROM silibus_tajuk WHERE nama = 'OTHER STUFF' AND jenis = 'Personal' LIMIT 1;
  IF tid IS NULL THEN
    INSERT INTO silibus_tajuk (nama, susunan, jenis, nota, status)
    VALUES ('OTHER STUFF', 50, 'Personal', 'Winning Chess Strategy for Kids', 'Aktif')
    RETURNING id INTO tid;
    INSERT INTO silibus_subtajuk (tajuk_id, nama, susunan, nota) VALUES
      (tid, 'INTRODUCTION',       1, 'ms 6'),
      (tid, 'HOW TO READ CHESS',  2, 'ms 7'),
      (tid, 'JUMBO MIX',          3, 'ms 85, 142, 182, 208'),
      (tid, 'RULES OF CHESS',     4, 'ms 209'),
      (tid, 'CHESS MANNERS',      5, 'ms 218'),
      (tid, 'EXTRA SPECIAL',      6, 'ms 219'),
      (tid, 'OPENINGS',           7, 'ms 224'),
      (tid, 'SOLUTIONS',          8, 'ms 226'),
      (tid, 'FINAL NOTES',        9, 'ms 242');
    RAISE NOTICE 'OTHER STUFF dicipta (id %) — 9 subtajuk.', tid;
  ELSE
    RAISE NOTICE 'OTHER STUFF sudah wujud (id %). Dilangkau.', tid;
  END IF;
END $$;

-- ============================================================
-- ROLLBACK (buang buku ini + semua subtajuk & progress via CASCADE):
--   DELETE FROM silibus_tajuk
--   WHERE jenis = 'Personal'
--     AND nama IN ('KIRIL''S KLASS','COMBO MOMBO','TACTICS 101','CHESS LINGO','OTHER STUFF');
-- ============================================================
