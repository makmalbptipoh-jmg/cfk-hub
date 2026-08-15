-- ============================================================
-- CFK HUB — Seed data: Tajuk Besar "CFK STEP BY STEP" + 42 subtajuk
-- Paste dalam Supabase SQL Editor dan Run.
-- IDEMPOTENT: kalau tajuk "CFK STEP BY STEP" sudah wujud, tiada apa berlaku
-- (tak jadi pendua). Nombor muka surat disimpan dalam medan `nota`.
-- ============================================================

DO $$
DECLARE tid UUID;
BEGIN
  SELECT id INTO tid FROM silibus_tajuk WHERE nama = 'CFK STEP BY STEP' LIMIT 1;

  IF tid IS NOT NULL THEN
    RAISE NOTICE 'Tajuk "CFK STEP BY STEP" sudah wujud (id %). Tiada perubahan.', tid;
    RETURN;
  END IF;

  INSERT INTO silibus_tajuk (nama, susunan, nota, status)
  VALUES ('CFK STEP BY STEP', 20, 'Kurikulum asas catur langkah demi langkah (INTRODUCTION + 41 bab).', 'Aktif')
  RETURNING id INTO tid;

  INSERT INTO silibus_subtajuk (tajuk_id, nama, susunan, nota) VALUES
    (tid, 'INTRODUCTION',                                    0,  'ms 6'),
    (tid, '#1 ORIGINS OF CHESS',                             1,  'ms 8'),
    (tid, '#2 NAMING THE CHESS SQUARES',                     2,  'ms 10'),
    (tid, '#3 NAMES OF THE PIECES / INITIAL SET-UP',         3,  'ms 17'),
    (tid, '#4 HOW THE PAWNS MOVE',                           4,  'ms 23'),
    (tid, '#5 PLAYING THE PAWN GAME',                        5,  'ms 28'),
    (tid, '#6 HOW THE ROOK MOVES',                           6,  'ms 33'),
    (tid, '#7 HOW THE BISHOP MOVES',                         7,  'ms 37'),
    (tid, '#8 HOW THE QUEEN MOVES',                          8,  'ms 41'),
    (tid, '#9 HOW THE KNIGHT MOVES',                         9,  'ms 45'),
    (tid, '#10 HOW THE KING MOVES / CHECK & CHECKMATE',      10, 'ms 49'),
    (tid, '#11 CASTLING',                                    11, 'ms 58'),
    (tid, '#12 CHECKMATE WITH TWO ROOKS',                    12, 'ms 62'),
    (tid, '#13 QUEEN AND ROOK: STALEMATES AND CHECKMATES',   13, 'ms 64'),
    (tid, '#14 ILLEGAL MOVES',                               14, 'ms 66'),
    (tid, '#15 KING AND QUEEN VS. KING MATE',                15, 'ms 70'),
    (tid, '#16 DRAWS - LESSON A',                            16, 'ms 76'),
    (tid, '#17 DRAWS - LESSON B',                            17, 'ms 78'),
    (tid, '#18 PAWN PROMOTIONS',                             18, 'ms 83'),
    (tid, '#19 EN PASSANT',                                  19, 'ms 85'),
    (tid, '#20 RULES OF PROPER DEVELOPMENT',                 20, 'ms 87'),
    (tid, '#21 SURRENDERING THE CENTER',                     21, 'ms 96'),
    (tid, '#22 STARTING A CHESS GAME',                       22, 'ms 98'),
    (tid, '#23 CHESS NOTATION',                              23, 'ms 100'),
    (tid, '#24 KING SAFETY',                                 24, 'ms 102'),
    (tid, '#25 BAD MOVES IN THE OPENING',                    25, 'ms 105'),
    (tid, '#26 MOVING THE QUEEN OUT TOO EARLY',              26, 'ms 106'),
    (tid, '#27 SCHOLAR''S MATE',                             27, 'ms 107'),
    (tid, '#28 DOUBLE ATTACKS / FORKS',                      28, 'ms 109'),
    (tid, '#29 PINS',                                        29, 'ms 114'),
    (tid, '#30 QUEEN & BISHOP MATES / QUEEN & ROOK MATES',   30, 'ms 120'),
    (tid, '#31 BACK RANK MATES',                             31, 'ms 128'),
    (tid, '#32 X-RAYS',                                      32, 'ms 132'),
    (tid, '#33 REMOVING THE GUARD',                          33, 'ms 134'),
    (tid, '#34 DISCOVERED & DOUBLE ATTACKS AND CHECKS',      34, 'ms 136'),
    (tid, '#35 DOUBLE ATTACKS WITH THREAT OF MATE',          35, 'ms 138'),
    (tid, '#36 PAWNS - GOOD AND BAD',                        36, 'ms 140'),
    (tid, '#37 NAMES OF THE OPENINGS',                       37, 'ms 144'),
    (tid, '#38 SCOTCH OPENING',                              38, 'ms 147'),
    (tid, '#39 THE PETROFF DEFENSE',                         39, 'ms 149'),
    (tid, '#40 ITALIAN OPENING WITH "FRIED LIVER ATTACK"',   40, 'ms 151'),
    (tid, '#41 HAVING FUN WITH CHESS PUZZLES',               41, 'ms 153');

  RAISE NOTICE 'Tajuk "CFK STEP BY STEP" dicipta (id %) dengan 42 subtajuk.', tid;
END $$;

-- ============================================================
-- ROLLBACK (buang tajuk ini + semua subtajuk & progress via CASCADE):
--   DELETE FROM silibus_tajuk WHERE nama = 'CFK STEP BY STEP';
-- ============================================================
