-- ============================================================
-- MEDIEVAL KINGDOMS - SQL SERVER
-- 02: CREAR TABLAS
-- Convertido desde MySQL. Cambios principales:
--   BIGINT UNSIGNED AUTO_INCREMENT -> BIGINT IDENTITY(1,1)
--   INT UNSIGNED                   -> INT + CHECK (>= 0 / >= 1)
--   DATETIME DEFAULT CURRENT_TIMESTAMP -> DATETIME2 DEFAULT SYSDATETIME()
--   building_requirements: SQL Server no permite dos FK con
--   ON DELETE CASCADE hacia la misma tabla (error 1785), por eso
--   la FK de required_building_id queda en NO ACTION.
-- ============================================================

USE medieval_kingdoms;
GO

-- ============================================================
-- ELIMINAR TABLAS EXISTENTES (orden inverso por las FK)
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
GO


-- ============================================================
-- PLAYERS
-- ============================================================

CREATE TABLE players (
    id          BIGINT IDENTITY(1,1) NOT NULL,
    username    NVARCHAR(50)  NOT NULL,
    created_at  DATETIME2     NOT NULL CONSTRAINT df_players_created_at DEFAULT SYSDATETIME(),

    CONSTRAINT pk_players PRIMARY KEY (id),
    CONSTRAINT uq_players_username UNIQUE (username)
);
GO


-- ============================================================
-- CITIES
-- ============================================================

CREATE TABLE cities (
    id            BIGINT IDENTITY(1,1) NOT NULL,
    player_id     BIGINT        NOT NULL,
    name          NVARCHAR(100) NOT NULL,
    coordinate_x  INT           NOT NULL,
    coordinate_y  INT           NOT NULL,
    created_at    DATETIME2     NOT NULL CONSTRAINT df_cities_created_at DEFAULT SYSDATETIME(),

    CONSTRAINT pk_cities PRIMARY KEY (id),

    CONSTRAINT fk_cities_player
        FOREIGN KEY (player_id)
        REFERENCES players(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_cities_coordinates UNIQUE (coordinate_x, coordinate_y)
);
GO


-- ============================================================
-- RESOURCES
-- ============================================================

CREATE TABLE resources (
    id     BIGINT IDENTITY(1,1) NOT NULL,
    name   NVARCHAR(50)  NOT NULL,
    value  DECIMAL(10,2) NOT NULL,

    CONSTRAINT pk_resources PRIMARY KEY (id),
    CONSTRAINT uq_resources_name UNIQUE (name)
);
GO


-- ============================================================
-- CITY RESOURCES
-- ============================================================

CREATE TABLE city_resources (
    city_id      BIGINT        NOT NULL,
    resource_id  BIGINT        NOT NULL,
    amount       DECIMAL(20,4) NOT NULL CONSTRAINT df_city_resources_amount DEFAULT 0,
    updated_at   DATETIME2     NOT NULL CONSTRAINT df_city_resources_updated_at DEFAULT SYSDATETIME(),

    CONSTRAINT pk_city_resources PRIMARY KEY (city_id, resource_id),

    CONSTRAINT fk_city_resources_city
        FOREIGN KEY (city_id)
        REFERENCES cities(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_city_resources_resource
        FOREIGN KEY (resource_id)
        REFERENCES resources(id)
        ON DELETE CASCADE
);
GO


-- ============================================================
-- BUILDINGS
-- category: RECURSOS | EJERCITO | TECNOLOGIAS
-- ============================================================

CREATE TABLE buildings (
    id         BIGINT IDENTITY(1,1) NOT NULL,
    name       NVARCHAR(50)  NOT NULL,
    category   NVARCHAR(30)  NOT NULL,
    base_cost  DECIMAL(20,4) NOT NULL,

    CONSTRAINT pk_buildings PRIMARY KEY (id),
    CONSTRAINT uq_buildings_name UNIQUE (name),

    CONSTRAINT chk_buildings_category
        CHECK (category IN (N'RECURSOS', N'EJERCITO', N'TECNOLOGIAS'))
);
GO


-- ============================================================
-- BUILDING PRODUCTION
-- ============================================================

CREATE TABLE building_production (
    building_id            BIGINT        NOT NULL,
    resource_id            BIGINT        NOT NULL,
    production_multiplier  DECIMAL(10,4) NOT NULL,

    CONSTRAINT pk_building_production PRIMARY KEY (building_id, resource_id),

    CONSTRAINT fk_building_production_building
        FOREIGN KEY (building_id)
        REFERENCES buildings(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_building_production_resource
        FOREIGN KEY (resource_id)
        REFERENCES resources(id)
        ON DELETE CASCADE
);
GO


-- ============================================================
-- BUILDING COSTS
-- ============================================================

CREATE TABLE building_costs (
    building_id  BIGINT        NOT NULL,
    resource_id  BIGINT        NOT NULL,
    amount       DECIMAL(20,4) NOT NULL,

    CONSTRAINT pk_building_costs PRIMARY KEY (building_id, resource_id),

    CONSTRAINT fk_building_costs_building
        FOREIGN KEY (building_id)
        REFERENCES buildings(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_building_costs_resource
        FOREIGN KEY (resource_id)
        REFERENCES resources(id)
        ON DELETE CASCADE
);
GO


-- ============================================================
-- BUILDING REQUIREMENTS
-- Ejemplo: Caballeria -> Armeria nivel 5
-- ============================================================

CREATE TABLE building_requirements (
    building_id           BIGINT NOT NULL,
    required_building_id  BIGINT NOT NULL,
    required_level        INT    NOT NULL,

    CONSTRAINT pk_building_requirements PRIMARY KEY (building_id, required_building_id),

    CONSTRAINT fk_building_requirements_building
        FOREIGN KEY (building_id)
        REFERENCES buildings(id)
        ON DELETE CASCADE,

    -- NO ACTION: SQL Server no acepta dos rutas de cascada
    -- hacia la misma tabla. Para borrar un edificio que es
    -- requisito de otro, primero borra esa fila de requisitos.
    CONSTRAINT fk_building_requirements_required_building
        FOREIGN KEY (required_building_id)
        REFERENCES buildings(id)
        ON DELETE NO ACTION,

    CONSTRAINT chk_building_requirements_level
        CHECK (required_level >= 1),

    CONSTRAINT chk_building_requirements_not_self
        CHECK (building_id <> required_building_id)
);
GO


-- ============================================================
-- CITY BUILDINGS
-- ============================================================

CREATE TABLE city_buildings (
    city_id      BIGINT NOT NULL,
    building_id  BIGINT NOT NULL,
    level        INT    NOT NULL CONSTRAINT df_city_buildings_level DEFAULT 1,

    CONSTRAINT pk_city_buildings PRIMARY KEY (city_id, building_id),

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
GO
