-- MEDIEVAL KINGDOMS - SQL SERVER
-- 03: DATOS INICIALES (mismo contenido que la versión MySQL)

USE medieval_kingdoms;
GO


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
-- Valor económico:
--
-- Minerales = 4 puntos
-- Madera    = 2 puntos
-- Comida    = 1 punto
-- ============================================================

INSERT INTO resources (
    name,
    value
)
VALUES
    ('Minerales', 4),
    ('Madera', 2),
    ('Comida', 1);


-- ============================================================
-- BUILDINGS
-- ============================================================
-- Tabla general de edificaciones.
--
-- RECURSOS:
--   Mina       -> 400
--   Aserradero -> 400
--   Granja     -> 400
--
-- EJERCITO:
--   Transporte    -> 800
--   Cuartel       -> 800
--   Campo de Tiro -> 1600
--   Caballeria    -> 3200
--   Taller        -> 6400
--
-- TECNOLOGIAS:
--   Armeria       -> 1600
--   Establo       -> 3200
--   Ingenieria    -> 6400
-- ============================================================

INSERT INTO buildings (
    name,
    category,
    base_cost
)
VALUES
    ('Mina',          'RECURSOS',    400),
    ('Aserradero',     'RECURSOS',    400),
    ('Granja',         'RECURSOS',    400),

    ('Transporte',     'EJERCITO',    800),
    ('Cuartel',        'EJERCITO',    800),
    ('Campo de Tiro',  'EJERCITO',    1600),
    ('Caballeria',     'EJERCITO',    3200),
    ('Taller',         'EJERCITO',    6400),

    ('Armeria',        'TECNOLOGIAS', 1600),
    ('Establo',        'TECNOLOGIAS', 3200),
    ('Ingenieria',     'TECNOLOGIAS', 6400);


-- ============================================================
-- BUILDING PRODUCTION
-- ============================================================
-- Multiplicadores:
--
-- Mina       -> 0.50
-- Aserradero -> 1.00
-- Granja     -> 2.00
--
-- Las edificaciones de Ejército y Tecnologías no producen
-- recursos, por lo que no tienen registros aquí.
-- ============================================================

INSERT INTO building_production (
    building_id,
    resource_id,
    production_multiplier
)
VALUES
    (
        (SELECT id FROM buildings WHERE name = 'Mina'),
        (SELECT id FROM resources WHERE name = 'Minerales'),
        0.50
    ),

    (
        (SELECT id FROM buildings WHERE name = 'Aserradero'),
        (SELECT id FROM resources WHERE name = 'Madera'),
        1.00
    ),

    (
        (SELECT id FROM buildings WHERE name = 'Granja'),
        (SELECT id FROM resources WHERE name = 'Comida'),
        2.00
    );


-- ============================================================
-- BUILDING COSTS - RECURSOS
-- ============================================================
-- Todos tienen un costo base de 400 puntos.
--
-- Mina:
--   50 Minerales = 200 puntos
--   100 Madera   = 200 puntos
--
-- Aserradero:
--   75 Minerales = 300 puntos
--   50 Madera    = 100 puntos
--
-- Granja:
--   25 Minerales = 100 puntos
--   150 Madera   = 300 puntos
-- ============================================================

INSERT INTO building_costs (
    building_id,
    resource_id,
    amount
)
VALUES
    -- Mina
    (
        (SELECT id FROM buildings WHERE name = 'Mina'),
        (SELECT id FROM resources WHERE name = 'Minerales'),
        50
    ),
    (
        (SELECT id FROM buildings WHERE name = 'Mina'),
        (SELECT id FROM resources WHERE name = 'Madera'),
        100
    ),

    -- Aserradero
    (
        (SELECT id FROM buildings WHERE name = 'Aserradero'),
        (SELECT id FROM resources WHERE name = 'Minerales'),
        75
    ),
    (
        (SELECT id FROM buildings WHERE name = 'Aserradero'),
        (SELECT id FROM resources WHERE name = 'Madera'),
        50
    ),

    -- Granja
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
-- BUILDING COSTS - EJERCITO
-- ============================================================
-- Los porcentajes representan puntos del costo base.
--
-- Minerales = 4 puntos por unidad
-- Madera    = 2 puntos por unidad
-- Comida    = 1 punto por unidad
-- ============================================================

INSERT INTO building_costs (
    building_id,
    resource_id,
    amount
)
VALUES
    -- --------------------------------------------------------
    -- Transporte - 800
    -- 20% Minerales / 30% Madera / 50% Comida
    -- --------------------------------------------------------
    (
        (SELECT id FROM buildings WHERE name = 'Transporte'),
        (SELECT id FROM resources WHERE name = 'Minerales'),
        40
    ),
    (
        (SELECT id FROM buildings WHERE name = 'Transporte'),
        (SELECT id FROM resources WHERE name = 'Madera'),
        120
    ),
    (
        (SELECT id FROM buildings WHERE name = 'Transporte'),
        (SELECT id FROM resources WHERE name = 'Comida'),
        400
    ),

    -- --------------------------------------------------------
    -- Cuartel - 800
    -- 50% Minerales / 20% Madera / 30% Comida
    -- --------------------------------------------------------
    (
        (SELECT id FROM buildings WHERE name = 'Cuartel'),
        (SELECT id FROM resources WHERE name = 'Minerales'),
        100
    ),
    (
        (SELECT id FROM buildings WHERE name = 'Cuartel'),
        (SELECT id FROM resources WHERE name = 'Madera'),
        80
    ),
    (
        (SELECT id FROM buildings WHERE name = 'Cuartel'),
        (SELECT id FROM resources WHERE name = 'Comida'),
        240
    ),

    -- --------------------------------------------------------
    -- Campo de Tiro - 1600
    -- 25% Minerales / 35% Madera / 40% Comida
    -- --------------------------------------------------------
    (
        (SELECT id FROM buildings WHERE name = 'Campo de Tiro'),
        (SELECT id FROM resources WHERE name = 'Minerales'),
        100
    ),
    (
        (SELECT id FROM buildings WHERE name = 'Campo de Tiro'),
        (SELECT id FROM resources WHERE name = 'Madera'),
        280
    ),
    (
        (SELECT id FROM buildings WHERE name = 'Campo de Tiro'),
        (SELECT id FROM resources WHERE name = 'Comida'),
        640
    ),

    -- --------------------------------------------------------
    -- Caballeria - 3200
    -- 20% Minerales / 20% Madera / 60% Comida
    -- --------------------------------------------------------
    (
        (SELECT id FROM buildings WHERE name = 'Caballeria'),
        (SELECT id FROM resources WHERE name = 'Minerales'),
        160
    ),
    (
        (SELECT id FROM buildings WHERE name = 'Caballeria'),
        (SELECT id FROM resources WHERE name = 'Madera'),
        320
    ),
    (
        (SELECT id FROM buildings WHERE name = 'Caballeria'),
        (SELECT id FROM resources WHERE name = 'Comida'),
        1920
    ),

    -- --------------------------------------------------------
    -- Taller - 6400
    -- 25% Minerales / 60% Madera / 15% Comida
    -- --------------------------------------------------------
    (
        (SELECT id FROM buildings WHERE name = 'Taller'),
        (SELECT id FROM resources WHERE name = 'Minerales'),
        400
    ),
    (
        (SELECT id FROM buildings WHERE name = 'Taller'),
        (SELECT id FROM resources WHERE name = 'Madera'),
        1920
    ),
    (
        (SELECT id FROM buildings WHERE name = 'Taller'),
        (SELECT id FROM resources WHERE name = 'Comida'),
        960
    );


-- ============================================================
-- BUILDING COSTS - TECNOLOGIAS
-- ============================================================

INSERT INTO building_costs (
    building_id,
    resource_id,
    amount
)
VALUES
    -- --------------------------------------------------------
    -- Armeria - 1600
    -- 75% Minerales / 25% Comida
    -- --------------------------------------------------------
    (
        (SELECT id FROM buildings WHERE name = 'Armeria'),
        (SELECT id FROM resources WHERE name = 'Minerales'),
        300
    ),
    (
        (SELECT id FROM buildings WHERE name = 'Armeria'),
        (SELECT id FROM resources WHERE name = 'Comida'),
        400
    ),

    -- --------------------------------------------------------
    -- Establo - 3200
    -- 25% Madera / 75% Comida
    -- --------------------------------------------------------
    (
        (SELECT id FROM buildings WHERE name = 'Establo'),
        (SELECT id FROM resources WHERE name = 'Madera'),
        400
    ),
    (
        (SELECT id FROM buildings WHERE name = 'Establo'),
        (SELECT id FROM resources WHERE name = 'Comida'),
        2400
    ),

    -- --------------------------------------------------------
    -- Ingenieria - 6400
    -- 25% Minerales / 75% Madera
    -- --------------------------------------------------------
    (
        (SELECT id FROM buildings WHERE name = 'Ingenieria'),
        (SELECT id FROM resources WHERE name = 'Minerales'),
        400
    ),
    (
        (SELECT id FROM buildings WHERE name = 'Ingenieria'),
        (SELECT id FROM resources WHERE name = 'Madera'),
        2400
    );


-- ============================================================
-- BUILDING REQUIREMENTS
-- ============================================================

-- ------------------------------------------------------------
-- Cuartel -> Armeria nivel 1
-- ------------------------------------------------------------

INSERT INTO building_requirements (
    building_id,
    required_building_id,
    required_level
)
SELECT
    b.id,
    r.id,
    1
FROM buildings b
JOIN buildings r
    ON r.name = 'Armeria'
WHERE b.name = 'Cuartel';


-- ------------------------------------------------------------
-- Campo de Tiro -> Armeria nivel 3
-- ------------------------------------------------------------

INSERT INTO building_requirements (
    building_id,
    required_building_id,
    required_level
)
SELECT
    b.id,
    r.id,
    3
FROM buildings b
JOIN buildings r
    ON r.name = 'Armeria'
WHERE b.name = 'Campo de Tiro';


-- ------------------------------------------------------------
-- Caballeria -> Armeria nivel 5
-- ------------------------------------------------------------

INSERT INTO building_requirements (
    building_id,
    required_building_id,
    required_level
)
SELECT
    b.id,
    r.id,
    5
FROM buildings b
JOIN buildings r
    ON r.name = 'Armeria'
WHERE b.name = 'Caballeria';


-- ------------------------------------------------------------
-- Caballeria -> Establo nivel 2
-- ------------------------------------------------------------

INSERT INTO building_requirements (
    building_id,
    required_building_id,
    required_level
)
SELECT
    b.id,
    r.id,
    2
FROM buildings b
JOIN buildings r
    ON r.name = 'Establo'
WHERE b.name = 'Caballeria';


-- ------------------------------------------------------------
-- Taller -> Ingenieria nivel 3
-- ------------------------------------------------------------

INSERT INTO building_requirements (
    building_id,
    required_building_id,
    required_level
)
SELECT
    b.id,
    r.id,
    3
FROM buildings b
JOIN buildings r
    ON r.name = 'Ingenieria'
WHERE b.name = 'Taller';


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
-- EDIFICIOS INICIALES DE LA CIUDAD
-- ============================================================
-- La ciudad comienza únicamente con:
--
-- Mina nivel 1
--
-- El resto de edificaciones existen en la tabla buildings,
-- pero todavía no están construidas en la ciudad.
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
GO
