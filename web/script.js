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
    getGameState
} from './firebase-database.js';

// Estado de autenticación (separado del estado del juego)
let authState = AUTH_STATES.UNAUTHENTICATED;

// Variable para almacenar la función de cleanup del listener
let gameStateListenerCleanup = null;

// Estado del juego (accesible globalmente)
let gameState = null;

// Estado local de acusaciones (jugador -> 'verde'|'naranja'|'rojo')
let accusationsState = {};

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
    
    // Generar grid de botones de jugadores
    generatePlayersGrid(totalPlayers);
    
    // Validar acusaciones y activar/desactivar botón ACUSAR
    validateAndUpdateAcusarButton();
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
    
    const validation = validateAccusations(accusationsState, gameState.totalPlayers);
    
    if (validation.success) {
        acusarButton.disabled = false;
        acusarButton.classList.remove('disabled');
    } else {
        acusarButton.disabled = true;
        acusarButton.classList.add('disabled');
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
    
    // Configurar listener de Firebase solo para el jugador 1 (director del juego)
    if (isPlayerOne(gameState)) {
        console.log('Configurando listener de Firebase para jugador 1...');
        
        // Limpiar listener anterior si existe
        if (gameStateListenerCleanup) {
            gameStateListenerCleanup();
        }
        
        // Configurar nuevo listener
        gameStateListenerCleanup = setupGameStateListener(gameState.gameCode, handleGameStateChange);
        
        console.log('Listener de Firebase configurado para jugador 1');
    } else {
        console.log('Jugador no es director del juego, no se configura listener');
    }
    
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
            preloadAudioForIOS();
            
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
            
            // TODO: Implementar lógica de acusación
            // Por ahora, solo mostrar las acusaciones en consola
            console.log('Acusaciones realizadas:', accusationsState);
            alert('¡Acusaciones enviadas! (Funcionalidad en desarrollo)');
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

// Función para manejar cambios en el estado del juego (solo jugador 1)
const handleGameStateChange = async (gameData) => {
    // Solo procesar si es el jugador 1 (director del juego)
    if (!gameState || !isPlayerOne(gameState)) {
        return;
    }
    
    // Solo procesar si el estado es "START"
    if (gameData.state !== "START") {
        return;
    }
    
    // Verificar si ya existen roles calculados para evitar recalcular
    if (gameData.peditos && gameData.peditos.length > 0 && gameData.pedorro) {
        console.log('Roles ya calculados, saltando cálculo automático');
        return;
    }
    
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
    const countdownNumbers = [5, 4, 3, 2, 1, 0];
    
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
            await playSoundWebAudio('intro/intro.mp3', 0);
        } catch (webAudioError) {
            console.warn('Web Audio API falló para intro, usando HTML5 Audio:', webAudioError);
            await playSoundHTML5('intro/intro.mp3');
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
            await playSoundWebAudio(`pedorro-${pedorroValue}.mp3`, 0);
        } catch (webAudioError) {
            console.warn('Web Audio API falló para pedorro, usando HTML5 Audio:', webAudioError);
            await playSoundHTML5(`pedorro-${pedorroValue}.mp3`);
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

// Función para crear y gestionar el contexto de audio
const createAudioContext = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
        console.warn('Web Audio API no soportada, usando HTML5 Audio como fallback');
        return null;
    }

    // Reutilizar un único contexto global para evitar límites de iOS
    if (window.__pedorrosAudioContext) {
        return window.__pedorrosAudioContext;
    }

    const audioContext = new AudioContext();

    // En iOS, el contexto puede estar suspendido inicialmente
    if (audioContext.state === 'suspended') {
        console.log('Contexto de audio suspendido, resumiendo...');
        audioContext.resume().catch(error => {
            console.warn('No se pudo resumir el contexto de audio:', error);
        });
    }

    window.__pedorrosAudioContext = audioContext;
    return audioContext;
};

// Función para desbloquear audio en iOS (Web Audio API) sin await
const preloadAudioForIOS = () => {
    // Solo precargar si es iOS y Web Audio API está disponible
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (!isIOS) {
        console.log('No es iOS, saltando precarga de audio');
        return;
    }

    try {
        console.log('iOS detectado: desbloqueando audio...');
        const audioContext = createAudioContext();
        if (!audioContext) {
            console.warn('Web Audio API no disponible en iOS, usando HTML5 Audio');
            return;
        }

        // Intentar reanudar sin await para mantener el gesto del usuario
        if (audioContext.state === 'suspended') {
            audioContext.resume().catch(() => {});
        }

        // Reproducir un buffer silencioso mínimo para activar el contexto
        const buffer = audioContext.createBuffer(1, 1, audioContext.sampleRate);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        try { source.start(0); } catch (_) {}
        source.onended = () => {
            try { source.disconnect(); } catch (_) {}
        };

        console.log('Audio desbloqueado exitosamente en iOS');
    } catch (error) {
        console.warn('Error al desbloquear audio en iOS:', error);
        console.log('Continuando con HTML5 Audio como fallback');
    }
};

// Función para reproducir sonido usando Web Audio API
const playSoundWebAudio = async (soundFileName, delayMs = 0) => {
    const audioContext = createAudioContext();
    if (!audioContext) {
        throw new Error('Web Audio API no disponible');
    }
    
    try {
        // Asegurar que el contexto esté ejecutándose
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }
        
        // Cargar el archivo de audio
        const response = await fetch(`sounds/${soundFileName}`);
        if (!response.ok) {
            throw new Error(`Error al cargar audio: ${response.status}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Crear fuente de audio
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        
        // Configurar volumen
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 1.0;
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Reproducir con timing preciso

        if (delayMs > 0) {
            // Usar el timing del contexto de audio para mayor precisión
            const startTime = audioContext.currentTime + (delayMs / 1000);
            setTimeout(() => {
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                source.start();
            }, delayMs)
            
            console.log(`timeoutx Audio programado para reproducirse en ${delayMs}ms`);
        } else {
            source.start(0);
            console.log('Audio reproducido inmediatamente');
        }
        
        // Limpiar recursos cuando termine
        source.onended = () => {
            source.disconnect();
            gainNode.disconnect();
        };
        
        return true;
        
    } catch (error) {
        console.error('Error con Web Audio API:', error);
        throw error;
    }
};

// Función para reproducir sonido usando HTML5 Audio (fallback)
const playSoundHTML5 = async (soundFileName) => {
    const audioElement = document.getElementById('game-audio');
    if (!audioElement) {
        throw new Error('Elemento de audio HTML5 no encontrado');
    }
    
    try {
        // Cambiar la fuente del audio
        audioElement.src = `sounds/${soundFileName}`;
        
        // Precargar y reproducir
        audioElement.load();
        
        // Reproducir con manejo de errores
        try {
            await audioElement.play();
            console.log('Sonido HTML5 reproducido exitosamente');
            return true;
        } catch (playError) {
            console.error('Error al reproducir sonido HTML5:', playError);
            // Fallback: intentar reproducir sin await
            audioElement.play().catch(error => {
                console.error('Error en fallback de reproducción HTML5:', error);
            });
            return false;
        }
    } catch (error) {
        console.error('Error con HTML5 Audio:', error);
        throw error;
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
            await playSoundWebAudio(soundFileName, 5000);
            console.log('Sonido programado exitosamente con Web Audio API para reproducirse en 5 segundos');
        } catch (webAudioError) {
            console.warn('Web Audio API falló, usando HTML5 Audio como fallback:', webAudioError);
            
            // Fallback a HTML5 Audio
            try {
                await playSoundHTML5(soundFileName);
                console.log('Sonido reproducido exitosamente con HTML5 Audio');
            } catch (html5Error) {
                console.error('HTML5 Audio también falló:', html5Error);
                
                // Último fallback: sonido neutral
                try {
                    await playSoundHTML5('neutral.mp3');
                    console.log('Sonido neutral reproducido como último fallback');
                } catch (finalError) {
                    console.error('Todos los métodos de audio fallaron:', finalError);
                }
            }
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
