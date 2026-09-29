const {
    getPlayerById
} = require('../services/playerService');

async function validatePlayer(req, res, next) {
    try {
        const playerId = req.params.playerId;

        const player = await getPlayerById(playerId);

        if (!player) {
            return res.status(404).json({
                error: 'Jugador no encontrado'
            });
        }

        // Guardamos el jugador para que las rutas
        // puedan utilizarlo sin volver a consultar la DB
        req.player = player;

        next();

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Error al validar el jugador'
        });
    }
}

module.exports = {
    validatePlayer
};