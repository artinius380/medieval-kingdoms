export interface Player {

    player_id: number;

    username: string;

}


// ========================================
// CITY
// ========================================

export interface City {

    city_id: number;

    player_id: number;

    name: string;

    coordinate_x: number;

    coordinate_y: number;

}


// ========================================
// RESOURCES
// ========================================

export interface Resource {

    resource_id: number;

    name: string;

    value: number;

    amount: number;

    updated_at: string;

}


export interface CityResource {

    resource_id: number;

    name: string;

    value: number;

    amount: number;

    updated_at: string;
}


export interface CityResources {

    city_id: number;

    resources: CityResource[];

    updated_at: string;
}


// ========================================
// BUILDINGS
// ========================================

export interface BuildingCost {
    resource_id: number;
    resource_name: string;
    resource_value: number;
    amount: number;
}

export type BuildingCategory =
    | 'RECURSOS'
    | 'EJERCITO'
    | 'TECNOLOGIAS';

export interface Building {

    building_id: number;

    name: string;

    category: BuildingCategory;

    resource_id: number;

    resource_name: string;

    resource_value: number;

    level: number;

    base_cost: number;

    production_multiplier: number;

    production_per_hour: number;

    next_level: number;

    building_value: number;

    upgrade_value: number;

    upgrade_costs: BuildingCost[];

    requirements: BuildingRequirement[];
}


export interface CityBuildings {

    city_id: number;

    buildings: Building[];

}


// ========================================
// BUILDING UPGRADE
// ========================================

export interface BuildingUpgradeResult {

    city_id: number;

    building_id: number;

    building_name: string;

    previous_level: number;

    new_level: number;

    upgrade_cost: number;

    resources: Resource[];

    updated_at: string;

}

export interface BuildingRequirement {
    building_id: number;
    building_name: string;
    required_level: number;
    current_level: number;
    met: boolean;
}