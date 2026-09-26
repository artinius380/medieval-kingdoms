USE medieval_kingdoms;

-- ============================================
-- EDIFICIOS
-- ============================================

INSERT INTO buildings (name)
VALUES ('Mina');


-- ============================================
-- JUGADORES
-- ============================================

INSERT INTO players (username)
VALUES ('Arty');


-- ============================================
-- RECURSOS INICIALES
-- ============================================

INSERT INTO player_resources (player_id, minerals)
SELECT id, 50
FROM players
WHERE username = 'Arty';


-- ============================================
-- EDIFICIOS DEL JUGADOR
-- ============================================

INSERT INTO player_buildings (player_id, building_id, level)
SELECT 
    p.id,
    b.id,
    1
FROM players p
JOIN buildings b ON b.name = 'Mina'
WHERE p.username = 'Arty';
