USE medieval_kingdoms;


-- ============================================================
-- DATOS INICIALES
-- ============================================================


-- ============================================================
-- PLAYER
-- ============================================================

INSERT INTO players (username)
VALUES ('Arty');


-- ============================================================
-- CITY
-- ============================================================
-- Ciudad inicial del jugador.
-- Las coordenadas son provisionales.
-- ============================================================

INSERT INTO cities (
    player_id,
    name,
    coordinate_x,
    coordinate_y
)
VALUES (
    (SELECT id
     FROM players
     WHERE username = 'Arty'),

    'Ciudad Principal',

    0,
    0
);


-- ============================================================
-- RESOURCES
-- ============================================================
-- Valor económico de cada recurso:
--
-- Minerales = 4 puntos
-- Madera    = 2 puntos
-- Comida    = 1 punto
-- ============================================================

INSERT INTO resources (name, value)
VALUES
    ('Minerales', 4),
    ('Madera', 2),
    ('Comida', 1);


-- ============================================================
-- BUILDINGS
-- ============================================================
-- Cada edificio tiene un valor base de 400 puntos.
--
-- Mina:
--   Produce Minerales
--   Producción = 50% del valor del edificio
--
-- Aserradero:
--   Produce Madera
--   Producción = 100% del valor del edificio
--
-- Granja:
--   Produce Comida
--   Producción = 200% del valor del edificio
-- ============================================================

INSERT INTO buildings (
    name,
    resource_id,
    base_cost,
    production_multiplier
)
VALUES
    (
        'Mina',
        (SELECT id FROM resources WHERE name = 'Minerales'),
        400,
        0.50
    ),

    (
        'Aserradero',
        (SELECT id FROM resources WHERE name = 'Madera'),
        400,
        1.00
    ),

    (
        'Granja',
        (SELECT id FROM resources WHERE name = 'Comida'),
        400,
        2.00
    );


-- ============================================================
-- BUILDING COSTS
-- ============================================================
-- Costos base para nivel 1.
--
-- Mina:
--   50 Minerales  = 200 puntos
--   100 Madera    = 200 puntos
--   Total         = 400 puntos
--
-- Aserradero:
--   75 Minerales  = 300 puntos
--   50 Madera     = 100 puntos
--   Total         = 400 puntos
--
-- Granja:
--   25 Minerales  = 100 puntos
--   150 Madera    = 300 puntos
--   Total         = 400 puntos
-- ============================================================


-- ------------------------------------------------------------
-- Mina
-- ------------------------------------------------------------

INSERT INTO building_costs (
    building_id,
    resource_id,
    amount
)
VALUES
    (
        (SELECT id FROM buildings WHERE name = 'Mina'),
        (SELECT id FROM resources WHERE name = 'Minerales'),
        50
    ),

    (
        (SELECT id FROM buildings WHERE name = 'Mina'),
        (SELECT id FROM resources WHERE name = 'Madera'),
        100
    );


-- ------------------------------------------------------------
-- Aserradero
-- ------------------------------------------------------------

INSERT INTO building_costs (
    building_id,
    resource_id,
    amount
)
VALUES
    (
        (SELECT id FROM buildings WHERE name = 'Aserradero'),
        (SELECT id FROM resources WHERE name = 'Minerales'),
        75
    ),

    (
        (SELECT id FROM buildings WHERE name = 'Aserradero'),
        (SELECT id FROM resources WHERE name = 'Madera'),
        50
    );


-- ------------------------------------------------------------
-- Granja
-- ------------------------------------------------------------

INSERT INTO building_costs (
    building_id,
    resource_id,
    amount
)
VALUES
    (
        (SELECT id FROM buildings WHERE name = 'Granja'),
        (SELECT id FROM resources WHERE name = 'Minerales'),
        25
    ),

    (
        (SELECT id FROM buildings WHERE name = 'Granja'),
        (SELECT id FROM resources WHERE name = 'Madera'),
        150
    );


-- ============================================================
-- RECURSOS INICIALES DE LA CIUDAD
-- ============================================================
-- La ciudad comienza con:
--
-- 50 Minerales
-- 50 Madera
-- 50 Comida
-- ============================================================

INSERT INTO city_resources (
    city_id,
    resource_id,
    amount
)

SELECT
    (
        SELECT id
        FROM cities
        WHERE name = 'Ciudad Principal'
          AND player_id = (
              SELECT id
              FROM players
              WHERE username = 'Arty'
          )
    ),

    id,

    CASE name
        WHEN 'Minerales' THEN 50
        WHEN 'Madera' THEN 50
        WHEN 'Comida' THEN 50
    END

FROM resources;


-- ============================================================
-- EDIFICIO INICIAL
-- ============================================================
-- La ciudad comienza con una Mina de nivel 1.
--
-- El Aserradero y la Granja existen como edificios disponibles,
-- pero todavía no están construidos en la ciudad.
-- ============================================================

INSERT INTO city_buildings (
    city_id,
    building_id,
    level
)

VALUES (
    (
        SELECT id
        FROM cities
        WHERE name = 'Ciudad Principal'
          AND player_id = (
              SELECT id
              FROM players
              WHERE username = 'Arty'
          )
    ),

    (
        SELECT id
        FROM buildings
        WHERE name = 'Mina'
    ),

    1
);