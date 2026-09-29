const express = require('express');

const {
    getCityBuildings,
    getCityBuilding,
    upgradeCityBuilding
} = require('../services/buildingService');


const router = express.Router({
    mergeParams: true
});


// ========================================
// GET - Todas las edificaciones de la ciudad
// ========================================
//
// GET
// /api/players/:playerId/cities/:cityId/buildings
//

router.get('/', async (req, res, next) => {

    try {

        const cityId =
            Number(req.params.cityId);


        const buildings =
            await getCityBuildings(cityId);


        res.json({
            city_id: cityId,
            buildings
        });


    } catch (error) {

        next(error);

    }

});


// ========================================
// GET - Una edificación
// ========================================
//
// GET
// /api/players/:playerId/cities/:cityId/buildings/:buildingId
//

router.get(
    '/:buildingId',
    async (req, res, next) => {

        try {

            const cityId =
                Number(req.params.cityId);

            const buildingId =
                Number(req.params.buildingId);


            if (
                !Number.isInteger(buildingId) ||
                buildingId <= 0
            ) {

                const error =
                    new Error(
                        'ID de edificación inválido'
                    );

                error.statusCode = 400;

                throw error;

            }


            const building =
                await getCityBuilding(
                    cityId,
                    buildingId
                );


            if (!building) {

                const error =
                    new Error(
                        'Edificio no encontrado'
                    );

                error.statusCode = 404;

                throw error;

            }


            res.json(building);


        } catch (error) {

            next(error);

        }

    }
);


// ========================================
// POST - Mejorar edificación
// ========================================
//
// POST
// /api/players/:playerId/cities/:cityId/buildings/:buildingId/upgrade
//

router.post(
    '/:buildingId/upgrade',
    async (req, res, next) => {

        try {

            const cityId =
                Number(req.params.cityId);

            const buildingId =
                Number(req.params.buildingId);


            if (
                !Number.isInteger(buildingId) ||
                buildingId <= 0
            ) {

                const error =
                    new Error(
                        'ID de edificación inválido'
                    );

                error.statusCode = 400;

                throw error;

            }


            const building =
                await upgradeCityBuilding(
                    cityId,
                    buildingId
                );


            res.json({
                message:
                    'Edificación mejorada correctamente.',
                building
            });


        } catch (error) {

            next(error);

        }

    }
);


module.exports = router;