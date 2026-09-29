const pool = require('../config/database');

async function getPlayerById(playerId) {
    const [rows] = await pool.query(
        `
        SELECT
            id AS player_id,
            username
        FROM players
        WHERE id = ?
        `,
        [playerId]
    );

    if (rows.length === 0) {
        return null;
    }

    return rows[0];
}

module.exports = {
    getPlayerById
};