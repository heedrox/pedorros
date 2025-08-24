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
