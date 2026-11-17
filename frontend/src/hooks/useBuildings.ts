import {
    useCallback,
    useEffect,
    useState
} from 'react';

import type {
    Building
} from '../types/game';

const API_URL = import.meta.env.VITE_API_URL;


interface BuildingsResponse {

    city_id: number;

    buildings: Building[];

}


export function useBuildings(
    playerId: number,
    cityId: number | null
) {

    const [buildings, setBuildings] =
        useState<BuildingsResponse | null>(null);


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState<string | null>(null);


    const [upgradingBuildingId, setUpgradingBuildingId] =
        useState<number | null>(null);


    // ========================================
    // Cargar edificios
    // ========================================

    const loadBuildings =
        useCallback(
            async () => {

                if (!cityId) {

                    setBuildings(null);
                    setLoading(false);

                    return;
                }


                try {

                    setLoading(true);
                    setError(null);


                    const response =
                        await fetch(
                            `${API_URL}/players/${playerId}/cities/${cityId}/buildings`
                        );


                    if (!response.ok) {

                        throw new Error(
                            'No se pudieron cargar las edificaciones.'
                        );

                    }


                    const data =
                        await response.json();


                    setBuildings(data);


                } catch (error) {

                    setError(
                        error instanceof Error
                            ? error.message
                            : 'Error al cargar las edificaciones.'
                    );


                } finally {

                    setLoading(false);

                }

            },
            [
                playerId,
                cityId
            ]
        );


    // ========================================
    // Cargar al cambiar de ciudad
    // ========================================

    useEffect(() => {

        loadBuildings();

    }, [loadBuildings]);


    // ========================================
    // Mejorar edificio
    // ========================================

    const upgradeBuilding =
        async (
            buildingId: number
        ): Promise<boolean> => {

            if (!cityId) {
                return false;
            }


            try {

                setUpgradingBuildingId(
                    buildingId
                );

                setError(null);


                const response =
                    await fetch(
                        `${API_URL}/players/${playerId}/cities/${cityId}/buildings/${buildingId}/upgrade`,
                        {
                            method: 'POST'
                        }
                    );


                if (!response.ok) {

                    const data =
                        await response.json()
                            .catch(() => null);


                    throw new Error(
                        data?.message ||
                        'No se pudo mejorar la edificación.'
                    );

                }


                // ========================================
                // Recargar edificios después de mejorar
                // ========================================

                await loadBuildings();


                return true;


            } catch (error) {

                setError(
                    error instanceof Error
                        ? error.message
                        : 'Error al mejorar la edificación.'
                );


                return false;


            } finally {

                setUpgradingBuildingId(null);

            }

        };


    // ========================================
    // Retorno
    // ========================================

    return {

        buildings,

        loading,

        error,

        upgradingBuildingId,

        upgradeBuilding,

        reloadBuildings:
            loadBuildings

    };

}