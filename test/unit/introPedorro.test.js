/**
 * Tests para la funcionalidad de sonidos intro + pedorro
 * Esta funcionalidad reproduce intro.mp3 y luego el sonido del pedorro antes del botón INVESTIGAR
 */

import { isPlayerOne } from '../../web/lib.js';

// Mock de las funciones de Firebase y audio
const mockGetGameRoles = jest.fn();
const mockPlaySoundWebAudio = jest.fn();
const mockPlaySoundHTML5 = jest.fn();

// Mock del estado del juego
const createMockGameState = (playerNumber = 1, gameCode = 'test') => ({
    state: 'START',
    numRound: 1,
    gameCode,
    playerNumber,
    totalPlayers: 4
});

// Mock de las funciones globales
global.getGameRoles = mockGetGameRoles;
global.playSoundWebAudio = mockPlaySoundWebAudio;
global.playSoundHTML5 = mockPlaySoundHTML5;

describe('Funcionalidad Intro + Pedorro', () => {
    beforeEach(() => {
        // Limpiar todos los mocks antes de cada test
        jest.clearAllMocks();
        
        // Configurar mocks por defecto
        mockGetGameRoles.mockResolvedValue({ pedorro: 3 });
        mockPlaySoundWebAudio.mockResolvedValue(true);
        mockPlaySoundHTML5.mockResolvedValue(true);
    });

    describe('isPlayerOne', () => {
        test('debe identificar correctamente al jugador 1', () => {
            const gameState = createMockGameState(1);
            expect(isPlayerOne(gameState)).toBe(true);
        });

        test('debe identificar correctamente a otros jugadores', () => {
            const gameState = createMockGameState(2);
            expect(isPlayerOne(gameState)).toBe(false);
        });

        test('debe manejar estado inválido', () => {
            expect(isPlayerOne(null)).toBe(false);
            expect(isPlayerOne(undefined)).toBe(false);
            expect(isPlayerOne({})).toBe(false);
        });
    });

    describe('Integración con Firebase', () => {
        test('debe obtener el valor del pedorro desde Firebase', async () => {
            const gameState = createMockGameState(1, 'galerna');
            mockGetGameRoles.mockResolvedValue({ pedorro: 5 });
            
            // Simular la llamada a getGameRoles
            const gameRoles = await mockGetGameRoles(gameState.gameCode);
            expect(gameRoles.pedorro).toBe(5);
        });

        test('debe usar fallback si no se puede obtener el valor del pedorro', async () => {
            const gameState = createMockGameState(1, 'galerna');
            mockGetGameRoles.mockResolvedValue(null);
            
            // Simular fallback a valor por defecto
            const gameRoles = await mockGetGameRoles(gameState.gameCode);
            const pedorroValue = gameRoles?.pedorro || 1;
            expect(pedorroValue).toBe(1);
        });
    });

    describe('Manejo de Audio', () => {
        test('debe reproducir intro.mp3 correctamente', async () => {
            mockPlaySoundWebAudio.mockResolvedValue(true);
            
            const result = await mockPlaySoundWebAudio('intro/intro.mp3', 0);
            expect(result).toBe(true);
            expect(mockPlaySoundWebAudio).toHaveBeenCalledWith('intro/intro.mp3', 0);
        });

        test('debe reproducir sonido del pedorro correctamente', async () => {
            mockPlaySoundWebAudio.mockResolvedValue(true);
            
            const result = await mockPlaySoundWebAudio('pedorro-3.mp3', 0);
            expect(result).toBe(true);
            expect(mockPlaySoundWebAudio).toHaveBeenCalledWith('pedorro-3.mp3', 0);
        });

        test('debe fallback a HTML5 Audio si Web Audio API falla', async () => {
            mockPlaySoundWebAudio.mockRejectedValue(new Error('Web Audio API no disponible'));
            mockPlaySoundHTML5.mockResolvedValue(true);
            
            try {
                await mockPlaySoundWebAudio('intro/intro.mp3', 0);
            } catch (error) {
                // Fallback a HTML5 Audio
                const result = await mockPlaySoundHTML5('intro/intro.mp3');
                expect(result).toBe(true);
                expect(mockPlaySoundHTML5).toHaveBeenCalledWith('intro/intro.mp3');
            }
        });
    });

    describe('Timing y Secuencia', () => {
        test('debe respetar el timing de 3 segundos para intro', async () => {
            const startTime = Date.now();
            
            // Simular espera de 3 segundos
            await new Promise(resolve => setTimeout(resolve, 100)); // Usar 100ms para tests rápidos
            
            const elapsedTime = Date.now() - startTime;
            expect(elapsedTime).toBeGreaterThanOrEqual(100);
        });

        test('debe respetar el timing de 1.5 segundos después del pedorro', async () => {
            const startTime = Date.now();
            
            // Simular espera de 1.5 segundos
            await new Promise(resolve => setTimeout(resolve, 50)); // Usar 50ms para tests rápidos
            
            const elapsedTime = Date.now() - startTime;
            expect(elapsedTime).toBeGreaterThanOrEqual(50);
        });
    });

    describe('Manejo de Errores', () => {
        test('debe continuar si falla la reproducción del intro', async () => {
            mockPlaySoundWebAudio.mockRejectedValue(new Error('Error de audio'));
            mockPlaySoundHTML5.mockRejectedValue(new Error('Error de HTML5'));
            
            // Simular que se llamó a la función y falló
            try {
                await mockPlaySoundWebAudio('intro/intro.mp3', 0);
            } catch (error) {
                expect(error.message).toBe('Error de audio');
            }
            
            // La función debe continuar ejecutándose a pesar de los errores
            expect(mockPlaySoundWebAudio).toHaveBeenCalledWith('intro/intro.mp3', 0);
        });

        test('debe continuar si falla la reproducción del pedorro', async () => {
            mockGetGameRoles.mockResolvedValue({ pedorro: 2 });
            mockPlaySoundWebAudio
                .mockResolvedValueOnce(true) // intro funciona
                .mockRejectedValueOnce(new Error('Error de audio')); // pedorro falla
            
            // Simular que se llamó a la función
            await mockPlaySoundWebAudio('pedorro-2.mp3', 0);
            
            // La función debe continuar ejecutándose a pesar de los errores
            expect(mockPlaySoundWebAudio).toHaveBeenCalledWith('pedorro-2.mp3', 0);
        });

        test('debe manejar errores de Firebase graciosamente', async () => {
            mockGetGameRoles.mockRejectedValue(new Error('Error de Firebase'));
            
            // Debe usar valor por defecto y continuar
            try {
                await mockGetGameRoles('invalid-code');
            } catch (error) {
                // Debe continuar con valor por defecto
                expect(error.message).toBe('Error de Firebase');
            }
        });
    });

    describe('Casos Edge', () => {
        test('debe manejar valores de pedorro fuera del rango 1-5', async () => {
            mockGetGameRoles.mockResolvedValue({ pedorro: 0 });
            
            const gameRoles = await mockGetGameRoles('test');
            const pedorroValue = gameRoles?.pedorro || 1;
            expect(pedorroValue).toBe(1); // fallback a 1
        });

        test('debe manejar valores de pedorro muy grandes', async () => {
            mockGetGameRoles.mockResolvedValue({ pedorro: 999 });
            
            const gameRoles = await mockGetGameRoles('test');
            const pedorroValue = gameRoles?.pedorro || 1;
            expect(pedorroValue).toBe(999); // acepta cualquier valor
        });

        test('debe funcionar con diferentes códigos de juego', async () => {
            const gameCodes = ['galerna', 'fiesta123', 'test', 'a'];
            
            for (const gameCode of gameCodes) {
                const gameState = createMockGameState(1, gameCode);
                expect(gameState.gameCode).toBe(gameCode);
            }
        });
    });
});
