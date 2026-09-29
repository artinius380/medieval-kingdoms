import type {
    Player,
    City,
    CityResources,
    CityBuildings,
    Building,
    BuildingUpgradeResult
} from '../types/game';


const API_URL = import.meta.env.VITE_API_URL;


// ========================================
// Generic request
// ========================================

async function request<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {

    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...options,

            headers: {
                'Content-Type': 'application/json',
                ...options?.headers
            }
        }
    );


    if (!response.ok) {

        const errorData =
            await response
                .json()
                .catch(() => null);


        throw new Error(
            errorData?.error ??
            `Error HTTP ${response.status}`
        );

    }


    return response.json();

}


// ========================================
// Players
// ========================================

export async function getPlayer(
    playerId: number
): Promise<Player> {

    return request<Player>(
        `/players/${playerId}`
    );

}


// ========================================
// Cities
// ========================================

export async function getPlayerCities(
    playerId: number
): Promise<City[]> {

    return request<City[]>(
        `/players/${playerId}/cities`
    );

}


export async function getCity(
    playerId: number,
    cityId: number
): Promise<City> {

    return request<City>(
        `/players/${playerId}/cities/${cityId}`
    );

}


// ----------------------------------------
// Resources
// ----------------------------------------

export async function getCityResources(
    playerId: number,
    cityId: number
): Promise<CityResources> {

    return request<CityResources>(
        `/players/${playerId}/cities/${cityId}/resources`
    );
}


// ========================================
// City Buildings
// ========================================

export async function getCityBuildings(
    playerId: number,
    cityId: number
): Promise<CityBuildings> {

    return request<CityBuildings>(
        `/players/${playerId}/cities/${cityId}/buildings`
    );

}


export async function getCityBuilding(
    playerId: number,
    cityId: number,
    buildingId: number
): Promise<Building> {

    return request<Building>(
        `/players/${playerId}/cities/${cityId}/buildings/${buildingId}`
    );

}


// ========================================
// Building upgrade
// ========================================

export async function upgradeBuilding(
    playerId: number,
    cityId: number,
    buildingId: number
): Promise<BuildingUpgradeResult> {

    return request<BuildingUpgradeResult>(
        `/players/${playerId}/cities/${cityId}/buildings/${buildingId}/upgrade`,
        {
            method: 'POST'
        }
    );

}