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
    isPlayerOne,
    getResetGameState,
    calculateGameRoles,
    generateNextSounds,
    determineSoundForPlayer,
    getPlayerRole,
    getAccusationState,
    validateAccusations,
    convertAccusationColorsToRoles,
    validateAccusationFormat,
    getAccusationsProgress,
    AUTH_STATES
} from './lib.js';

import {
    signInAnonymouslyUser,
    getCurrentUser,
    onAuthStateChangedListener
} from './firebase-config.js';

import {
    resetGameState,
    setupGameStateListener,
    updateGameRoles,
    getNextSounds,
    getGameRoles,
    updateGameState,
    getGameState,
    savePlayerAccusations,
    setupAccusationsListener
} from './firebase-database.js';

import { playAudio } from './audio.js';

// Estado de autenticación (separado del estado del juego)
let authState = AUTH_STATES.UNAUTHENTICATED;

// Variable para almacenar la función de cleanup del listener
let gameStateListenerCleanup = null;

// Estado del juego (accesible globalmente)
let gameState = null;

// Estado local de acusaciones (jugador -> 'verde'|'naranja'|'rojo')
let accusationsState = {};

// Variables para tracking de acusaciones (solo para jugador 1)
let accusationsListenerCleanup = null;
let accusationsData = {};

// ===== FUNCIONES UTILITARIAS PARA MANEJO DE CLASES CSS =====

/**
 * Activa un elemento removiendo 'inactive' y añadiendo 'active'
 * @param {HTMLElement} element - Elemento a activar
 */
const activate = (element) => {
    if (element) {
        element.classList.remove('inactive');
        element.classList.add('active');
    }
};

/**
 * Desactiva un elemento removiendo 'active' y añadiendo 'inactive'
 * @param {HTMLElement} element - Elemento a desactivar
 */
const deactivate = (element) => {
    if (element) {
        element.classList.remove('active');
        element.classList.add('inactive');
    }
};

/**
 * Cambia el estado de visibilidad de un elemento
 * @param {HTMLElement} element - Elemento a cambiar
 * @param {boolean} isVisible - Si debe ser visible o no
 */
const setVisibility = (element, isVisible) => {
    if (element) {
        if (isVisible) {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    }
};

// Función pura para renderizar la pantalla según el estado de autenticación
const renderAuthScreen = (authState) => {
    const loginScreen = document.getElementById('login-screen');
    const gameScreen = document.getElementById('game-screen');
    const startScreen = document.getElementById('start-screen');
    const gameHeader = document.getElementById('game-header');
    
    switch (authState) {
        case AUTH_STATES.UNAUTHENTICATED:
            activate(loginScreen);
            deactivate(gameScreen);
            deactivate(startScreen);
            setVisibility(gameHeader, false);
            break;
        case AUTH_STATES.AUTHENTICATED:
            deactivate(loginScreen);
            activate(gameScreen);
            // start-screen se activará después cuando se llame a renderStartScreen
            deactivate(startScreen);
            setVisibility(gameHeader, true);
            break;
        case AUTH_STATES.AUTHENTICATING:
            // Mantener pantalla de login durante autenticación
            activate(loginScreen);
            deactivate(gameScreen);
            deactivate(startScreen);
            setVisibility(gameHeader, false);
            break;
        default:
            console.log('Estado de autenticación no implementado:', authState);
    }
};

// Función pura para renderizar la pantalla según el estado
const renderScreen = (gameState) => {
    const { state, numRound, playerNumber, totalPlayers } = gameState;
    
    switch (state) {
        case 'START':
            renderStartScreen(gameState);
            break;
        case 'ACUSE':
            renderAcuseScreen(gameState);
            break;
        case 'RANKING':
            renderRankingScreen(gameState);
            break;
        default:
            console.log('Estado no implementado:', state);
    }
};

// Función pura para renderizar la pantalla START
const renderStartScreen = (gameState) => {
    const { numRound, playerNumber, totalPlayers } = gameState;
    const startScreen = document.getElementById('start-screen');
    const currentRoundElement = document.getElementById('current-round');
    const playerInfoElement = document.getElementById('player-info');
    const reiniciarButton = document.getElementById('reiniciar-btn');
    
    // Solo activar start-screen si estamos completamente en la pantalla del juego
    // y la pantalla de login está oculta
    const gameScreen = document.getElementById('game-screen');
    const loginScreen = document.getElementById('login-screen');
    
    if (startScreen && gameScreen && loginScreen) {
        const isGameActive = gameScreen.classList.contains('active');
        const isLoginActive = loginScreen.classList.contains('active');
        
        // Solo activar start-screen si el juego está activo Y el login está inactivo
        if (isGameActive && !isLoginActive) {
            activate(startScreen);
        } else {
            deactivate(startScreen);
        }
    }
    
    if (currentRoundElement) currentRoundElement.textContent = numRound;
    if (playerInfoElement && playerNumber > 0 && totalPlayers > 0) {
        playerInfoElement.textContent = `Jugador: ${playerNumber} / ${totalPlayers}`;
        playerInfoElement.style.display = 'block';
    }
    
    // Controlar visibilidad del botón REINICIAR solo para jugador 1
    if (reiniciarButton) {
        if (isPlayerOne(gameState)) {
            setVisibility(reiniciarButton, true);
        } else {
            setVisibility(reiniciarButton, false);
        }
    }
    
    // Limpiar tracking de acusaciones al volver a la pantalla START
    cleanupAccusationsTracking();
};

// Función pura para renderizar la pantalla de ranking
const renderRankingScreen = (gameState) => {
    const { numRound, playerNumber, totalPlayers } = gameState;
    
    // Ocultar todas las pantallas del juego
    const startScreen = document.getElementById('start-screen');
    const acuseScreen = document.getElementById('acuse-screen');
    const rankingScreen = document.getElementById('ranking-screen');
    
    deactivate(startScreen);
    deactivate(acuseScreen);
    activate(rankingScreen);
    
    // Limpiar tracking de acusaciones al cambiar a la pantalla de ranking
    cleanupAccusationsTracking();
    
    console.log('Pantalla de ranking mostrada');
};

// Función pura para renderizar la pantalla de acusación
const renderAcuseScreen = async (gameState) => {
    const { numRound, playerNumber, totalPlayers } = gameState;
    
    // Ocultar todas las pantallas del juego
    const startScreen = document.getElementById('start-screen');
    const acuseScreen = document.getElementById('acuse-screen');
    
    deactivate(startScreen);
    activate(acuseScreen);
    
    // Mostrar mensaje del pedorro si corresponde
    const pedorroMessage = document.getElementById('pedorro-message');
    if (pedorroMessage) {
        // Obtener el pedorro real desde Firebase
        try {
            const gameRoles = await getGameRoles(gameState.gameCode);
            if (gameRoles && gameRoles.pedorro === playerNumber) {
                setVisibility(pedorroMessage, true);
            } else {
                setVisibility(pedorroMessage, false);
            }
        } catch (error) {
            console.log('Error al obtener roles del juego:', error);
            setVisibility(pedorroMessage, false);
        }
    }
    
    // Configurar botones de sonidos
    setupSoundButtons(gameState);
    
    // Generar grid de botones de jugadores
    generatePlayersGrid(totalPlayers);
    
    // Validar acusaciones y activar/desactivar botón ACUSAR
    validateAndUpdateAcusarButton();
    
    // Configurar tracking de acusaciones para jugador 1
    setupAccusationsTracking();
};

// Función para configurar los botones de sonidos
const setupSoundButtons = (gameState) => {
    // Botón LIMPIO
    const limpiarBtn = document.getElementById('limpiar-btn');
    if (limpiarBtn) {
        limpiarBtn.addEventListener('click', handleLimpioClick);
    }
    
    // Botón PEDITO
    const peditoBtn = document.getElementById('pedito-btn');
    if (peditoBtn) {
        peditoBtn.addEventListener('click', () => handlePeditoClick(gameState));
    }
    
    // Botón PEDORRO
    const pedorroBtn = document.getElementById('pedorro-btn');
    if (pedorroBtn) {
        pedorroBtn.addEventListener('click', () => handlePedorroClick(gameState));
    }
};

// Función para manejar el click del botón LIMPIO
const handleLimpioClick = async () => {
    try {
        console.log('Reproduciendo sonido neutral...');
        await playAudio('neutral.mp3', 0);
    } catch (error) {
        console.error('Error al reproducir sonido neutral:', error);
    }
};

// Función para manejar el click del botón PEDITO
const handlePeditoClick = async (gameState) => {
    try {
        console.log('Obteniendo sonido del pedito...');
        
        // Obtener roles del juego desde Firebase
        const gameRoles = await getGameRoles(gameState.gameCode);
        const nextSounds = await getNextSounds(gameState.gameCode);
        
        if (gameRoles.peditos && gameRoles.peditos.length > 0) {
            // Tomar el primer pedito del array
            const primerPedito = gameRoles.peditos[0];
            const sonidoPedito = nextSounds[primerPedito];
            
            if (sonidoPedito) {
                console.log(`Reproduciendo pedito-${sonidoPedito}.mp3...`);
                await playAudio(`pedito-${sonidoPedito}.mp3`, 0);
            } else {
                console.warn('No se encontró sonido para el pedito');
            }
        } else {
            console.warn('No hay peditos en esta ronda');
        }
    } catch (error) {
        console.error('Error al reproducir sonido del pedito:', error);
    }
};

// Función para manejar el click del botón PEDORRO
const handlePedorroClick = async (gameState) => {
    try {
        console.log('Obteniendo sonido del pedorro...');
        
        // Obtener roles del juego desde Firebase
        const gameRoles = await getGameRoles(gameState.gameCode);
        
        if (gameRoles.pedorro) {
            const pedorroValue = gameRoles.pedorro;
            console.log(`Reproduciendo pedorro-${pedorroValue}.mp3...`);
            await playAudio(`pedorro-${pedorroValue}.mp3`, 0);
        } else {
            console.warn('No se encontró pedorro en esta ronda');
        }
    } catch (error) {
        console.error('Error al reproducir sonido del pedorro:', error);
    }
};

// Función para generar el grid de botones de jugadores
const generatePlayersGrid = (totalPlayers) => {
    const playersGrid = document.getElementById('players-grid');
    if (!playersGrid) return;
    
    // Limpiar grid existente
    playersGrid.innerHTML = '';
    
    // Crear botones para cada jugador
    for (let i = 1; i <= totalPlayers; i++) {
        const playerButton = document.createElement('button');
        playerButton.className = 'player-button verde';
        playerButton.textContent = `JUG. ${i}`;
        playerButton.dataset.playerNumber = i;
        
        // Event listener para cambio cíclico de colores
        playerButton.addEventListener('click', () => handlePlayerButtonClick(i));
        
        playersGrid.appendChild(playerButton);
    }
    
    // Inicializar estado de acusaciones con todos en verde (neutral)
    accusationsState = {};
    for (let i = 1; i <= totalPlayers; i++) {
        accusationsState[i] = 'verde';
    }
    
    // Inicializar estado de acusaciones con todos en verde (neutrales)
    accusationsState = {};
    for (let i = 1; i <= totalPlayers; i++) {
        accusationsState[i] = 'verde';
    }
    
    // Validar acusaciones iniciales y actualizar botón ACUSAR
    validateAndUpdateAcusarButton();
};

// Función para manejar el click en botones de jugadores
const handlePlayerButtonClick = (playerNumber) => {
    // Cambiar estado cíclicamente: verde -> naranja -> rojo -> verde
    const currentState = accusationsState[playerNumber] || 'verde';
    let newState;
    
    switch (currentState) {
        case 'verde':
            newState = 'naranja';
            break;
        case 'naranja':
            newState = 'rojo';
            break;
        case 'rojo':
            newState = 'verde';
            break;
        default:
            newState = 'verde';
    }
    
    // Actualizar estado local
    accusationsState[playerNumber] = newState;
    
    // Actualizar botón visualmente
    const playerButton = document.querySelector(`[data-player-number="${playerNumber}"]`);
    if (playerButton) {
        playerButton.className = `player-button ${newState}`;
    }
    
    // Validar acusaciones y actualizar botón ACUSAR
    validateAndUpdateAcusarButton();
};

// Función para validar acusaciones y actualizar estado del botón ACUSAR
const validateAndUpdateAcusarButton = () => {
    const acusarButton = document.getElementById('acusar-btn');
    if (!acusarButton || !gameState) return;
    
    // Validar que las cantidades de colores coincidan con la distribución esperada
    const validation = validateAccusations(accusationsState, gameState.totalPlayers);
    
    if (validation.success) {
        // Validación adicional: verificar que se puedan convertir a roles válidos
        const conversionResult = convertAccusationColorsToRoles(accusationsState);
        if (conversionResult.success) {
            const formatValidation = validateAccusationFormat(conversionResult.accusations, gameState.totalPlayers);
            if (formatValidation.success) {
                acusarButton.disabled = false;
                acusarButton.classList.remove('disabled');
                return;
            }
        }
    }
    
    // Si no pasa todas las validaciones, deshabilitar botón
    acusarButton.disabled = true;
    acusarButton.classList.add('disabled');
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
const initializeGame = async () => {
    console.log('PEDORROS - Juego iniciado');
    
    // Crear estado inicial inmutable (solo para obtener gameCode, playerNumber, totalPlayers)
    const initialGameState = initializeGameState(window.location.href);
    
    // Inicializar estado local de acusaciones
    accusationsState = {};
    
    // Intentar cargar el estado real desde Firebase
    console.log('Intentando cargar estado desde Firebase...');
    let firebaseGameState = null;
    
    try {
        firebaseGameState = await getGameState(initialGameState.gameCode);
        console.log('Estado cargado desde Firebase:', firebaseGameState);
    } catch (error) {
        console.log('Error al cargar estado desde Firebase:', error);
    }
    
    // Si no hay estado en Firebase, usar el estado inicial hardcodeado
    if (!firebaseGameState) {
        console.log('No hay estado en Firebase, usando estado inicial hardcodeado');
        gameState = initialGameState;
    } else {
        // Combinar el estado de Firebase con la información del jugador actual
        gameState = {
            ...firebaseGameState,
            gameCode: initialGameState.gameCode,
            playerNumber: initialGameState.playerNumber,
            totalPlayers: initialGameState.totalPlayers
        };
        console.log('Estado combinado:', gameState);
    }
    
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
    
    // Configurar listener de Firebase para TODOS los jugadores (para recibir cambios de estado)
    console.log('Configurando listener de Firebase para todos los jugadores...');
    
    // Limpiar listener anterior si existe
    if (gameStateListenerCleanup) {
        gameStateListenerCleanup();
    }
    
    // Configurar nuevo listener para todos los jugadores
    gameStateListenerCleanup = setupGameStateListener(gameState.gameCode, handleGameStateChange);
    
    console.log('Listener de Firebase configurado para todos los jugadores');
    
    // Esperar un momento para que el estado de autenticación esté completamente establecido
    setTimeout(() => {
        // Renderizar pantalla inicial
        console.log('renderizando pantalla inicial', gameState)
        renderScreen(gameState);
    }, 100);
    
    // Event listener para el botón DISIMULAR
    const disimularButton = document.getElementById('disimular-btn');
    if (disimularButton) {
        disimularButton.addEventListener('click', async () => {
            console.log('Botón DISIMULAR clickeado');
            console.log('Estado actual:', gameState.state);
            console.log('Ronda actual:', gameState.numRound);
            console.log('Código de juego:', gameState.gameCode);
            console.log('Jugador:', gameState.playerNumber, 'de', gameState.totalPlayers);
            
            // Desbloquear audio inmediatamente para iOS sin await (mantener gesto)
            
            // Iniciar secuencia de DISIMULAR
            startDisimularSequence();
            
            // Actualizar estado (inmutable)
            gameState = handleDisimularClick(gameState);
        });
    }
    
    // Event listener para el botón REINICIAR
    const reiniciarButton = document.getElementById('reiniciar-btn');
    if (reiniciarButton) {
        reiniciarButton.addEventListener('click', async () => {
            console.log('Botón REINICIAR clickeado');
            console.log('Código de juego:', gameState.gameCode);
            console.log('Jugador:', gameState.playerNumber, 'de', gameState.totalPlayers);
            
            // Confirmar acción de reinicio
            const confirmar = confirm('¿Estás seguro de que quieres reiniciar el juego? Esta acción no se puede deshacer.');
            
            if (confirmar) {
                try {
                    console.log('Reiniciando juego...');
                    const result = await resetGameState(gameState.gameCode);
                    
                    if (result.success) {
                        console.log('Juego reiniciado exitosamente:', result);
                        alert('¡Juego reiniciado exitosamente!');
                        
                        // Reinicializar estado local de acusaciones
                        accusationsState = {};
                        
                        // Volver a la pantalla START
                        renderScreen(gameState);
                    } else {
                        console.error('Error al reiniciar:', result.error);
                        alert(`Error al reiniciar: ${result.error}`);
                    }
                } catch (error) {
                    console.error('Error inesperado al reiniciar:', error);
                    alert('Error inesperado al reiniciar el juego');
                }
            } else {
                console.log('Reinicio cancelado por el usuario');
            }
        });
    }
    
    // Event listener para el botón ACUSAR
    const acusarButton = document.getElementById('acusar-btn');
    if (acusarButton) {
        acusarButton.addEventListener('click', async () => {
            console.log('Botón ACUSAR clickeado');
            console.log('Estado de acusaciones:', accusationsState);
            
            try {
                // Validar que el estado del juego esté disponible
                if (!gameState || !gameState.gameCode || !gameState.playerNumber || !gameState.totalPlayers) {
                    throw new Error('Estado del juego no disponible');
                }

                // Convertir colores a roles (verde -> neutral, naranja -> pedito, rojo -> pedorro)
                const conversionResult = convertAccusationColorsToRoles(accusationsState);
                if (!conversionResult.success) {
                    throw new Error(conversionResult.error);
                }

                // Validar formato de las acusaciones convertidas
                const formatValidation = validateAccusationFormat(conversionResult.accusations, gameState.totalPlayers);
                if (!formatValidation.success) {
                    throw new Error(formatValidation.error);
                }

                // Validar que las cantidades coincidan con la distribución esperada
                const validationResult = validateAccusations(accusationsState, gameState.totalPlayers);
                if (!validationResult.success) {
                    throw new Error(validationResult.error);
                }

                // Guardar acusaciones en Firebase
                const saveResult = await savePlayerAccusations(
                    gameState.gameCode, 
                    gameState.playerNumber, 
                    conversionResult.accusations
                );

                if (!saveResult.success) {
                    throw new Error(saveResult.error);
                }

                // Éxito: mostrar confirmación y deshabilitar botón
                console.log('Acusaciones guardadas exitosamente:', saveResult);
                alert('¡Acusaciones enviadas correctamente!');
                
                // Deshabilitar botón ACUSAR
                acusarButton.disabled = true;
                acusarButton.classList.add('disabled');
                acusarButton.textContent = 'ACUSACIONES ENVIADAS';

            } catch (error) {
                console.error('Error al enviar acusaciones:', error);
                alert(`Error al enviar acusaciones: ${error.message}`);
            }
        });
    }
    
    // Exportar funciones para uso futuro (cuando se implemente el sistema de módulos)
    window.PEDORROS = {
        getGameState: () => gameState,
        changeGameState: (newState) => {
            gameState = changeGameState(gameState, newState);
            renderScreen(gameState);
        },
        updateRound: (newNumRound) => {
            const result = updateRound(gameState, newNumRound);
            if (result.success) {
                gameState = result.gameState;
                renderScreen(gameState);
            } else {
                console.error('Error al actualizar ronda:', result.error);
            }
        },
        parseGameURL,
        getPlayerInfo: () => getPlayerInfo(gameState),
        getRoundInfo: () => getRoundInfo(gameState)
    };
};

// Función para manejar cambios en el estado del juego (para todos los jugadores)
const handleGameStateChange = async (gameData) => {
    if (!gameState) {
        return;
    }
    
    console.log('Cambio de estado detectado:', gameData.state, 'para jugador', gameState.playerNumber);
    
    // Lógica especial solo para jugador 1 (director del juego)
    if (isPlayerOne(gameState)) {
        // Solo procesar si el estado es "START" para cálculo automático de roles
        if (gameData.state === "START") {
            // Verificar si ya existen roles calculados para evitar recalcular
            if (gameData.peditos && gameData.peditos.length > 0 && gameData.pedorro) {
                console.log('Roles ya calculados, saltando cálculo automático');
            } else {
                console.log('Estado START detectado, calculando roles automáticamente...');
                
                try {
                    // Calcular distribución de roles
                    const roles = calculateGameRoles(gameState.totalPlayers);
                    
                    if (!roles.success) {
                        console.error('Error al calcular roles:', roles.error);
                        return;
                    }
                    
                    // Generar sonidos para cada jugador
                    const nextSounds = generateNextSounds(roles, gameState.totalPlayers);
                    
                    if (Object.keys(nextSounds).length === 0) {
                        console.error('Error al generar sonidos');
                        return;
                    }
                    
                    console.log('Roles calculados:', roles);
                    console.log('Sonidos generados:', nextSounds);
                    
                    // Actualizar en Firebase Database
                    const result = await updateGameRoles(gameState.gameCode, roles, nextSounds);
                    
                    if (result.success) {
                        console.log('Roles y sonidos actualizados exitosamente en Firebase');
                    } else {
                        console.error('Error al actualizar roles en Firebase:', result.error);
                    }
                    
                } catch (error) {
                    console.error('Error inesperado al calcular roles:', error);
                }
            }
        }
    }
    
    // Lógica para TODOS los jugadores: actualizar estado local y re-renderizar
    if (gameData.state && gameData.state !== gameState.state) {
        console.log(`Estado del juego cambiado de '${gameState.state}' a '${gameData.state}'`);
        
        // Actualizar estado local del juego
        gameState = changeGameState(gameState, gameData.state);
        
        // Re-renderizar pantalla con el nuevo estado
        renderScreen(gameState);
        
        console.log('Pantalla actualizada al nuevo estado:', gameData.state);
    }
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

// Cleanup cuando se cierre la aplicación
window.addEventListener('beforeunload', () => {
    if (gameStateListenerCleanup) {
        console.log('Limpiando listener de Firebase...');
        gameStateListenerCleanup();
        gameStateListenerCleanup = null;
    }
});

// Cleanup cuando se cambie de página
window.addEventListener('pagehide', () => {
    if (gameStateListenerCleanup) {
        console.log('Limpiando listener de Firebase...');
        gameStateListenerCleanup();
        gameStateListenerCleanup = null;
    }
});

// Función para iniciar la secuencia de DISIMULAR
const startDisimularSequence = async () => {
    const disimularButton = document.getElementById('disimular-btn');
    const disimularContainer = document.getElementById('disimular-container');
    const countdownDisplay = document.getElementById('countdown-display');
    const disimulandoDisplay = document.getElementById('disimulando-display');
    const mainContent = document.querySelector('.main-content');
    
    if (!disimularButton || !disimularContainer || !countdownDisplay || !disimulandoDisplay || !mainContent) {
        console.error('Elementos de DISIMULAR no encontrados');
        return;
    }
    
    // Deshabilitar botón durante la secuencia
    disimularButton.disabled = true;
    disimularButton.style.opacity = '0.5';
    
    // Ocultar main-content y mostrar contenedor de contador
    mainContent.style.display = 'none';
    disimularContainer.style.display = 'flex';
    
    // Asegurar que "DISIMULANDO" esté oculto al inicio
    disimulandoDisplay.style.display = 'none';
    
    // PROGRAMAR SONIDO INMEDIATAMENTE al inicio del contador
    // Esto asegura que se reproduzca exactamente después de 5 segundos
    await playSound();
    // Iniciar contador: 5, 4, 3, 2, 1
    const countdownNumbers = [3, 2, 1, 0];
    
    // Mostrar el primer número inmediatamente
    countdownDisplay.textContent = countdownNumbers[0];
    countdownDisplay.style.display = 'flex';
    
    for (let i = 1; i < countdownNumbers.length; i++) {
        // Esperar 1 segundo antes del siguiente número
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        countdownDisplay.textContent = countdownNumbers[i];
        // countdownDisplay ya está visible, no necesitamos cambiar display
    }
    
    // Ocultar contador y mostrar "DISIMULANDO"
    countdownDisplay.style.display = 'none';
    disimulandoDisplay.style.display = 'flex';
    
    // El sonido ya está programado para reproducirse automáticamente
    // No necesitamos llamar a playSound() aquí
    
    // Esperar 3 segundos mostrando "DISIMULANDO"
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Para jugador 1: secuencia especial de sonidos antes del botón INVESTIGAR
    if (isPlayerOne(gameState)) {
        await playIntroAndPedorroSound();
    } else {
        // Para otros jugadores: esperar 3 segundos y continuar normalmente
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Ocultar contenedor de disimular y mostrar botón de investigar
    disimularContainer.style.display = 'none';
    showInvestigarButton();
    
    // Rehabilitar botón
    disimularButton.disabled = false;
    disimularButton.style.opacity = '1';
    
    console.log('Secuencia de DISIMULAR completada');
};

// Función para reproducir secuencia de sonidos intro + pedorro para jugador 1
const playIntroAndPedorroSound = async () => {
    try {
        console.log('Iniciando secuencia de sonidos intro + pedorro para jugador 1...');
        
        // 1. Reproducir intro.mp3 con fallback
        console.log('Reproduciendo intro.mp3...');
        try {
            await playAudio('intro/intro.mp3', 0);
        } catch (webAudioError) {
            console.warn('Web Audio API falló para intro:', webAudioError);
        }
        
        // 2. Esperar 3 segundos (duración del intro)
        console.log('Esperando 3 segundos (duración del intro)...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 3. Obtener valor del pedorro desde Firebase
        console.log('Obteniendo valor del pedorro desde Firebase...');
        const gameRoles = await getGameRoles(gameState.gameCode);
        const pedorroValue = gameRoles?.pedorro || 1; // fallback a 1
        console.log(`Valor del pedorro obtenido: ${pedorroValue}`);
        
        // 4. Reproducir sonido del pedorro con fallback
        console.log(`Reproduciendo pedorro-${pedorroValue}.mp3...`);
        try {
            await playAudio(`pedorro-${pedorroValue}.mp3gst`, 0);
        } catch (webAudioError) {
            console.warn('Web Audio API falló para pedorro:', webAudioError);
        }
        
        // 5. Esperar 1.5 segundos adicionales
        console.log('Esperando 1.5 segundos adicionales...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('Secuencia de sonidos intro + pedorro completada');
        
    } catch (error) {
        console.error('Error en secuencia de sonidos intro+pedorro:', error);
        // Continuar con el botón de investigar incluso si fallan los sonidos
        console.log('Continuando con el botón de investigar a pesar del error de audio');
    }
};









// Función principal para reproducir el sonido correspondiente al jugador
const playSound = async () => {
    try {
        if (!gameState || !gameState.gameCode) {
            console.error('Estado del juego no disponible para reproducir sonido');
            return;
        }
        
        // Obtener datos de Firebase
        const [nextSounds, gameRoles] = await Promise.all([
            getNextSounds(gameState.gameCode),
            getGameRoles(gameState.gameCode)
        ]);
        
        console.log('NextSounds obtenidos:', nextSounds);
        console.log('Roles del juego obtenidos:', gameRoles);
        
        // Determinar qué sonido reproducir
        const soundFileName = determineSoundForPlayer(
            nextSounds,
            gameRoles.peditos,
            gameRoles.pedorro,
            gameState.playerNumber
        );
        
        console.log(`Reproduciendo sonido: ${soundFileName} para jugador ${gameState.playerNumber}`);
        
        // Intentar usar Web Audio API primero, con fallback a HTML5
        try {
            // Web Audio API con timing preciso de 5 segundos
            // El sonido se programa para reproducirse exactamente después del contador
            console.log("Reproduciendo sonido con Web Audio API tras 5 segundos", soundFileName);
            playAudio(soundFileName, 3000);
            console.log('Sonido programado exitosamente con Web Audio API para reproducirse en 5 segundos');
        } catch (webAudioError) {
            console.warn('Web Audio API falló:', webAudioError);
        }
        
    } catch (error) {
        console.error('Error al reproducir sonido:', error);
    }
};

// Función para mostrar el botón/texto de investigar
const showInvestigarButton = () => {
    const investigarContainer = document.getElementById('investigar-container');
    const investigarButton = document.getElementById('investigar-btn');
    const investigarText = document.getElementById('investigar-text');
    
    if (!investigarContainer || !investigarButton || !investigarText) {
        console.error('Elementos de investigar no encontrados');
        return;
    }
    
    // Mostrar contenedor de investigar
    investigarContainer.style.display = 'flex';
    
    // Verificar si es jugador 1
    if (isPlayerOne(gameState)) {
        // Para jugador 1: mostrar botón clicable
        investigarButton.style.display = 'block';
        investigarText.style.display = 'none';
        
        // Agregar event listener para el botón
        investigarButton.addEventListener('click', handleInvestigarClick);
    } else {
        // Para otros jugadores: mostrar solo texto
        investigarButton.style.display = 'none';
        investigarText.style.display = 'flex';
    }
    
    console.log('Pantalla de investigar mostrada');
};

// Función para manejar el clic del botón investigar
const handleInvestigarClick = async () => {
    try {
        if (!gameState || !gameState.gameCode) {
            console.error('Estado del juego no disponible para investigar');
            return;
        }
        
        // Verificar que sea jugador 1
        if (!isPlayerOne(gameState)) {
            console.error('Solo el jugador 1 puede investigar');
            return;
        }
        
        console.log('Jugador 1 iniciando investigación...');
        
        // Actualizar estado del juego a "ACUSE" en Firebase
        const result = await updateGameState(gameState.gameCode, 'ACUSE');
        
        if (result.success) {
            console.log('Estado del juego actualizado a ACUSE:', result);
            
            // Actualizar estado local del juego
            gameState = changeGameState(gameState, 'ACUSE');
            
            // Aquí se prepararía la transición al siguiente estado
            // Por ahora solo ocultamos la pantalla de investigar
            const investigarContainer = document.getElementById('investigar-container');
            if (investigarContainer) {
                investigarContainer.style.display = 'none';
            }
            
            console.log('Transición a estado ACUSE completada');
        } else {
            console.error('Error al actualizar estado del juego:', result.error);
            // Aquí se podría mostrar un mensaje de error al usuario
        }
        
    } catch (error) {
        console.error('Error al manejar clic de investigar:', error);
    }
};

// Desbloquear audio en el primer gesto del usuario por seguridad (iOS 18)
const __unlockOnce = () => {
    try { preloadAudioForIOS(); } catch (_) {}
    window.removeEventListener('pointerdown', __unlockOnce);
    window.removeEventListener('touchend', __unlockOnce);
    window.removeEventListener('click', __unlockOnce);
};
window.addEventListener('pointerdown', __unlockOnce, { once: true });
window.addEventListener('touchend', __unlockOnce, { once: true });
window.addEventListener('click', __unlockOnce, { once: true });

// ===== FUNCIONES PARA TRACKING DE ACUSACIONES (SOLO JUGADOR 1) =====

/**
 * Configura el tracking de acusaciones para el jugador 1
 */
const setupAccusationsTracking = () => {
    if (!gameState || !isPlayerOne(gameState)) {
        return; // Solo para jugador 1
    }

    console.log('Configurando tracking de acusaciones para jugador 1...');

    try {
        // Limpiar listener anterior si existe
        if (accusationsListenerCleanup) {
            accusationsListenerCleanup();
        }

        // Configurar nuevo listener
        accusationsListenerCleanup = setupAccusationsListener(
            gameState.gameCode,
            (newAccusationsData) => {
                console.log('Datos de acusaciones actualizados:', newAccusationsData);
                accusationsData = newAccusationsData;
                updateAccusationsCounter(newAccusationsData);
            }
        );

        console.log('Tracking de acusaciones configurado exitosamente');
    } catch (error) {
        console.error('Error al configurar tracking de acusaciones:', error);
    }
};

/**
 * Actualiza el contador visual de acusaciones enviadas
 */
const updateAccusationsCounter = async (accusationsData) => {
    if (!gameState || !isPlayerOne(gameState)) {
        return; // Solo para jugador 1
    }

    const counterContainer = document.getElementById('accusations-counter');
    const progressElement = document.getElementById('accusations-progress');
    const listElement = document.getElementById('accusations-list');

    if (!counterContainer || !progressElement || !listElement) {
        console.error('Elementos del contador de acusaciones no encontrados');
        return;
    }

    try {
        // Obtener progreso de acusaciones
        const progress = getAccusationsProgress(accusationsData, gameState.totalPlayers);

        if (progress.success) {
            // Mostrar contenedor
            counterContainer.style.display = 'block';

            // Actualizar progreso numérico
            progressElement.textContent = `Acusaciones enviadas: ${progress.progress}`;

            // Actualizar lista de jugadores
            listElement.textContent = progress.message;

            console.log('Contador de acusaciones actualizado:', progress);

            // Verificar si todos han enviado acusaciones para transición automática
            if (progress.totalSent === progress.totalExpected && gameState.state === 'ACUSE') {
                console.log('Todos los jugadores han enviado acusaciones. Transicionando a RANKING...');
                
                try {
                    // Cambiar estado en Firebase
                    const result = await updateGameState(gameState.gameCode, 'RANKING');
                    
                    if (result.success) {
                        console.log('Estado del juego actualizado a RANKING:', result);
                        
                        // Actualizar estado local del juego
                        gameState = changeGameState(gameState, 'RANKING');
                        
                        // Re-renderizar pantalla
                        renderScreen(gameState);
                        
                        console.log('Transición a estado RANKING completada');
                    } else {
                        console.error('Error al actualizar estado del juego:', result.error);
                    }
                } catch (error) {
                    console.error('Error al manejar transición automática:', error);
                }
            }
        } else {
            console.error('Error al obtener progreso de acusaciones:', progress.error);
            // Ocultar contenedor en caso de error
            counterContainer.style.display = 'none';
        }
    } catch (error) {
        console.error('Error al actualizar contador de acusaciones:', error);
        counterContainer.style.display = 'none';
    }
};

/**
 * Limpia el tracking de acusaciones
 */
const cleanupAccusationsTracking = () => {
    if (accusationsListenerCleanup) {
        accusationsListenerCleanup();
        accusationsListenerCleanup = null;
    }
    accusationsData = {};
    
    // Ocultar contador
    const counterContainer = document.getElementById('accusations-counter');
    if (counterContainer) {
        counterContainer.style.display = 'none';
    }
};
