const express = require('express');

const {
    getPlayerCities,
    getPlayerCity,
    createCity
} = require('../services/cityService');

const {
    getCityResources
} = require('../services/resourceService');

const buildingRoutes =
    require('./buildingRoutes');


const router = express.Router();


// ========================================
// GET - Todas las ciudades del jugador
// ========================================
//
// GET /api/players/:playerId/cities
//

router.get(
    '/players/:playerId/cities',
    async (req, res, next) => {

        try {

            const playerId =
                Number(req.params.playerId);


            if (
                !Number.isInteger(playerId) ||
                playerId <= 0
            ) {

                const error =
                    new Error(
                        'ID de jugador inválido'
                    );

                error.statusCode = 400;

                throw error;

            }


            const cities =
                await getPlayerCities(playerId);


            res.json({
                cities
            });


        } catch (error) {

            next(error);

        }

    }
);


// ========================================
// GET - Una ciudad del jugador
// ========================================
//
// GET /api/players/:playerId/cities/:cityId
//

router.get(
    '/players/:playerId/cities/:cityId',
    async (req, res, next) => {

        try {

            const playerId =
                Number(req.params.playerId);

            const cityId =
                Number(req.params.cityId);


            // ----------------------------------------
            // Validar playerId
            // ----------------------------------------

            if (
                !Number.isInteger(playerId) ||
                playerId <= 0
            ) {

                const error =
                    new Error(
                        'ID de jugador inválido'
                    );

                error.statusCode = 400;

                throw error;

            }


            // ----------------------------------------
            // Validar cityId
            // ----------------------------------------

            if (
                !Number.isInteger(cityId) ||
                cityId <= 0
            ) {

                const error =
                    new Error(
                        'ID de ciudad inválido'
                    );

                error.statusCode = 400;

                throw error;

            }


            // ----------------------------------------
            // Obtener ciudad
            // ----------------------------------------

            const city =
                await getPlayerCity(
                    playerId,
                    cityId
                );


            if (!city) {

                const error =
                    new Error(
                        'Ciudad no encontrada'
                    );

                error.statusCode = 404;

                throw error;

            }


            res.json(city);


        } catch (error) {

            next(error);

        }

    }
);

// ========================================
// GET - Recursos de una ciudad
// ========================================
//
// GET /api/players/:playerId/cities/:cityId/resources
//

router.get(
    '/players/:playerId/cities/:cityId/resources',
    async (req, res, next) => {

        try {

            const playerId =
                Number(req.params.playerId);

            const cityId =
                Number(req.params.cityId);


            // ----------------------------------------
            // Validar playerId
            // ----------------------------------------

            if (
                !Number.isInteger(playerId) ||
                playerId <= 0
            ) {

                const error =
                    new Error(
                        'ID de jugador inválido'
                    );

                error.statusCode = 400;

                throw error;
            }


            // ----------------------------------------
            // Validar cityId
            // ----------------------------------------

            if (
                !Number.isInteger(cityId) ||
                cityId <= 0
            ) {

                const error =
                    new Error(
                        'ID de ciudad inválido'
                    );

                error.statusCode = 400;

                throw error;
            }


            // ----------------------------------------
            // Verificar que la ciudad pertenece
            // al jugador
            // ----------------------------------------

            const city =
                await getPlayerCity(
                    playerId,
                    cityId
                );


            if (!city) {

                const error =
                    new Error(
                        'Ciudad no encontrada'
                    );

                error.statusCode = 404;

                throw error;
            }


            // ----------------------------------------
            // Obtener recursos
            // ----------------------------------------

            const resources =
                await getCityResources(cityId);


            // ----------------------------------------
            // Respuesta
            // ----------------------------------------

            res.json({
                city_id: cityId,
                resources
            });

        } catch (error) {

            next(error);

        }

    }
);

// ========================================
// POST - Crear ciudad
// ========================================
//
// POST /api/players/:playerId/cities
//

router.post(
    '/players/:playerId/cities',
    async (req, res, next) => {

        try {

            const playerId =
                Number(req.params.playerId);


            // ----------------------------------------
            // Validar playerId
            // ----------------------------------------

            if (
                !Number.isInteger(playerId) ||
                playerId <= 0
            ) {

                const error =
                    new Error(
                        'ID de jugador inválido'
                    );

                error.statusCode = 400;

                throw error;

            }


            const {
                name,
                x,
                y
            } = req.body;


            // ----------------------------------------
            // Validar nombre
            // ----------------------------------------

            if (
                !name ||
                !name.trim()
            ) {

                const error =
                    new Error(
                        'El nombre de la ciudad es obligatorio'
                    );

                error.statusCode = 400;

                throw error;

            }


            // ----------------------------------------
            // Validar coordenadas
            // ----------------------------------------

            if (
                x === undefined ||
                y === undefined
            ) {

                const error =
                    new Error(
                        'Las coordenadas x e y son obligatorias'
                    );

                error.statusCode = 400;

                throw error;

            }


            const coordinateX =
                Number(x);

            const coordinateY =
                Number(y);


            if (
                !Number.isInteger(coordinateX) ||
                !Number.isInteger(coordinateY)
            ) {

                const error =
                    new Error(
                        'Las coordenadas deben ser números enteros'
                    );

                error.statusCode = 400;

                throw error;

            }


            // ----------------------------------------
            // Crear ciudad
            // ----------------------------------------

            const city =
                await createCity(
                    playerId,
                    name.trim(),
                    coordinateX,
                    coordinateY
                );


            res.status(201).json(city);


        } catch (error) {

            next(error);

        }

    }
);

// ========================================
// EXPORT
// ========================================

module.exports = router;