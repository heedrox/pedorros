/**
 * FIREBASE-DATABASE.JS - Operaciones de base de datos para PEDORROS
 * Maneja la interacción con Firebase Realtime Database
 */

import { database } from './firebase-config.js';
import { ref, set } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

/**
 * Obtiene la referencia a la base de datos
 * @returns {Object} Referencia a Firebase Database
 */
export const getDatabaseRef = () => {
    return database;
};

/**
 * Genera el estado de reinicio del juego según la especificación
 * @returns {Object} Estado de reinicio con estructura predefinida
 */
export const getResetGameState = () => ({
    ranking: {},
    lastResult: null,
    numRound: 1,
    state: "START",
    nextSounds: {},
    pedorroSound: null
});

/**
 * Reinicia el estado del juego en Firebase Database
 * @param {string} gameCode - Código del juego (ej: "galerna")
 * @returns {Promise<Object>} Resultado de la operación
 */
export const resetGameState = async (gameCode) => {
    try {
        if (!gameCode || typeof gameCode !== 'string') {
            throw new Error('Código de juego inválido');
        }

        const resetState = getResetGameState();
        const gameRef = ref(database, `pedorros-game/${gameCode}`);
        
        await set(gameRef, resetState);
        
        return {
            success: true,
            message: 'Juego reiniciado exitosamente',
            gameCode,
            resetState
        };
    } catch (error) {
        console.error('Error al reiniciar el juego:', error);
        return {
            success: false,
            error: error.message,
            gameCode
        };
    }
};
