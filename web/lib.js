/**
 * LIB.JS - Core de la aplicación PEDORROS
 * Contiene toda la lógica de negocio sin dependencias del DOM
 */

// Estado inmutable de la aplicación
export const createGameState = (state = 'START', round = 1, gameCode = '', playerNumber = 0, totalPlayers = 0) => ({
    state,
    round,
    gameCode,
    playerNumber,
    totalPlayers
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
        return createGameState('START', 1, 'dev', 1, 4);
    }
};

// Función pura para cambiar el estado del juego
export const changeGameState = (currentState, newState) => ({
    ...currentState,
    state: newState
});

// Función pura para actualizar la ronda
export const updateRound = (currentState, newRound) => ({
    ...currentState,
    round: newRound
});

// Función pura para manejar el click del botón DISIMULAR
export const handleDisimularClick = (gameState) => {
    const { state, round, gameCode, playerNumber, totalPlayers } = gameState;
    
    // TODO: En futuras implementaciones, aquí irá la lógica del juego
    // Por ahora solo retorna el mismo estado (inmutable)
    return gameState;
};

// Función pura para validar si un estado es válido
export const isValidGameState = (gameState) => {
    return gameState && 
           typeof gameState === 'object' &&
           typeof gameState.state === 'string' &&
           typeof gameState.round === 'number' &&
           typeof gameState.gameCode === 'string' &&
           typeof gameState.playerNumber === 'number' &&
           typeof gameState.totalPlayers === 'number';
};

// Función pura para obtener información del jugador
export const getPlayerInfo = (gameState) => {
    if (!isValidGameState(gameState)) {
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
    if (!isValidGameState(gameState)) {
        return null;
    }
    
    return {
        currentRound: gameState.round,
        maxRounds: 5,
        isLastRound: gameState.round >= 5
    };
};
