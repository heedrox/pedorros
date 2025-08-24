/**
 * SCRIPT.JS - Lógica de DOM y conexión con el core
 * Importa todas las funciones del core desde lib.js
 */

import { 
    createGameState, 
    parseGameURL, 
    initializeGameState, 
    changeGameState, 
    updateRound, 
    handleDisimularClick,
    getPlayerInfo,
    getRoundInfo,
    AUTH_STATES
} from './lib.js';

import {
    signInAnonymouslyUser,
    getCurrentUser,
    onAuthStateChangedListener
} from './firebase-config.js';

// Estado de autenticación (separado del estado del juego)
let authState = AUTH_STATES.UNAUTHENTICATED;

// Función pura para renderizar la pantalla según el estado de autenticación
const renderAuthScreen = (authState) => {
    const loginScreen = document.getElementById('login-screen');
    const gameScreen = document.getElementById('game-screen');
    const startScreen = document.getElementById('start-screen');
    
    switch (authState) {
        case AUTH_STATES.UNAUTHENTICATED:
            if (loginScreen) {
                loginScreen.classList.add('active');
                loginScreen.classList.remove('inactive');
            }
            if (gameScreen) {
                gameScreen.classList.remove('active');
                gameScreen.classList.add('inactive');
            }
            if (startScreen) {
                startScreen.classList.remove('active');
                startScreen.classList.add('inactive');
            }
            break;
        case AUTH_STATES.AUTHENTICATED:
            if (loginScreen) {
                loginScreen.classList.remove('active');
                loginScreen.classList.add('inactive');
            }
            if (gameScreen) {
                gameScreen.classList.add('active');
                gameScreen.classList.remove('inactive');
            }
            // start-screen se activará después cuando se llame a renderStartScreen
            if (startScreen) {
                startScreen.classList.remove('active');
                startScreen.classList.add('inactive');
            }
            break;
        case AUTH_STATES.AUTHENTICATING:
            // Mantener pantalla de login durante autenticación
            if (loginScreen) {
                loginScreen.classList.add('active');
                loginScreen.classList.remove('inactive');
            }
            if (gameScreen) {
                gameScreen.classList.remove('active');
                gameScreen.classList.add('inactive');
            }
            if (startScreen) {
                startScreen.classList.remove('active');
                startScreen.classList.add('inactive');
            }
            break;
        default:
            console.log('Estado de autenticación no implementado:', authState);
    }
};

// Función pura para renderizar la pantalla según el estado
const renderScreen = (gameState) => {
    const { state, round, playerNumber, totalPlayers } = gameState;
    
    switch (state) {
        case 'START':
            renderStartScreen(round, playerNumber, totalPlayers);
            break;
        default:
            console.log('Estado no implementado:', state);
    }
};

// Función pura para renderizar la pantalla START
const renderStartScreen = (round, playerNumber, totalPlayers) => {
    const startScreen = document.getElementById('start-screen');
    const currentRoundElement = document.getElementById('current-round');
    const playerInfoElement = document.getElementById('player-info');
    
    // Solo activar start-screen si estamos completamente en la pantalla del juego
    // y la pantalla de login está oculta
    const gameScreen = document.getElementById('game-screen');
    const loginScreen = document.getElementById('login-screen');
    
    if (startScreen && gameScreen && loginScreen) {
        const isGameActive = gameScreen.classList.contains('active');
        const isLoginActive = loginScreen.classList.contains('active');
        
        // Solo activar start-screen si el juego está activo Y el login está inactivo
        if (isGameActive && !isLoginActive) {
            startScreen.classList.add('active');
            startScreen.classList.remove('inactive');
        } else {
            startScreen.classList.remove('active');
            startScreen.classList.add('inactive');
        }
    }
    
    if (currentRoundElement) currentRoundElement.textContent = round;
    if (playerInfoElement && playerNumber > 0 && totalPlayers > 0) {
        playerInfoElement.textContent = `Jugador: ${playerNumber} / ${totalPlayers}`;
        playerInfoElement.style.display = 'block';
    }
};

// Función para manejar el login anónimo
const handleLogin = async () => {
    console.log('Iniciando login anónimo...');
    
    // Cambiar estado a autenticando
    authState = AUTH_STATES.AUTHENTICATING;
    renderAuthScreen(authState);
    
    try {
        const result = await signInAnonymouslyUser();
        
        if (result.success) {
            console.log('Login exitoso:', result.user.uid);
            authState = AUTH_STATES.AUTHENTICATED;
            renderAuthScreen(authState);
            
            // Inicializar el juego después del login exitoso
            initializeGame();
        } else {
            console.error('Error en login:', result.error);
            authState = AUTH_STATES.UNAUTHENTICATED;
            renderAuthScreen(authState);
            alert('Error al acceder. Inténtalo de nuevo.');
        }
    } catch (error) {
        console.error('Error inesperado en login:', error);
        authState = AUTH_STATES.UNAUTHENTICATED;
        renderAuthScreen(authState);
        alert('Error inesperado. Inténtalo de nuevo.');
    }
};

// Función para inicializar el juego (solo se ejecuta después de autenticación)
const initializeGame = () => {
    console.log('PEDORROS - Juego iniciado');
    
    // Crear estado inicial inmutable
    let gameState = initializeGameState(window.location.href);
    
    // Log del estado inicial
    const playerInfo = getPlayerInfo(gameState);
    const roundInfo = getRoundInfo(gameState);
    
    if (playerInfo) {
        console.log('Jugador:', playerInfo.playerNumber, 'de', playerInfo.totalPlayers);
        console.log('Jugador válido:', playerInfo.isPlayerValid);
    }
    
    if (roundInfo) {
        console.log('Ronda actual:', roundInfo.currentRound, 'de', roundInfo.maxRounds);
        console.log('¿Última ronda?', roundInfo.isLastRound);
    }
    
    console.log('Código de juego:', gameState.gameCode);
    
    // Esperar un momento para que el estado de autenticación esté completamente establecido
    setTimeout(() => {
        // Renderizar pantalla inicial
        renderScreen(gameState);
    }, 100);
    
    // Event listener para el botón DISIMULAR
    const disimularButton = document.getElementById('disimular-btn');
    if (disimularButton) {
        disimularButton.addEventListener('click', () => {
            console.log('Botón DISIMULAR clickeado');
            console.log('Estado actual:', gameState.state);
            console.log('Ronda actual:', gameState.round);
            console.log('Código de juego:', gameState.gameCode);
            console.log('Jugador:', gameState.playerNumber, 'de', gameState.totalPlayers);
            
            // TODO: En futuras implementaciones, aquí irá la lógica del juego
            // Por ahora solo mostramos que funciona
            alert('¡Botón DISIMULAR funcionando! (Funcionalidad pendiente de implementar)');
            
            // Actualizar estado (inmutable)
            gameState = handleDisimularClick(gameState);
        });
    }
    
    // Exportar funciones para uso futuro (cuando se implemente el sistema de módulos)
    window.PEDORROS = {
        getGameState: () => gameState,
        changeGameState: (newState) => {
            gameState = changeGameState(gameState, newState);
            renderScreen(gameState);
        },
        updateRound: (newRound) => {
            gameState = updateRound(gameState, newRound);
            renderScreen(gameState);
        },
        parseGameURL,
        getPlayerInfo: () => getPlayerInfo(gameState),
        getRoundInfo: () => getRoundInfo(gameState)
    };
};

// Función principal de inicialización de la aplicación
const initializeApp = () => {
    console.log('PEDORROS - Aplicación iniciada');
    
    // Configurar listener de cambios de autenticación
    onAuthStateChangedListener((user) => {
        if (user) {
            console.log('Usuario autenticado detectado:', user.uid);
            authState = AUTH_STATES.AUTHENTICATED;
            renderAuthScreen(authState);
            
            // Solo inicializar el juego si no se ha hecho ya
            if (!window.PEDORROS) {
                initializeGame();
            }
        } else {
            console.log('Usuario no autenticado');
            authState = AUTH_STATES.UNAUTHENTICATED;
            renderAuthScreen(authState);
        }
    });
    
    // Event listener para el botón ACCEDER
    const accederButton = document.getElementById('acceder-btn');
    if (accederButton) {
        accederButton.addEventListener('click', handleLogin);
    }
    
    // Renderizar pantalla inicial según estado de autenticación
    renderAuthScreen(authState);
};

// Event listener para cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeApp);
