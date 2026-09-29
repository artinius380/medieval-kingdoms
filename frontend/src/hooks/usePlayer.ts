import { useEffect, useState } from 'react';

import { getPlayer } from '../services/api';

import type { Player } from '../types/game';

export function usePlayer(playerId: number) {

    const [player, setPlayer] =
        useState<Player | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);


    useEffect(() => {

        async function loadPlayer() {

            try {

                setLoading(true);
                setError(null);

                const playerData =
                    await getPlayer(playerId);

                setPlayer(playerData);

            } catch (error) {

                setError(
                    error instanceof Error
                        ? error.message
                        : 'Error al cargar el jugador'
                );

            } finally {

                setLoading(false);

            }
        }

        loadPlayer();

    }, [playerId]);


    return {
        player,
        loading,
        error
    };
}