/**
 * LIB.JS - Core de la aplicación PEDORROS
 * Contiene toda la lógica de negocio sin dependencias del DOM
 */

// Estados de autenticación (separados del estado del juego)
export const AUTH_STATES = {
    AUTHENTICATING: 'AUTHENTICATING',
    AUTHENTICATED: 'AUTHENTICATED',
    UNAUTHENTICATED: 'UNAUTHENTICATED'
};

// Estado inmutable de la aplicación
export const createGameState = (state = 'START', numRound = 1, gameCode = '', playerNumber = 0, totalPlayers = 0) => ({
    state,
    numRound,
    gameCode,
    playerNumber,
    totalPlayers,
    ranking: {},
    lastResult: null,
    nextSounds: {},
    pedorroSound: null
});

// Función pura para parsear la URL y extraer parámetros del juego
export const parseGameURL = (url) => {
    // Validar que la URL sea válida
    if (!url || typeof url !== 'string') {
        return {
            success: false,
            gameCode: '',
            playerNumber: 0,
            totalPlayers: 0
        };
    }
    
    const regex = /\/g\/([^\/]+)\/p\/(\d+)\/(\d+)/;
    const match = url.match(regex);
    
    if (match) {
        const gameCode = match[1];
        const playerNumber = parseInt(match[2]);
        const totalPlayers = parseInt(match[3]);
        
        return {
            success: true,
            gameCode,
            playerNumber,
            totalPlayers
        };
    } else {
        return {
            success: false,
            gameCode: '',
            playerNumber: 0,
            totalPlayers: 0
        };
    }
};

// Función pura para crear el estado inicial del juego
export const initializeGameState = (url) => {
    const parsedURL = parseGameURL(url);
    
    if (parsedURL.success) {
        return createGameState('START', 1, parsedURL.gameCode, parsedURL.playerNumber, parsedURL.totalPlayers);
    } else {
        alert('wrong url, please check')
    }
};

// Función pura para cambiar el estado del juego
export const changeGameState = (gameState, newState, newNumRound = null) => {
    if (!gameState || typeof gameState !== 'object') {
        return null;
    }
    
    const { state, numRound } = gameState;
    
    return {
        ...gameState,
        state: newState,
        numRound: newNumRound !== null ? newNumRound : numRound
    };
};

// Función pura para actualizar la ronda
export const updateRound = (currentState, newNumRound) => ({
    ...currentState,
    numRound: newNumRound
});

// Función pura para validar si un estado es válido
export const validateGameState = (gameState) => {
    return gameState &&
        typeof gameState.state === 'string' &&
        typeof gameState.numRound === 'number' &&
        typeof gameState.gameCode === 'string' &&
        typeof gameState.playerNumber === 'number' &&
        typeof gameState.totalPlayers === 'number' &&
        gameState.playerNumber > 0 &&
        gameState.totalPlayers > 0 &&
        gameState.playerNumber <= gameState.totalPlayers;
};

// Función pura para obtener información del jugador
export const getPlayerInfo = (gameState) => {
    if (!validateGameState(gameState)) {
        return null;
    }
    
    return {
        playerNumber: gameState.playerNumber,
        totalPlayers: gameState.totalPlayers,
        isPlayerValid: gameState.playerNumber > 0 && gameState.playerNumber <= gameState.totalPlayers
    };
};

// Función pura para obtener información de la ronda
export const getRoundInfo = (gameState) => {
    if (!gameState || typeof gameState.numRound !== 'number') {
        return { currentRound: 1, totalRounds: 5, isLastRound: false };
    }
    
    return {
        currentRound: gameState.numRound,
        totalRounds: 5,
        isLastRound: gameState.numRound >= 5
    };
};

// Función pura para validar si es el jugador 1 (director del juego)
export const isPlayerOne = (gameState) => {
    return !!gameState && 
           typeof gameState === 'object' && 
           typeof gameState.playerNumber === 'number' && 
           gameState.playerNumber === 1;
};

// Función pura para generar el estado de reinicio del juego
export const getResetGameState = () => ({
    ranking: {},
    lastResult: null,
    numRound: 1,
    state: "START",
    nextSounds: {},
    peditos: [],
    pedorro: null
});

// Función pura para mezclar un array (algoritmo Fisher-Yates)
export const shuffleArray = (array) => {
    if (!Array.isArray(array)) {
        return [];
    }
    
    const shuffled = [...array]; // Clonar array para mantener inmutabilidad
    
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
};

// Función pura para calcular la distribución de roles según el número de jugadores
export const calculateGameRoles = (totalPlayers) => {
    // Validar que totalPlayers sea un número
    if (typeof totalPlayers !== 'number' || !Number.isInteger(totalPlayers)) {
        return {
            success: false,
            error: 'Número de jugadores debe ser un número entero',
            peditos: [],
            pedorro: null
        };
    }
    
    // Validar rango de jugadores (4-16 según PRODUCT_BRIEF)
    if (totalPlayers < 4 || totalPlayers > 16) {
        return {
            success: false,
            error: 'Número de jugadores debe estar entre 4 y 16',
            peditos: [],
            pedorro: null
        };
    }
    
    // Tabla de distribución según PRODUCT_BRIEF
    const roleDistribution = {
        4: { peditos: 2, pedorros: 1, neutrales: 1 },
        5: { peditos: 2, pedorros: 1, neutrales: 2 },
        6: { peditos: 3, pedorros: 1, neutrales: 2 },
        7: { peditos: 4, pedorros: 1, neutrales: 2 },
        8: { peditos: 4, pedorros: 1, neutrales: 3 },
        9: { peditos: 5, pedorros: 1, neutrales: 3 },
        10: { peditos: 6, pedorros: 1, neutrales: 3 },
        11: { peditos: 6, pedorros: 1, neutrales: 4 },
        12: { peditos: 7, pedorros: 1, neutrales: 4 },
        13: { peditos: 8, pedorros: 1, neutrales: 4 },
        14: { peditos: 8, pedorros: 1, neutrales: 5 },
        15: { peditos: 9, pedorros: 1, neutrales: 5 },
        16: { peditos: 10, pedorros: 1, neutrales: 5 }
    };
    
    const distribution = roleDistribution[totalPlayers];
    
    // Generar array base [1, 2, 3, ..., totalPlayers]
    const baseArray = Array.from({ length: totalPlayers }, (_, i) => i + 1);
    
    // Mezclar el array
    const shuffledArray = shuffleArray(baseArray);
    
    // Extraer roles
    const peditos = shuffledArray.slice(0, distribution.peditos);
    const pedorro = shuffledArray[distribution.peditos];
    
    return {
        success: true,
        peditos,
        pedorro,
        totalPlayers
    };
};

// Función pura para obtener la distribución de roles para mostrar al usuario
export const getRolesDistribution = (totalPlayers) => {
    // Validar que totalPlayers sea un número
    if (typeof totalPlayers !== 'number' || !Number.isInteger(totalPlayers)) {
        return {
            success: false,
            error: 'Número de jugadores debe ser un número entero'
        };
    }
    
    // Validar rango de jugadores (4-16 según PRODUCT_BRIEF)
    if (totalPlayers < 4 || totalPlayers > 16) {
        return {
            success: false,
            error: 'Número de jugadores debe estar entre 4 y 16'
        };
    }
    
    // Tabla de distribución según PRODUCT_BRIEF
    const roleDistribution = {
        4: { peditos: 2, pedorros: 1, neutrales: 1 },
        5: { peditos: 2, pedorros: 1, neutrales: 2 },
        6: { peditos: 3, pedorros: 1, neutrales: 2 },
        7: { peditos: 4, pedorros: 1, neutrales: 2 },
        8: { peditos: 4, pedorros: 1, neutrales: 3 },
        9: { peditos: 5, pedorros: 1, neutrales: 3 },
        10: { peditos: 6, pedorros: 1, neutrales: 3 },
        11: { peditos: 6, pedorros: 1, neutrales: 4 },
        12: { peditos: 7, pedorros: 1, neutrales: 4 },
        13: { peditos: 8, pedorros: 1, neutrales: 4 },
        14: { peditos: 8, pedorros: 1, neutrales: 5 },
        15: { peditos: 9, pedorros: 1, neutrales: 5 },
        16: { peditos: 10, pedorros: 1, neutrales: 5 }
    };
    
    const distribution = roleDistribution[totalPlayers];
    
    return {
        success: true,
        peditos: distribution.peditos,
        pedorros: distribution.pedorros,
        neutrales: distribution.neutrales
    };
};

// Función pura para generar el diccionario de sonidos para cada jugador
export const generateNextSounds = (roles, totalPlayers) => {
    if (!roles || !roles.success || !roles.peditos || !roles.pedorro) {
        return {};
    }
    
    // Crear diccionario base con null para todos
    const nextSounds = {};
    for (let i = 1; i <= totalPlayers; i++) {
        nextSounds[i] = null;
    }
    
    // Asignar sonido para peditos (mismo número del 1-5)
    const peditoSound = Math.floor(Math.random() * 5) + 1;
    roles.peditos.forEach(playerNum => {
        nextSounds[playerNum] = peditoSound;
    });
    
    // Asignar sonido para pedorro (número del 1-5, puede coincidir)
    const pedorroSound = Math.floor(Math.random() * 5) + 1;
    nextSounds[roles.pedorro] = pedorroSound;
    
    return nextSounds;
};

// Función pura para determinar el rol del jugador actual
export const getPlayerRole = (peditos, pedorro, playerNumber) => {
    if (!Array.isArray(peditos) || typeof pedorro !== 'number' || typeof playerNumber !== 'number') {
        return 'neutral';
    }
    
    if (peditos.includes(playerNumber)) {
        return 'pedito';
    }
    
    if (pedorro === playerNumber) {
        return 'pedorro';
    }
    
    return 'neutral';
};

// Función pura para determinar qué sonido reproducir para un jugador
export const determineSoundForPlayer = (nextSounds, peditos, pedorro, playerNumber) => {
    // Validar parámetros de entrada
    if (!nextSounds || typeof nextSounds !== 'object' || 
        !Array.isArray(peditos) || typeof pedorro !== 'number' || 
        typeof playerNumber !== 'number') {
        return 'neutral.mp3';
    }
    
    // Obtener el valor de nextSounds para este jugador
    const soundValue = nextSounds[playerNumber];
    
    // Si es null, reproducir sonido neutral
    if (soundValue === null) {
        return 'neutral.mp3';
    }
    
    // Si es un número, determinar el tipo de sonido según el rol
    if (typeof soundValue === 'number' && soundValue >= 1 && soundValue <= 5) {
        const playerRole = getPlayerRole(peditos, pedorro, playerNumber);
        
        if (playerRole === 'pedito') {
            return `pedito-${soundValue}.mp3`;
        } else if (playerRole === 'pedorro') {
            return `pedorro-${soundValue}.mp3`;
        }
    }
    
    // Fallback a sonido neutral
    return 'neutral.mp3';
};

// Función pura para manejar el click del botón DISIMULAR (actualizada)
export const handleDisimularClick = (gameState) => {
    const { state, numRound, gameCode, playerNumber, totalPlayers } = gameState;
    
    // Retornar nuevo estado con flag de disimulando
    return {
        ...gameState,
        isDisimulando: true
    };
};

// ===== FUNCIONES PARA SISTEMA DE ACUSACIONES =====

// Función pura para obtener el estado actual de acusación de un jugador
export const getAccusationState = (accusations, playerNumber) => {
    if (!accusations || typeof accusations !== 'object' || typeof playerNumber !== 'number') {
        return 'verde';
    }
    
    return accusations[playerNumber] || 'verde';
};

// Función pura para validar que las cantidades de acusaciones coincidan con la distribución esperada
export const validateAccusations = (accusations, totalPlayers) => {
    // Validar parámetros de entrada
    if (!accusations || typeof accusations !== 'object' || typeof totalPlayers !== 'number') {
        return {
            success: false,
            error: 'Parámetros inválidos para validación de acusaciones'
        };
    }
    
    // Validar rango de jugadores (4-16 según PRODUCT_BRIEF)
    if (totalPlayers < 4 || totalPlayers > 16) {
        return {
            success: false,
            error: 'Número de jugadores debe estar entre 4 y 16'
        };
    }
    
    // Tabla de distribución según PRODUCT_BRIEF
    const roleDistribution = {
        4: { peditos: 2, pedorros: 1, neutrales: 1 },
        5: { peditos: 2, pedorros: 1, neutrales: 2 },
        6: { peditos: 3, pedorros: 1, neutrales: 2 },
        7: { peditos: 4, pedorros: 1, neutrales: 2 },
        8: { peditos: 4, pedorros: 1, neutrales: 3 },
        9: { peditos: 5, pedorros: 1, neutrales: 3 },
        10: { peditos: 6, pedorros: 1, neutrales: 3 },
        11: { peditos: 6, pedorros: 1, neutrales: 4 },
        12: { peditos: 7, pedorros: 1, neutrales: 4 },
        13: { peditos: 8, pedorros: 1, neutrales: 4 },
        14: { peditos: 8, pedorros: 1, neutrales: 5 },
        15: { peditos: 9, pedorros: 1, neutrales: 5 },
        16: { peditos: 10, pedorros: 1, neutrales: 5 }
    };
    
    const distribution = roleDistribution[totalPlayers];
    
    // Contar acusaciones actuales
    let verdes = 0;
    let naranjas = 0;
    let rojos = 0;
    
    for (let i = 1; i <= totalPlayers; i++) {
        const state = getAccusationState(accusations, i);
        switch (state) {
            case 'verde':
                verdes++;
                break;
            case 'naranja':
                naranjas++;
                break;
            case 'rojo':
                rojos++;
                break;
            default:
                // Estado inválido, contar como verde
                verdes++;
        }
    }
    
    // Validar que las cantidades coincidan exactamente
    const isValid = verdes === distribution.neutrales && 
                   naranjas === distribution.peditos && 
                   rojos === distribution.pedorros;
    
    return {
        success: isValid,
        error: isValid ? null : `Cantidades incorrectas: ${verdes} verdes, ${naranjas} naranjas, ${rojos} rojos. Esperado: ${distribution.neutrales} verdes, ${distribution.peditos} naranjas, ${distribution.pedorros} rojos`,
        counts: { verdes, naranjas, rojos },
        expected: distribution
    };
};

// ===== NUEVAS FUNCIONES PARA FUNCIONALIDAD ACUSAR =====

/**
 * Convierte el estado de acusaciones de colores a roles
 * @param {Object} accusationsState - Estado de acusaciones con colores (verde/naranja/rojo)
 * @returns {Object} Objeto con éxito/error y acusaciones convertidas
 */
export const convertAccusationColorsToRoles = (accusationsState) => {
    if (!accusationsState || typeof accusationsState !== 'object') {
        return {
            success: false,
            error: 'Estado de acusaciones inválido'
        };
    }

    const convertedAccusations = {};
    const colorToRoleMap = {
        'verde': 'neutral',
        'naranja': 'pedito',
        'rojo': 'pedorro'
    };

    // Convertir cada acusación de color a rol
    for (const [playerNumber, color] of Object.entries(accusationsState)) {
        if (!colorToRoleMap.hasOwnProperty(color)) {
            return {
                success: false,
                error: `Color inválido '${color}' para jugador ${playerNumber}. Solo se permiten: verde, naranja, rojo`
            };
        }
        convertedAccusations[playerNumber] = colorToRoleMap[color];
    }

    return {
        success: true,
        accusations: convertedAccusations
    };
};

/**
 * Valida el formato de las acusaciones convertidas
 * @param {Object} accusations - Acusaciones en formato de roles (neutral/pedito/pedorro)
 * @param {number} totalPlayers - Número total de jugadores
 * @returns {Object} Objeto con éxito/error y mensaje descriptivo
 */
export const validateAccusationFormat = (accusations, totalPlayers) => {
    // Validar parámetros de entrada
    if (!accusations || typeof accusations !== 'object' || typeof totalPlayers !== 'number') {
        return {
            success: false,
            error: 'Parámetros inválidos para validación de formato'
        };
    }

    // Validar rango de jugadores (4-16 según PRODUCT_BRIEF)
    if (totalPlayers < 4 || totalPlayers > 16) {
        return {
            success: false,
            error: 'Número de jugadores debe estar entre 4 y 16'
        };
    }

    // Validar que el número de acusaciones coincida con totalPlayers
    const accusationCount = Object.keys(accusations).length;
    if (accusationCount !== totalPlayers) {
        return {
            success: false,
            error: `Número de acusaciones (${accusationCount}) no coincide con total de jugadores (${totalPlayers})`
        };
    }

    // Validar que todas las acusaciones contengan solo valores válidos
    const validRoles = ['neutral', 'pedito', 'pedorro'];
    for (const [playerNumber, role] of Object.entries(accusations)) {
        if (!validRoles.includes(role)) {
            return {
                success: false,
                error: `Rol inválido '${role}' para jugador ${playerNumber}. Solo se permiten: neutral, pedito, pedorro`
            };
        }
    }

    // Validar que los números de jugador sean consecutivos del 1 al totalPlayers
    for (let i = 1; i <= totalPlayers; i++) {
        if (!accusations.hasOwnProperty(i.toString())) {
            return {
                success: false,
                error: `Falta acusación para el jugador ${i}`
            };
        }
    }

    return {
        success: true,
        message: 'Formato de acusaciones válido'
    };
};

/**
 * Obtiene el progreso de acusaciones enviadas por todos los jugadores
 * @param {Object} accusationsData - Datos de acusaciones desde Firebase
 * @param {number} totalPlayers - Número total de jugadores en el juego
 * @returns {Object} Objeto con éxito/error y progreso de acusaciones
 */
export const getAccusationsProgress = (accusationsData, totalPlayers) => {
    // Validar parámetros de entrada
    if (!accusationsData || typeof accusationsData !== 'object' || typeof totalPlayers !== 'number') {
        return {
            success: false,
            error: 'Parámetros inválidos para obtener progreso de acusaciones'
        };
    }

    // Validar rango de jugadores (4-16 según PRODUCT_BRIEF)
    if (totalPlayers < 4 || totalPlayers > 16) {
        return {
            success: false,
            error: 'Número de jugadores debe estar entre 4 y 16'
        };
    }

    try {
        const playersWithAccusations = [];
        
        // Buscar jugadores que han enviado acusaciones completas
        for (let playerNumber = 1; playerNumber <= totalPlayers; playerNumber++) {
            const accusationKey = `acusation${playerNumber}`;
            
            if (accusationsData[accusationKey]) {
                const accusation = accusationsData[accusationKey];
                
                // Verificar que la acusación esté completa (tenga acusaciones para todos los jugadores)
                if (accusation && typeof accusation === 'object') {
                    const accusationCount = Object.keys(accusation).length;
                    
                    // Verificar que tenga exactamente el número correcto de acusaciones
                    if (accusationCount === totalPlayers) {
                        // Verificar que todos los valores sean válidos
                        const validRoles = ['neutral', 'pedito', 'pedorro'];
                        const hasValidValues = Object.values(accusation).every(role => 
                            validRoles.includes(role)
                        );
                        
                        if (hasValidValues) {
                            playersWithAccusations.push(playerNumber);
                        }
                    }
                }
            }
        }
        
        // Ordenar jugadores numéricamente
        playersWithAccusations.sort((a, b) => a - b);
        
        return {
            success: true,
            playersWithAccusations,
            totalSent: playersWithAccusations.length,
            totalExpected: totalPlayers,
            progress: `${playersWithAccusations.length}/${totalPlayers}`,
            message: playersWithAccusations.length > 0 
                ? `Acusaciones enviadas: ${playersWithAccusations.join(', ')}`
                : 'Ninguna acusación enviada aún'
        };
        
    } catch (error) {
        return {
            success: false,
            error: `Error al procesar progreso de acusaciones: ${error.message}`
        };
    }
};

/**
 * Valida las entradas para el cálculo de puntuación
 * @param {Object} acusations - Objeto con acusaciones de todos los jugadores
 * @param {Array<number>} peditos - Array de números de jugadores que son peditos
 * @param {number} pedorro - Número del jugador que es el pedorro
 * @returns {Object} Objeto con validación y posibles errores
 */
export const validateScoreInputs = (acusations, peditos, pedorro) => {
    const errors = [];
    
    // Validar acusations
    if (!acusations || typeof acusations !== 'object') {
        errors.push('acusations debe ser un objeto válido');
    }
    
    // Validar peditos
    if (!Array.isArray(peditos)) {
        errors.push('peditos debe ser un array');
    } else if (peditos.length === 0) {
        errors.push('peditos no puede estar vacío');
    } else if (!peditos.every(p => typeof p === 'number' && p > 0)) {
        errors.push('peditos debe contener solo números positivos');
    }
    
    // Validar pedorro
    if (typeof pedorro !== 'number' || pedorro <= 0) {
        errors.push('pedorro debe ser un número positivo');
    }
    
    // Validar que no haya conflictos entre peditos y pedorro
    if (peditos.includes(pedorro)) {
        errors.push('pedorro no puede ser también un pedito');
    }
    
    // Validar que las acusaciones tengan el formato correcto
    if (acusations && typeof acusations === 'object') {
        for (const [key, accusation] of Object.entries(acusations)) {
            if (!key.startsWith('acusation')) {
                errors.push(`Clave inválida en acusations: ${key}`);
                continue;
            }
            
            if (!accusation || typeof accusation !== 'object') {
                errors.push(`Acusación inválida para ${key}`);
                continue;
            }
            
            // Verificar que los valores sean válidos
            const validRoles = ['neutral', 'pedito', 'pedorro'];
            for (const [playerNum, role] of Object.entries(accusation)) {
                if (!validRoles.includes(role)) {
                    errors.push(`Rol inválido '${role}' en ${key} para jugador ${playerNum}`);
                }
            }
        }
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
};

/**
 * Cuenta cuántos peditos acertó un jugador
 * @param {Object} playerAccusations - Acusaciones del jugador específico
 * @param {Array<number>} peditos - Array de números de jugadores que son peditos
 * @returns {number} Número de peditos acertados
 */
export const countPeditoHits = (playerAccusations, peditos) => {
    if (!playerAccusations || !Array.isArray(peditos)) {
        return 0;
    }
    
    let hits = 0;
    
    // Para cada jugador que es realmente un pedito, verificar si el jugador lo acusó correctamente
    for (const peditoNumber of peditos) {
        if (playerAccusations[peditoNumber] === 'pedito') {
            hits++;
        }
    }
    
    return hits;
};

/**
 * Cuenta cuántos jugadores acertaron al pedorro
 * @param {Object} allAccusations - Todas las acusaciones de todos los jugadores
 * @param {number} pedorro - Número del jugador que es el pedorro
 * @returns {number} Número de aciertos al pedorro
 */
export const countPedorroHits = (allAccusations, pedorro) => {
    if (!allAccusations || typeof pedorro !== 'number') {
        return 0;
    }
    
    let hits = 0;
    
    for (const [key, accusation] of Object.entries(allAccusations)) {
        if (!key.startsWith('acusation')) continue;
        
        if (accusation && accusation[pedorro] === 'pedorro') {
            hits++;
        }
    }
    
    return hits;
};

/**
 * Cuenta cuántos jugadores QUE NO SON EL PEDORRO acertaron al pedorro
 * @param {Object} allAccusations - Todas las acusaciones de todos los jugadores
 * @param {number} pedorro - Número del jugador que es el pedorro
 * @returns {number} Número de aciertos al pedorro por jugadores no-pedorro
 */
export const countPedorroHitsByOthers = (allAccusations, pedorro) => {
    if (!allAccusations || typeof pedorro !== 'number') {
        return 0;
    }
    
    let hits = 0;
    
    for (const [key, accusation] of Object.entries(allAccusations)) {
        if (!key.startsWith('acusation')) continue;
        
        const playerNumber = parseInt(key.replace('acusation', ''));
        if (isNaN(playerNumber)) continue;
        
        // Solo contar aciertos de jugadores que NO son el pedorro
        if (playerNumber !== pedorro && accusation && accusation[pedorro] === 'pedorro') {
            hits++;
        }
    }
    
    return hits;
};

/**
 * Calcula la puntuación individual de un jugador
 * @param {number} playerNumber - Número del jugador
 * @param {Object} playerAccusations - Acusaciones del jugador específico
 * @param {Array<number>} peditos - Array de números de jugadores que son peditos
 * @param {number} pedorro - Número del jugador que es el pedorro
 * @param {Object} allAccusations - Todas las acusaciones de todos los jugadores
 * @returns {number} Puntuación total del jugador
 */
export const calculatePlayerScore = (playerNumber, playerAccusations, peditos, pedorro, allAccusations) => {
    if (!playerAccusations || !Array.isArray(peditos) || typeof pedorro !== 'number') {
        return 0;
    }
    
    let score = 0;
    
    // Puntos por peditos acertados (1 punto por cada acierto)
    const peditoHits = countPeditoHits(playerAccusations, peditos);
    score += peditoHits;
    
    // Puntos por pedorro
    if (playerNumber === pedorro) {
        // Si el jugador ES el pedorro: 10 puntos si nadie QUE NO SEA ÉL lo acusó
        const pedorroHitsByOthers = countPedorroHitsByOthers(allAccusations, pedorro);
        if (pedorroHitsByOthers === 0) {
            score += 10;
        }
        // NOTA: El pedorro SÍ puede obtener puntos por acertar peditos
    } else {
        // Si el jugador NO es el pedorro: 5 puntos si acertó al pedorro Y otra persona QUE NO ES EL PEDORRO también acertó
        if (playerAccusations[pedorro] === 'pedorro') {
            const totalPedorroHitsByOthers = countPedorroHitsByOthers(allAccusations, pedorro);
            if (totalPedorroHitsByOthers >= 2) { // Al menos 2 aciertos de jugadores no-pedorro (incluyendo este jugador)
                score += 5;
            }
        }
    }
    
    return score;
};

/**
 * Calcula la puntuación de la ronda para todos los jugadores
 * @param {Object} acusations - Objeto con acusaciones de todos los jugadores
 * @param {Array<number>} peditos - Array de números de jugadores que son peditos
 * @param {number} pedorro - Número del jugador que es el pedorro
 * @returns {Object} Objeto con puntuación de cada jugador { 1: 12, 2: 8, ... }
 */
export const calculateRoundScore = (acusations, peditos, pedorro) => {
    // Validar entradas
    const validation = validateScoreInputs(acusations, peditos, pedorro);
    if (!validation.valid) {
        throw new Error(`Entradas inválidas para cálculo de puntuación: ${validation.errors.join(', ')}`);
    }
    
    const scores = {};
    
    // Calcular puntuación para cada jugador
    for (const [key, accusation] of Object.entries(acusations)) {
        if (!key.startsWith('acusation')) continue;
        
        const playerNumber = parseInt(key.replace('acusation', ''));
        if (isNaN(playerNumber)) continue;
        
        const playerScore = calculatePlayerScore(playerNumber, accusation, peditos, pedorro, acusations);
        scores[playerNumber] = playerScore;
    }
    
    return scores;
};
