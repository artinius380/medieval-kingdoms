const pool = require('../config/database');


// ========================================
// CONFIGURACIÓN
// ========================================

const COST_MULTIPLIER = 1.5;


// ========================================
// Actualizar recursos de una ciudad
// ========================================

async function updateCityResources(cityId) {

    const connection =
        await pool.getConnection();

    try {

        await connection.beginTransaction();


        // ========================================
        // Obtener recursos de la ciudad
        // ========================================

        const [resourceRows] =
            await connection.query(
                `
                SELECT
                    cr.city_id,
                    cr.resource_id,
                    cr.amount,
                    cr.updated_at,

                    r.name,
                    r.value

                FROM city_resources cr

                JOIN resources r
                    ON r.id = cr.resource_id

                WHERE cr.city_id = ?

                FOR UPDATE
                `,
                [cityId]
            );


        if (resourceRows.length === 0) {

            throw new Error(
                'Recursos de la ciudad no encontrados'
            );

        }


        // ========================================
        // Obtener edificios de la ciudad
        // ========================================

        const [buildingRows] =
            await connection.query(
                `
                SELECT
                    cb.building_id,
                    cb.level,

                    b.base_cost,
                    b.production_multiplier,
                    b.resource_id

                FROM city_buildings cb

                JOIN buildings b
                    ON b.id = cb.building_id

                WHERE cb.city_id = ?
                `,
                [cityId]
            );


        // ========================================
        // Producción por recurso
        // ========================================

        const production = {};


        for (const building of buildingRows) {

            const level =
                Number(building.level);

            const baseCost =
                Number(building.base_cost);

            const productionMultiplier =
                Number(
                    building.production_multiplier
                );


            // Valor actual del edificio
            //
            // Nivel 1 = 400
            // Nivel 2 = 600
            // Nivel 3 = 900
            // etc.

            const currentBuildingValue =
                baseCost *
                Math.pow(
                    COST_MULTIPLIER,
                    level - 1
                );


            // Producción por hora

            const productionPerHour =
                currentBuildingValue *
                productionMultiplier;


            const resourceId =
                Number(building.resource_id);


            if (!production[resourceId]) {

                production[resourceId] = 0;

            }


            production[resourceId] +=
                productionPerHour;

        }


        // ========================================
        // Calcular tiempo transcurrido
        // ========================================

        const now = new Date();


        for (const resource of resourceRows) {

            const lastUpdate =
                new Date(resource.updated_at);


            const elapsedMilliseconds =
                now.getTime() -
                lastUpdate.getTime();


            const elapsedHours =
                elapsedMilliseconds /
                (1000 * 60 * 60);


            // Producción de este recurso

            const productionPerHour =
                production[resource.resource_id] || 0;


            // Cantidad nueva

            const newAmount =
                Number(resource.amount) +
                productionPerHour *
                elapsedHours;


            // ========================================
            // Guardar
            // ========================================

            await connection.query(
                `
                UPDATE city_resources

                SET
                    amount = ?,
                    updated_at = ?

                WHERE city_id = ?
                  AND resource_id = ?
                `,
                [
                    newAmount,
                    now,
                    cityId,
                    resource.resource_id
                ]
            );


            // Actualizar objeto
            // para devolver el valor nuevo

            resource.amount =
                newAmount;

            resource.updated_at =
                now;

        }


        await connection.commit();


        // ========================================
        // Respuesta
        // ========================================

        return resourceRows.map(resource => ({

            resource_id:
                resource.resource_id,

            name:
                resource.name,

            value:
                Number(resource.value),

            amount:
                Number(resource.amount),

            updated_at:
                resource.updated_at

        }));


    } catch (error) {

        await connection.rollback();

        throw error;

    } finally {

        connection.release();

    }

}


// ========================================
// Obtener recursos
// ========================================

async function getCityResources(cityId) {

    return await updateCityResources(cityId);

}


// ========================================
// EXPORTS
// ========================================

module.exports = {

    updateCityResources,

    getCityResources

};