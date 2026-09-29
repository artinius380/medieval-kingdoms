import type {
    Player,
    CityResources
} from '../types/game';

import ResourceBar from './ResourceBar';

interface HeaderProps {
    player: Player;
    resources: CityResources;
}

function Header({
    player,
    resources
}: HeaderProps) {

    return (
        <header className="game-header">

            {/* Fila superior */}
            <div className="header-top">

                <div className="game-brand">
                    <h1>Medieval Kingdoms</h1>
                </div>

                <div className="game-player">

                    <span className="player-label">
                        Jugador:
                    </span>

                    <strong className="player-name">
                        {player.username}
                    </strong>

                </div>

            </div>


            {/* Recursos */}
            <div className="header-resources">

                <ResourceBar
                    resources={resources}
                />

            </div>

        </header>
    );
}

export default Header;