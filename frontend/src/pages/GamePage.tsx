import { useState } from 'react';

import Header from '../components/Header';
import BuildingCard from '../components/BuildingCard';
import BuildingDetail from '../components/BuildingDetail';

import type { Building } from '../types/game';

import { usePlayer } from '../hooks/usePlayer';
import { useResources } from '../hooks/useResources';
import { useBuildings } from '../hooks/useBuildings';



function GamePage() {

    const playerId = 1;

    const [selectedCityId, setSelectedCityId] =
        useState<number>(1);


    // ----------------------------------------
    // Menú activo
    // ----------------------------------------

    const [activeMenu, setActiveMenu] =
        useState('recursos');

    const [selectedBuilding, setSelectedBuilding] =
        useState<Building | null>(null);
    // ----------------------------------------
    // Categorías de edificios
    // ----------------------------------------

    const resourceBuildings = [
        'Mina',
        'Aserradero',
        'Granja'
    ];

    const armyBuildings = [
        'Transporte',
        'Cuartel',
        'Campo de Tiro',
        'Caballería',
        'Taller'
    ];

    const technologyBuildings = [
        'Armería',
        'Establo',
        'Ingeniería'
    ];

    // ----------------------------------------
    // Player
    // ----------------------------------------

    const {
        player,
        loading: playerLoading,
        error: playerError
    } = usePlayer(playerId);


    // ----------------------------------------
    // Buildings
    // ----------------------------------------

    const {
        buildings,
        loading: buildingsLoading,
        error: buildingsError,
        upgradingBuildingId,
        upgradeBuilding
    } = useBuildings(
        playerId,
        selectedCityId
    );

    // ----------------------------------------
    // Resources
    // ----------------------------------------

    const {
        resources,
        loading: resourcesLoading,
        error: resourcesError,
        refreshResources
    } = useResources(
        playerId,
        selectedCityId,
        buildings?.buildings ?? []
    );


    const handleUpgrade = async (
        buildingId: number
    ) => {

        const success =
            await upgradeBuilding(
                buildingId
            );


        if (success) {

            await refreshResources();

        }

    };

    // ----------------------------------------
    // Loading
    // ----------------------------------------

    const loading =
        playerLoading ||
        resourcesLoading ||
        buildingsLoading;


    if (loading) {

        return (
            <div className="game-loading">
                Cargando reino...
            </div>
        );

    }


    // ----------------------------------------
    // Error
    // ----------------------------------------

    const error =
        playerError ||
        resourcesError ||
        buildingsError;


    if (!player || !resources || !buildings) {

        return (
            <div className="game-error">
                {error || 'No se pudieron cargar los datos.'}
            </div>
        );

    }


    // ----------------------------------------
    // Título del menú actual
    // ----------------------------------------

    const getPageTitle = () => {

        switch (activeMenu) {

            case 'recursos':
                return 'Recursos Básicos';

            case 'ejercito':
                return 'Ejército';

            case 'tecnologias':
                return 'Tecnologías';

            case 'exploracion':
                return 'Exploración';

            case 'mapa':
                return 'Mapa';

            default:
                return 'Recursos Básicos';
        }

    };

    const getBuildingsForMenu = () => {

        switch (activeMenu) {

            case 'recursos':
                return buildings.buildings.filter(
                    building =>
                        building.category === 'RECURSOS'
                );

            case 'ejercito':
                return buildings.buildings.filter(
                    building =>
                        building.category === 'EJERCITO'
                );

            case 'tecnologias':
                return buildings.buildings.filter(
                    building =>
                        building.category === 'TECNOLOGIAS'
                );

            default:
                return [];
        }

    };

    // ----------------------------------------
    // Interfaz
    // ----------------------------------------

    return (
        <div className="game">

            {/* ==================================
                FONDO ANIMADO
            ================================== */}

            <video
                className="game-background-video"
                autoPlay
                loop
                muted
                playsInline
            >
                <source
                    src="/medieval-kingdoms-bg-animated2.mp4"
                    type="video/mp4"
                />
            </video>


            <Header
                player={player}
                resources={resources}
            />


            <main className="game-content">

                {/* ==================================
                    COLUMNA IZQUIERDA - MENÚ
                ================================== */}

                <aside className="game-menu">

                    <h3>Menú</h3>

                    <nav>

                        {/* RECURSOS BÁSICOS */}

                        <button
                            className={`menu-item ${activeMenu === 'recursos'
                                ? 'menu-item-active'
                                : ''
                                }`}
                            onClick={() => {
                                setActiveMenu('recursos');
                                setSelectedBuilding(null);
                            }}
                        >
                            Recursos Básicos
                        </button>


                        {/* EJÉRCITO */}

                        <button
                            className={`menu-item ${activeMenu === 'ejercito'
                                ? 'menu-item-active'
                                : ''
                                }`}
                            onClick={() => {
                                setActiveMenu('ejercito');
                                setSelectedBuilding(null);
                            }}
                        >
                            Ejército
                        </button>


                        {/* TECNOLOGÍAS */}

                        <button
                            className={`menu-item ${activeMenu === 'tecnologias'
                                ? 'menu-item-active'
                                : ''
                                }`}
                            onClick={() => {
                                setActiveMenu('tecnologias');
                                setSelectedBuilding(null);
                            }}
                        >
                            Tecnologías
                        </button>


                        {/* EXPLORACIÓN */}

                        <button
                            className={`menu-item ${activeMenu === 'exploracion'
                                ? 'menu-item-active'
                                : ''
                                }`}
                            onClick={() => {
                                setActiveMenu('exploracion');
                                setSelectedBuilding(null);
                            }}
                        >
                            Exploración
                        </button>


                        {/* MAPA */}

                        <button
                            className={`menu-item ${activeMenu === 'mapa'
                                ? 'menu-item-active'
                                : ''
                                }`}
                            onClick={() => {
                                setActiveMenu('mapa');
                                setSelectedBuilding(null);
                            }}
                        >
                            Mapa
                        </button>

                    </nav>

                </aside>


                {/* ==================================
                    COLUMNA CENTRAL - CONTENIDO
                ================================== */}

                <section className="game-main">

                    <h2>
                        {getPageTitle()}
                    </h2>


                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}


                    {/* ==================================
                        EDIFICACIONES
                    ================================== */}

                    {(
                        activeMenu === 'recursos' ||
                        activeMenu === 'ejercito' ||
                        activeMenu === 'tecnologias'
                    ) && (

                            <div className="buildings-grid">

                                {selectedBuilding ? (

                                    <BuildingDetail
                                        building={selectedBuilding}
                                        onBack={() =>
                                            setSelectedBuilding(null)
                                        }
                                    />

                                ) : (

                                    getBuildingsForMenu().map(
                                        (building) => {

                                            return (
                                                <BuildingCard
                                                    key={building.building_id}
                                                    building={building}
                                                    resources={resources.resources}
                                                    onUpgrade={handleUpgrade}
                                                    upgrading={
                                                        upgradingBuildingId ===
                                                        building.building_id
                                                    }
                                                    onSelect={
                                                        setSelectedBuilding
                                                    }
                                                />
                                            );

                                        }
                                    )

                                )}

                            </div>

                        )}


                    {/* ==================================
                        EXPLORACIÓN
                    ================================== */}

                    {activeMenu === 'exploracion' && (

                        <div className="empty-game-panel">

                        </div>

                    )}


                    {/* ==================================
                        MAPA
                    ================================== */}

                    {activeMenu === 'mapa' && (

                        <div className="empty-game-panel">

                        </div>

                    )}

                </section>


                {/* ==================================
                    COLUMNA DERECHA - CIUDADES
                ================================== */}

                <aside className="city-panel">

                    <h3>Ciudades</h3>

                    <div className="city-list">

                        <button
                            className={`city-item ${selectedCityId === 1
                                ? 'city-item-active'
                                : ''
                                }`}
                            onClick={() =>
                                setSelectedCityId(1)
                            }
                        >

                            <span className="city-icon">
                                🏰
                            </span>

                            <span className="city-info">

                                <strong>
                                    Ciudad Principal
                                </strong>

                                <small>
                                    Ciudad 1
                                </small>

                            </span>

                        </button>

                    </div>

                </aside>


            </main>

        </div>
    );
}

export default GamePage;