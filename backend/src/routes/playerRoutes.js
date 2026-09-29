const express = require('express');

const {
    getPlayerResources
} = require('../services/resourceService');

const {
    getPlayerBuildings
} = require('../services/buildingService');

const router = express.Router({
    mergeParams: true
});


// GET /api/players/:playerId
// Información básica del jugador
router.get('/', async (req, res) => {
    try {
        const player = req.player;

        res.json({
            player_id: player.player_id,
            username: player.username
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Error al consultar el jugador'
        });
    }
});


// GET /api/players/:playerId/resources
// Recursos actualizados del jugador
router.get('/resources', async (req, res) => {
    try {
        const playerId = req.params.playerId;

        const resources = await getPlayerResources(playerId);

        res.json({
            player_id: playerId,
            minerals: resources.minerals,
            updated_at: resources.updated_at
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Error al consultar los recursos'
        });
    }
});


// GET /api/players/:playerId/buildings
// Edificaciones del jugador
router.get('/buildings', async (req, res) => {
    try {
        const playerId = req.params.playerId;

        const buildings = await getPlayerBuildings(playerId);

        res.json({
            player_id: playerId,
            buildings: buildings
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Error al consultar las edificaciones'
        });
    }
});


module.exports = router;