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
