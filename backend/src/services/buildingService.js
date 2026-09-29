const pool = require('../config/database');


// ========================================
// CONFIGURACIÓN
// ========================================

const COST_MULTIPLIER = 1.5;


// ========================================
// Calcular información de una edificación
// ========================================

function calculateBuildingInfo(building) {

    const level = Number(building.level);
    const baseCost = Number(building.base_cost);
    const productionMultiplier =
        Number(building.production_multiplier);


    // ========================================
    // EDIFICIO NO CONSTRUIDO
    // ========================================

    if (level === 0) {

        return {

            production_per_hour: 0,

            next_level: 1,

            building_value: baseCost,

            upgrade_value: baseCost

        };
    }


    // ========================================
    // EDIFICIO CONSTRUIDO
    // ========================================

    const buildingValue =
        baseCost *
        Math.pow(
            COST_MULTIPLIER,
            level - 1
        );


    const productionPerHour =
        buildingValue *
        productionMultiplier;


    const nextLevel =
        level + 1;


    const upgradeValue =
        baseCost *
        Math.pow(
            COST_MULTIPLIER,
            nextLevel - 1
        );


    return {

        production_per_hour:
            productionPerHour,

        next_level:
            nextLevel,

        building_value:
            buildingValue,

        upgrade_value:
            upgradeValue

    };
}


// ========================================
// Obtener costos de una edificación
// ========================================

async function getBuildingCosts(buildingId, level) {

    const [rows] = await pool.query(
        `
        SELECT
            bc.resource_id,
            r.name AS resource_name,
            r.value AS resource_value,
            bc.amount AS base_amount
        FROM building_costs bc
        JOIN resources r
            ON r.id = bc.resource_id
        WHERE bc.building_id = ?
        ORDER BY bc.resource_id
        `,
        [buildingId]
    );


    // Para nivel 0, el costo de construcción
    // corresponde al costo base.
    const costLevel =
        Number(level) > 0
            ? Number(level)
            : 1;


    return rows.map(cost => {

        const amount =
            Number(cost.base_amount) *
            Math.pow(
                COST_MULTIPLIER,
                costLevel - 1
            );


        return {

            resource_id:
                Number(cost.resource_id),

            resource_name:
                cost.resource_name,

            resource_value:
                Number(cost.resource_value),

            amount:
                amount

        };

    });
}


// ========================================
// Obtener todas las edificaciones
// de una ciudad
// ========================================

async function getCityBuildings(cityId) {

    const [rows] = await pool.query(
        `
        SELECT
            b.id AS building_id,

            b.name,

            b.resource_id,

            r.name AS resource_name,
            r.value AS resource_value,

            b.base_cost,
            b.production_multiplier,

            COALESCE(cb.level, 0) AS level

        FROM buildings b

        LEFT JOIN city_buildings cb
            ON cb.building_id = b.id
            AND cb.city_id = ?

        LEFT JOIN resources r
            ON r.id = b.resource_id

        ORDER BY b.id
        `,
        [cityId]
    );


    const buildings = [];


    for (const building of rows) {

        const level =
            Number(building.level);


        // Calcular usando el nivel REAL.
        // Si es nivel 0, calculateBuildingInfo()
        // devolverá producción 0.

        const buildingInfo =
            calculateBuildingInfo(building);


        // Para nivel 0, getBuildingCosts()
        // internamente utilizará el costo base.

        const upgradeCosts =
            await getBuildingCosts(
                building.building_id,
                level
            );


        buildings.push({

            city_id:
                Number(cityId),

            building_id:
                Number(building.building_id),

            name:
                building.name,

            resource_id:
                Number(building.resource_id),

            resource_name:
                building.resource_name,

            resource_value:
                Number(
                    building.resource_value ?? 0
                ),

            level,

            base_cost:
                Number(building.base_cost),

            production_multiplier:
                Number(
                    building.production_multiplier
                ),

            ...buildingInfo,

            upgrade_costs:
                upgradeCosts

        });

    }


    return buildings;
}


// ========================================
// Obtener una edificación específica
// ========================================

async function getCityBuilding(
    cityId,
    buildingId
) {

    const [rows] = await pool.query(
        `
        SELECT
            cb.city_id,
            cb.building_id,

            b.name,

            b.resource_id,

            r.name AS resource_name,
            r.value AS resource_value,

            b.base_cost,
            b.production_multiplier,

            cb.level

        FROM city_buildings cb

        JOIN buildings b
            ON b.id = cb.building_id

        LEFT JOIN resources r
            ON r.id = b.resource_id

        WHERE cb.city_id = ?
          AND cb.building_id = ?
        `,
        [
            cityId,
            buildingId
        ]
    );


    if (rows.length === 0) {
        return null;
    }


    const building = rows[0];


    const buildingInfo =
        calculateBuildingInfo(building);


    const upgradeCosts =
        await getBuildingCosts(
            building.building_id,
            building.level
        );


    return {

        city_id: building.city_id,

        building_id: building.building_id,

        name: building.name,

        resource_id: building.resource_id,

        resource_name: building.resource_name,

        resource_value:
            Number(building.resource_value ?? 0),

        level: building.level,

        base_cost:
            Number(building.base_cost),

        production_multiplier:
            Number(building.production_multiplier),

        ...buildingInfo,

        upgrade_costs: upgradeCosts

    };
}


// ========================================
// MEJORAR EDIFICACIÓN
// ========================================

async function upgradeCityBuilding(
    cityId,
    buildingId
) {

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();


        // ----------------------------------------
        // Bloquear la ciudad
        // ----------------------------------------
        // Esto evita que dos mejoras simultáneas
        // de la misma ciudad calculen el mismo nivel.

        const [cityRows] = await connection.query(
            `
            SELECT id
            FROM cities
            WHERE id = ?
            FOR UPDATE
            `,
            [
                cityId
            ]
        );


        if (cityRows.length === 0) {

            throw new Error(
                'La ciudad no existe.'
            );

        }


        // ----------------------------------------
        // Verificar que el edificio existe
        // ----------------------------------------

        const [buildingDefinitionRows] =
            await connection.query(
                `
                SELECT
                    id,
                    name
                FROM buildings
                WHERE id = ?
                FOR UPDATE
                `,
                [
                    buildingId
                ]
            );


        if (buildingDefinitionRows.length === 0) {

            throw new Error(
                'La edificación no existe.'
            );

        }


        const buildingDefinition =
            buildingDefinitionRows[0];


        // ----------------------------------------
        // Obtener edificio de la ciudad
        // ----------------------------------------

        const [buildingRows] =
            await connection.query(
                `
                SELECT
                    city_id,
                    building_id,
                    level
                FROM city_buildings
                WHERE city_id = ?
                  AND building_id = ?
                FOR UPDATE
                `,
                [
                    cityId,
                    buildingId
                ]
            );


        // Si no existe en city_buildings,
        // significa que está en nivel 0.

        const buildingExists =
            buildingRows.length > 0;


        const currentLevel =
            buildingExists
                ? Number(buildingRows[0].level)
                : 0;


        // ----------------------------------------
        // Obtener costos base
        // ----------------------------------------

        const [costRows] =
            await connection.query(
                `
                SELECT
                    bc.resource_id,
                    bc.amount,
                    r.name
                FROM building_costs bc
                JOIN resources r
                    ON r.id = bc.resource_id
                WHERE bc.building_id = ?
                ORDER BY bc.resource_id
                `,
                [
                    buildingId
                ]
            );


        if (costRows.length === 0) {

            throw new Error(
                'La edificación no tiene costos definidos.'
            );

        }


        // ----------------------------------------
        // Calcular costos
        // ----------------------------------------
        //
        // Nivel 0 -> 1 = costo base
        // Nivel 1 -> 2 = costo base
        // Nivel 2 -> 3 = costo base * multiplier
        // Nivel 3 -> 4 = costo base * multiplier²
        //
        // Esto coincide con getBuildingCosts().

        const costLevel =
            Math.max(
                currentLevel,
                1
            );


        const costs =
            costRows.map(cost => ({

                resource_id:
                    Number(cost.resource_id),

                amount:
                    Number(cost.amount) *
                    Math.pow(
                        COST_MULTIPLIER,
                        costLevel - 1
                    )

            }));


        // ----------------------------------------
        // Verificar recursos
        // ----------------------------------------

        for (const cost of costs) {

            const [resourceRows] =
                await connection.query(
                    `
                    SELECT
                        cr.amount,
                        r.name
                    FROM city_resources cr
                    JOIN resources r
                        ON r.id = cr.resource_id
                    WHERE cr.city_id = ?
                      AND cr.resource_id = ?
                    FOR UPDATE
                    `,
                    [
                        cityId,
                        cost.resource_id
                    ]
                );


            const currentAmount =
                resourceRows.length > 0
                    ? Number(
                        resourceRows[0].amount
                    )
                    : 0;


            if (
                currentAmount <
                cost.amount
            ) {

                const resourceName =
                    resourceRows.length > 0
                        ? resourceRows[0].name
                        : 'recurso desconocido';


                throw new Error(
                    `Recursos insuficientes: ${resourceName}`
                );

            }

        }


        // ----------------------------------------
        // Descontar recursos
        // ----------------------------------------

        for (const cost of costs) {

            await connection.query(
                `
                UPDATE city_resources
                SET amount = amount - ?
                WHERE city_id = ?
                  AND resource_id = ?
                `,
                [
                    cost.amount,
                    cityId,
                    cost.resource_id
                ]
            );

        }


        // ----------------------------------------
        // Crear o mejorar edificio
        // ----------------------------------------

        if (!buildingExists) {

            // Primera construcción:
            // nivel 0 -> nivel 1

            await connection.query(
                `
                INSERT INTO city_buildings (
                    city_id,
                    building_id,
                    level
                )
                VALUES (?, ?, 1)
                `,
                [
                    cityId,
                    buildingId
                ]
            );

        } else {

            // Edificio existente:
            // subir un nivel

            await connection.query(
                `
                UPDATE city_buildings
                SET level = level + 1
                WHERE city_id = ?
                  AND building_id = ?
                `,
                [
                    cityId,
                    buildingId
                ]
            );

        }


        // ----------------------------------------
        // Confirmar transacción
        // ----------------------------------------

        await connection.commit();


        // ----------------------------------------
        // Obtener edificio actualizado
        // ----------------------------------------

        return await getCityBuilding(
            cityId,
            buildingId
        );


    } catch (error) {

        await connection.rollback();

        throw error;

    } finally {

        connection.release();

    }

}


// ========================================
// EXPORTS
// ========================================

module.exports = {

    getCityBuildings,

    getCityBuilding,

    upgradeCityBuilding,

    calculateBuildingInfo,

    getBuildingCosts

};