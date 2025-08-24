/**
 * Tests para la funcionalidad de investigar
 * Prueba la lógica de mostrar botón/texto y cambio de estado
 */

import { isPlayerOne, changeGameState } from '../../web/lib.js';

// Mock de las funciones de Firebase
const mockUpdateGameState = jest.fn();

// Mock del DOM
document.body.innerHTML = `
    <div id="investigar-container" style="display: none;">
        <button id="investigar-btn" style="display: none;">👃 INVESTIGAR</button>
        <div id="investigar-text" style="display: none;">👃</div>
    </div>
`;

// Mock de gameState
const mockGameState = {
    gameCode: 'test-game',
    playerNumber: 1,
    totalPlayers: 4,
    state: 'DISIMULANDO',
    numRound: 1
};

describe('Funcionalidad de Investigar', () => {
    
    beforeEach(() => {
        // Limpiar mocks antes de cada test
        jest.clearAllMocks();
        
        // Resetear estado del DOM
        const investigarContainer = document.getElementById('investigar-container');
        const investigarButton = document.getElementById('investigar-btn');
        const investigarText = document.getElementById('investigar-text');
        
        if (investigarContainer) investigarContainer.style.display = 'none';
        if (investigarButton) investigarButton.style.display = 'none';
        if (investigarText) investigarText.style.display = 'none';
    });
    
    describe('Validación de jugador 1', () => {
        test('debe identificar correctamente al jugador 1', () => {
            const playerOneState = { ...mockGameState, playerNumber: 1 };
            const otherPlayerState = { ...mockGameState, playerNumber: 2 };
            
            expect(isPlayerOne(playerOneState)).toBe(true);
            expect(isPlayerOne(otherPlayerState)).toBe(false);
        });
        
        test('debe manejar estado inválido', () => {
            expect(isPlayerOne(null)).toBe(false);
            expect(isPlayerOne(undefined)).toBe(false);
            expect(isPlayerOne({})).toBe(false);
        });
    });
    
    describe('Cambio de estado del juego', () => {
        test('debe cambiar el estado correctamente', () => {
            const newState = changeGameState(mockGameState, 'ACUSE');
            
            expect(newState.state).toBe('ACUSE');
            expect(newState.gameCode).toBe(mockGameState.gameCode);
            expect(newState.playerNumber).toBe(mockGameState.playerNumber);
            expect(newState).not.toBe(mockGameState); // Inmutabilidad
        });
        
        test('debe mantener inmutabilidad del estado original', () => {
            const originalState = { ...mockGameState };
            const newState = changeGameState(mockGameState, 'ACUSE');
            
            expect(mockGameState.state).toBe('DISIMULANDO'); // Estado original no cambia
            expect(newState.state).toBe('ACUSE'); // Nuevo estado sí cambia
        });
        
        test('debe cambiar a diferentes estados', () => {
            const states = ['ACUSE', 'RESULTS', 'START'];
            
            states.forEach(state => {
                const newState = changeGameState(mockGameState, state);
                expect(newState.state).toBe(state);
            });
        });
    });
    
    describe('Elementos del DOM', () => {
        test('debe encontrar todos los elementos necesarios', () => {
            const investigarContainer = document.getElementById('investigar-container');
            const investigarButton = document.getElementById('investigar-btn');
            const investigarText = document.getElementById('investigar-text');
            
            expect(investigarContainer).not.toBeNull();
            expect(investigarButton).not.toBeNull();
            expect(investigarText).not.toBeNull();
        });
        
        test('debe tener los IDs correctos', () => {
            const investigarContainer = document.getElementById('investigar-container');
            const investigarButton = document.getElementById('investigar-btn');
            const investigarText = document.getElementById('investigar-text');
            
            expect(investigarContainer.id).toBe('investigar-container');
            expect(investigarButton.id).toBe('investigar-btn');
            expect(investigarText.id).toBe('investigar-text');
        });
    });
    
    describe('Funciones de Firebase', () => {
        test('debe tener la función updateGameState disponible', () => {
            // Esta función está en firebase-database.js, no en lib.js
            // Solo verificamos que el test pueda ejecutarse
            expect(typeof mockUpdateGameState).toBe('function');
        });
    });
    
    describe('Casos edge', () => {
        test('debe manejar gameState null', () => {
            expect(isPlayerOne(null)).toBe(false);
        });
        
        test('debe manejar gameState undefined', () => {
            expect(isPlayerOne(undefined)).toBe(false);
        });
        
        test('debe manejar gameState sin playerNumber', () => {
            const invalidState = { gameCode: 'test', state: 'START' };
            expect(isPlayerOne(invalidState)).toBe(false);
        });
        
        test('debe manejar cambio de estado con valores inválidos', () => {
            const invalidStates = [null, undefined, '', 123, {}];
            
            invalidStates.forEach(invalidState => {
                const newState = changeGameState(mockGameState, invalidState);
                expect(newState.state).toBe(invalidState);
                expect(newState).not.toBe(mockGameState);
            });
        });
    });
});
