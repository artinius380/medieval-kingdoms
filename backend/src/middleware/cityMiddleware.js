const {
    cityBelongsToPlayer
} = require('../services/cityService');


// ========================================
// VALIDAR CIUDAD
// ========================================
//
// Comprueba que la ciudad pertenece
// al jugador indicado en la URL.
//
// URL esperada:
//
// /api/players/:playerId/cities/:cityId/...
//
// ========================================

async function validateCityOwnership(
    req,
    res,
    next
) {

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
        // Comprobar propietario
        // ----------------------------------------

        const belongsToPlayer =
            await cityBelongsToPlayer(
                playerId,
                cityId
            );


        if (!belongsToPlayer) {

            const error =
                new Error(
                    'La ciudad no pertenece al jugador'
                );

            error.statusCode = 404;

            throw error;

        }


        // ----------------------------------------
        // Continuar
        // ----------------------------------------

        next();


    } catch (error) {

        next(error);

    }

}


module.exports = {
    validateCityOwnership
};