import type {
    Building,
    BuildingCost,
    CityResource
} from '../types/game';

import { resourceConfig } from '../config/resourceConfig';


// ========================================
// PROPS
// ========================================

interface BuildingCardProps {
    building: Building;
    resources: CityResource[];
    onUpgrade: (buildingId: number) => void;
    upgrading: boolean;
}


// ========================================
// COMPONENTE
// ========================================

function BuildingCard({
    building,
    resources,
    onUpgrade,
    upgrading
}: BuildingCardProps) {


    // ========================================
    // FORMATO DE NÚMEROS
    // ========================================

    const formatNumber = (value: number) =>
        Math.round(value).toLocaleString('es-ES');


    // ========================================
    // IMAGEN DE EDIFICIO
    // ========================================

    const getBuildingVideo = (buildingName: string) => {

        switch (buildingName) {

            // ==============================
            // RECURSOS
            // ==============================

            case 'Mina':
                return '/mina.mp4';

            case 'Aserradero':
                return '/aserradero.mp4';

            case 'Granja':
                return '/granja.mp4';


            // ==============================
            // EJÉRCITO
            // ==============================

            case 'Transporte':
                return '/transporte.mp4';

            case 'Cuartel':
                return '/cuartel.mp4';

            case 'Campo de Tiro':
                return '/campo_de_tiro.mp4';

            case 'Caballeria':
                return '/caballeria.mp4';

            case 'Taller':
                return '/taller.mp4';


            // ==============================
            // TECNOLOGÍAS
            // ==============================

            case 'Armeria':
                return '/armeria.mp4';

            case 'Establo':
                return '/establo.mp4';

            case 'Ingenieria':
                return '/ingenieria.mp4';


            // ==============================
            // DEFAULT
            // ==============================

            default:
                return '/edificio.mp4';
        }
    };


    // ========================================
    // CONFIGURACIÓN DEL RECURSO
    // ========================================

    const getResourceConfig = (resourceName: string) => {

        return (
            resourceConfig[
            resourceName as keyof typeof resourceConfig
            ] ?? {
                icon: '📦',
                color: '#f0e6d2'
            }
        );
    };


    // ========================================
    // PRODUCCIÓN
    // ========================================

    const productionPerHour =
        Number(building.production_per_hour ?? 0);


    // ========================================
    // COSTOS DE MEJORA
    // ========================================

    const upgradeCosts: BuildingCost[] =
        building.upgrade_costs ?? [];


    // ========================================
    // OBTENER CANTIDAD DE UN RECURSO
    // ========================================

    const getResourceAmount = (
        resourceId: number
    ) => {

        const resource = resources.find(
            resource =>
                resource.resource_id === resourceId
        );

        return Number(
            resource?.amount ?? 0
        );
    };


    // ========================================
    // REQUISITOS DE MEJORA
    // ========================================

    const resourceRequirements =
        upgradeCosts.map(cost => {

            const required =
                Number(cost.amount);

            const available =
                getResourceAmount(
                    cost.resource_id
                );

            const missing =
                Math.max(
                    required - available,
                    0
                );

            const percentage =
                required > 0
                    ? Math.min(
                        (available / required) * 100,
                        100
                    )
                    : 100;

            return {
                ...cost,
                required,
                available,
                missing,
                percentage
            };

        });


    // ========================================
    // ¿PUEDE MEJORAR?
    // ========================================

    // ========================================
    // REQUISITOS DE EDIFICACIÓN
    // ========================================

    const buildingRequirements =
        building.requirements ?? [];

    const hasEnoughResources =
        resourceRequirements.every(
            requirement =>
                requirement.available >=
                requirement.required
        );


    const hasBuildingRequirements =
        buildingRequirements.every(
            requirement =>
                requirement.met
        );


    const canUpgrade =
        hasEnoughResources &&
        hasBuildingRequirements &&
        !upgrading;

    // ========================================
    // RENDER
    // ========================================

    return (

        <div className="building-card-wrapper">

            <div className="building-card">


                {/* ==================================
                    HEADER
                ================================== */}

                <div className="building-card-header">

                    <h3>
                        {building.name}
                    </h3>


                    <video
                        className="building-image"
                        src={getBuildingVideo(building.name)}
                        autoPlay
                        loop
                        muted
                        playsInline
                    />


                    <span className="building-level">
                        Nivel {building.level}
                    </span>

                </div>


                {/* ==================================
                    INFORMACIÓN
                ================================== */}

                <div className="building-info">


                    {/* PRODUCCIÓN */}

                    {building.category === 'RECURSOS' && (

                        <div className="building-stat">

                            <span className="stat-label">
                                Producción
                            </span>

                            <span
                                className="stat-value"
                                style={{
                                    color:
                                        getResourceConfig(
                                            building.resource_name
                                        ).color
                                }}
                            >

                                <span>
                                    {
                                        getResourceConfig(
                                            building.resource_name
                                        ).icon
                                    }
                                </span>

                                {' '}

                                {formatNumber(
                                    productionPerHour
                                )}

                                {' /h'}

                            </span>

                        </div>

                    )}


                    {/* COSTE DE MEJORA */}

                    <div className="building-stat building-cost-stat">

                        <span className="stat-label">
                            Coste
                        </span>


                        <span className="stat-value building-costs">

                            {resourceRequirements.map(
                                cost => {

                                    const config =
                                        getResourceConfig(
                                            cost.resource_name
                                        );

                                    return (

                                        <span
                                            key={
                                                cost.resource_id
                                            }
                                            className="building-cost"
                                            style={{
                                                color:
                                                    config.color
                                            }}
                                        >

                                            <span>
                                                {config.icon}
                                            </span>

                                            {' '}

                                            {formatNumber(
                                                cost.required
                                            )}

                                        </span>

                                    );

                                }
                            )}

                        </span>

                    </div>

                </div>


                {/* ==================================
                    BOTÓN DE MEJORA
                ================================== */}

                <div className="upgrade-button-wrapper">


                    <button
                        className={`upgrade-button ${canUpgrade
                            ? 'upgrade-button-ready'
                            : 'upgrade-button-disabled'
                            }`}

                        onClick={() =>
                            onUpgrade(
                                building.building_id
                            )
                        }

                        disabled={!canUpgrade}
                    >

                        {upgrading
                            ? 'Mejorando'
                            : `Nivel ${building.next_level}`}

                    </button>


                    {/* ==================================
                        TOOLTIP
                    ================================== */}

                    {!upgrading && (

                        <div className="upgrade-tooltip">

                            {/* ==================================
    RECURSOS PARA MEJORAR
================================== */}

                            <strong>
                                Recursos para mejorar
                            </strong>


                            <div className="tooltip-resources">

                                {resourceRequirements.map((resource) => (

                                    <div
                                        key={resource.resource_id}
                                        className="tooltip-resource"
                                    >

                                        {/* NOMBRE + PORCENTAJE + CANTIDAD */}

                                        <div className="tooltip-resource-header">

                                            {/* NOMBRE + ICONO */}

                                            <span
                                                className="tooltip-resource-name"
                                                style={{
                                                    color:
                                                        resourceConfig[
                                                            resource.resource_name
                                                        ]?.color
                                                }}
                                            >

                                                {resourceConfig[
                                                    resource.resource_name
                                                ]?.icon}

                                                {' '}

                                                {resource.resource_name}

                                            </span>


                                            {/* PORCENTAJE */}

                                            <span className="tooltip-resource-percentage">

                                                {formatNumber(
                                                    resource.percentage
                                                )}%

                                            </span>


                                            {/* CANTIDAD */}

                                            <span
                                                className="tooltip-resource-amount"
                                                style={{
                                                    color:
                                                        resourceConfig[
                                                            resource.resource_name
                                                        ]?.color
                                                }}
                                            >

                                                {formatNumber(
                                                    resource.available
                                                )}

                                                {' / '}

                                                {formatNumber(
                                                    resource.required
                                                )}

                                            </span>

                                        </div>


                                        {/* BARRA DE PROGRESO */}

                                        <div className="tooltip-progress-bar">

                                            <div
                                                className="tooltip-progress-fill"
                                                style={{
                                                    width: `${Math.min(
                                                        resource.percentage,
                                                        100
                                                    )}%`,

                                                    backgroundColor:
                                                        resourceConfig[
                                                            resource.resource_name
                                                        ]?.color
                                                }}
                                            />

                                        </div>

                                    </div>

                                ))}

                            </div>


                            {/* ==================================
    REQUISITOS DE EDIFICACIÓN
================================== */}

                            {buildingRequirements.length > 0 && (

                                <div className="tooltip-requirements">

                                    <strong>
                                        Requisitos
                                    </strong>


                                    <div className="tooltip-requirements-list">

                                        {buildingRequirements.map(
                                            (requirement) => (

                                                <div
                                                    key={requirement.building_id}
                                                    className={`tooltip-requirement ${requirement.met
                                                        ? 'tooltip-requirement-met'
                                                        : 'tooltip-requirement-missing'
                                                        }`}
                                                >

                                                    <span className="tooltip-requirement-name">

                                                        {requirement.met
                                                            ? '✓'
                                                            : '🔒'}

                                                        {' '}

                                                        {requirement.building_name}

                                                    </span>


                                                    <span className="tooltip-requirement-level">

                                                        Nivel {requirement.required_level}

                                                        {' '}

                                                        {requirement.met
                                                            ? '✓'
                                                            : `(Actual: ${requirement.current_level})`}

                                                    </span>

                                                </div>

                                            )
                                        )}

                                    </div>

                                </div>

                            )}

                        </div>

                    )}

                </div>

            </div>

        </div>

    );
}

export default BuildingCard;