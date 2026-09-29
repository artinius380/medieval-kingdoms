const pool = require('../config/database');


// ========================================
// Obtener todas las ciudades de un jugador
// ========================================

async function getPlayerCities(playerId) {

    const [rows] = await pool.query(
        `
        SELECT
            id,
            player_id,
            name,
            coordinate_x AS x,
            coordinate_y AS y,
            created_at
        FROM cities
        WHERE player_id = ?
        ORDER BY id
        `,
        [playerId]
    );

    return rows;
}


// ========================================
// Obtener una ciudad específica
// ========================================

async function getPlayerCity(
    playerId,
    cityId
) {

    const [rows] = await pool.query(
        `
        SELECT
            id,
            player_id,
            name,
            coordinate_x AS x,
            coordinate_y AS y,
            created_at
        FROM cities
        WHERE id = ?
          AND player_id = ?
        `,
        [
            cityId,
            playerId
        ]
    );


    if (rows.length === 0) {

        return null;

    }


    return rows[0];
}


// ========================================
// Obtener ciudad con sus recursos
// ========================================

async function getCityResources(cityId) {

    const [rows] = await pool.query(
        `
        SELECT
            r.id AS resource_id,
            r.name,
            r.value,
            cr.amount,
            cr.updated_at
        FROM city_resources cr

        INNER JOIN resources r
            ON r.id = cr.resource_id

        WHERE cr.city_id = ?

        ORDER BY r.id
        `,
        [cityId]
    );

    return rows;
}


// ========================================
// Verificar que una ciudad pertenece
// a un jugador
// ========================================

async function cityBelongsToPlayer(
    playerId,
    cityId
) {

    const [rows] = await pool.query(
        `
        SELECT id
        FROM cities
        WHERE id = ?
          AND player_id = ?
        `,
        [
            cityId,
            playerId
        ]
    );


    return rows.length > 0;
}


// ========================================
// Crear una ciudad
// ========================================

async function createCity(
    playerId,
    name,
    x,
    y
) {

    const [result] = await pool.query(
        `
        INSERT INTO cities (
            player_id,
            name,
            coordinate_x,
            coordinate_y
        )
        VALUES (?, ?, ?, ?)
        `,
        [
            playerId,
            name,
            x,
            y
        ]
    );


    return getPlayerCity(
        playerId,
        result.insertId
    );
}


// ========================================
// EXPORTS
// ========================================

module.exports = {

    getPlayerCities,
    getPlayerCity,
    getCityResources,
    cityBelongsToPlayer,
    createCity

};