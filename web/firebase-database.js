/**
 * FIREBASE-DATABASE.JS - Operaciones de base de datos para PEDORROS
 * Maneja la interacción con Firebase Realtime Database
 */

import { database } from './firebase-config.js';
import { ref, set, onValue, update, off, get, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

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
    peditos: [],
    pedorro: null
});

/**
 * Reinicia el estado del juego en Firebase Database
 * @param {string} gameCode - Código del juego (ej: "galerna")
 * @returns {Promise<Object>} Resultado de la operación
 */
export const resetGameState = async (gameCode) => {
    try {
        const gameRef = ref(database, `pedorros-game/${gameCode}`);
        
        const resetData = {
            state: 'START',
            numRound: 1,
            gameCode: gameCode,
            playerNumber: 0,
            totalPlayers: 0,
            ranking: {},
            lastResult: null,
            nextSounds: {},
            pedorroSound: null,
            resetTimestamp: serverTimestamp()
        };
        
        await set(gameRef, resetData);
        
        return { success: true, gameState: resetData };
    } catch (error) {
        console.error('Error al reiniciar el juego:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Configura un listener para cambios en el estado del juego
 * @param {string} gameCode - Código del juego (ej: "galerna")
 * @param {Function} callback - Función a ejecutar cuando cambie el estado
 * @returns {Function} Función de cleanup para desconectar el listener
 */
export const setupGameStateListener = (gameCode, callback) => {
    try {
        if (!gameCode || typeof gameCode !== 'string') {
            throw new Error('Código de juego inválido');
        }

        const gameRef = ref(database, `pedorros-game/${gameCode}`);
        
        // Configurar listener
        onValue(gameRef, (snapshot) => {
            const gameData = snapshot.val();
            if (gameData && callback) {
                callback(gameData);
            }
        });
        
        // Retornar función de cleanup
        return () => {
            off(gameRef);
        };
    } catch (error) {
        console.error('Error al configurar listener del juego:', error);
        return () => {}; // Función de cleanup vacía en caso de error
    }
};

/**
 * Actualiza los roles y sonidos del juego en Firebase Database
 * @param {string} gameCode - Código del juego
 * @param {Object} roles - Objeto con peditos y pedorro
 * @param {Object} nextSounds - Diccionario de sonidos por jugador
 * @returns {Promise<Object>} Resultado de la operación
 */
export const updateGameRoles = async (gameCode, roles, nextSounds) => {
    try {
        if (!gameCode || typeof gameCode !== 'string') {
            throw new Error('Código de juego inválido');
        }

        if (!roles || !roles.success || !roles.peditos || !roles.pedorro) {
            throw new Error('Estructura de roles inválida');
        }

        if (!nextSounds || typeof nextSounds !== 'object') {
            throw new Error('Estructura de sonidos inválida');
        }

        const gameRef = ref(database, `pedorros-game/${gameCode}`);
        
        // Actualizar solo los campos específicos
        await update(gameRef, {
            peditos: roles.peditos,
            pedorro: roles.pedorro,
            nextSounds: nextSounds
        });
        
        return {
            success: true,
            message: 'Roles y sonidos actualizados exitosamente',
            gameCode,
            roles,
            nextSounds
        };
    } catch (error) {
        console.error('Error al actualizar roles del juego:', error);
        return {
            success: false,
            error: error.message,
            gameCode
        };
    }
};

/**
 * Obtiene el diccionario de sonidos para el juego actual
 * @param {string} gameCode - Código del juego
 * @returns {Promise<Object>} Diccionario de sonidos por jugador
 */
export const getNextSounds = async (gameCode) => {
    try {
        if (!gameCode || typeof gameCode !== 'string') {
            throw new Error('Código de juego inválido');
        }

        const gameRef = ref(database, `pedorros-game/${gameCode}/nextSounds`);
        const snapshot = await get(gameRef);
        
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            return {};
        }
    } catch (error) {
        console.error('Error al obtener nextSounds:', error);
        return {};
    }
};

/**
 * Obtiene los roles actuales del juego (peditos y pedorro)
 * @param {string} gameCode - Código del juego
 * @returns {Promise<Object>} Objeto con peditos y pedorro
 */
export const getGameRoles = async (gameCode) => {
    try {
        if (!gameCode || typeof gameCode !== 'string') {
            throw new Error('Código de juego inválido');
        }

        const gameRef = ref(database, `pedorros-game/${gameCode}`);
        const snapshot = await get(gameRef);
        
        if (snapshot.exists()) {
            const gameData = snapshot.val();
            return {
                peditos: gameData.peditos || [],
                pedorro: gameData.pedorro || null
            };
        } else {
            return {
                peditos: [],
                pedorro: null
            };
        }
    } catch (error) {
        console.error('Error al obtener roles del juego:', error);
        return {
            peditos: [],
            pedorro: null
        };
    }
};

/**
 * Obtiene el estado completo del juego desde Firebase Database
 * @param {string} gameCode - Código del juego (ej: "galerna")
 * @returns {Promise<Object>} Estado completo del juego o null si no existe
 */
export const getGameState = async (gameCode) => {
    try {
        if (!gameCode || typeof gameCode !== 'string') {
            throw new Error('Código de juego inválido');
        }

        const gameRef = ref(database, `pedorros-game/${gameCode}`);
        const snapshot = await get(gameRef);
        
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error al obtener estado del juego:', error);
        return null;
    }
};

/**
 * Actualiza el estado del juego en Firebase Database
 * @param {string} gameCode - Código del juego (ej: "galerna")
 * @param {string} newState - Nuevo estado del juego (ej: "ACUSE")
 * @returns {Promise<Object>} Resultado de la operación
 */
export const updateGameState = async (gameCode, newState) => {
    try {
        if (!gameCode || typeof gameCode !== 'string') {
            throw new Error('Código de juego inválido');
        }

        if (!newState || typeof newState !== 'string') {
            throw new Error('Nuevo estado inválido');
        }

        const gameRef = ref(database, `pedorros-game/${gameCode}`);
        
        // Actualizar solo el campo state
        await update(gameRef, {
            state: newState
        });
        
        return {
            success: true,
            message: 'Estado del juego actualizado exitosamente',
            gameCode,
            newState
        };
    } catch (error) {
        console.error('Error al actualizar estado del juego:', error);
        return {
            success: false,
            error: error.message,
            gameCode,
            newState
        };
    }
};

/**
 * Guarda las acusaciones de un jugador específico en Firebase Database
 * @param {string} gameCode - Código del juego (ej: "galerna")
 * @param {number} playerNumber - Número del jugador que hace la acusación
 * @param {Object} accusations - Acusaciones en formato de roles (neutral/pedito/pedorro)
 * @returns {Promise<Object>} Resultado de la operación
 */
export const savePlayerAccusations = async (gameCode, playerNumber, accusations) => {
    try {
        if (!gameCode || typeof gameCode !== 'string') {
            throw new Error('Código de juego inválido');
        }

        if (!playerNumber || typeof playerNumber !== 'number' || playerNumber < 1) {
            throw new Error('Número de jugador inválido');
        }

        if (!accusations || typeof accusations !== 'object') {
            throw new Error('Acusaciones inválidas');
        }

        // Crear la estructura de datos para las acusaciones
        const accusationData = {
            [`acusations/acusation${playerNumber}`]: accusations,
            lastUpdated: serverTimestamp()
        };

        // Usar update() para modificar solo el campo específico sin sobrescribir el documento completo
        const gameRef = ref(database, `pedorros-game/${gameCode}`);
        await update(gameRef, accusationData);
        
        return {
            success: true,
            message: `Acusaciones del jugador ${playerNumber} guardadas exitosamente`,
            gameCode,
            playerNumber,
            accusations,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error al guardar acusaciones del jugador:', error);
        return {
            success: false,
            error: error.message,
            gameCode,
            playerNumber
        };
    }
};

/**
 * Configura un listener para cambios en las acusaciones del juego
 * @param {string} gameCode - Código del juego (ej: "galerna")
 * @param {Function} callback - Función a ejecutar cuando cambien las acusaciones
 * @returns {Function} Función de cleanup para desconectar el listener
 */
export const setupAccusationsListener = (gameCode, callback) => {
    try {
        if (!gameCode || typeof gameCode !== 'string') {
            throw new Error('Código de juego inválido');
        }

        if (typeof callback !== 'function') {
            throw new Error('Callback debe ser una función');
        }

        const accusationsRef = ref(database, `pedorros-game/${gameCode}/acusations`);
        
        // Configurar listener
        onValue(accusationsRef, (snapshot) => {
            const accusationsData = snapshot.val();
            if (callback) {
                callback(accusationsData || {});
            }
        });
        
        // Retornar función de cleanup
        return () => {
            off(accusationsRef);
        };
    } catch (error) {
        console.error('Error al configurar listener de acusaciones:', error);
        return () => {}; // Función de cleanup vacía en caso de error
    }
};

/**
 * Actualiza el ranking del juego y la puntuación de la última ronda en Firebase Database
 * @param {string} gameCode - Código del juego (ej: "galerna")
 * @param {Object} ranking - Objeto con puntuaciones totales de todos los jugadores
 * @param {Object} lastRoundScore - Objeto con puntuaciones de la ronda actual
 * @returns {Promise<Object>} Resultado de la operación
 */
export const updateGameRanking = async (gameCode, ranking, lastRoundScore) => {
    try {
        if (!gameCode || typeof gameCode !== 'string') {
            throw new Error('Código de juego inválido');
        }

        if (!ranking || typeof ranking !== 'object') {
            throw new Error('Ranking inválido');
        }

        if (!lastRoundScore || typeof lastRoundScore !== 'object') {
            throw new Error('Puntuación de ronda inválida');
        }

        // Crear la estructura de datos para el ranking
        const rankingData = {
            ranking,
            lastRoundScore,
            lastUpdated: serverTimestamp()
        };

        // Usar update() para modificar solo los campos de ranking sin sobrescribir el documento completo
        const gameRef = ref(database, `pedorros-game/${gameCode}`);
        await update(gameRef, rankingData);
        
        return {
            success: true,
            message: `Ranking del juego actualizado exitosamente`,
            gameCode,
            ranking,
            lastRoundScore,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error al actualizar ranking del juego:', error);
        return {
            success: false,
            error: error.message,
            gameCode
        };
    }
};

/**
 * Reinicia el juego para la siguiente ronda, limpiando campos específicos y actualizando el estado
 * @param {string} gameCode - Código del juego (ej: "galerna")
 * @param {number} newNumRound - Nuevo número de ronda
 * @returns {Promise<Object>} Resultado de la operación
 */
export const resetGameForNextRound = async (gameCode, newNumRound) => {
    try {
        if (!gameCode || typeof gameCode !== 'string') {
            throw new Error('Código de juego inválido');
        }

        if (typeof newNumRound !== 'number' || newNumRound < 1) {
            throw new Error('Número de ronda inválido');
        }

        // Crear la estructura de datos para el reinicio
        const resetData = {
            state: 'START',
            numRound: newNumRound,
            acusations: null,
            lastRoundScore: null,
            nextSounds: null,
            peditos: null,
            pedorro: null,
            lastUpdated: serverTimestamp()
        };

        // Usar update() para modificar solo los campos específicos sin sobrescribir el documento completo
        const gameRef = ref(database, `pedorros-game/${gameCode}`);
        await update(gameRef, resetData);
        
        return {
            success: true,
            message: `Juego reiniciado para la ronda ${newNumRound}`,
            gameCode,
            newNumRound,
            resetData,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error al reiniciar juego para siguiente ronda:', error);
        return {
            success: false,
            error: error.message,
            gameCode
        };
    }
};
