import type { Building } from '../types/game';

interface BuildingDetailProps {
    building: Building;
    onBack: () => void;
}

function BuildingDetail({
    building,
    onBack
}: BuildingDetailProps) {

    return (
        <div className="building-detail">

            {/* ==================================
                CONTENIDO
            ================================== */}

            <div className="building-detail-content">

                {/* ==================================
                    ENCABEZADO
                ================================== */}

                <div className="building-detail-header">

                    <h2>
                        {building.name}
                    </h2>

                    <button
                        className="building-detail-back"
                        onClick={onBack}
                    >
                        ← Volver
                    </button>

                </div>


                <div className="building-detail-level">
                    Nivel {building.level}
                </div>


                {/* ==================================
                    VIDEO
                ================================== */}

                <video
                    className="building-detail-video"
                    src={getBuildingVideo(building.name)}
                    autoPlay
                    loop
                    muted
                    playsInline
                />


                {/* ==================================
                    INFORMACIÓN TEMPORAL
                ================================== */}

                <div className="building-detail-info">

                    <p>
                        Edificación:
                        {' '}
                        {building.name}
                    </p>

                    <p>
                        Categoría:
                        {' '}
                        {building.category}
                    </p>

                    <p>
                        Nivel actual:
                        {' '}
                        {building.level}
                    </p>

                </div>

            </div>

        </div>
    );
}


/* ========================================
   VIDEO DE EDIFICACIÓN
======================================== */

const getBuildingVideo = (buildingName: string) => {

    switch (buildingName) {

        // RECURSOS

        case 'Mina':
            return '/mina.mp4';

        case 'Aserradero':
            return '/aserradero.mp4';

        case 'Granja':
            return '/granja.mp4';


        // EJÉRCITO

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


        // TECNOLOGÍAS

        case 'Armeria':
            return '/armeria.mp4';

        case 'Establo':
            return '/establo.mp4';

        case 'Ingenieria':
            return '/ingenieria.mp4';


        default:
            return '/edificio.mp4';
    }
};


export default BuildingDetail;