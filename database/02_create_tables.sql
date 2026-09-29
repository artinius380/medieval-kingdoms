USE medieval_kingdoms;

-- ============================================================
-- ELIMINAR TABLAS EXISTENTES
-- ============================================================

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
-- Cantidad de cada recurso que posee una ciudad.
--
-- Una ciudad puede tener múltiples tipos de recursos.
--
-- Ejemplo:
-- Ciudad 1 -> Minerales
-- Ciudad 1 -> Madera
-- Ciudad 1 -> Comida
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
-- Define los tipos de edificios disponibles.
--
-- resource_id:
-- Indica qué recurso produce el edificio.
--
-- Ejemplo:
-- Mina       -> Minerales
-- Aserradero -> Madera
-- Granja     -> Comida
--
-- base_cost:
-- Valor total de construcción del edificio en puntos.
--
-- production_multiplier:
-- Multiplicador de producción por hora.
--
-- Mina       -> 0.50
-- Aserradero -> 1.00
-- Granja     -> 2.00
-- ============================================================

CREATE TABLE buildings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(50) NOT NULL UNIQUE,

    resource_id BIGINT UNSIGNED NULL,

    base_cost DECIMAL(20,4) NOT NULL,

    production_multiplier DECIMAL(10,4) NOT NULL,

    CONSTRAINT fk_buildings_resource
        FOREIGN KEY (resource_id)
        REFERENCES resources(id)
        ON DELETE SET NULL
);


-- ============================================================
-- BUILDING COSTS
-- ============================================================
-- Define los recursos necesarios para construir/mejorar
-- cada tipo de edificio.
--
-- Ejemplo Mina nivel 1:
-- 100 Madera
-- 50 Minerales
--
-- Los costos posteriores se calcularán mediante la fórmula
-- de crecimiento que definiremos en el backend.
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
-- CITY BUILDINGS
-- ============================================================
-- Edificaciones pertenecientes a una ciudad.
--
-- Una ciudad puede tener una instancia de cada tipo
-- de edificio.
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
        ON DELETE CASCADE
);