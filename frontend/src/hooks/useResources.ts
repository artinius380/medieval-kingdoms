import {
    useCallback,
    useEffect,
    useState
} from 'react';

import {
    getCityResources
} from '../services/api';

import type {
    CityResources,
    Building
} from '../types/game';


export function useResources(
    playerId: number,
    cityId: number | null,
    buildings: Building[] = []
) {

    const [resources, setResources] =
        useState<CityResources | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);


    // ========================================
    // Cargar recursos desde el backend
    // ========================================

    const loadResources = useCallback(
        async () => {

            if (!cityId) {

                setResources(null);
                setLoading(false);

                return;
            }


            try {

                setError(null);

                const resourcesData =
                    await getCityResources(
                        playerId,
                        cityId
                    );

                setResources(resourcesData);

            } catch (error) {

                setError(
                    error instanceof Error
                        ? error.message
                        : 'Error al cargar los recursos'
                );

            } finally {

                setLoading(false);

            }

        },
        [playerId, cityId]
    );


    // ========================================
    // Carga inicial
    // ========================================

    useEffect(() => {

        setLoading(true);

        loadResources();

    }, [loadResources]);


    // ========================================
    // Sincronización con backend
    // cada 5 segundos
    // ========================================

    useEffect(() => {

        if (!cityId) {
            return;
        }


        const interval =
            setInterval(() => {

                loadResources();

            }, 5000);


        return () => {

            clearInterval(interval);

        };

    }, [loadResources, cityId]);


    // ========================================
    // Producción visual
    // cada 0.5 segundos
    // ========================================

    useEffect(() => {

        const interval =
            setInterval(() => {

                setResources(current => {

                    if (!current) {
                        return current;
                    }


                    // --------------------------------
                    // Producción por recurso
                    // --------------------------------

                    const productionByResource =
                        new Map<number, number>();


                    for (const building of buildings) {

                        // Un edificio nivel 0
                        // no produce recursos.

                        if (building.level <= 0) {
                            continue;
                        }


                        const production =
                            Number(
                                building.production_per_hour ?? 0
                            );


                        if (production <= 0) {
                            continue;
                        }


                        const currentProduction =
                            productionByResource.get(
                                building.resource_id
                            ) ?? 0;


                        productionByResource.set(
                            building.resource_id,
                            currentProduction + production
                        );

                    }


                    // --------------------------------
                    // Aplicar producción
                    // --------------------------------

                    return {

                        ...current,

                        resources:
                            current.resources.map(resource => {

                                const productionPerHour =
                                    productionByResource.get(
                                        resource.resource_id
                                    ) ?? 0;


                                if (productionPerHour <= 0) {
                                    return resource;
                                }


                                // 0.5 segundos de producción

                                const production =
                                    productionPerHour / 3600 * 0.5;


                                return {

                                    ...resource,

                                    amount:
                                        Number(resource.amount) +
                                        production

                                };

                            })

                    };

                });

            }, 500);


        return () => {

            clearInterval(interval);

        };

    }, [buildings]);


    // ========================================
    // Return
    // ========================================

    return {

        resources,

        loading,

        error,

        refreshResources:
            loadResources

    };

}