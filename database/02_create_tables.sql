USE medieval_kingdoms;

-- ============================================================
-- ELIMINAR TABLAS EXISTENTES
-- ============================================================

DROP TABLE IF EXISTS building_requirements;
DROP TABLE IF EXISTS building_production;
DROP TABLE IF EXISTS city_buildings;
DROP TABLE IF EXISTS building_costs;
DROP TABLE IF EXISTS city_resources;
DROP TABLE IF EXISTS buildings;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS cities;
DROP TABLE IF EXISTS players;


-- ============================================================
-- PLAYERS
-- ============================================================

CREATE TABLE players (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- CITIES
-- ============================================================

CREATE TABLE cities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    player_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    coordinate_x INT NOT NULL,
    coordinate_y INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cities_player
        FOREIGN KEY (player_id)
        REFERENCES players(id)
        ON DELETE CASCADE,

    UNIQUE (coordinate_x, coordinate_y)
);


-- ============================================================
-- RESOURCES
-- ============================================================

CREATE TABLE resources (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    value DECIMAL(10,2) NOT NULL
);


-- ============================================================
-- CITY RESOURCES
-- ============================================================

CREATE TABLE city_resources (
    city_id BIGINT UNSIGNED NOT NULL,
    resource_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(20,4) NOT NULL DEFAULT 0,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (city_id, resource_id),

    CONSTRAINT fk_city_resources_city
        FOREIGN KEY (city_id)
        REFERENCES cities(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_city_resources_resource
        FOREIGN KEY (resource_id)
        REFERENCES resources(id)
        ON DELETE CASCADE
);


-- ============================================================
-- BUILDINGS
-- ============================================================
-- Tabla general para todas las edificaciones.
--
-- category identifica el menú al que pertenece:
--   RECURSOS
--   EJERCITO
--   TECNOLOGIAS
--
-- La producción se define en building_production.
-- Los costos se definen en building_costs.
-- Los requisitos se definen en building_requirements.
-- ============================================================

CREATE TABLE buildings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(30) NOT NULL,
    base_cost DECIMAL(20,4) NOT NULL,

    CONSTRAINT chk_buildings_category
        CHECK (category IN ('RECURSOS', 'EJERCITO', 'TECNOLOGIAS'))
);


-- ============================================================
-- BUILDING PRODUCTION
-- ============================================================
-- Solo las edificaciones productoras necesitan registros aquí.
-- Ejemplo:
--   Mina       -> Minerales -> 0.50
--   Aserradero -> Madera    -> 1.00
--   Granja     -> Comida    -> 2.00
-- ============================================================

CREATE TABLE building_production (
    building_id BIGINT UNSIGNED NOT NULL,
    resource_id BIGINT UNSIGNED NOT NULL,
    production_multiplier DECIMAL(10,4) NOT NULL,

    PRIMARY KEY (building_id, resource_id),

    CONSTRAINT fk_building_production_building
        FOREIGN KEY (building_id)
        REFERENCES buildings(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_building_production_resource
        FOREIGN KEY (resource_id)
        REFERENCES resources(id)
        ON DELETE CASCADE
);


-- ============================================================
-- BUILDING COSTS
-- ============================================================
-- amount representa el costo base del recurso para el nivel 1.
-- El backend puede seguir aplicando el multiplicador de nivel
-- que ya utiliza actualmente.
-- ============================================================

CREATE TABLE building_costs (
    building_id BIGINT UNSIGNED NOT NULL,
    resource_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(20,4) NOT NULL,

    PRIMARY KEY (building_id, resource_id),

    CONSTRAINT fk_building_costs_building
        FOREIGN KEY (building_id)
        REFERENCES buildings(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_building_costs_resource
        FOREIGN KEY (resource_id)
        REFERENCES resources(id)
        ON DELETE CASCADE
);


-- ============================================================
-- BUILDING REQUIREMENTS
-- ============================================================
-- Una edificación puede requerir varias edificaciones.
-- Ejemplo:
--   Caballeria -> Armeria nivel 5
--   Caballeria -> Establo nivel 2
-- ============================================================

CREATE TABLE building_requirements (
    building_id BIGINT UNSIGNED NOT NULL,
    required_building_id BIGINT UNSIGNED NOT NULL,
    required_level INT UNSIGNED NOT NULL,

    PRIMARY KEY (building_id, required_building_id),

    CONSTRAINT fk_building_requirements_building
        FOREIGN KEY (building_id)
        REFERENCES buildings(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_building_requirements_required_building
        FOREIGN KEY (required_building_id)
        REFERENCES buildings(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_building_requirements_level
        CHECK (required_level >= 1),

    CONSTRAINT chk_building_requirements_not_self
        CHECK (building_id <> required_building_id)
);


-- ============================================================
-- CITY BUILDINGS
-- ============================================================

CREATE TABLE city_buildings (
    city_id BIGINT UNSIGNED NOT NULL,
    building_id BIGINT UNSIGNED NOT NULL,
    level INT UNSIGNED NOT NULL DEFAULT 1,

    PRIMARY KEY (city_id, building_id),

    CONSTRAINT fk_city_buildings_city
        FOREIGN KEY (city_id)
        REFERENCES cities(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_city_buildings_building
        FOREIGN KEY (building_id)
        REFERENCES buildings(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_city_buildings_level
        CHECK (level >= 1)
);