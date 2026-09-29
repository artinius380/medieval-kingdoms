const pool = require('../config/database');

const BASE_COST = 100;
const COST_MULTIPLIER = 1.5;
const PRODUCTION_PERCENTAGE = 0.30;


// ========================================
// Mejorar una edificación
// ========================================

async function upgradeBuilding(cityId, buildingId) {

    const connection =
        await pool.getConnection();

    let transactionCommitted = false;

    try {

        await connection.beginTransaction();


        // ========================================
        // 1. Obtener edificación
        // ========================================

        const [buildingRows] =
            await connection.query(
                `
                SELECT
                    pb.city_id,
                    pb.building_id,
                    pb.level,
                    b.name,
                    b.resource_type
                FROM player_buildings pb
                JOIN buildings b
                    ON b.id = pb.building_id
                WHERE pb.city_id = ?
                  AND pb.building_id = ?
                FOR UPDATE
                `,
                [
                    cityId,
                    buildingId
                ]
            );


        if (buildingRows.length === 0) {

            throw new Error(
                'Edificación no encontrada'
            );
        }


        const building =
            buildingRows[0];


        // ========================================
        // 2. Obtener recursos
        // ========================================

        const [resourceRows] =
            await connection.query(
                `
                SELECT
                    city_id,
                    minerals,
                    wood,
                    food,
                    updated_at
                FROM player_resources
                WHERE city_id = ?
                FOR UPDATE
                `,
                [cityId]
            );


        if (resourceRows.length === 0) {

            throw new Error(
                'Recursos de la ciudad no encontrados'
            );
        }


        const resources =
            resourceRows[0];


        // ========================================
        // 3. Calcular producción acumulada
        // ========================================

        const currentBuildingCost =
            BASE_COST *
            Math.pow(
                COST_MULTIPLIER,
                building.level - 1
            );


        const productionPerHour =
            currentBuildingCost *
            PRODUCTION_PERCENTAGE;


        const now =
            new Date();

        const lastUpdate =
            new Date(resources.updated_at);

        const elapsedMilliseconds =
            now - lastUpdate;

        const elapsedHours =
            elapsedMilliseconds /
            (1000 * 60 * 60);


        const resourceProduced =
            productionPerHour *
            elapsedHours;


        // ========================================
        // 4. Obtener recurso utilizado
        // ========================================

        const resourceType =
            building.resource_type;


        if (
            !['minerals', 'wood', 'food']
                .includes(resourceType)
        ) {

            throw new Error(
                'Tipo de recurso no válido para la edificación'
            );
        }


        const currentAmount =
            Number(resources[resourceType]);


        const updatedAmount =
            currentAmount +
            resourceProduced;


        // ========================================
        // 5. Coste de mejora
        // ========================================

        const upgradeCost =
            currentBuildingCost *
            COST_MULTIPLIER;


        // ========================================
        // 6. Verificar recursos
        // ========================================

        if (updatedAmount < upgradeCost) {

            // Guardar producción acumulada
            await connection.query(
                `
                UPDATE player_resources
                SET
                    ${resourceType} = ?,
                    updated_at = ?
                WHERE city_id = ?
                `,
                [
                    updatedAmount,
                    now,
                    cityId
                ]
            );


            await connection.commit();

            transactionCommitted = true;


            const error =
                new Error(
                    `Recursos insuficientes. Necesitas ${upgradeCost} y tienes ${updatedAmount}`
                );

            error.statusCode = 400;

            throw error;
        }


        // ========================================
        // 7. Descontar coste
        // ========================================

        const remainingAmount =
            updatedAmount -
            upgradeCost;


        // ========================================
        // 8. Nuevo nivel
        // ========================================

        const newLevel =
            building.level + 1;


        // ========================================
        // 9. Actualizar recurso
        // ========================================

        await connection.query(
            `
            UPDATE player_resources
            SET
                ${resourceType} = ?,
                updated_at = ?
            WHERE city_id = ?
            `,
            [
                remainingAmount,
                now,
                cityId
            ]
        );


        // ========================================
        // 10. Actualizar edificio
        // ========================================

        await connection.query(
            `
            UPDATE player_buildings
            SET level = ?
            WHERE city_id = ?
              AND building_id = ?
            `,
            [
                newLevel,
                cityId,
                buildingId
            ]
        );


        // ========================================
        // 11. Commit
        // ========================================

        await connection.commit();

        transactionCommitted = true;


        // ========================================
        // 12. Resultado
        // ========================================

        return {

            city_id: cityId,

            building_id:
                buildingId,

            building_name:
                building.name,

            resource_type:
                resourceType,

            previous_level:
                building.level,

            new_level:
                newLevel,

            upgrade_cost:
                upgradeCost,

            remaining_resource:
                remainingAmount,

            updated_at:
                now
        };


    } catch (error) {

        if (!transactionCommitted) {
            await connection.rollback();
        }

        throw error;

    } finally {

        connection.release();

    }
}


module.exports = {
    upgradeBuilding
};